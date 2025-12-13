# Module: storage

## Purpose

Implements the `IStorage` interface for persisting payment hash validity. Payment hashes must be tracked to prevent replay attacks (one hash = one execution).

## Public API

```typescript
interface IStorage {
  isValid(paymentHash: string): Promise<boolean>;
  setValid(paymentHash: string, valid: boolean): Promise<void>;
}
```

## Invariants

1. **`isValid(hash)` returns `true`** only if hash was created AND not yet used
2. **`setValid(hash, true)`** marks hash as available (after invoice creation)
3. **`setValid(hash, false)`** invalidates hash (after tool execution)
4. **Hash lifecycle**: created → valid → used → invalid (never valid again)
5. **Thread safety**: Implementations should handle concurrent access

## Dependencies

| Allowed | Forbidden |
|---------|-----------|
| `@getalby/paidmcp` (IStorage type) | `../tools/*` |
| Database clients (redis, postgres) | `../transports/*` |
| Node.js built-ins | |

## Implementations

### MemoryStorage (Default)

```typescript
import { MemoryStorage } from "@getalby/paidmcp";
const storage = new MemoryStorage();
```

**Characteristics**:
- ✅ Zero configuration
- ✅ Fast (in-memory)
- ❌ Loses state on restart
- ❌ Not suitable for production

**Use for**: Development, testing, demos

### Custom Implementations

For production, implement `IStorage` with persistent backing:

```typescript
// src/storage/redis_storage.ts
import { IStorage } from "@getalby/paidmcp";
import { createClient, RedisClientType } from "redis";

export class RedisStorage implements IStorage {
  private client: RedisClientType;

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });
    this.client.connect();
  }

  async isValid(paymentHash: string): Promise<boolean> {
    const value = await this.client.get(`payment:${paymentHash}`);
    return value === "valid";
  }

  async setValid(paymentHash: string, valid: boolean): Promise<void> {
    if (valid) {
      // Expire after 1 hour (unpaid invoices)
      await this.client.setEx(`payment:${paymentHash}`, 3600, "valid");
    } else {
      await this.client.del(`payment:${paymentHash}`);
    }
  }
}
```

## File Structure

```
storage/
├── index.ts              # Barrel export
├── memory.ts             # MemoryStorage (or use from paidmcp)
├── redis.ts              # RedisStorage example
└── database.ts           # SQL-based example
```

## Integration

```typescript
// src/mcp_server.ts
import { PaidMcpServer } from "@getalby/paidmcp";
import { RedisStorage } from "./storage/redis.js";

const storage = new RedisStorage(process.env.REDIS_URL!);

const server = new PaidMcpServer(
  { name: "my-server", version: "1.0.0" },
  { nwcUrl: process.env.NWC_URL!, storage }  // Pass storage here
);
```

## Production Considerations

### Expiry Strategy

Unpaid invoices should expire. Two approaches:

1. **TTL on valid hashes** (recommended): Set expiry when creating
   ```typescript
   await client.setEx(key, 3600, "valid");  // 1 hour TTL
   ```

2. **Cleanup job**: Periodically delete old valid hashes
   ```typescript
   // Cron: Delete valid hashes older than 1 hour
   DELETE FROM payment_hashes 
   WHERE status = 'valid' AND created_at < NOW() - INTERVAL '1 hour';
   ```

### High Availability

For multi-instance deployments:
- Use shared storage (Redis, PostgreSQL)
- Ensure atomic operations (race conditions on concurrent hash use)
- Consider distributed locks if needed

### Monitoring

Track these metrics:
- Valid hashes created (invoices generated)
- Hashes invalidated (successful executions)
- Stale hashes cleaned up (expired/unpaid)
- `isValid` false rate (replay attempts or errors)

## Testing

```typescript
// Test implementation behavior
const storage = new YourStorage();

// Create valid hash
await storage.setValid("test-hash", true);
assert(await storage.isValid("test-hash") === true);

// Invalidate hash
await storage.setValid("test-hash", false);
assert(await storage.isValid("test-hash") === false);

// Unknown hash
assert(await storage.isValid("unknown") === false);
```
