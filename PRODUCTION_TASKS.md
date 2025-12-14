# Production Readiness Tasks

**Project:** Paid MCP Server (notebin)
**Branch:** `paid-mcp-poc`
**Created:** 2025-12-14
**Last Updated:** 2025-12-14

---

## Completed

- [x] TOCTOU Race Condition Fix - Redis + Lua atomic scripts
- [x] Payment Hash Theft Prevention - Params hash binding
- [x] Redis Storage - ioredis with Docker (local dev)
- [x] Test Scripts - `test-race-condition.mjs`, `test-params-binding.mjs`

---

## Remaining Tasks

### HIGH Priority - Security

| # | Task | Status | Effort |
|---|------|--------|--------|
| 1 | Add input validation for `limit` parameter (positive integer, max cap) | [ ] | 20 min |
| 2 | Add input validation for `language` parameter (max length, alphanumeric) | [ ] | 15 min |
| 3 | Add input validation for `tags` parameter (max array length, max item length) | [ ] | 15 min |

**Details:**
- `limit`: Must be positive integer, cap at 500 for premium, 100 for free
- `language`: Max 50 chars, lowercase alphanumeric + dash only (e.g., `typescript`, `c-sharp`)
- `tags`: Max 10 items, each max 50 chars, alphanumeric + dash

**Implementation Location:** `src/app/[transport]/route.ts`

```typescript
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
  if (value.length > 10) return value.slice(0, 10);
  return value
    .filter((t): t is string => typeof t === 'string' && t.length <= 50)
    .map(t => t.toLowerCase());
}
```

---

### HIGH Priority - Infrastructure

| # | Task | Status | Effort |
|---|------|--------|--------|
| 4 | Set up Upstash Redis account for production | [ ] | 15 min |
| 5 | Add Upstash Redis adapter to `payment-storage` | [ ] | 30 min |
| 6 | Configure Vercel environment variables | [ ] | 10 min |

**Environment Variables for Vercel:**
```bash
# Required for paid tools
NWC_URL=nostr+walletconnect://pubkey?relay=wss://...&secret=...

# Production Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Authentication
NEXTAUTH_SECRET=your-random-secret-min-32-chars
NEXTAUTH_URL=https://your-domain.vercel.app

# Optional: Custom relays (comma-separated)
NEXT_PUBLIC_NOSTR_RELAYS=wss://relay1.com,wss://relay2.com
```

