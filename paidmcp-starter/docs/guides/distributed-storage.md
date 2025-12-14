# Distributed Storage for Payment State

This guide explains how to implement production-ready payment storage using Redis for atomic operations and horizontal scaling.

## Why Distributed Storage?

The default `MemoryStorage` has critical limitations:

| Limitation | Impact |
|------------|--------|
| Process-local | Lost on restart, doesn't work for serverless |
| No atomicity | TOCTOU race condition (see [ADR-004](../adr/004-atomic-payment-claims.md)) |
| Single instance | Doesn't work with load balancing |

## Storage Interface

```typescript
type PaymentState = 'VALID' | 'PROCESSING' | 'INVALID';

interface PaymentMetadata {
  toolName: string;
  paramsHash: string;
  created: number;
  processingStarted?: number;
}

interface IPaymentStorage {
  /**
   * Create a valid payment hash after invoice generation
   */
  setValid(paymentHash: string, metadata?: PaymentMetadata): Promise<void>;

  /**
   * Atomic claim: VALID → PROCESSING
   * Returns true if successfully claimed, false otherwise
   * This is the critical operation that prevents race conditions
   */
  tryClaimForProcessing(paymentHash: string): Promise<boolean>;

  /**
   * Release: PROCESSING → VALID
   * Used when payment verification fails (user hasn't paid yet)
   * Preserves the hash so user can retry after paying
   */
  releaseBack(paymentHash: string): Promise<void>;

  /**
   * Consume: PROCESSING → INVALID
   * Used after successful tool execution
   */
  consume(paymentHash: string): Promise<void>;

  /**
   * Get current state (for debugging/monitoring)
   */
  getState(paymentHash: string): Promise<PaymentState | null>;
}
```

## Implementation: Memory Storage (Development)

For local development and single-instance deployments:

```typescript
// src/lib/payment-storage/memory.ts

export class MemoryPaymentStorage implements IPaymentStorage {
  private store = new Map<string, {
    state: PaymentState;
    metadata: PaymentMetadata;
  }>();

  async setValid(paymentHash: string, metadata?: PaymentMetadata): Promise<void> {
    this.store.set(paymentHash, {
      state: 'VALID',
      metadata: metadata || { toolName: '', paramsHash: '', created: Date.now() },
    });
  }

  async tryClaimForProcessing(paymentHash: string): Promise<boolean> {
    const record = this.store.get(paymentHash);
    if (!record) return false;

    // Handle stale PROCESSING (>30s)
    if (record.state === 'PROCESSING') {
      const started = record.metadata.processingStarted || 0;
      if (Date.now() - started > 30000) {
        record.state = 'VALID';  // Release stale claim
      }
    }

    if (record.state !== 'VALID') return false;

    // Atomic transition (synchronous in JS single-thread)
    record.state = 'PROCESSING';
    record.metadata.processingStarted = Date.now();
    return true;
  }

  async releaseBack(paymentHash: string): Promise<void> {
    const record = this.store.get(paymentHash);
    if (record?.state === 'PROCESSING') {
      record.state = 'VALID';
      record.metadata.processingStarted = undefined;
    }
  }

  async consume(paymentHash: string): Promise<void> {
    const record = this.store.get(paymentHash);
    if (record) {
      record.state = 'INVALID';
    }
  }

  async getState(paymentHash: string): Promise<PaymentState | null> {
    return this.store.get(paymentHash)?.state || null;
  }
}
```

## Implementation: Redis Storage (Production)

For production, serverless, and load-balanced deployments:

### Prerequisites

```bash
# For Vercel
npm install @upstash/redis

# For self-hosted
npm install ioredis
```

### Environment Variables

```bash
# Upstash (Vercel)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Or standard Redis
REDIS_URL="redis://localhost:6379"
```

### Redis Storage Implementation

