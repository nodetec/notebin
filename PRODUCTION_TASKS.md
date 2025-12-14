# Production Readiness Tasks

**Project:** Paid MCP Server (notebin)
**Branch:** `paid-mcp-poc`
**Last Updated:** 2025-12-14

---

## Progress Overview

| Phase | Status | Tasks |
|-------|--------|-------|
| Security Fixes | ✅ Complete | 2/2 |
| MVP | ⬜ In Progress | 0/5 |
| Post-MVP | ⬜ Not Started | 0/10 |

**Current Focus:** MVP Phase

---

## Quick Reference

### Key Files
| File | Purpose |
|------|---------|
| `src/app/[transport]/route.ts` | MCP handler, input validation |
| `src/lib/payment-storage/` | Redis adapters (ioredis, Upstash) |
| `scripts/test-*.mjs` | Security test scripts |

### Commands
```bash
# Local development
docker compose up -d redis
npm run dev

# Test security (local)
node scripts/test-race-condition.mjs
node scripts/test-params-binding.mjs

# Test security (preview)
MCP_ENDPOINT=https://preview.vercel.app/mcp node scripts/test-race-condition.mjs
MCP_ENDPOINT=https://preview.vercel.app/mcp node scripts/test-params-binding.mjs
```

### Environment Variables (Vercel)
```bash
NWC_URL=nostr+walletconnect://...        # Required for payments
UPSTASH_REDIS_REST_URL=https://...       # Production Redis
UPSTASH_REDIS_REST_TOKEN=...             # Production Redis
NEXTAUTH_SECRET=...                       # Auth (min 32 chars)
```

---

## Completed

- [x] **TOCTOU Race Condition Fix** - Redis + Lua atomic scripts
- [x] **Payment Hash Theft Prevention** - Params hash binding
- [x] **Redis Storage** - ioredis with Docker (local dev)
- [x] **Security Test Scripts** - `test-race-condition.mjs`, `test-params-binding.mjs`

---

## MVP Tasks (~2.5 hours)

Complete these to ship a production-ready paid MCP server.

### MVP-1: Production Redis (Upstash)
**Effort:** ~1 hour | **Status:** ⬜

