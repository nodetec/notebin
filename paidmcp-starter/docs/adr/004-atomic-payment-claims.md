# ADR-004: Atomic Payment Claims (TOCTOU Fix)

## Status

Accepted

## Context

A Time-of-Check-Time-of-Use (TOCTOU) race condition exists in the two-phase payment verification flow defined in [ADR-001](./001-two-phase-payment.md). This vulnerability allows attackers to execute paid tools multiple times using a single payment.

### The Vulnerable Pattern

The original flow separates check and invalidation with an async gap:

```typescript
// Phase 2: Verification (VULNERABLE)
if (!isPaymentValid(paymentHash)) {        // CHECK (read)
  return { error: "Invalid hash" };
}

const paid = await verifyPayment(hash);     // ASYNC GAP (100-500ms)
if (!paid) {
  return { error: "Not paid" };
}

invalidatePayment(paymentHash);             // USE (write) - TOO LATE!
const result = await executeTool(args);
```

### Race Condition Timeline

```
Time    Request A                    Request B                    Storage
─────────────────────────────────────────────────────────────────────────────
T0      isPaymentValid(hash)                                      VALID
        → returns true
T1                                   isPaymentValid(hash)         VALID
                                     → returns true
T2      verifyPayment(hash)                                       VALID
        (async, 200ms)
T3                                   verifyPayment(hash)          VALID
                                     (async, 200ms)
T4      → payment verified                                        VALID
T5                                   → payment verified           VALID
T6      invalidatePayment(hash)                                   INVALID
T7      executeTool() ✓                                           INVALID
T8                                   invalidatePayment(hash)      INVALID
T9                                   executeTool() ✓              INVALID
─────────────────────────────────────────────────────────────────────────────
Result: Single payment → Two executions (DOUBLE SPEND)
```

### Root Cause

1. **IStorage interface lacks atomic operations**:
   ```typescript
   interface IStorage {
     isValid(paymentHash: string): Promise<boolean>;  // Read
     setValid(paymentHash: string, valid: boolean): Promise<void>;  // Write
     // No atomic read-and-write operation!
   }
   ```

2. **Check and invalidation are separate operations** with async verification between them

3. **In-memory Map doesn't work for distributed deployments** (load balancing, serverless)

## Decision

Implement a **Three-State Finite State Machine (FSM)** with **atomic state transitions** using Redis and Lua scripts for distributed atomicity.

### Three-State FSM

```
                    generateInvoice()
        (none) ─────────────────────────▶ VALID
                                            │
                                            │ tryClaimForProcessing()
                                            │ (ATOMIC: check + transition)
                                            ▼
                                       PROCESSING
                                      (blocks other
                                        claims)
                                       /         \
                    releaseBack()     /           \  consumePayment()
                   (verify failed)   /             \ (verify success)
                                    ▼               ▼
                                 VALID           INVALID
                               (preserved)      (consumed)
```

### State Definitions

| State | Meaning | Transitions To |
|-------|---------|----------------|
| `VALID` | Invoice created, awaiting payment/claim | `PROCESSING` |
| `PROCESSING` | Claimed for verification, blocks concurrent claims | `VALID` or `INVALID` |
| `INVALID` | Consumed or expired, cannot be used | (terminal) |

### Atomic Claim Operation

The critical fix is making the claim operation atomic:

```typescript
// OLD (vulnerable): Two operations
const valid = await storage.isValid(hash);  // Read
// ⚠️ Race window here
await storage.setValid(hash, false);         // Write

// NEW (safe): Single atomic operation
const claimed = await storage.tryClaimForProcessing(hash);  // Atomic read+write
if (!claimed) {
  return { error: "Invalid, processing, or consumed" };
}
// Hash is now PROCESSING - no other request can claim it
```

## Implementation

### Extended IStorage Interface

```typescript
type PaymentState = 'VALID' | 'PROCESSING' | 'INVALID';

interface IPaymentStorage {
  // Create valid payment hash (after invoice generation)
  setValid(paymentHash: string, metadata?: PaymentMetadata): Promise<void>;

  // Atomic claim: VALID → PROCESSING (returns true if successful)
  tryClaimForProcessing(paymentHash: string): Promise<boolean>;

  // Release: PROCESSING → VALID (when verification fails)
  releaseBack(paymentHash: string): Promise<void>;

  // Consume: PROCESSING → INVALID (after successful execution)
  consume(paymentHash: string): Promise<void>;

  // Query state (for debugging/monitoring)
  getState(paymentHash: string): Promise<PaymentState | null>;
}

interface PaymentMetadata {
  toolName: string;
  paramsHash: string;  // SHA256 of canonical params (prevents hash theft)
  created: number;
}
```

