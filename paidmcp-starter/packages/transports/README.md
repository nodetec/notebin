# Module: transports

## Purpose

HTTP and SSE transport handlers for web-based MCP communication. STDIO transport is handled directly in `index.ts` using the MCP SDK.

## Public API

```typescript
// HTTP Streamable (recommended for web)
export function addStreamableHttpEndpoints(app: Express): void

// SSE (legacy, for clients that require it)
export function addSSEEndpoints(app: Express): void
```

## Invariants

1. **Stateless HTTP**: Each request creates a new server instance
2. **Session SSE**: SSE maintains sessions; requires cleanup on disconnect
3. **Transport must close**: Always close transport on request end/error
4. **Error responses**: Return JSON-RPC formatted errors

## Dependencies

| Allowed | Forbidden |
|---------|-----------|
| `../mcp_server.ts` (createMcpServer) | `../tools/*` |
| `@modelcontextprotocol/sdk` transports | `../storage/*` |
| `express` | Direct tool registration |

## Transport Options

### STDIO (Default)

**When to use**: Claude Desktop, CLI tools, local development

**Location**: Handled in `src/index.ts`, not in this module

```typescript
// src/index.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const transport = new StdioServerTransport();
const server = createMcpServer();
await server.connect(transport);
```

### HTTP Streamable (Recommended for Web)

**When to use**: Web services, remote access, multiple clients

**Characteristics**:
- ✅ Stateless (easy to scale)
- ✅ Standard HTTP semantics
- ✅ Supports streaming responses
- ❌ No persistent connection (each call is new)

```typescript
// src/transports/streamable_http.ts
import { Express, Request, Response, json } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "../mcp_server.js";

export function addStreamableHttpEndpoints(app: Express) {
  app.post("/mcp", json(), async (req: Request, res: Response) => {
    try {
      const server = createMcpServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,  // Stateless
      });

      res.on("close", () => {
        transport.close();
        server.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP request error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });
}
```

### SSE (Legacy)

**When to use**: Clients that only support Server-Sent Events

**Characteristics**:
- ⚠️ Requires session management
- ⚠️ Memory leak risk if sessions not cleaned
- ⚠️ Two endpoints required (GET /sse, POST /messages)
- ✅ Real-time streaming

```typescript
// src/transports/sse.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Express } from "express";
import { createMcpServer } from "../mcp_server.js";

export function addSSEEndpoints(app: Express) {
  const sessions: Record<string, { 
    server: McpServer; 
    transport: SSEServerTransport 
  }> = {};

  // Client connects here to establish SSE stream
  app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport("/messages", res);
    const server = createMcpServer();
    sessions[transport.sessionId] = { server, transport };
    
    // Cleanup on disconnect
    res.on("close", () => {
      delete sessions[transport.sessionId];
    });
    
    server.connect(transport);
  });

  // Client sends messages here
  app.post("/messages", (req, res) => {
    const sessionId = req.query.sessionId as string;
    const session = sessions[sessionId];
    if (session) {
      session.transport.handlePostMessage(req, res);
    } else {
      res.status(400).json({ error: "Session not found" });
    }
  });
}
```

## File Structure

```
transports/
├── index.ts              # Barrel export
├── streamable_http.ts    # HTTP Streamable transport
└── sse.ts                # SSE transport (legacy)
```

## Integration

```typescript
// src/index.ts
import express from "express";
import { addStreamableHttpEndpoints } from "./transports/streamable_http.js";

async function runHTTP() {
  const app = express();
  app.use(express.json());
  
  addStreamableHttpEndpoints(app);
  // Or: addSSEEndpoints(app);
  
  const port = parseInt(process.env.PORT || "3000");
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
```

## Error Handling

All transport errors should return JSON-RPC formatted responses:

```typescript
// Error response format
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32603,  // Internal error
    "message": "Description of what went wrong"
  },
  "id": null
}
```

Common error codes:
- `-32600`: Invalid request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error

## Testing

```bash
# Start HTTP server
MODE=HTTP npm start

# Test with curl
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'
```