- [ ] Create Upstash account at [upstash.com](https://upstash.com)
- [ ] Create Redis database (free tier: 10K commands/day)
- [ ] Install: `npm install @upstash/redis`
- [ ] Create `src/lib/payment-storage/upstash.ts` adapter
- [ ] Update `src/lib/payment-storage/index.ts` to detect Upstash env vars
- [ ] Test locally with Upstash credentials

**Done when:** `getPaymentStorage()` returns Upstash adapter when `UPSTASH_REDIS_REST_URL` is set.

### MVP-2: Deploy & Test on Vercel
**Effort:** ~30 min | **Status:** ⬜

- [ ] Add environment variables to Vercel project
- [ ] Deploy to preview
- [ ] Verify: `GET /mcp` returns `{ redis: "connected" }`
- [ ] Run `test-race-condition.mjs` against preview (should pass)
- [ ] Run `test-params-binding.mjs` against preview (should pass)
- [ ] Test real payment flow (1 sat)

**Done when:** Both security tests pass on Vercel preview with real Redis.

### MVP-3: Input Validation
**Effort:** ~45 min | **Status:** ⬜

- [ ] Add `validateLimit()` - positive integer, max 500 premium / 100 free
- [ ] Add `validateLanguage()` - max 50 chars, alphanumeric + dash
- [ ] Add `validateTags()` - max 10 items, each max 50 chars
- [ ] Apply validators in `executeSearchSnippetsPremium()`
- [ ] Apply validators in `executeSearchSnippets()`
- [ ] Apply validators in `executeFetchCodeSnippets()`

**Done when:** Invalid inputs (negative limit, oversized strings) are rejected or sanitized.

### MVP-4: Final Documentation
**Effort:** ~15 min | **Status:** ⬜

- [ ] Update `SECURITY_ANALYSIS_REPORT.md` - mark input validation complete
- [ ] Update this file - mark MVP complete

**Done when:** All docs reflect production-ready status.

### MVP-5: Production Deploy
**Effort:** ~10 min | **Status:** ⬜

- [ ] Merge `paid-mcp-poc` to `main`
- [ ] Deploy to production
- [ ] Verify production health check
- [ ] Run final security tests against production

**Done when:** Production deployment is live and passing all tests.

---

## Post-MVP Tasks

### Tier 1: Quick Wins (~1 hour)

| Task | Effort | Impact |
|------|--------|--------|
| Reduce invoice TTL to 10 min | 10 min | Security hardening |
| Add result deduplication | 20 min | Better response quality |
| Reuse SimplePool singleton | 30 min | Faster warm requests |

### Tier 2: Performance (~2.5 hours)

| Task | Effort | Impact |
|------|--------|--------|
| Parallel relay fetching with timeout | 45 min | Faster + more reliable |
| Response caching (Redis) | 1 hour | Major perf boost |
| Optimize premium search filters | 30 min | Better search quality |

### Tier 3: Production Hardening (~4 hours)

| Task | Effort | Impact |
|------|--------|--------|
| Connection health monitoring | 45 min | Reliability |
| Structured logging | 30 min | Debugging |
| Rate limiting per IP | 2 hours | Abuse prevention |
| Error monitoring (Sentry) | 1 hour | Production visibility |

---

## Implementation Notes

### Input Validation Reference

```typescript
// Add to src/app/[transport]/route.ts

function validateLimit(value: unknown, max: number, defaultVal: number): number {
  if (value === undefined || value === null) return defaultVal;
  if (typeof value !== 'number' || !Number.isFinite(value)) return defaultVal;
  if (value <= 0 || !Number.isInteger(value)) return defaultVal;
  return Math.min(value, max);
}

function validateLanguage(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  if (value.length > 50) return undefined;
  if (!/^[a-z0-9-]+$/i.test(value)) return undefined;
  return value.toLowerCase();
}

function validateTags(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const filtered = value
    .filter((t): t is string => typeof t === 'string' && t.length <= 50)
    .slice(0, 10)
    .map(t => t.toLowerCase());
  return filtered.length > 0 ? filtered : undefined;
}
```

### Upstash Adapter Reference

```typescript
// src/lib/payment-storage/upstash.ts
import { Redis } from '@upstash/redis';
import type { IPaymentStorage, PaymentMetadata, PaymentState } from './types';

export class UpstashPaymentStorage implements IPaymentStorage {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  // Implement IPaymentStorage interface...
  // Note: Upstash supports Lua scripts via redis.eval()
}
```

### Storage Detection Reference

```typescript
// Update src/lib/payment-storage/index.ts

export function getPaymentStorage(): IPaymentStorage {
  if (storageInstance) return storageInstance;

  // Prefer Upstash in production (Vercel)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    console.log('[payment-storage] Using Upstash Redis');
    storageInstance = new UpstashPaymentStorage();
    return storageInstance;
  }

  // Fall back to ioredis for local development
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  console.log(`[payment-storage] Using ioredis: ${redisUrl}`);
  storageInstance = new RedisPaymentStorage(redisUrl);
  return storageInstance;
}
```

---

## Risk & Blockers

| Risk | Mitigation |
|------|------------|
| Upstash free tier limit (10K/day) | Monitor usage, upgrade if needed |
| NWC wallet runs out of funds | Monitor balance, set up alerts |
| Relay downtime | Multiple relays configured as fallback |
| Cold start latency | Acceptable for MVP, optimize in Tier 2 |

---

## Success Criteria

**MVP is complete when:**
1. ✅ All HIGH severity security issues fixed (DONE)
2. ⬜ Deployed to Vercel with Upstash Redis
3. ⬜ Security tests pass on production
4. ⬜ Input validation implemented
5. ⬜ Can complete full payment flow (invoice → pay → execute)

**Production is ready when:**
- MVP complete
- Real payment tested successfully
- Documentation updated
