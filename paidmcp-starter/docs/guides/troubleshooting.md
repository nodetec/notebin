# Guide: Troubleshooting

Common errors, debugging techniques, and solutions for PaidMCP servers.

## Common Errors

### "Cannot find module" with .ts extension

**Error:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module './mcp_server'
```

**Cause:** TypeScript files compiled to JavaScript, but imports still reference `.ts` extension.

**Solution:** Change all imports to use `.js` extension:

```typescript
// ❌ WRONG
import { createMcpServer } from "./mcp_server";
import { registerMyTool } from "./tools/my_tool.ts";

// ✅ CORRECT
import { createMcpServer } from "./mcp_server.js";
import { registerMyTool } from "./tools/my_tool.js";
```

### "NWC_URL environment variable is required"

**Error:**
```
Error: NWC_URL environment variable is required
```

**Cause:** Missing or invalid NWC URL in environment.

**Solution:**

1. Check `.env` file exists:
   ```bash
   ls -la .env
   ```

2. Verify NWC URL format:
   ```bash
   # Should look like:
   NWC_URL="nostr+walletconnect://pubkey?relay=wss://...&secret=..."
   ```

3. Ensure dotenv is loaded:
   ```typescript
   import dotenv from "dotenv";
   dotenv.config(); // Before accessing process.env.NWC_URL
   ```

4. For Claude Desktop, set in config JSON:
   ```json
   {
     "env": {
       "NWC_URL": "nostr+walletconnect://..."
     }
   }
   ```

### "Payment verification failed"

**Error:**
```
Error: Payment verification failed
```

**Cause:** Invoice not paid or payment not yet confirmed.

**Solutions:**

1. **Check invoice was paid:**
   - Open invoice in Lightning wallet
   - Verify payment succeeded
   - Wait for confirmation (usually instant)

2. **Check NWC connection:**
   ```typescript
   import { nwc } from "@getalby/sdk";

   const client = new nwc.NWCClient({
     nostrWalletConnectUrl: process.env.NWC_URL
   });

   const info = await client.getInfo();
   console.log("Wallet connected:", info);
   ```

3. **Check invoice expiry:**
   - Lightning invoices typically expire after 15-60 minutes
   - Request new invoice if expired

### "Invalid payment_hash"

**Error:**
```
Error: Invalid payment_hash
```

**Cause:** Payment hash not found in storage or already used.

**Solutions:**

1. **Hash already used (one-time use):**
   - Request new invoice by calling tool without `payment_hash`
   - Each payment is single-use

2. **Server restarted with MemoryStorage:**
   - MemoryStorage loses hashes on restart
   - Solution: Implement [persistent storage](custom-storage.md)

3. **Different storage instance:**
   - In HTTP mode, each request creates new server
   - Ensure storage is shared (Redis, DB)

### STDIO transport not responding

**Symptoms:**
- Claude Desktop shows "Server not responding"
- Tools not appearing
- No error messages

**Cause:** Console.log interfering with STDIO protocol.

**Solution:**

1. Remove all `console.log()` statements:
   ```typescript
   // ❌ WRONG: Breaks STDIO
   console.log("Tool called with:", params);

   // ✅ CORRECT: Use stderr
   console.error("Tool called with:", params);
   ```

2. Check server is running:
   ```bash
   # In Claude Desktop logs, should see server start
   ```

3. Verify config path is correct:
   ```json
   {
     "command": "node",
     "args": ["/absolute/path/to/build/index.js"]  // Must be absolute
   }
   ```

### HTTP endpoint returns 500

**Error:**
```
{"jsonrpc":"2.0","error":{"code":-32603,"message":"Internal server error"},"id":null}
```

**Causes and Solutions:**

1. **NWC connection failed:**
   - Verify `NWC_URL` is set
   - Check network connectivity to Nostr relays
   - Test NWC connection independently

2. **Server creation failed:**
   ```typescript
   // Add error logging
   try {
     const server = createMcpServer();
   } catch (error) {
     console.error("Server creation failed:", error);
     throw error;
   }
   ```

3. **Storage connection failed:**
   - Check Redis/DB is running
   - Verify connection string
   - Test storage independently

### "Module not found: express"

**Error:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'express'
```

