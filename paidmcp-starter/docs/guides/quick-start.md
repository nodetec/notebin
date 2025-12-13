# Guide: Quick Start

Get a PaidMCP server running from scratch in 15 minutes.

## Prerequisites

- Node.js 20+ installed
- A Lightning wallet with NWC support (Alby, Zeus, etc.)
- Basic TypeScript knowledge

## 1. Project Setup

### Initialize Project

```bash
# Create project directory
mkdir my-paid-mcp-server
cd my-paid-mcp-server

# Initialize npm project
npm init -y
```

### Add ES Module Support

Edit `package.json` and add:

```json
{
  "type": "module"
}
```

## 2. Install Dependencies

### Core Dependencies

```bash
npm install @getalby/paidmcp @modelcontextprotocol/sdk zod
```

### Optional: HTTP Transport Support

```bash
npm install express dotenv
```

### Development Dependencies

```bash
npm install -D typescript @types/node @types/express
```

## 3. Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 4. Update package.json Scripts

Add to your `package.json`:

```json
{
  "name": "my-paid-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "build/index.js",
  "bin": {
    "mcp": "build/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node build/index.js",
    "start:http": "MODE=HTTP node build/index.js",
    "inspect": "npx @modelcontextprotocol/inspector node build/index.js"
  }
}
```

## 5. Project Structure

Create this directory structure:

```
my-paid-mcp-server/
├── src/
│   ├── index.ts           # Entry point with transport selection
│   ├── mcp_server.ts      # Server initialization
│   └── tools/             # Paid tool implementations
│       ├── index.ts       # Barrel export for tools
│       └── example_tool.ts # Your first tool
├── build/                 # Compiled output (created by tsc)
├── package.json
├── tsconfig.json
├── .env                   # Environment variables (gitignored)
├── .env.example           # Example environment file
└── .gitignore
```

## 6. Environment Configuration

### Create .env.example

```bash
# Required: Nostr Wallet Connect URL from your Lightning wallet
# Get this from Alby, Zeus, or any NWC-compatible wallet
NWC_URL="nostr+walletconnect://..."

# Optional: HTTP server port (default: 3000)
PORT=3000

# Optional: Transport mode (default: STDIO)
# Values: STDIO | HTTP
MODE=STDIO
```

### Create .gitignore

```
node_modules/
build/
.env
*.log
```

### Getting an NWC URL

1. **Alby**: Go to Settings > Wallet Connections > Add Connection
2. **Zeus**: Settings > NWC > Create New Connection
3. **Other wallets**: Check for NWC/Nostr Wallet Connect support

The NWC URL format: `nostr+walletconnect://pubkey?relay=wss://...&secret=...`

### Create .env

Copy `.env.example` to `.env` and add your actual NWC URL:

```bash
cp .env.example .env
# Edit .env and add your NWC_URL
```

## 7. Create Server Code

### src/mcp_server.ts

```typescript
import { MemoryStorage, PaidMcpServer } from "@getalby/paidmcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerExampleTool } from "./tools/example_tool.js";

const storage = new MemoryStorage();

export function createMcpServer(): McpServer {
  if (!process.env.NWC_URL) {
    throw new Error("NWC_URL environment variable is required");
  }

  const server = new PaidMcpServer(
    {
      name: "my-paid-mcp-server",
      version: "1.0.0",
      title: "My Paid MCP Server",
    },
    { nwcUrl: process.env.NWC_URL, storage }
  );

  // Register all paid tools
  registerExampleTool(server);

  return server;
}
```

### src/tools/example_tool.ts

```typescript
import { z } from "zod";
import { PaidMcpServer } from "@getalby/paidmcp";

export function registerExampleTool(server: PaidMcpServer) {
  server.registerPaidTool(
    "example_tool",
    {
      title: "Example Tool",
      description: "A simple example tool that echoes your input",
      inputSchema: {
        message: z.string().describe("The message to echo back"),
      },
      outputSchema: {
        result: z.string().describe("The echoed message"),
        timestamp: z.string().describe("When the message was processed"),
      },
    },
    // Charge callback - determines payment amount
    async (params) => ({
      satoshi: 21,
      description: `Example tool: ${params.message}`,
    }),
    // Tool callback - executes after payment verified
    async (params) => {
      const result = {
        result: `You said: ${params.message}`,
        timestamp: new Date().toISOString(),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
        structuredContent: result,
      };
    }
  );
}
```

### src/index.ts

```typescript
#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { createMcpServer } from "./mcp_server.js";

// Load environment variables
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

// Transport selection based on MODE environment variable
switch (process.env.MODE || "STDIO") {
  case "STDIO":
  default:
    runSTDIO().catch(console.error);
    break;
}
```

## 8. Build and Test

### Build the Project

```bash
npm run build
```

### Test with MCP Inspector

```bash
npm run inspect
```

This opens an interactive UI where you can:
1. See your registered tools
2. Call tools with test parameters
3. View invoice generation (Phase 1)
4. Pay invoices (if testing full flow)
5. Verify tool execution (Phase 2)

## 9. Claude Desktop Integration

Add to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "my-paid-server": {
      "command": "node",
      "args": ["/absolute/path/to/my-paid-mcp-server/build/index.js"],
      "env": {
        "NWC_URL": "nostr+walletconnect://..."
      }
    }
  }
}
```

Restart Claude Desktop to load the server.

## 10. Verify It Works

In Claude Desktop:

1. Ask: "What tools do you have available?"
2. Claude should list your `example_tool`
3. Ask: "Use the example tool with message 'Hello World'"
4. Claude will show you a payment invoice
5. Pay the invoice in your Lightning wallet
6. Claude will retry and show the result

## Next Steps

- [Create more paid tools](creating-tools.md)
- [Add HTTP transport](transport-modes.md) for web services
- [Implement persistent storage](custom-storage.md) for production
- Read [conventions.md](../conventions.md) for code style guidelines

## Troubleshooting

**"Cannot find module" errors**
- Ensure all imports use `.js` extension (not `.ts`)
- Run `npm run build` before testing

**"NWC_URL environment variable is required"**
- Check that `.env` file exists and contains valid NWC URL
- Verify NWC URL format: `nostr+walletconnect://...`

**STDIO transport not responding**
- Remove all `console.log()` statements (breaks STDIO protocol)
- Use `console.error()` for debugging instead

See [troubleshooting.md](troubleshooting.md) for more help.
