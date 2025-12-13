---
name: paidmcp
description: Guide for building paid MCP servers that charge Bitcoin Lightning payments for tool usage. This skill should be used when users want to create MCP servers with paid tools, implement payment callbacks, configure NWC wallets, set up custom storage, or configure transport modes.
---

# PaidMCP

PaidMCP enables charging Bitcoin Lightning payments for MCP server tools using Nostr Wallet Connect (NWC). It wraps the official MCP SDK, adding payment verification to tool execution.

## Critical Invariants

These rules are ALWAYS true. Violating them will break the system:

1. **Payment hashes are one-time use** — after tool execution, hash is invalidated
2. **Charge callback runs first** — determines invoice amount BEFORE payment
3. **Tool callback requires verified payment** — NEVER executes unpaid
4. **STDIO mode: no console.log** — use `console.error()` for debugging
5. **ES2022 imports need .js extension** — `import from "./file.js"` not `"./file"`
6. **Tool responses need both formats** — `content[]` AND `structuredContent`

## Task-Based Workflows

Determine the task type, then follow the corresponding workflow:

| Task | Workflow |
|------|----------|
| Creating a new paid MCP server | → [New Server Workflow](#new-server-workflow) |
| Adding a tool to existing server | → [Add Tool Workflow](#add-tool-workflow) |
| Implementing persistent storage | → [Custom Storage Workflow](#custom-storage-workflow) |
| Configuring HTTP transport | → [Transport Workflow](#transport-workflow) |
| Debugging payment issues | → See `references/troubleshooting.md` |

---

### New Server Workflow

To create a new paid MCP server from scratch:

1. **Initialize project** with ES module support:
   ```bash
   npm init -y
   # Add "type": "module" to package.json
   ```

2. **Install dependencies**:
   ```bash
   npm install @getalby/paidmcp @modelcontextprotocol/sdk zod
   npm install -D typescript @types/node
   ```

3. **Configure TypeScript** (`tsconfig.json`):
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "ES2022",
       "moduleResolution": "bundler",
       "outDir": "./build",
       "rootDir": "./src",
       "strict": true
     }
   }
   ```

4. **Create server** (`src/mcp_server.ts`):
   ```typescript
   import { MemoryStorage, PaidMcpServer } from "@getalby/paidmcp";
   import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

   const storage = new MemoryStorage();

   export function createMcpServer(): McpServer {
     if (!process.env.NWC_URL) {
       throw new Error("NWC_URL environment variable is required");
     }

     const server = new PaidMcpServer(
       { name: "my-server", version: "1.0.0" },
       { nwcUrl: process.env.NWC_URL, storage }
     );

     // Register tools here
     return server;
   }
   ```

5. **Create entry point** (`src/index.ts`):
   ```typescript
   import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
   import { createMcpServer } from "./mcp_server.js";

   const transport = new StdioServerTransport();
   const server = createMcpServer();
   await server.connect(transport);
   ```

6. **Set environment**: Create `.env` with `NWC_URL="nostr+walletconnect://..."`

7. **Add tools**: Follow [Add Tool Workflow](#add-tool-workflow)

---

### Add Tool Workflow

To add a paid tool to an existing server:

1. **Create tool file** using `assets/tool_template.ts` as starting point

2. **Define the tool** with four required arguments:
   ```typescript
   server.registerPaidTool(
     "tool_name",           // 1. snake_case identifier
     { inputSchema, outputSchema, ... },  // 2. Zod schemas
     async (params) => ({ satoshi, description }),  // 3. Charge callback
     async (params) => ({ content, structuredContent })  // 4. Tool callback
   );
   ```

3. **Implement charge callback** — determines payment dynamically:
   ```typescript
   async (params) => ({
     satoshi: params.premium ? 100 : 21,
     description: `Service: ${params.input}`,
   })
   ```

4. **Implement tool callback** — executes ONLY after payment verified:
   ```typescript
   async (params) => {
     const result = { /* your logic */ };
     return {
       content: [{ type: "text", text: JSON.stringify(result) }],
       structuredContent: result,
     };
   }
   ```

5. **Add Zod descriptions** — ALWAYS use `.describe()` for LLM context:
   ```typescript
   inputSchema: {
     city: z.string().describe("The city to look up"),
   }
   ```

6. **Register in server** — import and call registration function in `mcp_server.ts`

7. **Test with MCP Inspector**: `npx @modelcontextprotocol/inspector node build/index.js`

---

### Custom Storage Workflow

To implement persistent storage (required for production):

1. **Choose storage backend**: Redis (recommended), PostgreSQL, or SQLite

2. **Implement IStorage interface**:
   ```typescript
   import { IStorage } from "@getalby/paidmcp";

   class RedisStorage implements IStorage {
     async isValid(paymentHash: string): Promise<boolean> {
       // Return true if hash exists and unused
     }
     async setValid(paymentHash: string, valid: boolean): Promise<void> {
       // If valid=true: store hash (invoice created)
       // If valid=false: delete hash (tool executed)
     }
   }
   ```

3. **Replace MemoryStorage** in server initialization

4. **Add expiry** — set TTL on valid hashes (1 hour recommended for unpaid invoices)

See `references/api_reference.md` for IStorage contract details.

---

### Transport Workflow

To configure transport mode:

**STDIO (default)** — for Claude Desktop, CLI tools:
```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
const transport = new StdioServerTransport();
await server.connect(transport);
```

**HTTP Streamable** — for web services, remote access:
```typescript
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => { transport.close(); server.close(); });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(3000);
```

| Transport | Use Case | console.log OK? |
|-----------|----------|-----------------|
| STDIO | Claude Desktop, CLI | NO (use stderr) |
| HTTP | Web services, APIs | Yes |

---

## Payment Flow

The two-phase payment flow is automatic:

```
Phase 1: Tool call (no payment_hash)
         → Charge callback runs
         → Invoice generated via NWC
         → Returns { payment_request, payment_hash }

Phase 2: Tool call (with payment_hash)
         → Payment verified via NWC
         → Tool callback executes
         → Hash invalidated (one-time use)
```

---

## Anti-Patterns

Avoid these common mistakes:

| Anti-Pattern | Problem | Correct Approach |
|--------------|---------|------------------|
| `console.log()` in STDIO | Breaks protocol | Use `console.error()` |
| Missing `.js` in imports | Runtime module error | Always use `.js` extension |
| Hardcoded NWC_URL | Security risk | Use `process.env.NWC_URL` |
| Missing `structuredContent` | Invalid tool response | Return both `content[]` AND `structuredContent` |
| Missing `.describe()` on Zod | LLM can't understand params | Always add descriptions |
| MemoryStorage in production | Loses hashes on restart | Implement persistent storage |
| Reusing payment_hash | Security vulnerability | Each hash is single-use |

---

## Resources

### references/

- `api_reference.md` — Complete API: PaidMcpServer, IStorage, IWallet, ChargeCallback
- `troubleshooting.md` — Common errors and solutions

### assets/

- `tool_template.ts` — Boilerplate for creating new paid tools
