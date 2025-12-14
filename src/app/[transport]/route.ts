import { type Filter, nip19, SimplePool } from "nostr-tools";
import { NWCClient } from "@getalby/sdk";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { decodeBase64Content } from "~/lib/utils";
import { getPaymentStorage, hashParams, extractBindableParams } from "~/lib/payment-storage";

/**
 * MCP Server configuration
 */
const SERVER_INFO = {
  name: "notebin",
  version: "1.0.0",
  protocolVersion: "2024-11-05",
};

// =============================================================================
// PAYMENT INFRASTRUCTURE
// Uses Redis with atomic Lua scripts to prevent TOCTOU race conditions.
// @see paidmcp-starter/docs/adr/004-atomic-payment-claims.md
// =============================================================================

/**
 * Payment storage singleton (Redis-based)
 * Initialized once at module load, reused across all requests.
 */
const paymentStorage = getPaymentStorage();

/**
 * NWC client singleton (lazy initialized)
 */
let nwcClient: NWCClient | null = null;

function getNwcClient(): NWCClient | null {
  if (!nwcClient && process.env.NWC_URL) {
    nwcClient = new NWCClient({
      nostrWalletConnectUrl: process.env.NWC_URL,
    });
  }
  return nwcClient;
}

/**
 * Generate invoice for paid tool.
 * Stores payment hash as VALID in Redis with params binding.
 *
 * @param satoshi - Amount to charge in satoshis
 * @param description - Invoice description
 * @param toolName - Name of the tool being paid for
 * @param args - Tool arguments (used to compute paramsHash for binding)
 */
async function generateInvoice(
  satoshi: number,
  description: string,
  toolName: string,
  args: Record<string, unknown>
) {
  const client = getNwcClient();
  if (!client) {
    throw new Error("NWC not configured. Set NWC_URL environment variable.");
  }

  const invoice = await client.makeInvoice({
    amount: satoshi * 1000, // Convert to millisats
    description,
  });

  // Compute params hash for binding - prevents payment hash theft
  const bindableParams = extractBindableParams(args, toolName);
  const paramsHashValue = hashParams(bindableParams);

  // Store payment hash as VALID in Redis with params binding
  await paymentStorage.setValid(invoice.payment_hash, {
    toolName,
    paramsHash: paramsHashValue,
    created: Date.now(),
  });

  console.log(`[TOCTOU-FIX] 📝 Payment hash created: ${invoice.payment_hash.slice(0, 16)}...`);
  console.log(`[TOCTOU-FIX]    State: (none) → VALID`);
  console.log(`[TOCTOU-FIX]    Params bound: ${paramsHashValue.slice(0, 16)}...`);

  return {
    payment_request: invoice.invoice, // bolt11 invoice string
    payment_hash: invoice.payment_hash,
  };
}

/**
 * Verify payment was made
 */
async function verifyPayment(paymentHash: string): Promise<boolean> {
  const client = getNwcClient();
  if (!client) return false;

  try {
    const lookup = await client.lookupInvoice({ payment_hash: paymentHash });
    return !!lookup.settled_at;
  } catch {
    return false;
  }
}

/**
 * Tool definitions - easy to extend with paid tools later
 */
const TOOLS = {
  fetchCodeSnippets: {
    name: "fetchCodeSnippets",
    description: "Fetch code snippets from a specific Notebin user by their npub",
    inputSchema: {
      type: "object" as const,
      properties: {
        npub: { type: "string", description: "Nostr public key (npub format)" },
        limit: { type: "number", description: "Maximum number of snippets to fetch", default: 100 },
        language: { type: "string", description: "Filter by programming language" },
        tags: { type: "array", items: { type: "string" }, description: "Filter by tags" },
      },
      required: ["npub"],
    },
  },
  searchSnippets: {
    name: "searchSnippets",
    description: "Search all code snippets on Notebin by language, tags, or keywords. Does not require a specific user.",
    inputSchema: {
      type: "object" as const,
      properties: {
        language: { type: "string", description: "Filter by programming language (e.g., 'typescript', 'python', 'rust')" },
        tags: { type: "array", items: { type: "string" }, description: "Filter by tags (e.g., ['api', 'auth'])" },
        keyword: { type: "string", description: "Search for keyword in snippet content (client-side filter)" },
        limit: { type: "number", description: "Maximum number of snippets to return", default: 50 },
      },
      required: [],
    },
  },
};

// =============================================================================
// PAID TOOLS (Step B)
// =============================================================================

/**
 * Paid tool definitions with pricing
 */
