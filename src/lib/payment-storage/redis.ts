import Redis from "ioredis";
import type { IPaymentStorage, PaymentMetadata, PaymentState } from "./types";

/**
 * Redis-based payment storage with atomic Lua scripts.
 *
 * Lua scripts execute atomically on the Redis server,
 * eliminating TOCTOU race conditions.
 *
 * @see docs/adr/004-atomic-payment-claims.md
 */
export class RedisPaymentStorage implements IPaymentStorage {
  private redis: Redis;
  private readonly keyPrefix = "payment:";
  private readonly ttlSeconds = 3600; // 1 hour
  private readonly staleTimeoutMs = 30000; // 30 seconds

  /**
   * Lua script for atomic claim operation.
   * VALID → PROCESSING transition.
   *
   * Returns 1 if claimed, 0 if not claimable.
   */
  private static readonly CLAIM_SCRIPT = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local stale_timeout = tonumber(ARGV[2])
    local ttl = tonumber(ARGV[3])

    local state = redis.call('HGET', key, 'state')

    -- Can claim if VALID
    if state == 'VALID' then
      redis.call('HSET', key, 'state', 'PROCESSING', 'processingStarted', now)
      redis.call('EXPIRE', key, ttl)
      return 1
    end

    -- Can reclaim if PROCESSING is stale (crashed request)
    if state == 'PROCESSING' then
      local started = tonumber(redis.call('HGET', key, 'processingStarted') or '0')
      if (now - started) > stale_timeout then
        redis.call('HSET', key, 'state', 'PROCESSING', 'processingStarted', now)
        redis.call('EXPIRE', key, ttl)
        return 1
      end
    end

    return 0
  `;

  /**
   * Lua script for atomic release operation.
   * PROCESSING → VALID transition.
   *
   * Returns 1 if released, 0 if not in PROCESSING state.
   */
  private static readonly RELEASE_SCRIPT = `
    local key = KEYS[1]
    local ttl = tonumber(ARGV[1])

    local state = redis.call('HGET', key, 'state')
    if state == 'PROCESSING' then
      redis.call('HSET', key, 'state', 'VALID')
      redis.call('HDEL', key, 'processingStarted')
      redis.call('EXPIRE', key, ttl)
      return 1
    end
    return 0
  `;

  constructor(redisUrl?: string) {
    const url = redisUrl || process.env.REDIS_URL || "redis://localhost:6379";
    this.redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on("error", (err) => {
      console.error("[payment-storage] Redis error:", err.message);
    });

    this.redis.on("connect", () => {
      console.log("[payment-storage] Redis connected");
    });
  }

  private key(paymentHash: string): string {
    return `${this.keyPrefix}${paymentHash}`;
  }

  async setValid(paymentHash: string, metadata?: Partial<PaymentMetadata>): Promise<void> {
    const key = this.key(paymentHash);
    const now = Date.now();

    await this.redis.hset(key, {
      state: "VALID",
      toolName: metadata?.toolName || "",
      paramsHash: metadata?.paramsHash || "",
      created: now.toString(),
    });

    await this.redis.expire(key, this.ttlSeconds);
  }

  async tryClaimForProcessing(paymentHash: string): Promise<boolean> {
    const result = await this.redis.eval(
      RedisPaymentStorage.CLAIM_SCRIPT,
      1,
      this.key(paymentHash),
      Date.now().toString(),
      this.staleTimeoutMs.toString(),
      this.ttlSeconds.toString()
    );

    return result === 1;
  }

  async releaseBack(paymentHash: string): Promise<void> {
    await this.redis.eval(
      RedisPaymentStorage.RELEASE_SCRIPT,
      1,
      this.key(paymentHash),
      this.ttlSeconds.toString()
    );
  }

  async consume(paymentHash: string): Promise<void> {
    const key = this.key(paymentHash);
    await this.redis.hset(key, "state", "INVALID");
    await this.redis.hdel(key, "processingStarted");
    // Keep for audit trail, will auto-expire after TTL
  }

  async getState(paymentHash: string): Promise<PaymentState | null> {
    const state = await this.redis.hget(this.key(paymentHash), "state");
    if (!state) return null;
    return state as PaymentState;
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === "PONG";
    } catch {
      return false;
    }
  }

  /**
   * Close the Redis connection.
   * Call this on application shutdown.
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}