### Redis + Lua Implementation

Lua scripts execute atomically on the Redis server - no interleaving possible.

```lua
-- CLAIM_SCRIPT: Atomic VALID → PROCESSING transition
local key = KEYS[1]
local now = tonumber(ARGV[1])
local stale_timeout = 30000  -- 30 seconds

local state = redis.call('HGET', key, 'state')

-- Can claim if VALID
if state == 'VALID' then
  redis.call('HSET', key, 'state', 'PROCESSING', 'processingStarted', now)
  redis.call('EXPIRE', key, 3600)  -- 1 hour TTL
  return 1
end

-- Can reclaim if PROCESSING is stale (crashed request)
if state == 'PROCESSING' then
  local started = tonumber(redis.call('HGET', key, 'processingStarted') or '0')
  if (now - started) > stale_timeout then
    redis.call('HSET', key, 'state', 'PROCESSING', 'processingStarted', now)
    redis.call('EXPIRE', key, 3600)
    return 1
  end
end

return 0  -- Cannot claim (doesn't exist, already processing, or invalid)
```

### Updated Payment Flow

```typescript
// Phase 2: Verification (FIXED)
if (!await storage.tryClaimForProcessing(paymentHash)) {
  return { error: "Invalid, in-use, or consumed" };
}
// Hash is now PROCESSING - race condition eliminated

try {
  const paid = await verifyPayment(paymentHash);
  if (!paid) {
    // Payment not verified - RESTORE hash so user can retry after paying
    await storage.releaseBack(paymentHash);
    return { error: "Payment not received" };
  }

  // Payment verified - execute tool
  const result = await executeTool(args);

  // Success - consume the hash
  await storage.consume(paymentHash);
  return { result };

} catch (error) {
  // Tool failed after payment verified - consume anyway (payment is settled)
  await storage.consume(paymentHash);
  throw error;
}
```

## Consequences

### Positive

- **Eliminates TOCTOU race condition** - atomic claim prevents double-spend
- **Preserves payment hash on verification failure** - better UX
- **Scales horizontally** - Redis works across instances
- **Handles stale claims** - 30s timeout for crashed requests
- **Production-ready** - Lua scripts are battle-tested

### Negative

- **Requires Redis** - additional infrastructure dependency
- **Increased latency** - ~1ms per Redis operation (negligible vs 200ms NWC)
- **More complex** - three states vs two

### Neutral

- **Same NWC verification** - Lightning integration unchanged
- **Compatible with existing flow** - drop-in replacement for storage layer

## Scaling Characteristics

| Scale | Redis Config | Notes |
|-------|--------------|-------|
| 1M req/day | Single instance | Default Upstash free tier |
| 100M req/day | Single instance | Upstash Pro or self-hosted |
| 1B req/day | Redis Cluster | Sharded by payment_hash |

### Memory Usage

```
Per payment hash: ~500 bytes
Active lifetime: ~5 minutes (with 1hr TTL safety)
At 1B req/day peak: ~1.7 GB active memory
```

## Alternatives Considered

### 1. Mutex/Lock per Payment Hash

Acquire distributed lock before verification.

**Rejected because:**
- Adds blocking/waiting
- Lock management complexity
- Deadlock potential

### 2. Optimistic Locking with Version

Add version field, reject if changed.

**Rejected because:**
- Requires retry logic
- More round trips
- Doesn't preserve hash on failure

### 3. Database with SELECT FOR UPDATE

Use PostgreSQL row-level locking.

**Rejected because:**
- Higher latency than Redis
- Connection pool management
- Overkill for simple state machine

### 4. In-Memory with Process Lock

Use mutex within single process.

**Rejected because:**
- Doesn't work for load balancing
- Doesn't work for serverless
- Lost on restart

## References

- [ADR-001: Two-Phase Payment Flow](./001-two-phase-payment.md)
- [ADR-002: NWC over LNURL](./002-nwc-over-lnurl.md)
- [ADR-003: Custom MCP over Vercel Adapter](./003-custom-mcp-over-vercel-adapter.md)
- [OWASP Race Conditions](https://owasp.org/www-community/vulnerabilities/Race_Conditions)
- [Redis Lua Scripting](https://redis.io/docs/interact/programmability/eval-intro/)
- [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)
- [TOCTOU Wikipedia](https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use)