```typescript
// src/lib/payment-storage/redis.ts

import { Redis } from '@upstash/redis';
// Or: import Redis from 'ioredis';

export class RedisPaymentStorage implements IPaymentStorage {
  private redis: Redis;

  // Lua script for atomic claim operation
  private static CLAIM_SCRIPT = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local stale_timeout = 30000

    local state = redis.call('HGET', key, 'state')

    if state == 'VALID' then
      redis.call('HSET', key, 'state', 'PROCESSING', 'processingStarted', now)
      redis.call('EXPIRE', key, 3600)
      return 1
    end

    if state == 'PROCESSING' then
      local started = tonumber(redis.call('HGET', key, 'processingStarted') or '0')
      if (now - started) > stale_timeout then
        redis.call('HSET', key, 'state', 'PROCESSING', 'processingStarted', now)
        redis.call('EXPIRE', key, 3600)
        return 1
      end
    end

    return 0
  `;

  // Lua script for atomic release
  private static RELEASE_SCRIPT = `
    local key = KEYS[1]
    local state = redis.call('HGET', key, 'state')
    if state == 'PROCESSING' then
      redis.call('HSET', key, 'state', 'VALID')
      redis.call('HDEL', key, 'processingStarted')
      redis.call('EXPIRE', key, 3600)
      return 1
    end
    return 0
  `;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  private key(paymentHash: string): string {
    return `payment:${paymentHash}`;
  }

  async setValid(paymentHash: string, metadata?: PaymentMetadata): Promise<void> {
    const key = this.key(paymentHash);
    await this.redis.hset(key, {
      state: 'VALID',
      toolName: metadata?.toolName || '',
      paramsHash: metadata?.paramsHash || '',
      created: (metadata?.created || Date.now()).toString(),
    });
    await this.redis.expire(key, 3600); // 1 hour TTL
  }

  async tryClaimForProcessing(paymentHash: string): Promise<boolean> {
    const result = await this.redis.eval(
      RedisPaymentStorage.CLAIM_SCRIPT,
      [this.key(paymentHash)],
      [Date.now().toString()]
    );
    return result === 1;
  }

  async releaseBack(paymentHash: string): Promise<void> {
    await this.redis.eval(
      RedisPaymentStorage.RELEASE_SCRIPT,
      [this.key(paymentHash)],
      []
    );
  }

  async consume(paymentHash: string): Promise<void> {
    const key = this.key(paymentHash);
    await this.redis.hset(key, { state: 'INVALID' });
    await this.redis.hdel(key, 'processingStarted');
    // Keep for audit trail, will expire after TTL
  }

  async getState(paymentHash: string): Promise<PaymentState | null> {
    const state = await this.redis.hget(this.key(paymentHash), 'state');
    return (state as PaymentState) || null;
  }
}
```

### Factory Function

```typescript
// src/lib/payment-storage/index.ts

import { MemoryPaymentStorage } from './memory';
import { RedisPaymentStorage } from './redis';

export function createPaymentStorage(): IPaymentStorage {
  // Use Redis if configured, otherwise fallback to memory
  if (process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL) {
    console.log('Using Redis payment storage');
    return new RedisPaymentStorage();
  }

  console.warn('Using in-memory payment storage (not for production)');
  return new MemoryPaymentStorage();
}

export type { IPaymentStorage, PaymentState, PaymentMetadata };
```

## Usage in Payment Flow

```typescript
import { createPaymentStorage } from '~/lib/payment-storage';

const storage = createPaymentStorage();

// Phase 1: Invoice Generation
async function handlePhase1(toolConfig, args) {
  const invoice = await generateInvoice(toolConfig.price, description);

  await storage.setValid(invoice.payment_hash, {
    toolName: toolConfig.name,
    paramsHash: hashParams(args),
    created: Date.now(),
  });

  return { payment_request: invoice.payment_request, payment_hash: invoice.payment_hash };
}