const PAID_TOOLS = {
  searchSnippetsPremium: {
    name: "searchSnippetsPremium",
    description: "Premium search with higher limits and full content (10 sats). Provide payment_hash after paying invoice.",
    inputSchema: {
      type: "object" as const,
      properties: {
        language: { type: "string", description: "Filter by programming language" },
        tags: { type: "array", items: { type: "string" }, description: "Filter by tags" },
        keyword: { type: "string", description: "Search for keyword in snippet content" },
        limit: { type: "number", description: "Maximum snippets (up to 500)", default: 100 },
        raw: { type: "boolean", description: "Return raw content without base64 decoding", default: false },
        payment_hash: { type: "string", description: "Payment hash from paid invoice (required for execution)" },
      },
      required: [],
    },
    // Pricing config
    _price: { satoshi: 1, description: "Premium search" },
  },
};

/**
 * Execute premium search (paid tool)
 */
async function executeSearchSnippetsPremium(args: {
  language?: string;
  tags?: string[];
  keyword?: string;
  limit?: number;
  raw?: boolean;
}) {
  const pool = new SimplePool();

  const filter: Filter = {
    kinds: [1337],
    limit: Math.min(args.limit ?? 100, 500), // Higher limit for premium
  };

  if (args.language) {
    filter["#l"] = [args.language.toLowerCase()];
  }

  if (args.tags && args.tags.length > 0) {
    filter["#t"] = args.tags;
  }

  let events = await pool.querySync(DEFAULT_RELAYS, filter);
  pool.close(DEFAULT_RELAYS);

  // Client-side keyword filter
  if (args.keyword) {
    const keywordLower = args.keyword.toLowerCase();
    events = events.filter((event) => {
      if (event.content.toLowerCase().includes(keywordLower)) return true;
      const titleTag = event.tags.find((t) => t[0] === "title");
      if (titleTag && titleTag[1]?.toLowerCase().includes(keywordLower)) return true;
      return false;
    });
  }

  // Premium: Full content, more metadata
  const results = events.map((event) => {
    const titleTag = event.tags.find((t) => t[0] === "title");
    const langTag = event.tags.find((t) => t[0] === "l");
    const descTag = event.tags.find((t) => t[0] === "summary" || t[0] === "description");
    const tags = event.tags.filter((t) => t[0] === "t").map((t) => t[1]);

    // Decode base64 content unless raw mode requested
    const { content: decodedContent, isBase64Encoded } = args.raw
      ? { content: event.content, isBase64Encoded: false }
      : decodeBase64Content(event.content);

    return {
      id: event.id,
      title: titleTag?.[1] || "Untitled",
      description: descTag?.[1] || null,
      language: langTag?.[1] || "unknown",
      tags,
      content: decodedContent,
      is_base64_encoded: isBase64Encoded,
      author: nip19.npubEncode(event.pubkey),
      created_at: event.created_at,
      sig: event.sig,
    };
  });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ count: results.length, premium: true, snippets: results }, null, 2),
      },
    ],
  };
}

/**
 * Execute the fetchCodeSnippets tool
 */
