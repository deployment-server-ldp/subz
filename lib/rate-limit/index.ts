import "server-only";

// In-memory sliding-window rate limiter for local development. This does NOT
// coordinate across multiple server instances — SECURITY.md §5 and
// README "Production Checklist" call out swapping this for a shared store
// (e.g. Upstash Redis, gated by RATE_LIMIT_PROVIDER) before production.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Periodically forget stale buckets so this map can't grow unbounded on a
// long-running dev server.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  },
  5 * 60_000,
).unref?.();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}