// Phase 2: Verification and Execution
async function handlePhase2(paymentHash, args) {
  // Atomic claim - eliminates race condition
  if (!await storage.tryClaimForProcessing(paymentHash)) {
    return { error: "Invalid, in-use, or already consumed payment_hash" };
  }

  // Verify payment with NWC
  const paid = await verifyPayment(paymentHash);
  if (!paid) {
    // Release back - user can retry after paying
    await storage.releaseBack(paymentHash);
    return { error: "Payment not received. Please pay the invoice first." };
  }

  // Execute tool
  try {
    const result = await executeTool(args);
    await storage.consume(paymentHash);
    return { result };
  } catch (error) {
    // Tool failed but payment was verified - consume anyway
    await storage.consume(paymentHash);
    throw error;
  }
}
```

## Why Lua Scripts?

Redis Lua scripts execute **atomically** on the Redis server:

```
Without Lua (VULNERABLE):                With Lua (SAFE):
─────────────────────────               ─────────────────────────
Client A: HGET state → VALID            Client A: EVAL script
Client B: HGET state → VALID              Redis: [executes atomically]
Client A: HSET state PROCESSING           - HGET state → VALID
Client B: HSET state PROCESSING           - HSET state PROCESSING
                                          - return 1
Both claimed! RACE CONDITION            Client A: gets 1 (claimed)

                                        Client B: EVAL script
                                          Redis: [executes atomically]
                                          - HGET state → PROCESSING
                                          - return 0
                                        Client B: gets 0 (rejected)
```

## Monitoring

### Redis Keys

```bash
# List all payment hashes
redis-cli KEYS "payment:*"

# Check specific hash state
redis-cli HGETALL "payment:abc123"

# Count by state
redis-cli EVAL "return #redis.call('KEYS', 'payment:*')" 0
```

### Metrics to Track

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `claims_total` | Total claim attempts | N/A |
| `claims_success` | Successful claims | N/A |
| `claims_rejected` | Rejected (race prevented) | >1% of total |
| `stale_reclaims` | Stale PROCESSING reclaimed | >0.1% |
| `processing_duration` | Time in PROCESSING state | >10s avg |

## Troubleshooting

### "Invalid payment_hash" but user paid

1. Check if hash exists: `HGETALL payment:{hash}`
2. Check state: should be `VALID` or `PROCESSING`
3. If `INVALID`: already consumed
4. If missing: TTL expired or never created

### Stale PROCESSING

Requests that crash leave hashes in `PROCESSING`. The 30s timeout auto-recovers:

```
T0: Request claims hash → PROCESSING
T1: Request crashes (no release/consume)
T30: Next request reclaims (stale timeout)
```

### High rejection rate

Many concurrent requests for same hash indicates:
1. Client retrying too fast
2. Possible replay attack
3. Need rate limiting per hash

## Security Considerations

### Hash Binding (Optional Enhancement)

To prevent hash theft (attacker using another user's paid hash):

```typescript
// Store params hash when creating invoice
await storage.setValid(hash, {
  toolName: 'searchSnippetsPremium',
  paramsHash: sha256(JSON.stringify(sortedParams)),
  created: Date.now(),
});

// Verify params match when claiming
const metadata = await storage.getMetadata(hash);
if (metadata.paramsHash !== sha256(JSON.stringify(sortedParams))) {
  return { error: "Payment hash bound to different parameters" };
}
```

### Rate Limiting

Consider rate limiting per payment hash:

```typescript
const CLAIM_ATTEMPTS_KEY = `claim_attempts:${paymentHash}`;
const attempts = await redis.incr(CLAIM_ATTEMPTS_KEY);
await redis.expire(CLAIM_ATTEMPTS_KEY, 60); // 1 minute window

if (attempts > 10) {
  return { error: "Too many attempts for this payment hash" };
}
```

## Related Documentation

- [ADR-004: Atomic Payment Claims](../adr/004-atomic-payment-claims.md)
- [ADR-001: Two-Phase Payment Flow](../adr/001-two-phase-payment.md)
- [Architecture Overview](../architecture.md)
- [Upstash Redis Docs](https://upstash.com/docs/redis/overall/getstarted)
