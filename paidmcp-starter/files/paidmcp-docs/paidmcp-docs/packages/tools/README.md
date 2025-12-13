# Module: tools

## Purpose

Contains paid tool implementations. Each tool is a self-contained unit that defines its schema, pricing, and execution logic.

## Public API

```typescript
// Each tool exports a registration function
export function registerToolName(server: PaidMcpServer): void

// Optional: barrel export for all tools
export function registerAllTools(server: PaidMcpServer): void
```

## Invariants

1. **Every tool MUST have both callbacks**: charge callback AND tool callback
2. **Input schemas MUST use `.describe()`**: LLM needs parameter descriptions
3. **Tool callbacks MUST return both formats**:
   ```typescript
   { content: [{ type: "text", text: "..." }], structuredContent: T }
   ```
4. **Charge callbacks MUST return**:
   ```typescript
   { satoshi: number, description: string }
   ```
5. **No console.log()**: Breaks STDIO transport; use `console.error()` for debugging

## Dependencies

| Allowed | Forbidden |
|---------|-----------|
| `@getalby/paidmcp` | `../transports/*` |
| `zod` | Direct storage access |
| External APIs (fetch) | |
| Node.js built-ins | |

## File Structure

```
tools/
├── index.ts              # Barrel export
├── get_weather.ts        # Example: weather lookup
├── send_email.ts         # Example: email sending
└── [your_tool].ts        # Your tools here
```

## Adding a New Tool

### Step 1: Create the file

```typescript
// src/tools/my_tool.ts
import { z } from "zod";
import { PaidMcpServer } from "@getalby/paidmcp";

export function registerMyTool(server: PaidMcpServer) {
  server.registerPaidTool(
    "my_tool",  // Tool name (snake_case)
    {
      title: "My Tool",
      description: "What this tool does - be specific for LLM",
      inputSchema: {
        param1: z.string().describe("What this parameter is for"),
      },
      outputSchema: {
        result: z.string().describe("What the result contains"),
      },
    },
    // Charge callback
    async (params) => ({
      satoshi: 21,
      description: `My tool: ${params.param1}`,
    }),
    // Tool callback
    async (params) => {
      const result = { result: `Processed: ${params.param1}` };
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
        structuredContent: result,
      };
    }
  );
}
```

### Step 2: Add to barrel export

```typescript
// src/tools/index.ts
export { registerMyTool } from "./my_tool.js";

// Or create a registerAll function
import { registerMyTool } from "./my_tool.js";
import { registerOtherTool } from "./other_tool.js";

export function registerAllTools(server: PaidMcpServer) {
  registerMyTool(server);
  registerOtherTool(server);
}
```

### Step 3: Register in server

```typescript
// src/mcp_server.ts
import { registerMyTool } from "./tools/my_tool.js";

export function createMcpServer() {
  const server = new PaidMcpServer(...);
  registerMyTool(server);  // Add this line
  return server;
}
```

## Testing

```bash
# Build first
npm run build

# Interactive testing
npm run inspect
# → Select your tool
# → Enter test parameters
# → Observe invoice generation
# → (Pay invoice if testing full flow)
# → Verify response
```

## Common Patterns

### External API Integration

```typescript
async (params) => {
  const response = await fetch(`https://api.example.com/${params.id}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const data = await response.json() as ExpectedType;
  return {
    content: [{ type: "text", text: JSON.stringify(data) }],
    structuredContent: data,
  };
}
```

### Dynamic Pricing

```typescript
async (params) => ({
  satoshi: params.items.length * 10,  // 10 sats per item
  description: `Processing ${params.items.length} items`,
})
```

### Validation with Clear Errors

```typescript
async (params) => {
  if (params.query.length < 3) {
    throw new Error("Query must be at least 3 characters");
  }
  // ... rest of logic
}
```
