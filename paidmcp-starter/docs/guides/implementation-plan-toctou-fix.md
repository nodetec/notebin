# Implementation Plan: TOCTOU Fix for Payment Verification

## Overview

This document outlines the implementation plan for fixing the Time-of-Check-Time-of-Use (TOCTOU) race condition in the payment verification flow. The fix introduces a Three-State FSM with atomic operations using Redis.

**Related Documentation:**
- [ADR-004: Atomic Payment Claims](../adr/004-atomic-payment-claims.md) - Decision record
- [Architecture: Payment State Machine](../architecture.md#payment-state-machine) - System design
- [Distributed Storage Guide](./distributed-storage.md) - Implementation details

## Prerequisites

### 1. Redis Provider Setup

Choose one based on your deployment:

| Deployment | Recommended Provider | Setup |
|------------|---------------------|-------|
| Vercel | Upstash Redis | [Vercel Integration](https://vercel.com/integrations/upstash) |
| Vercel | Vercel KV | [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv) |
| AWS | ElastiCache | AWS Console |
| Self-hosted | Redis | `docker run -p 6379:6379 redis` |

### 2. Environment Variables

```bash
# For Upstash (recommended for Vercel)
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Or for standard Redis
REDIS_URL="redis://localhost:6379"
```

### 3. Dependencies

```bash
# For Upstash (Vercel/serverless)
npm install @upstash/redis

# For standard Redis (self-hosted)
npm install ioredis
```

## Implementation Steps

### Step 1: Create Payment Storage Types

**File:** `src/lib/payment-storage/types.ts`

```typescript
export type PaymentState = 'VALID' | 'PROCESSING' | 'INVALID';

export interface PaymentMetadata {
  toolName: string;
  paramsHash: string;
  created: number;
  processingStarted?: number;
}

export interface IPaymentStorage {
  setValid(paymentHash: string, metadata?: PaymentMetadata): Promise<void>;
  tryClaimForProcessing(paymentHash: string): Promise<boolean>;
  releaseBack(paymentHash: string): Promise<void>;
  consume(paymentHash: string): Promise<void>;
  getState(paymentHash: string): Promise<PaymentState | null>;
}
```

### Step 2: Implement Memory Storage (Development)

**File:** `src/lib/payment-storage/memory.ts`

See [Distributed Storage Guide](./distributed-storage.md#implementation-memory-storage-development) for full implementation.

Key points:
- Uses `Map` for storage
- Synchronous operations (atomic in single-threaded JS)
- 30-second stale timeout for PROCESSING state
- For development/testing only

### Step 3: Implement Redis Storage (Production)

**File:** `src/lib/payment-storage/redis.ts`

See [Distributed Storage Guide](./distributed-storage.md#implementation-redis-storage-production) for full implementation.

Key points:
- Uses Lua scripts for atomic operations
- Supports both Upstash and ioredis
- 1-hour TTL for automatic cleanup
- Stale PROCESSING detection (30s timeout)

### Step 4: Create Storage Factory

**File:** `src/lib/payment-storage/index.ts`

```typescript
import { MemoryPaymentStorage } from './memory.js';
import { RedisPaymentStorage } from './redis.js';
import type { IPaymentStorage } from './types.js';

export function createPaymentStorage(): IPaymentStorage {
  if (process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL) {
    return new RedisPaymentStorage();
  }

  console.warn('[payment-storage] Using in-memory storage (not for production)');
  return new MemoryPaymentStorage();
}

export * from './types.js';
```

### Step 5: Update route.ts Payment Flow

**File:** `src/app/[transport]/route.ts`

#### 5a. Import and Initialize Storage

```typescript
import { createPaymentStorage, type IPaymentStorage } from '~/lib/payment-storage';

// Initialize storage (module-level singleton)
const storage = createPaymentStorage();
```

#### 5b. Update Invoice Generation (Phase 1)

```typescript
async function generateInvoice(satoshi: number, description: string, toolName: string, args: unknown) {
  const client = getNwcClient();
  if (!client) {
    throw new Error("NWC not configured");
  }

  const invoice = await client.makeInvoice({
    amount: satoshi * 1000,
    description,
  });

  // Store with metadata for security
  await storage.setValid(invoice.payment_hash, {
    toolName,
    paramsHash: hashParams(args),  // Implement this helper
    created: Date.now(),
  });

  return {
    payment_request: invoice.invoice,
    payment_hash: invoice.payment_hash,
  };
}
```

#### 5c. Update Payment Verification (Phase 2)

Replace the vulnerable pattern:

```typescript
// OLD (vulnerable)
if (!isPaymentValid(paymentHash)) {
  return { error: "Invalid hash" };
}
const paid = await verifyPayment(paymentHash);
if (!paid) {
  return { error: "Not paid" };
}
invalidatePayment(paymentHash);
const result = await executeSearchSnippetsPremium(args);
```

With the atomic pattern:

```typescript
// NEW (safe)
// Step 1: Atomic claim
if (!await storage.tryClaimForProcessing(paymentHash)) {
  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32602, message: "Invalid, in-use, or already consumed payment_hash" },
  };
}

// Step 2: Verify payment (hash is now PROCESSING, safe from races)
const paid = await verifyPayment(paymentHash);
if (!paid) {
  // Release back - user can retry after paying
  await storage.releaseBack(paymentHash);
  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32602, message: "Payment not received. Please pay the invoice first." },
  };
}

// Step 3: Execute tool
try {
  const result = await executeSearchSnippetsPremium(args);

  // Step 4: Consume on success
  await storage.consume(paymentHash);

  return { jsonrpc: "2.0", id, result };
} catch (error) {
  // Consume even on failure (payment was verified)
  await storage.consume(paymentHash);
  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32603, message: `Tool execution failed: ${error}` },
  };
}
```

#### 5d. Remove Old Functions

Delete these deprecated functions:
- `isPaymentValid()`
- `setPaymentValid()`
- `invalidatePayment()`
- `paymentStorage` Map

### Step 6: Add Helper Function for Params Hashing

**File:** `src/lib/payment-storage/utils.ts`

```typescript
import { createHash } from 'crypto';

export function hashParams(params: unknown): string {
  // Sort keys for consistent hashing
  const canonical = JSON.stringify(params, Object.keys(params as object).sort());
  return createHash('sha256').update(canonical).digest('hex');
}
```

### Step 7: Testing

#### Local Testing (Memory Storage)

```bash
# No Redis env vars = uses memory storage
npm run dev

# Test concurrent requests
node scripts/test-race-condition.mjs
```

#### Production Testing (Redis Storage)

```bash
# Set Redis env vars
export UPSTASH_REDIS_REST_URL="..."
export UPSTASH_REDIS_REST_TOKEN="..."

npm run dev

# Verify Redis is being used
# Should see: "[payment-storage] Using Redis storage"
```

#### Race Condition Test Script

Create `scripts/test-race-condition.mjs`:

```javascript
// Simulate concurrent requests with same payment_hash
const paymentHash = "test_hash_123";

// First, set up a valid hash (simulate invoice generation)
await fetch('http://localhost:3000/mcp', {
  method: 'POST',
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: { name: 'searchSnippetsPremium', arguments: {} },
    id: 1
  })
});

// Extract payment_hash from response, then...

// Fire 10 concurrent requests with same hash
const requests = Array(10).fill(null).map(() =>
  fetch('http://localhost:3000/mcp', {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'searchSnippetsPremium',
        arguments: { payment_hash: paymentHash }
      },
      id: 1
    })
  })
);

const results = await Promise.all(requests);
const bodies = await Promise.all(results.map(r => r.json()));

// Count successes - should be exactly 1 (or 0 if not paid)
const successes = bodies.filter(b => !b.error).length;
console.log(`Successes: ${successes} (expected: 0 or 1)`);
```

## File Checklist

| File | Action | Status |
|------|--------|--------|
| `src/lib/payment-storage/types.ts` | Create | [ ] |
| `src/lib/payment-storage/memory.ts` | Create | [ ] |
| `src/lib/payment-storage/redis.ts` | Create | [ ] |
| `src/lib/payment-storage/utils.ts` | Create | [ ] |
| `src/lib/payment-storage/index.ts` | Create | [ ] |
| `src/app/[transport]/route.ts` | Update | [ ] |
| `scripts/test-race-condition.mjs` | Create | [ ] |
| `.env.example` | Update | [ ] |

## Rollback Plan

If issues arise:

1. **Immediate**: Set `REDIS_URL` to empty → falls back to memory storage
2. **Code rollback**: Revert route.ts to use old `paymentStorage` Map
3. **Data**: Redis data auto-expires (1hr TTL), no manual cleanup needed

## Monitoring

After deployment, monitor:

| Metric | Source | Alert If |
|--------|--------|----------|
| Claim rejections | Application logs | >5% of attempts |
| Stale reclaims | Application logs | >0.1% of claims |
| Redis latency | Upstash dashboard | >10ms avg |
| Redis errors | Application logs | Any errors |

## Security Considerations

1. **Hash binding**: Params hash prevents using someone else's payment
2. **TTL**: Prevents infinite storage growth
3. **Stale timeout**: Recovers from crashed requests
4. **No hash enumeration**: Payment hashes are random, unguessable

## References

- [ADR-004: Atomic Payment Claims](../adr/004-atomic-payment-claims.md)
- [Distributed Storage Guide](./distributed-storage.md)
- [Architecture Overview](../architecture.md)
- [Upstash Redis Documentation](https://upstash.com/docs/redis/overall/getstarted)
- [Redis Lua Scripting](https://redis.io/docs/interact/programmability/eval-intro/)
