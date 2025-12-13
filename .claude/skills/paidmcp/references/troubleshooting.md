# PaidMCP Troubleshooting

Common errors and solutions for PaidMCP servers.

## Module Errors

### "Cannot find module" with missing extension

**Error:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module './mcp_server'
```

**Cause:** ES2022 modules require explicit `.js` extension in imports.

**Solution:**
```typescript
// Wrong
import { createMcpServer } from "./mcp_server";

// Correct
import { createMcpServer } from "./mcp_server.js";
```

### "Module not found: express"

**Error:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'express'
```

**Cause:** HTTP dependencies not installed.

**Solution:**
```bash
npm install express dotenv
npm install -D @types/express
```

---

## Environment Errors

### "NWC_URL environment variable is required"

**Cause:** Missing or malformed NWC URL.

**Solutions:**

1. Check `.env` file exists and contains valid URL:
   ```bash
   NWC_URL="nostr+walletconnect://pubkey?relay=wss://...&secret=..."
   ```

2. Ensure dotenv loads before accessing env:
   ```typescript
   import dotenv from "dotenv";
   dotenv.config();  // Must be before process.env.NWC_URL
   ```

3. For Claude Desktop, set in config JSON:
   ```json
   {
     "env": {
       "NWC_URL": "nostr+walletconnect://..."
     }
   }
   ```

---

## Payment Errors

### "Payment verification failed"

**Cause:** Invoice not paid or payment not confirmed.

**Solutions:**

1. Verify invoice was paid in Lightning wallet
2. Check NWC connection:
   ```typescript
   import { nwc } from "@getalby/sdk";
   const client = new nwc.NWCClient({ nostrWalletConnectUrl: process.env.NWC_URL });
   const info = await client.getInfo();
   console.log("Connected:", info);
   ```
3. Check invoice hasn't expired (typically 15-60 min)

### "Invalid payment_hash"

**Cause:** Hash not found in storage or already used.

**Solutions:**

1. **Already used**: Request new invoice (call tool without payment_hash)
2. **Server restarted with MemoryStorage**: Implement persistent storage
3. **Different storage instance in HTTP mode**: Ensure storage is shared across requests

---

## Transport Errors

### STDIO not responding / Tools not appearing

**Cause:** `console.log()` corrupting STDIO protocol.

**Solution:**
```typescript
// Wrong - breaks STDIO
console.log("Debug:", params);

// Correct - uses stderr
console.error("Debug:", params);
```

Also verify config path is absolute:
```json
{
  "command": "node",
  "args": ["/absolute/path/to/build/index.js"]
}
```

### HTTP endpoint returns 500

**Causes and solutions:**

1. **NWC connection failed**: Verify NWC_URL is set and valid
2. **Server creation error**: Add error logging:
   ```typescript
   try {
     const server = createMcpServer();
   } catch (error) {
     console.error("Server creation failed:", error);
     throw error;
   }
   ```
3. **Storage connection failed**: Test storage independently

---

## TypeScript Errors

### Compilation errors with MCP SDK

**Common fixes:**

1. Ensure tsconfig targets ES2022:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "ES2022",
       "moduleResolution": "bundler"
     }
   }
   ```

2. Add `skipLibCheck` if type conflicts:
   ```json
   {
     "compilerOptions": {
       "skipLibCheck": true
     }
   }
   ```

---

## Debugging Techniques

### Test NWC Connection

```typescript
import { nwc } from "@getalby/sdk";

async function testNWC() {
  const client = new nwc.NWCClient({
    nostrWalletConnectUrl: process.env.NWC_URL!
  });

  const info = await client.getInfo();
  console.log("Wallet info:", info);

  // Test invoice creation
  const invoice = await client.makeInvoice({
    amount: 21,
    description: "Test invoice"
  });
  console.log("Invoice:", invoice);
}
```

### Use MCP Inspector

Interactive tool testing without payment:

```bash
npm run build
npx @modelcontextprotocol/inspector node build/index.js
```

### HTTP Mode Debugging

```bash
# List tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'

# Call tool (get invoice)
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"tool_name","arguments":{}},"id":2}'
```

---

## Error Code Reference

| Code | Meaning |
|------|---------|
| `-32600` | Invalid request |
| `-32601` | Method not found |
| `-32602` | Invalid params |
| `-32603` | Internal error |