**Upstash Setup:**
1. Go to [upstash.com](https://upstash.com) → Create account
2. Create new Redis database (free tier: 10K commands/day)
3. Copy REST URL and Token to Vercel environment variables
4. Install: `npm install @upstash/redis`

---

### MEDIUM Priority - Hardening

| # | Task | Status | Effort |
|---|------|--------|--------|
| 7 | Reduce invoice TTL from 1 hour to 5-10 minutes | [ ] | 10 min |

**Location:** `src/lib/payment-storage/redis.ts` line 15
```typescript
private readonly ttlSeconds = 600; // 10 minutes (was 3600)
```

**Rationale:** Shorter TTL reduces window for attacks and cleans up unpaid invoices faster.

---

### MEDIUM Priority - Performance Optimizations

| # | Task | Status | Effort |
|---|------|--------|--------|
| 8 | Reuse SimplePool connection instead of creating new per request | [ ] | 30 min |
| 9 | Add response caching for frequent queries (Redis) | [ ] | 1 hour |
| 10 | Implement parallel relay fetching with timeout | [ ] | 45 min |
| 11 | Add result deduplication (same event from multiple relays) | [ ] | 20 min |
| 12 | Optimize premium search with better Nostr filters | [ ] | 30 min |
| 13 | Add connection health monitoring and relay fallback | [ ] | 45 min |

**Details:**

#### 8. Reuse SimplePool (with serverless caveat)

```typescript
// Singleton pool - reused across requests in warm containers
// NOTE: Will be recreated on serverless cold starts (acceptable)
let poolInstance: SimplePool | null = null;

function getPool(): SimplePool {
  if (!poolInstance) {
    poolInstance = new SimplePool();
  }
  return poolInstance;
}

// Usage - don't close after each request
const pool = getPool();
const events = await pool.querySync(DEFAULT_RELAYS, filter);
// Don't call pool.close() - keep connections alive
```

**Caveat:** In Vercel serverless, the singleton resets on cold starts (~5-15 min idle). This is acceptable - the optimization helps during warm periods with multiple requests.

#### 9. Response Caching

```typescript
// Cache key = hash of query params
const cacheKey = `search:${hashParams({ language, tags, keyword, limit })}`;

// Check cache first
const cached = await redis.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}

// Fetch from relays
const results = await fetchFromRelays(filter);

// Cache for 60 seconds
await redis.setex(cacheKey, 60, JSON.stringify(results));
```

#### 10. Parallel Relay Fetching with Timeout

```typescript
// Fetch from all relays with 5s timeout
const RELAY_TIMEOUT = 5000;

async function fetchWithTimeout(relay: string, filter: Filter): Promise<Event[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RELAY_TIMEOUT);

  try {
    const events = await pool.querySync([relay], filter);
    return events;
  } catch {
    return []; // Relay failed, continue with others
  } finally {
    clearTimeout(timeout);
  }
}

// Fetch from all relays in parallel, aggregate results
const results = await Promise.allSettled(
  DEFAULT_RELAYS.map(relay => fetchWithTimeout(relay, filter))
);

const allEvents = results
  .filter((r): r is PromiseFulfilledResult<Event[]> => r.status === 'fulfilled')
  .flatMap(r => r.value);
```

#### 11. Result Deduplication

```typescript
// Dedupe by event ID (same event may come from multiple relays)
function dedupeEvents(events: Event[]): Event[] {
  const seen = new Set<string>();
  return events.filter(event => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}
```

---

### LOW Priority - Monitoring & Observability

| # | Task | Status | Effort |
|---|------|--------|--------|
| 14 | Add structured logging for payment flows | [ ] | 30 min |
| 15 | Add error monitoring (Sentry or similar) | [ ] | 1 hour |
| 16 | Add rate limiting per IP/session | [ ] | 2 hours |

---

### Deployment & Testing

| # | Task | Status | Effort |
|---|------|--------|--------|
| 17 | Deploy to Vercel preview | [ ] | 5 min |
| 18 | Run `test-race-condition.mjs` against preview URL | [ ] | 10 min |
| 19 | Run `test-params-binding.mjs` against preview URL | [ ] | 10 min |
| 20 | Update `SECURITY_ANALYSIS_REPORT.md` with final status | [ ] | 15 min |

**Test Commands:**
```bash
# Test against local
node scripts/test-race-condition.mjs
node scripts/test-params-binding.mjs

# Test against Vercel preview
MCP_ENDPOINT=https://your-preview.vercel.app/mcp node scripts/test-race-condition.mjs
MCP_ENDPOINT=https://your-preview.vercel.app/mcp node scripts/test-params-binding.mjs
```

---

## Summary

| Category | Tasks | Effort |
|----------|-------|--------|
| Security (Input Validation) | 3 | ~50 min |
| Infrastructure (Upstash) | 3 | ~55 min |
| Hardening (TTL) | 1 | ~10 min |
| Performance Optimizations | 6 | ~3.5 hours |
| Monitoring & Observability | 3 | ~3.5 hours |
| Deployment & Testing | 4 | ~40 min |
| **Total** | **20** | **~9 hours** |

### Priority Order (MVP-First Approach)

#### MVP - Ship First (Required for Production)
| Order | Task # | Description | Why MVP |
|-------|--------|-------------|---------|
| 1 | 4-6 | Upstash Redis setup | Can't deploy to Vercel without it |
| 2 | 17 | Deploy to Vercel preview | Validate infrastructure works |
| 3 | 18-19 | Run security tests on preview | Verify fixes work in production env |
| 4 | 1-3 | Input validation | Last security item (MEDIUM severity) |
| 5 | 20 | Update security report | Document production-ready status |

**MVP Effort: ~2.5 hours**

#### Post-MVP Tier 1 - Quick Wins (High Impact, Low Effort)
| Order | Task # | Description | Impact |
|-------|--------|-------------|--------|
| 6 | 7 | Reduce TTL to 10 min | Security hardening, 10 min |
| 7 | 11 | Result deduplication | Better response quality, 20 min |
| 8 | 8 | SimplePool reuse | Faster warm requests, 30 min |

**Tier 1 Effort: ~1 hour**

#### Post-MVP Tier 2 - Performance (High Impact, More Effort)
| Order | Task # | Description | Impact |
|-------|--------|-------------|--------|
| 9 | 10 | Parallel relay fetching | Faster + more reliable, 45 min |
| 10 | 9 | Response caching | Major perf boost for repeated queries, 1 hour |
| 11 | 12 | Optimize premium filters | Better search quality, 30 min |

**Tier 2 Effort: ~2.5 hours**

#### Post-MVP Tier 3 - Production Hardening (Nice to Have)
| Order | Task # | Description | Impact |
|-------|--------|-------------|--------|
| 12 | 13 | Connection health monitoring | Reliability, 45 min |
| 13 | 14 | Structured logging | Debugging, 30 min |
| 14 | 16 | Rate limiting | Abuse prevention, 2 hours |
| 15 | 15 | Error monitoring (Sentry) | Production visibility, 1 hour |

**Tier 3 Effort: ~4.25 hours**

---

### MVP Definition

**What's in MVP:**
- ✅ TOCTOU race condition fix (DONE)
- ✅ Payment hash theft prevention (DONE)
- ✅ Redis payment storage (DONE)
- ⬜ Production Redis (Upstash)
- ⬜ Input validation
- ⬜ Deployed and tested on Vercel

**What's NOT in MVP (defer):**
- Performance optimizations (caching, pooling, parallel fetch)
- Monitoring and observability
- Rate limiting
- TTL reduction (1 hour is acceptable for MVP)

**MVP Success Criteria:**
1. All security tests pass on Vercel preview
2. Can generate invoice, pay, and execute tool
3. Race condition prevented (only 1 success per payment)
4. Params binding works (theft blocked)

---

## Quick Reference

### Files to Modify

| File | Changes |
|------|---------|
| `src/app/[transport]/route.ts` | Input validation, pool singleton |
| `src/lib/payment-storage/index.ts` | Add Upstash detection |
| `src/lib/payment-storage/upstash.ts` | New file - Upstash adapter |
| `src/lib/payment-storage/redis.ts` | Reduce TTL |
| `src/lib/nostr/pool.ts` | New file - Pool singleton (optional) |
| `src/lib/nostr/cache.ts` | New file - Response caching (optional) |
| `SECURITY_ANALYSIS_REPORT.md` | Update status |

### Dependencies to Add

```bash
# Required for production
npm install @upstash/redis

# Optional for monitoring
npm install @sentry/nextjs
```

---

## Production Deployment Checklist

```
Pre-deployment:
□ Input validation implemented and tested
□ Upstash Redis account created
□ All environment variables configured in Vercel
□ Local tests passing

Deployment:
□ Deploy to Vercel preview
□ Verify health endpoint: GET /mcp returns { redis: "connected" }
□ Run test-race-condition.mjs against preview
□ Run test-params-binding.mjs against preview
□ Test with real Lightning payment (1 sat)

Post-deployment:
□ Monitor for errors
□ Update SECURITY_ANALYSIS_REPORT.md
□ Merge to main branch
```

---

## Notes

- **Local Development:** Docker Redis is fine (`docker compose up -d redis`)
- **Upstash Free Tier:** 10,000 commands/day (sufficient for testing/low traffic)
- **Upstash Pro:** Required for high-volume production
- **Serverless Cold Starts:** Pool singleton resets, but this is acceptable
- **Security Status:** All HIGH severity vulnerabilities are FIXED
- **Remaining Security:** Input validation (originally MEDIUM in security report)
