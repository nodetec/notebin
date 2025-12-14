import { RedisPaymentStorage } from "./redis";
import type { IPaymentStorage } from "./types";

export type { IPaymentStorage, PaymentMetadata, PaymentState } from "./types";
export { RedisPaymentStorage } from "./redis";
export { hashParams, extractBindableParams } from "./utils";

/**
 * Singleton storage instance.
 * Created once at module load, reused across all requests.
 */
let storageInstance: IPaymentStorage | null = null;

/**
 * Get or create the payment storage instance.
 *
 * Auto-detection order:
 * 1. UPSTASH_REDIS_REST_URL → Upstash (future)
 * 2. REDIS_URL → ioredis (local/self-hosted)
 * 3. Default → Redis on localhost:6379
 *
 * For development, uses local Redis.
 * For production on Vercel, add Upstash support.
 */
export function getPaymentStorage(): IPaymentStorage {
  if (storageInstance) {
    return storageInstance;
  }

  // Future: Add Upstash support here
  // if (process.env.UPSTASH_REDIS_REST_URL) {
  //   console.log("[payment-storage] Using Upstash Redis");
  //   storageInstance = new UpstashPaymentStorage();
  //   return storageInstance;
  // }

  // Use ioredis for local/self-hosted Redis
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  console.log(`[payment-storage] Using Redis: ${redisUrl}`);
  storageInstance = new RedisPaymentStorage(redisUrl);

  return storageInstance;
}

/**
 * Create a fresh storage instance (for testing).
 * Does not affect the singleton.
 */
export function createPaymentStorage(redisUrl?: string): IPaymentStorage {
  return new RedisPaymentStorage(redisUrl);
}
