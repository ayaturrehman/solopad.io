/**
 * Simple in-memory rate limiter for API routes.
 * For production at scale, replace with Redis-based (e.g., @upstash/ratelimit).
 *
 * Usage:
 *   import { rateLimit } from "@/lib/rate-limit";
 *   const limiter = rateLimit({ interval: 60_000, maxRequests: 10 });
 *
 *   // In route handler:
 *   const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
 *   const { success } = limiter.check(ip);
 *   if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

const stores = new Map();

export function rateLimit({ interval = 60_000, maxRequests = 10 } = {}) {
  const store = new Map();

  // Cleanup expired entries every 5 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now - entry.start > interval * 2) store.delete(key);
    }
  }, 300_000);

  // Don't prevent process exit
  if (cleanupInterval.unref) cleanupInterval.unref();

  return {
    check(key) {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now - entry.start > interval) {
        store.set(key, { start: now, count: 1 });
        return { success: true, remaining: maxRequests - 1 };
      }

      entry.count++;
      if (entry.count > maxRequests) {
        return { success: false, remaining: 0 };
      }

      return { success: true, remaining: maxRequests - entry.count };
    },
  };
}

// Pre-configured limiters for common use cases
export const authLimiter = rateLimit({ interval: 60_000, maxRequests: 10 }); // 10 attempts/min
export const registerLimiter = rateLimit({ interval: 60_000, maxRequests: 5 }); // 5 signups/min
export const bookingLimiter = rateLimit({ interval: 60_000, maxRequests: 20 }); // 20 bookings/min
export const apiLimiter = rateLimit({ interval: 60_000, maxRequests: 100 }); // 100 calls/min
