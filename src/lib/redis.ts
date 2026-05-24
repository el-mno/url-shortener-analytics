import Redis from "ioredis";

// Reuse a single client across hot reloads in development.
const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// How long a slug -> URL mapping stays cached before falling back to Postgres.
export const SLUG_CACHE_TTL_SECONDS = 60 * 60 * 24; // 24h

export const slugCacheKey = (slug: string) => `slug:${slug}`;