async function executeFetchCodeSnippets(args: {
  npub: string;
  limit?: number;
  language?: string;
  tags?: string[];
}) {
  try {
    const publicKey = nip19.decode(args.npub).data as string;
    const pool = new SimplePool();

    const filter: Filter = {
      kinds: [1337],
      limit: args.limit ?? 100,
      authors: [publicKey],
    };

    if (args.language) {
      filter["#l"] = [args.language];
    }

    if (args.tags) {
      filter["#t"] = args.tags;
    }

    const events = await pool.querySync(DEFAULT_RELAYS, filter);
    pool.close(DEFAULT_RELAYS);

    return {
      content: [{ type: "text", text: JSON.stringify(events, null, 2) }],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching snippets: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Execute the searchSnippets tool - search across all users
 */
async function executeSearchSnippets(args: {
  language?: string;
  tags?: string[];
  keyword?: string;
  limit?: number;
}) {
  try {
    const pool = new SimplePool();

    const filter: Filter = {
      kinds: [1337],
      limit: args.limit ?? 50,
    };

    // Add language filter
    if (args.language) {
      filter["#l"] = [args.language.toLowerCase()];
    }

    // Add tags filter
    if (args.tags && args.tags.length > 0) {
      filter["#t"] = args.tags;
    }

    let events = await pool.querySync(DEFAULT_RELAYS, filter);
    pool.close(DEFAULT_RELAYS);

    // Client-side keyword filter (Nostr doesn't support full-text search)
    if (args.keyword) {
      const keywordLower = args.keyword.toLowerCase();
      events = events.filter((event) => {
        // Search in content
        if (event.content.toLowerCase().includes(keywordLower)) return true;
        // Search in title tag if present
        const titleTag = event.tags.find((t) => t[0] === "title");
        if (titleTag && titleTag[1]?.toLowerCase().includes(keywordLower)) return true;
        // Search in description tag if present
        const descTag = event.tags.find((t) => t[0] === "summary" || t[0] === "description");
        if (descTag && descTag[1]?.toLowerCase().includes(keywordLower)) return true;
        return false;
      });
    }

    // Format results with metadata
    const results = events.map((event) => {
      const titleTag = event.tags.find((t) => t[0] === "title");
      const langTag = event.tags.find((t) => t[0] === "l");
      const tags = event.tags.filter((t) => t[0] === "t").map((t) => t[1]);

      return {
        id: event.id,
        title: titleTag?.[1] || "Untitled",
        language: langTag?.[1] || "unknown",
        tags,
        content: event.content.slice(0, 500) + (event.content.length > 500 ? "..." : ""),
        author: nip19.npubEncode(event.pubkey),
        created_at: event.created_at,
      };
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ count: results.length, snippets: results }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching snippets: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle MCP JSON-RPC requests
 */
async function handleMcpRequest(body: { jsonrpc: string; method: string; params?: unknown; id?: string | number }) {
  const { method, params, id } = body;

  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: SERVER_INFO.protocolVersion,
          capabilities: { tools: {} },
          serverInfo: { name: SERVER_INFO.name, version: SERVER_INFO.version },
        },
      };

    case "notifications/initialized":
      // No response needed for notifications
      return null;

    case "tools/list":
      // Combine free and paid tools (strip internal _price field for response)
      const allTools = [
        ...Object.values(TOOLS),
        ...Object.values(PAID_TOOLS).map(({ _price, ...tool }) => tool),
      ];
      return {
        jsonrpc: "2.0",
        id,
        result: { tools: allTools },
      };

    case "tools/call": {
      const { name, arguments: args } = params as { name: string; arguments: Record<string, unknown> };

      // =====================================================================
      // FREE TOOLS
      // =====================================================================
      if (name === "fetchCodeSnippets") {
        const result = await executeFetchCodeSnippets(args as Parameters<typeof executeFetchCodeSnippets>[0]);
        return { jsonrpc: "2.0", id, result };
      }

      if (name === "searchSnippets") {
        const result = await executeSearchSnippets(args as Parameters<typeof executeSearchSnippets>[0]);
        return { jsonrpc: "2.0", id, result };
      }

      // =====================================================================
      // PAID TOOLS - Two-phase payment flow
      // =====================================================================
      if (name === "searchSnippetsPremium") {
        const paymentHash = args.payment_hash as string | undefined;
        const toolConfig = PAID_TOOLS.searchSnippetsPremium;

        // Phase 1: No payment_hash provided → generate invoice
        if (!paymentHash) {
          try {
            const invoice = await generateInvoice(
              toolConfig._price.satoshi,
              `${toolConfig._price.description}: ${args.keyword || args.language || "search"}`,
              "searchSnippetsPremium",
              args as Record<string, unknown>
            );
            return {
              jsonrpc: "2.0",
              id,
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      payment_required: true,
                      payment_request: invoice.payment_request,
                      payment_hash: invoice.payment_hash,
                      amount_sats: toolConfig._price.satoshi,
                      instructions: "Pay the invoice, then call this tool again with payment_hash parameter.",
                    }),
                  },
                ],
              },
            };
          } catch (error) {
            return {
              jsonrpc: "2.0",
              id,
              error: { code: -32603, message: `Invoice generation failed: ${error instanceof Error ? error.message : "Unknown error"}` },
            };
          }
        }

        // =====================================================================
        // Phase 2: payment_hash provided → ATOMIC claim, verify, execute
        // This flow eliminates TOCTOU race conditions.
        // @see paidmcp-starter/docs/adr/004-atomic-payment-claims.md
        // =====================================================================

        // Step 1: Atomic claim (VALID → PROCESSING)
        // This prevents concurrent requests from using the same hash
        console.log(`[TOCTOU-FIX] 🔒 Attempting atomic claim: ${paymentHash.slice(0, 16)}...`);
        const claimed = await paymentStorage.tryClaimForProcessing(paymentHash);
        if (!claimed) {
          console.log(`[TOCTOU-FIX] ❌ Claim REJECTED (hash invalid, in-use, or consumed)`);
          console.log(`[TOCTOU-FIX]    → Race condition PREVENTED or hash already used`);
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: "Invalid, in-use, or already consumed payment_hash" },
          };
        }
        console.log(`[TOCTOU-FIX] ✓ Claim SUCCESS`);
        console.log(`[TOCTOU-FIX]    State: VALID → PROCESSING`);

        // Step 1b: Verify params hash binding (prevents payment hash theft)
        // This ensures the payment_hash can only be used with the same params it was generated for
        const storedMetadata = await paymentStorage.getMetadata(paymentHash);
        if (storedMetadata?.paramsHash) {
          const currentBindableParams = extractBindableParams(args as Record<string, unknown>, "searchSnippetsPremium");
          const currentParamsHash = hashParams(currentBindableParams);

          if (storedMetadata.paramsHash !== currentParamsHash) {
            console.log(`[TOCTOU-FIX] ❌ Params hash MISMATCH - possible theft attempt!`);
            console.log(`[TOCTOU-FIX]    Stored:  ${storedMetadata.paramsHash.slice(0, 16)}...`);
            console.log(`[TOCTOU-FIX]    Current: ${currentParamsHash.slice(0, 16)}...`);
            // Release back - params don't match what invoice was generated for
            await paymentStorage.releaseBack(paymentHash);
            return {
              jsonrpc: "2.0",
              id,
              error: { code: -32602, message: "Payment hash was generated for different parameters. Request a new invoice." },
            };
          }
          console.log(`[TOCTOU-FIX] ✓ Params hash VERIFIED`);
        }

        // Step 2: Verify payment with NWC
        // Hash is now PROCESSING - no race condition possible
        console.log(`[TOCTOU-FIX] 💰 Verifying payment with NWC...`);
        const paid = await verifyPayment(paymentHash);
        if (!paid) {
          // Payment not verified - release back so user can retry after paying
          console.log(`[TOCTOU-FIX] ⚠️ Payment NOT verified - releasing hash back`);
          console.log(`[TOCTOU-FIX]    State: PROCESSING → VALID (preserved for retry)`);
          await paymentStorage.releaseBack(paymentHash);
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: "Payment not received. Please pay the invoice first." },
          };
        }
        console.log(`[TOCTOU-FIX] ✓ Payment VERIFIED`);

        // Step 3: Execute the tool
        try {
          console.log(`[TOCTOU-FIX] 🚀 Executing tool...`);
          const result = await executeSearchSnippetsPremium(args as Parameters<typeof executeSearchSnippetsPremium>[0]);

          // Step 4: Consume the hash (PROCESSING → INVALID)
          await paymentStorage.consume(paymentHash);
          console.log(`[TOCTOU-FIX] ✓ Tool executed successfully`);
          console.log(`[TOCTOU-FIX]    State: PROCESSING → INVALID (consumed)`);
          console.log(`[TOCTOU-FIX] 🎉 Payment flow complete!`);

          return { jsonrpc: "2.0", id, result };
        } catch (error) {
          // Tool failed but payment was verified - consume anyway (payment is settled)
          await paymentStorage.consume(paymentHash);
          console.log(`[TOCTOU-FIX] ❌ Tool execution FAILED`);
          console.log(`[TOCTOU-FIX]    State: PROCESSING → INVALID (consumed despite error)`);
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32603, message: `Tool execution failed: ${error instanceof Error ? error.message : "Unknown error"}` },
          };
        }
      }

      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Unknown tool: ${name}` },
      };
    }

    default:
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
  }
}

/**
 * POST /mcp - MCP JSON-RPC endpoint
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const result = await handleMcpRequest(body);

    // Notifications don't get a response
    if (result === null) {
      return new Response(null, { status: 204 });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("MCP request error:", error);
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32603, message: error instanceof Error ? error.message : "Internal server error" },
        id: null,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET /mcp - Health check / SSE endpoint placeholder
 */
export async function GET(request: Request): Promise<Response> {
  const accept = request.headers.get("accept") || "";

  // SSE request - return event stream
  if (accept.includes("text/event-stream")) {
    const stream = new ReadableStream({
      start(controller) {
        // Send initial endpoint event for MCP SSE protocol
        const endpointEvent = `event: endpoint\ndata: /mcp\n\n`;
        controller.enqueue(new TextEncoder().encode(endpointEvent));

        // Keep connection alive with periodic pings
        const interval = setInterval(() => {
          try {
            controller.enqueue(new TextEncoder().encode(": ping\n\n"));
          } catch {
            clearInterval(interval);
          }
        }, 30000);

        // Clean up on close
        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Regular GET - health check with Redis status
  const redisHealthy = await paymentStorage.ping();
  return new Response(
    JSON.stringify({
      name: SERVER_INFO.name,
      version: SERVER_INFO.version,
      status: redisHealthy ? "ok" : "degraded",
      redis: redisHealthy ? "connected" : "disconnected",
      endpoints: { mcp: "POST /mcp", sse: "GET /sse" },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * DELETE - Session cleanup (no-op for stateless mode)
 */
export async function DELETE(): Promise<Response> {
  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