**Cause:** Missing HTTP dependencies.

**Solution:**
```bash
npm install express dotenv
npm install -D @types/express
```

### TypeScript compilation errors

**Error:**
```
error TS2307: Cannot find module '@getalby/paidmcp'
```

**Cause:** Dependencies not installed or TypeScript config issue.

**Solutions:**

1. Install dependencies:
   ```bash
   npm install
   ```

2. Clean build and rebuild:
   ```bash
   rm -rf build node_modules package-lock.json
   npm install
   npm run build
   ```

3. Check `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "bundler",  // Required
       "module": "ES2022",
       "target": "ES2022"
     }
   }
   ```

## Debugging Techniques

### Enable Verbose Logging (HTTP Mode Only)

```typescript
// src/mcp_server.ts
export function createMcpServer(): McpServer {
  console.error("Creating MCP server...");

  const server = new PaidMcpServer(
    { name: "my-server", version: "1.0.0" },
    { nwcUrl: process.env.NWC_URL!, storage }
  );

  console.error("Server created successfully");
  return server;
}
```

**Note:** Only use `console.error()`, never `console.log()` (breaks STDIO).

### Test NWC Connection Independently

Create `scripts/test-nwc.ts`:

```typescript
import { nwc } from "@getalby/sdk";
import dotenv from "dotenv";

dotenv.config();

async function testNWC() {
  const client = new nwc.NWCClient({
    nostrWalletConnectUrl: process.env.NWC_URL!
  });

  try {
    // Test connection
    const info = await client.getInfo();
    console.log("✓ Wallet info:", info);

    // Test invoice creation
    const invoice = await client.makeInvoice({
      amount: 1, // 1 sat
      description: "Test invoice"
    });
    console.log("✓ Invoice created:", invoice.payment_request);

  } catch (error) {
    console.error("✗ NWC error:", error);
  }
}

testNWC();
```

Run:
```bash
npx tsx scripts/test-nwc.ts
```

### Use MCP Inspector for Interactive Testing

```bash
npm run build
npm run inspect
```

Benefits:
- See all registered tools
- Test invoice generation
- View exact requests/responses
- Debug tool schemas

### Check Payment Hash Storage

Add debug logging to storage:

```typescript
export class DebugStorage implements IStorage {
  constructor(private storage: IStorage) {}

  async isValid(paymentHash: string): Promise<boolean> {
    const result = await this.storage.isValid(paymentHash);
    console.error(`Storage.isValid(${paymentHash}): ${result}`);
    return result;
  }

  async setValid(paymentHash: string, valid: boolean): Promise<void> {
    console.error(`Storage.setValid(${paymentHash}, ${valid})`);
    await this.storage.setValid(paymentHash, valid);
  }
}

// Wrap your storage
const storage = new DebugStorage(new RedisStorage(redisUrl));
```

### Inspect HTTP Requests

For HTTP mode, log all incoming requests:

```typescript
app.use((req, res, next) => {
  console.error(`${req.method} ${req.path}`, req.body);
  next();
});
```

### Check Build Output

Verify TypeScript compiled correctly:

```bash
# Should see .js files matching your .ts files
ls -R build/
```

## Anti-Patterns to Avoid

### Hardcoded NWC URLs

```typescript
// ❌ NEVER hardcode secrets
const server = new PaidMcpServer(
  { name: "server", version: "1.0.0" },
  { nwcUrl: "nostr+walletconnect://...", storage }
);

// ✅ ALWAYS use environment variables
const server = new PaidMcpServer(
  { name: "server", version: "1.0.0" },
  { nwcUrl: process.env.NWC_URL!, storage }
);
```

### Missing .js extensions

```typescript
// ❌ Will fail at runtime
import { tool } from "./tools/my_tool";

// ✅ Explicit .js extension required
import { tool } from "./tools/my_tool.js";
```

