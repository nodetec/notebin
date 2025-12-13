import { type Filter, nip19, SimplePool } from "nostr-tools";
import { NWCClient } from "@getalby/sdk";
import { DEFAULT_RELAYS } from "~/lib/constants";

/**
 * MCP Server configuration
 */
const SERVER_INFO = {
  name: "notebin",
  version: "1.0.0",
  protocolVersion: "2024-11-05",
};

// =============================================================================
// PAYMENT INFRASTRUCTURE (Step B)
// =============================================================================

/**
 * Payment storage (in-memory for testing)
 * In production, use Redis for persistence across serverless invocations
 */
const paymentStorage = new Map<string, { valid: boolean; created: number }>();

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
 * Check if a payment hash is valid (exists and unused)
 */
function isPaymentValid(paymentHash: string): boolean {
  const record = paymentStorage.get(paymentHash);
  return record?.valid === true;
}

/**
 * Mark payment hash as valid (after invoice created)
 */
function setPaymentValid(paymentHash: string): void {
  paymentStorage.set(paymentHash, { valid: true, created: Date.now() });
}

/**
 * Invalidate payment hash (after tool executed)
 */
function invalidatePayment(paymentHash: string): void {
  paymentStorage.set(paymentHash, { valid: false, created: Date.now() });
}

/**
 * Generate invoice for paid tool
 */
async function generateInvoice(satoshi: number, description: string) {
  const client = getNwcClient();
  if (!client) {
    throw new Error("NWC not configured. Set NWC_URL environment variable.");
  }

  const invoice = await client.makeInvoice({
    amount: satoshi * 1000, // Convert to millisats
    description,
  });

  // Store payment hash as valid
  setPaymentValid(invoice.paymentHash);

  return {
    payment_request: invoice.paymentRequest,
    payment_hash: invoice.paymentHash,
  };
}

/**
 * Verify payment was made
 */
async function verifyPayment(paymentHash: string): Promise<boolean> {
  const client = getNwcClient();
  if (!client) return false;

  try {
    const lookup = await client.lookupInvoice({ paymentHash });
    return !!lookup.settledAt;
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
        payment_hash: { type: "string", description: "Payment hash from paid invoice (required for execution)" },
      },
      required: [],
    },
    // Pricing config
    _price: { satoshi: 10, description: "Premium search" },
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

    return {
      id: event.id,
      title: titleTag?.[1] || "Untitled",
      description: descTag?.[1] || null,
      language: langTag?.[1] || "unknown",
      tags,
      content: event.content, // Full content for premium
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
              `${toolConfig._price.description}: ${args.keyword || args.language || "search"}`
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

        // Phase 2: payment_hash provided → verify and execute
        if (!isPaymentValid(paymentHash)) {
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: "Invalid or already used payment_hash" },
          };
        }

        // Verify payment with NWC
        const paid = await verifyPayment(paymentHash);
        if (!paid) {
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: "Payment not received. Please pay the invoice first." },
          };
        }

        // Invalidate hash (one-time use)
        invalidatePayment(paymentHash);

        // Execute the tool
        try {
          const result = await executeSearchSnippetsPremium(args as Parameters<typeof executeSearchSnippetsPremium>[0]);
          return { jsonrpc: "2.0", id, result };
        } catch (error) {
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

  // Regular GET - health check
  return new Response(
    JSON.stringify({
      name: SERVER_INFO.name,
      version: SERVER_INFO.version,
      status: "ok",
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
