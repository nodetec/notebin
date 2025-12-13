# Guide: Transport Modes

PaidMCP servers support three transport modes for different use cases.

## Overview

| Transport | Use Case | Stateful | Complexity |
|-----------|----------|----------|------------|
| **STDIO** | Claude Desktop, CLI tools | No | Low |
| **HTTP Streamable** | Web services, remote access | No | Medium |
| **SSE** | Legacy streaming clients | Yes | High |

## STDIO Mode (Default)

### When to Use

- Claude Desktop integration
- Local CLI tools
- Development and testing
- Single-user applications

### Characteristics

- ✅ Simple setup
- ✅ No HTTP server needed
- ✅ Built-in streaming
- ❌ No console.log() allowed (breaks protocol)
- ❌ Single client only

### Implementation

Already included in the quick-start template:

```typescript
// src/index.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./mcp_server.js";

async function runSTDIO() {
  const transport = new StdioServerTransport();
  const server = createMcpServer();
  await server.connect(transport);
}

runSTDIO().catch(console.error);
```

### Running

```bash
npm run build
npm start
# Or via Claude Desktop config
```

### Important: No console.log()

STDIO uses stdout for MCP protocol communication. Any `console.log()` will corrupt messages.

```typescript
// ❌ WRONG: Breaks STDIO
console.log("Debug:", params);

// ✅ CORRECT: Use stderr
console.error("Debug:", params);
```

## HTTP Streamable Mode

### When to Use

- Web applications
- Remote access over internet
- Multiple concurrent clients
- Horizontal scaling
- API integration

### Characteristics

- ✅ Stateless (scales easily)
- ✅ Standard HTTP semantics
- ✅ Multiple clients
- ✅ Streaming responses
- ❌ Requires Express server
- ❌ Each request creates new server instance

### Implementation

Create `src/transports/streamable_http.ts`:

```typescript
import { Express, Request, Response, json } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "../mcp_server.js";

export function addStreamableHttpEndpoints(app: Express) {
  app.post("/mcp", json(), async (req: Request, res: Response) => {
    try {
      // Create new server and transport per request (stateless mode)
      const server = createMcpServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless
      });

      // Cleanup on connection close
      res.on("close", () => {
        transport.close();
        server.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling MCP request:", error);
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

Update `src/index.ts` to support HTTP mode:

```typescript
#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import express from "express";
import { createMcpServer } from "./mcp_server.js";
import { addStreamableHttpEndpoints } from "./transports/streamable_http.js";

dotenv.config();

async function runSTDIO() {
  try {
    const transport = new StdioServerTransport();
    const server = createMcpServer();
    await server.connect(transport);
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to start server: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

async function runHTTP() {
  const app = express();
  app.use(express.json());

  // Add MCP endpoint
  addStreamableHttpEndpoints(app);

  const port = parseInt(process.env.PORT || "3000");
  app.listen(port, () => {
    console.log(`PaidMCP server running in HTTP mode on port ${port}`);
  });
}

// Transport selection based on MODE environment variable
switch (process.env.MODE || "STDIO") {
  case "HTTP":
    runHTTP().catch(console.error);
    break;
  case "STDIO":
  default:
    runSTDIO().catch(console.error);
    break;
}
```

### Running

```bash
# Build first
npm run build

# Run in HTTP mode
npm run start:http
# Or
MODE=HTTP npm start
```

### Testing

```bash
# List available tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 1
  }'

# Call a tool (Phase 1: Get invoice)
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "example_tool",
      "arguments": {
        "message": "Hello"
      }
    },
    "id": 2
  }'
```

## SSE Mode (Legacy)

### When to Use

- Clients that require Server-Sent Events
- Real-time streaming requirements
- Legacy integrations

### Characteristics

- ⚠️ Requires session management
- ⚠️ Memory leak risk if sessions not cleaned
- ⚠️ More complex than HTTP Streamable
- ✅ Real-time event streaming
- ✅ Persistent connection

### Implementation

Create `src/transports/sse.ts`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Express } from "express";
import { createMcpServer } from "../mcp_server.js";

export function addSSEEndpoints(app: Express) {
  const sessions: Record<
    string,
    { server: McpServer; transport: SSEServerTransport }
  > = {};

  // GET /sse - Client connects to establish SSE stream
  app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport("/messages", res);
    const server = createMcpServer();
    sessions[transport.sessionId] = { server, transport };

    // Cleanup on disconnect
    res.on("close", () => {
      delete sessions[transport.sessionId];
      console.error(`Session ${transport.sessionId} closed`);
    });

    await server.connect(transport);
  });

  // POST /messages - Client sends messages here
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

Update `src/index.ts` to add SSE mode:

```typescript
async function runSSE() {
  const app = express();
  app.use(express.json());

  // Add SSE endpoints
  addSSEEndpoints(app);

  const port = parseInt(process.env.PORT || "3000");
  app.listen(port, () => {
    console.log(`PaidMCP server running in SSE mode on port ${port}`);
  });
}

// Update switch statement
switch (process.env.MODE || "STDIO") {
  case "HTTP":
    runHTTP().catch(console.error);
    break;
  case "SSE":
    runSSE().catch(console.error);
    break;
  case "STDIO":
  default:
    runSTDIO().catch(console.error);
    break;
}
```

### Running

```bash
MODE=SSE npm start
```

### Testing

```bash
# Open SSE connection (keep this running)
curl -N http://localhost:3000/sse

# In another terminal, send message (replace SESSION_ID from SSE response)
curl -X POST "http://localhost:3000/messages?sessionId=SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 1
  }'
```

## Choosing a Transport

### Decision Matrix

| Requirement | Recommended Transport |
|-------------|----------------------|
| Claude Desktop integration | STDIO |
| Web application | HTTP Streamable |
| Remote API access | HTTP Streamable |
| Real-time events | SSE |
| Horizontal scaling | HTTP Streamable |
| Simplest setup | STDIO |
| Multiple concurrent users | HTTP Streamable |

### Production Recommendations

1. **STDIO**: For desktop integrations only
2. **HTTP Streamable**: Default choice for web services
3. **SSE**: Only if client specifically requires it

### Hybrid Setup

You can support multiple transports:

```typescript
// index.ts
const mode = process.env.MODE || "STDIO";

if (mode === "HTTP" || mode === "SSE") {
  const app = express();
  app.use(express.json());

  if (mode === "HTTP") {
    addStreamableHttpEndpoints(app);
  } else {
    addSSEEndpoints(app);
  }

  const port = parseInt(process.env.PORT || "3000");
  app.listen(port);
} else {
  runSTDIO();
}
```

## Error Handling

All transports should return MCP-compatible error responses:

```typescript
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32603,  // Internal error
    "message": "Error description"
  },
  "id": null
}
```

Common error codes:
- `-32600`: Invalid request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error

## Next Steps

- [Implement custom storage](custom-storage.md) for production
- [Add more tools](creating-tools.md)
- See [packages/transports/README.md](../../packages/transports/README.md) for module details
