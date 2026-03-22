import { describe, it, expect } from "vitest";
import { rateLimit, authLimiter, registerLimiter, bookingLimiter } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests within the limit", () => {
    const limiter = rateLimit({ interval: 60_000, maxRequests: 3 });
    expect(limiter.check("ip1").success).toBe(true);
    expect(limiter.check("ip1").success).toBe(true);
    expect(limiter.check("ip1").success).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const limiter = rateLimit({ interval: 60_000, maxRequests: 2 });
    limiter.check("ip2");
    limiter.check("ip2");
    expect(limiter.check("ip2").success).toBe(false);
  });

  it("tracks different IPs independently", () => {
    const limiter = rateLimit({ interval: 60_000, maxRequests: 1 });
    expect(limiter.check("ip-a").success).toBe(true);
    expect(limiter.check("ip-b").success).toBe(true);
    expect(limiter.check("ip-a").success).toBe(false);
    expect(limiter.check("ip-b").success).toBe(false);
  });

  it("returns remaining count", () => {
    const limiter = rateLimit({ interval: 60_000, maxRequests: 5 });
    expect(limiter.check("ip3").remaining).toBe(4);
    expect(limiter.check("ip3").remaining).toBe(3);
    expect(limiter.check("ip3").remaining).toBe(2);
  });

  it("resets after interval expires", () => {
    const limiter = rateLimit({ interval: 1, maxRequests: 1 }); // 1ms interval
    limiter.check("ip4");
    expect(limiter.check("ip4").success).toBe(false);

    // Wait for interval to expire
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(limiter.check("ip4").success).toBe(true);
        resolve();
      }, 10);
    });
  });
});

describe("Pre-configured limiters", () => {
  it("authLimiter allows 10 requests", () => {
    for (let i = 0; i < 10; i++) {
      expect(authLimiter.check(`auth-test-${Date.now()}-${i}`).success).toBe(true);
    }
  });

  it("registerLimiter allows 5 requests", () => {
    const ip = `reg-test-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      expect(registerLimiter.check(ip).success).toBe(true);
    }
    expect(registerLimiter.check(ip).success).toBe(false);
  });

  it("bookingLimiter allows 20 requests", () => {
    const ip = `book-test-${Date.now()}`;
    for (let i = 0; i < 20; i++) {
      expect(bookingLimiter.check(ip).success).toBe(true);
    }
    expect(bookingLimiter.check(ip).success).toBe(false);
  });
});
