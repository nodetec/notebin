# Code Conventions

## File Organization

### Structure Rules

| Rule | Rationale |
|------|-----------|
| One tool per file | Keeps context small, easy to understand |
| Max 200 LOC per file | Forces decomposition, fits in LLM context |
| Max 40 LOC per function | Single responsibility, testable |
| Barrel exports for directories | Clean imports from outside the module |

### Directory Layout

```
src/
├── index.ts              # Entry point only - transport selection
├── mcp_server.ts         # Server creation only - no tool logic here
├── tools/
│   ├── index.ts          # Barrel: export { registerAllTools } or individual exports
│   ├── get_weather.ts    # One file per tool
│   └── send_email.ts
├── storage/
│   ├── index.ts          # Barrel: export implementations
│   ├── memory.ts         # MemoryStorage (default)
│   └── redis.ts          # RedisStorage (production example)
└── transports/
    ├── streamable_http.ts
    └── sse.ts
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Tool names | `snake_case` | `get_weather`, `send_notification` |
| Function names | `camelCase` | `registerGetWeatherTool`, `createMcpServer` |
| Type/Interface names | `PascalCase` | `WeatherResult`, `IStorage`, `ChargeCallback` |
| File names | `snake_case.ts` | `get_weather.ts`, `database_storage.ts` |
| Environment variables | `SCREAMING_SNAKE_CASE` | `NWC_URL`, `PORT`, `MODE` |
| Constants | `SCREAMING_SNAKE_CASE` | `DEFAULT_PORT`, `MAX_RETRIES` |

## Import Conventions

### ES2022 Module Requirements

```typescript
// ✅ CORRECT: .js extension required
import { createMcpServer } from "./mcp_server.js";
import { registerGetWeatherTool } from "./tools/get_weather.js";

// ❌ WRONG: Missing extension - will fail at runtime
import { createMcpServer } from "./mcp_server";
```

### Import Order

```typescript
// 1. Node.js built-ins
import { readFile } from "fs/promises";

// 2. External packages
import { z } from "zod";
import { PaidMcpServer } from "@getalby/paidmcp";

// 3. Internal modules (relative imports)
import { createMcpServer } from "./mcp_server.js";
```

## Tool Implementation Patterns

### Registration Function Pattern

```typescript
// tools/my_tool.ts
import { z } from "zod";
import { PaidMcpServer } from "@getalby/paidmcp";

export function registerMyTool(server: PaidMcpServer) {
  server.registerPaidTool(
    "my_tool",           // snake_case name
    { /* config */ },
    async (params) => ({ /* charge */ }),
    async (params) => ({ /* result */ })
  );
}
```

### Zod Schema Convention

```typescript
inputSchema: {
  // ALWAYS include .describe() - this is what the LLM sees
  city: z.string().describe("The city name to look up"),
  
  // Use clear descriptions for optional params
  units: z.enum(["celsius", "fahrenheit"])
    .optional()
    .describe("Temperature units. Defaults to celsius if not specified."),
    
  // Numbers should indicate valid ranges in description
  limit: z.number()
    .min(1)
    .max(100)
    .optional()
    .describe("Maximum results to return (1-100, default: 10)"),
}
```

### Tool Response Format

```typescript
// ALWAYS return BOTH content and structuredContent
return {
  content: [
    { type: "text", text: JSON.stringify(result) }
  ],
  structuredContent: result,  // Must match outputSchema type
};
```

### Charge Callback Pattern

```typescript
// Simple fixed pricing
async (params) => ({
  satoshi: 21,
  description: `Weather lookup for ${params.city}`,
})

// Dynamic pricing
async (params) => ({
  satoshi: params.premium ? 100 : 21,
  description: `${params.premium ? "Premium" : "Standard"} weather for ${params.city}`,
})
```

## Error Handling

### In Tool Callbacks

```typescript
async (params) => {
  // Validate and throw - server will catch and format
  if (!data.length) {
    throw new Error(`City not found: ${params.city}`);
  }
  
  // Never return error objects, always throw
  return { content: [...], structuredContent: result };
}
```

### Debugging (STDIO-safe)

```typescript
// ✅ CORRECT: stderr doesn't interfere with STDIO protocol
console.error("Debug:", JSON.stringify(params));

// ❌ WRONG: stdout breaks STDIO communication
console.log("Debug:", params);
```

## TypeScript Conventions

### Strict Mode Required

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Type Assertions for External APIs

```typescript
// Type external API responses
const geoData = await response.json() as { lat: string; lon: string }[];

// Or use type guards for runtime safety
function isGeoResult(data: unknown): data is { lat: string; lon: string }[] {
  return Array.isArray(data) && data.every(
    item => typeof item.lat === "string" && typeof item.lon === "string"
  );
}
```

## Documentation Conventions

### Docstrings for Exported Symbols

```typescript
/**
 * Registers the weather lookup tool with the server.
 * 
 * Invariants:
 * - Requires valid city name (validated by geocoding API)
 * - Charges 21 sats per lookup
 * 
 * @param server - The PaidMcpServer instance to register with
 */
export function registerGetWeatherTool(server: PaidMcpServer) { ... }
```

### Context Hooks in Code

```typescript
// invariant: payment_hash is single-use, invalidated after execution
// docs: docs/adr/001-two-phase-payment.md
async function verifyAndExecute(...) { ... }
```

## Testing Conventions

### Manual Testing with Inspector

```bash
# Always test tools with MCP Inspector before deploying
npm run build
npm run inspect
```

### Test File Location

```
src/
├── tools/
│   ├── get_weather.ts
│   └── get_weather.test.ts   # Co-located test file
```