### Console.log in STDIO mode

```typescript
// ❌ Corrupts STDIO protocol
async (params) => {
  console.log("Processing:", params);
  return result;
}

// ✅ Use stderr or remove
async (params) => {
  console.error("Processing:", params);  // OK for debugging
  return result;
}
```

### Incorrect callback returns

```typescript
// ❌ Missing structuredContent
return {
  content: [{ type: "text", text: JSON.stringify(data) }]
};

// ❌ Missing content array
return {
  structuredContent: data
};

// ✅ Both required
return {
  content: [{ type: "text", text: JSON.stringify(data) }],
  structuredContent: data
};
```

### Forgetting .describe() on schemas

```typescript
// ❌ LLM has no context
inputSchema: {
  city: z.string(),
}

// ✅ Describe every field
inputSchema: {
  city: z.string().describe("The city name to look up"),
}
```

### Not validating inputs

```typescript
// ❌ Assumes input is valid
async (params) => {
  const data = await fetch(`/api/${params.id}`);
  return processData(data);
}

// ✅ Validate and provide clear errors
async (params) => {
  if (!params.id || params.id.length < 3) {
    throw new Error("ID must be at least 3 characters");
  }

  const data = await fetch(`/api/${params.id}`);
  if (!data) {
    throw new Error(`Not found: ${params.id}`);
  }

  return processData(data);
}
```

### Committing .env files

```bash
# ❌ NEVER commit secrets
git add .env
git commit -m "Add env"

# ✅ Add to .gitignore
echo ".env" >> .gitignore
git add .env.example  # Commit template only
```

## Getting Help

### Check Documentation

1. [Quick Start](quick-start.md) - Setup guide
2. [Creating Tools](creating-tools.md) - Tool implementation
3. [Architecture](../architecture.md) - System design
4. [Conventions](../conventions.md) - Code style

### Search Existing Issues

- [PaidMCP GitHub Issues](https://github.com/getAlby/paidmcp/issues)
- [MCP SDK Issues](https://github.com/modelcontextprotocol/sdk/issues)

### Provide Detailed Error Reports

When reporting issues, include:

1. **Error message** (full stack trace)
2. **Environment:**
   - Node.js version: `node --version`
   - OS: `uname -a` or `ver`
   - Transport mode: STDIO/HTTP/SSE
3. **Minimal reproduction:**
   - Simplified code that shows the problem
   - Steps to reproduce
4. **What you've tried:**
   - Solutions attempted
   - Debugging steps taken

### Example Issue Template

```markdown
## Problem
STDIO transport not connecting in Claude Desktop

## Environment
- Node.js: v20.10.0
- OS: macOS 14.1
- PaidMCP: 1.0.0
- Transport: STDIO

## Steps to Reproduce
1. Created server with quick-start guide
2. Added to Claude Desktop config
3. Restarted Claude Desktop
4. Tools not appearing

## What I've Tried
- Verified config path is absolute
- Checked no console.log() statements
- Confirmed build/ directory exists
- Tested with MCP Inspector (works)

## Code
[Attach minimal reproduction or link to repo]
```

## Preventive Measures

### Pre-deployment Checklist

- [ ] All imports use `.js` extension
- [ ] No `console.log()` in STDIO mode
- [ ] Environment variables in `.env.example` documented
- [ ] `.env` in `.gitignore`
- [ ] All Zod fields have `.describe()`
- [ ] Callbacks return correct formats
- [ ] `npm run build` succeeds
- [ ] Tested with MCP Inspector
- [ ] Storage is persistent (production)
- [ ] Error handling in place

### Automated Checks

Add to CI/CD:

```bash
# Build check
npm run build

# Type check
npx tsc --noEmit

# Lint (if using ESLint)
npm run lint
```

## Next Steps

- Review [conventions.md](../conventions.md) for best practices
- Implement [custom storage](custom-storage.md) for production
- Add monitoring and logging
