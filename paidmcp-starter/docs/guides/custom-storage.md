# Guide: Custom Storage

The default `MemoryStorage` loses payment hashes on server restart. For production, implement persistent storage.

## Why Persistent Storage?

| Issue | Impact | Solution |
|-------|--------|----------|
| Server restart | Valid invoices become invalid | Persistent storage |
| Horizontal scaling | Each instance has different state | Shared storage (Redis, DB) |
| Debugging | No payment history | Storage with logging |

## IStorage Interface

All storage implementations must satisfy:

```typescript
interface IStorage {
  isValid(paymentHash: string): Promise<boolean>;
  setValid(paymentHash: string, valid: boolean): Promise<void>;
}
```

### Contract

1. **`isValid(hash)`** returns `true` if hash exists and hasn't been used
2. **`setValid(hash, true)`** marks hash as available (after invoice created)
3. **`setValid(hash, false)`** invalidates hash (after tool executed)
4. **Hash lifecycle**: created → valid → used → invalid (never valid again)

## Redis Storage (Recommended)

### Installation

```bash
npm install redis
npm install -D @types/redis
```

### Implementation

Create `src/storage/redis_storage.ts`:

```typescript
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
      // Set with 1 hour expiry for unpaid invoices
      await this.client.setEx(`payment:${paymentHash}`, 3600, "valid");
    } else {
      // Remove after use
      await this.client.del(`payment:${paymentHash}`);
    }
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}
```

### Integration

Update `src/mcp_server.ts`:

```typescript
import { PaidMcpServer } from "@getalby/paidmcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedisStorage } from "./storage/redis_storage.js";
import { registerExampleTool } from "./tools/example_tool.js";

const storage = new RedisStorage(process.env.REDIS_URL || "redis://localhost:6379");

export function createMcpServer(): McpServer {
  if (!process.env.NWC_URL) {
    throw new Error("NWC_URL environment variable is required");
  }

  const server = new PaidMcpServer(
    { name: "my-paid-mcp-server", version: "1.0.0" },
    { nwcUrl: process.env.NWC_URL, storage }
  );

  registerExampleTool(server);

  return server;
}
```

### Environment Variables

Add to `.env`:

```bash
REDIS_URL=redis://localhost:6379
# Or for Redis Cloud:
# REDIS_URL=redis://username:password@host:port
```

### Running Redis

```bash
# Local development with Docker
docker run -d -p 6379:6379 redis:alpine

# Or install locally
# macOS: brew install redis && brew services start redis
# Ubuntu: sudo apt install redis-server && sudo systemctl start redis
```

## PostgreSQL Storage

### Installation

```bash
npm install pg
npm install -D @types/pg
```

### Schema

```sql
CREATE TABLE payment_hashes (
  payment_hash VARCHAR(64) PRIMARY KEY,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 hour'
);

-- Index for cleanup queries
CREATE INDEX idx_payment_hashes_expires ON payment_hashes(expires_at);

-- Cleanup expired hashes (run periodically)
-- DELETE FROM payment_hashes WHERE expires_at < NOW();
```

### Implementation

Create `src/storage/postgres_storage.ts`:

