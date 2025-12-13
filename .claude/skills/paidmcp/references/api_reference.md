# PaidMCP API Reference

## PaidMcpServer

Main class that extends `McpServer` from the official MCP SDK.

### Constructor

```typescript
constructor(
  serverInfo: Implementation,
  paidArgs: { nwcUrl: string; storage?: IStorage },
  options?: ServerOptions
)
```

**Parameters:**
- `serverInfo` - Server metadata (`{ name: string, version?: string }`)
- `paidArgs.nwcUrl` - NWC connection string (`nostr+walletconnect://...`)
- `paidArgs.storage` - Optional storage implementation (default: `MemoryStorage`)
- `options` - Standard MCP ServerOptions

### registerPaidTool

```typescript
registerPaidTool<InputArgs extends ZodRawShape, OutputArgs extends ZodRawShape>(
  name: string,
  config: {
    title?: string;
    description?: string;
    inputSchema?: InputArgs;
    outputSchema?: OutputArgs;
    annotations?: ToolAnnotations;
  },
  charge: ChargeCallback<InputArgs>,
  cb: ToolCallback<InputArgs>
): RegisteredTool
```

**Parameters:**
- `name` - Unique tool identifier
- `config.title` - Human-readable tool name
- `config.description` - Tool description for LLM context
- `config.inputSchema` - Zod schema object for input validation
- `config.outputSchema` - Zod schema object for output typing
- `charge` - Callback returning payment requirements
- `cb` - Tool execution callback (runs after payment verified)

## ChargeCallback

```typescript
type ChargeCallback<InputArgs> = (
  params: z.objectOutputType<ZodObject<InputArgs>, ZodTypeAny>
) => Promise<{ satoshi: number; description: string }> | { satoshi: number; description: string }
```

Returns payment amount in satoshis and invoice description based on request parameters.

## IStorage Interface

Interface for payment hash storage. Implement to persist payment state.

```typescript
interface IStorage {
  isValid(paymentHash: string): Promise<boolean>;
  setValid(paymentHash: string, valid: boolean): Promise<void>;
}
```

**Methods:**
- `isValid` - Check if payment hash is valid and unused
- `setValid` - Mark payment hash as valid (when invoice created) or invalid (after use)

### MemoryStorage

Default in-memory implementation. Payment hashes are lost on restart.

```typescript
import { MemoryStorage } from "@getalby/paidmcp";
const storage = new MemoryStorage();
```

## IWallet Interface

Interface for wallet implementations. `NWCWallet` is the default.

```typescript
interface IWallet {
  requestInvoice(
    satoshi: number,
    description: string
  ): Promise<{ payment_request: string; payment_hash: string }>;

  verifyPayment(paymentHash: string): Promise<boolean>;
}
```

## Schema Helpers

### paidConfig

Automatically enhances tool config with payment fields:

```typescript
import { paidConfig } from "@getalby/paidmcp";

// Adds payment_hash to inputSchema
// Adds payment_instructions, payment_request, payment_hash to outputSchema
const enhancedConfig = paidConfig(originalConfig);
```

## Exports

All exports from `@getalby/paidmcp`:

```typescript
export { PaidMcpServer } from "./paid_mcp_server.js";
export { IWallet, NWCWallet } from "./wallets/index.js";
export { IStorage, MemoryStorage } from "./storage/index.js";
export { paidConfig, paidInputSchema, paidOutputSchema } from "./schema.js";
export { ChargeCallback, paidCallback } from "./callbacks.js";
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NWC_URL` | Yes | Nostr Wallet Connect connection string |
| `PORT` | No | HTTP server port (default: 3000) |
| `MODE` | No | Transport mode: `STDIO` (default) or `HTTP` |

## Payment Response Format

When tool is called without valid payment:

```json
{
  "payment_instructions": "Payment required. Pay the payment_request and try the same request again with the payment_hash set to continue.",
  "payment_request": "lnbc...",
  "payment_hash": "abc123..."
}
```
