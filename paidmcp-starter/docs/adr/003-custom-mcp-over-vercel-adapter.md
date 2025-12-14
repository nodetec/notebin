# ADR-003: Custom MCP Handler over Vercel MCP Adapter

## Status

Accepted

## Context

Notebin initially used `@vercel/mcp-adapter` to expose MCP tools for fetching code snippets. When adding paid tools with Lightning payments via `@getalby/paidmcp`, we discovered fundamental incompatibilities between the two approaches.

### Original Implementation (Vercel Adapter)

```typescript
import { createMcpHandler } from "@vercel/mcp-adapter";

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "fetchCodeSnippets",
      "Fetch code snippets from Notebin",
      { npub: z.string(), limit: z.number().default(100) },
      async ({ npub, limit }) => {
        // Single callback - executes immediately
        const events = await pool.querySync(relays, filter);
        return { content: [{ type: "text", text: JSON.stringify(events) }] };
      }
    );
  },
  { capabilities: { tools: {} } },
  { redisUrl: process.env.REDIS_URL, sseEndpoint: "/sse" }
);
```

### PaidMCP Requirements

PaidMCP requires a fundamentally different tool registration pattern:

```typescript
server.registerPaidTool(
  "tool_name",
  { inputSchema, outputSchema },
  async (params) => ({ satoshi: 50, description: "..." }),  // Charge callback
  async (params) => ({ content: [...], structuredContent }) // Tool callback
);
```

## Decision

Replace `@vercel/mcp-adapter` with a custom MCP JSON-RPC handler that implements the two-phase payment flow directly.

## Rationale

### 1. API Architecture Incompatibility

| Aspect | Vercel Adapter | PaidMCP |
|--------|---------------|---------|
| Registration | `server.tool(name, desc, schema, callback)` | `server.registerPaidTool(name, config, chargeCallback, toolCallback)` |
| Callbacks | Single callback | Two callbacks (charge + execution) |
| Return format | `{ content: [...] }` | `{ content: [...], structuredContent: T }` |

The Vercel adapter wraps the standard MCP SDK's `McpServer.tool()` method, which has no concept of:
- Payment state management
- Conditional execution based on payment status
- Separate pricing logic from execution logic

### 2. Two-Phase Payment Flow Not Supported

PaidMCP implements a two-phase flow that cannot be retrofitted into the Vercel adapter:

```
Phase 1: Client calls tool WITHOUT payment_hash
         → Server invokes charge callback
         → Server generates Lightning invoice via NWC
         → Server stores payment_hash as valid
         → Server returns { payment_request, payment_hash }

Phase 2: Client calls tool WITH payment_hash
         → Server validates payment_hash exists and unused
         → Server verifies payment via NWC lookup
         → Server invokes tool callback
         → Server invalidates payment_hash (one-time use)
         → Server returns tool result
```

The Vercel adapter executes the tool callback immediately on every call with no interception points.

### 3. Missing Integration Points

The Vercel adapter doesn't expose hooks for:

| Required Hook | Purpose | Vercel Support |
|---------------|---------|----------------|
| Pre-execution | Invoke charge callback, check payment | None |
| Payment storage | Track valid/used payment hashes | Redis (sessions only) |
| NWC integration | Generate/verify invoices | None |
| Conditional routing | Branch on payment_hash presence | None |
| Post-execution | Invalidate payment hash | None |

### 4. PaidMcpServer is Not a Plugin

`@getalby/paidmcp` exports `PaidMcpServer`, a complete server class that extends the MCP SDK. It's designed to be the server, not a middleware or plugin:

```typescript
// PaidMCP expects this pattern:
const server = new PaidMcpServer(
  { name: "my-server", version: "1.0.0" },
  { nwcUrl: process.env.NWC_URL, storage: new MemoryStorage() }
);
server.registerPaidTool(...);

// NOT this pattern:
const handler = createMcpHandler((server) => {
  // server here is Vercel's wrapper, not PaidMcpServer
  // Cannot call server.registerPaidTool()
});
```

## Implementation

### Custom MCP Handler Structure

```typescript
// src/app/[transport]/route.ts

// Payment infrastructure
const paymentStorage = new Map<string, { valid: boolean; created: number }>();
let nwcClient: NWCClient | null = null;

// Manual JSON-RPC routing
async function handleMcpRequest(body: JsonRpcRequest) {
  switch (body.method) {
    case "initialize": return { result: { capabilities: { tools: {} } } };
    case "tools/list": return { result: { tools: [...FREE_TOOLS, ...PAID_TOOLS] } };
    case "tools/call": return handleToolCall(body.params);
  }
}

// Two-phase payment flow for paid tools
async function handleToolCall({ name, arguments: args }) {
  if (name === "searchSnippetsPremium") {
    const paymentHash = args.payment_hash;

    // Phase 1: Generate invoice
    if (!paymentHash) {
      const invoice = await generateInvoice(PRICE, description);
      return {
        result: {
          content: [{
            type: "text",
            text: JSON.stringify({
              payment_required: true,
              payment_request: invoice.payment_request,
              payment_hash: invoice.payment_hash,
            })
          }]
        }
      };
    }

    // Phase 2: Verify and execute
    if (!isPaymentValid(paymentHash)) return { error: "Invalid hash" };
    if (!await verifyPayment(paymentHash)) return { error: "Not paid" };
    invalidatePayment(paymentHash);
    return { result: await executeSearchSnippetsPremium(args) };
  }

  // Free tools execute immediately
  if (name === "fetchCodeSnippets") {
    return { result: await executeFetchCodeSnippets(args) };
  }
}
```

### Trade-offs

| Aspect | Vercel Adapter | Custom Handler |
|--------|---------------|----------------|
| Setup complexity | Low (declarative) | Higher (manual JSON-RPC) |
| Payment support | None | Full two-phase flow |
| SSE support | Built-in with Redis | Manual implementation |
| Type safety | Zod integration | Manual validation |
| Maintenance | Vercel-managed | Self-maintained |
| Flexibility | Limited to adapter API | Full control |

## Alternatives Considered

### 1. Run Separate PaidMCP Server

Run `@getalby/paidmcp` as a standalone STDIO or HTTP server alongside the Vercel deployment.

**Rejected because:**
- Requires separate infrastructure
- Complicates deployment (two services)
- Increases latency (extra hop)
- Fragments the API surface

### 2. Fork Vercel Adapter

Modify `@vercel/mcp-adapter` to support payment hooks.

**Rejected because:**
- Significant maintenance burden
- Would diverge from upstream
- Payment flow is fundamental, not a small patch

### 3. Middleware Wrapper

Wrap Vercel adapter calls with payment logic.

**Rejected because:**
- Vercel adapter doesn't expose tool execution hooks
- Would require patching internals
- Fragile to adapter updates

## Consequences

### Positive

- Full control over MCP protocol implementation
- Native two-phase payment flow support
- Can mix free and paid tools seamlessly
- Direct NWC integration without abstractions
- Flexibility for future payment models

### Negative

- Must maintain JSON-RPC handling manually
- Lost Vercel adapter's Redis session management
- More code to test and maintain
- Must track MCP protocol changes ourselves

### Neutral

- Similar deployment model (Next.js API routes)
- Same Nostr/Lightning dependencies
- Comparable performance characteristics

## References

- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [PaidMCP Architecture](./architecture.md)
- [Two-Phase Payment Flow](./001-two-phase-payment.md)
- [NWC over LNURL Decision](./002-nwc-over-lnurl.md)
- [@vercel/mcp-adapter](https://github.com/vercel/mcp-adapter)
- [@getalby/paidmcp](https://github.com/getAlby/paidmcp)