```typescript
import { IStorage } from "@getalby/paidmcp";
import { Pool } from "pg";

export class PostgresStorage implements IStorage {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async isValid(paymentHash: string): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT status FROM payment_hashes
       WHERE payment_hash = $1 AND expires_at > NOW()`,
      [paymentHash]
    );

    return result.rows.length > 0 && result.rows[0].status === "valid";
  }

  async setValid(paymentHash: string, valid: boolean): Promise<void> {
    if (valid) {
      // Insert as valid with 1 hour expiry
      await this.pool.query(
        `INSERT INTO payment_hashes (payment_hash, status, expires_at)
         VALUES ($1, 'valid', NOW() + INTERVAL '1 hour')
         ON CONFLICT (payment_hash) DO NOTHING`,
        [paymentHash]
      );
    } else {
      // Mark as used (or delete)
      await this.pool.query(
        `UPDATE payment_hashes SET status = 'used' WHERE payment_hash = $1`,
        [paymentHash]
      );
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
```

### Environment Variables

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/paidmcp
```

## SQLite Storage (Simple File-Based)

### Installation

```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

### Implementation

Create `src/storage/sqlite_storage.ts`:

```typescript
import { IStorage } from "@getalby/paidmcp";
import Database from "better-sqlite3";

export class SqliteStorage implements IStorage {
  private db: Database.Database;

  constructor(filename: string = "paidmcp.db") {
    this.db = new Database(filename);

    // Create table if not exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payment_hashes (
        payment_hash TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        expires_at INTEGER DEFAULT (strftime('%s', 'now') + 3600)
      )
    `);
  }

  async isValid(paymentHash: string): Promise<boolean> {
    const row = this.db
      .prepare(
        `SELECT status FROM payment_hashes
         WHERE payment_hash = ? AND expires_at > strftime('%s', 'now')`
      )
      .get(paymentHash) as { status: string } | undefined;

    return row?.status === "valid";
  }

  async setValid(paymentHash: string, valid: boolean): Promise<void> {
    if (valid) {
      this.db
        .prepare(
          `INSERT OR IGNORE INTO payment_hashes (payment_hash, status)
           VALUES (?, 'valid')`
        )
        .run(paymentHash);
    } else {
      this.db
        .prepare(`UPDATE payment_hashes SET status = 'used' WHERE payment_hash = ?`)
        .run(paymentHash);
    }
  }

  close(): void {
    this.db.close();
  }
}
```

## Production Considerations

### Expiry Strategy

Unpaid invoices should expire to prevent hash table growth.

#### Option 1: TTL (Time-To-Live)

Best for Redis:

```typescript
// Automatically expires after 1 hour
await this.client.setEx(`payment:${paymentHash}`, 3600, "valid");
```

#### Option 2: Cleanup Job

For SQL databases:

```typescript
// Run periodically (cron, setInterval, etc.)
async function cleanupExpiredHashes() {
  await db.query(
    `DELETE FROM payment_hashes WHERE expires_at < NOW()`
  );
}

// Run every hour
setInterval(cleanupExpiredHashes, 60 * 60 * 1000);
```

### High Availability

For multi-instance deployments:

1. **Use shared storage**: All instances connect to same Redis/DB
2. **Atomic operations**: Prevent race conditions
3. **Connection pooling**: Reuse database connections
4. **Retry logic**: Handle temporary connection failures

#### Atomic Check-and-Set Example

```typescript
// Redis WATCH for atomic operations
async isValidAndConsume(paymentHash: string): Promise<boolean> {
  const multi = this.client.multi();

  // Start transaction
  await this.client.watch(`payment:${paymentHash}`);

  const value = await this.client.get(`payment:${paymentHash}`);

  if (value !== "valid") {
    await this.client.unwatch();
    return false;
  }

  // Atomically delete if still valid
  multi.del(`payment:${paymentHash}`);
  const result = await multi.exec();

  return result !== null; // null means transaction aborted
}
```

### Monitoring

Track these metrics:

```typescript
class MonitoredStorage implements IStorage {
  constructor(private storage: IStorage, private metrics: MetricsClient) {}

  async isValid(paymentHash: string): Promise<boolean> {
    const start = Date.now();
    const result = await this.storage.isValid(paymentHash);

    this.metrics.histogram("storage.isValid.duration", Date.now() - start);
    this.metrics.increment(`storage.isValid.result.${result}`);

    return result;
  }

  async setValid(paymentHash: string, valid: boolean): Promise<void> {
    const start = Date.now();
    await this.storage.setValid(paymentHash, valid);

    this.metrics.histogram("storage.setValid.duration", Date.now() - start);
    this.metrics.increment(`storage.setValid.${valid ? "create" : "consume"}`);
  }
}
```

### Error Handling

Graceful degradation when storage fails:

```typescript
export class ResilientStorage implements IStorage {
  constructor(private storage: IStorage) {}

  async isValid(paymentHash: string): Promise<boolean> {
    try {
      return await this.storage.isValid(paymentHash);
    } catch (error) {
      console.error("Storage error in isValid:", error);
      // Fail closed: don't allow execution on storage error
      return false;
    }
  }

  async setValid(paymentHash: string, valid: boolean): Promise<void> {
    try {
      await this.storage.setValid(paymentHash, valid);
    } catch (error) {
      console.error("Storage error in setValid:", error);
      // Log but don't crash server
      // Consider: queue for retry, alert monitoring
    }
  }
}
```

## Testing Storage Implementations

```typescript
// storage_test.ts
import { IStorage } from "@getalby/paidmcp";

async function testStorage(storage: IStorage) {
  const testHash = "test-hash-" + Date.now();

  // Initially invalid
  console.assert(
    (await storage.isValid(testHash)) === false,
    "Unknown hash should be invalid"
  );

  // Mark as valid
  await storage.setValid(testHash, true);
  console.assert(
    (await storage.isValid(testHash)) === true,
    "Hash should be valid after creation"
  );

  // Consume hash
  await storage.setValid(testHash, false);
  console.assert(
    (await storage.isValid(testHash)) === false,
    "Hash should be invalid after consumption"
  );

  console.log("✓ Storage tests passed");
}

// Run tests
const storage = new RedisStorage("redis://localhost:6379");
await testStorage(storage);
```

## Choosing a Storage Backend

| Storage | Best For | Pros | Cons |
|---------|----------|------|------|
| **MemoryStorage** | Development, demos | Zero config | Loses state |
| **Redis** | Production, scaling | Fast, TTL support | Requires Redis server |
| **PostgreSQL** | Existing PG setup | ACID, relational | Slower than Redis |
| **SQLite** | Single instance | File-based, simple | Not for multi-instance |

## Next Steps

- [Deploy with HTTP transport](transport-modes.md)
- See [packages/storage/README.md](../../packages/storage/README.md) for module details
- Read [architecture.md](../architecture.md) for storage's role in the system
