import { describe, it, expect } from "vitest";
import { calculatePlatformFee, PLATFORM_FEE_RATES } from "@/lib/stripe";

describe("PLATFORM_FEE_RATES", () => {
  it("has correct rates for all plans", () => {
    expect(PLATFORM_FEE_RATES.free).toBe(0.05);
    expect(PLATFORM_FEE_RATES.starter).toBe(0.03);
    expect(PLATFORM_FEE_RATES.solo).toBe(0.02);
    expect(PLATFORM_FEE_RATES.pro).toBe(0.01);
  });
});

describe("calculatePlatformFee", () => {
  it("calculates 3% for starter on £100 (10000 cents)", () => {
    expect(calculatePlatformFee(10000, "starter")).toBe(300);
  });

  it("calculates 2% for solo on £100", () => {
    expect(calculatePlatformFee(10000, "solo")).toBe(200);
  });

  it("calculates 1% for pro on £100", () => {
    expect(calculatePlatformFee(10000, "pro")).toBe(100);
  });

  it("calculates 5% for free on £100", () => {
    expect(calculatePlatformFee(10000, "free")).toBe(500);
  });

  it("unknown plan falls through to free rate via getPlatformFeeRate", () => {
    // calculatePlatformFee("nonexistent") → getPlatformFeeRate("nonexistent") → free rate (5%)
    expect(calculatePlatformFee(10000, "nonexistent")).toBe(500);
  });

  it("no plan arg defaults to starter (3%) via default param", () => {
    // calculatePlatformFee(10000) → plan defaults to "starter" → 3%
    expect(calculatePlatformFee(10000)).toBe(300);
  });

  it("handles zero amount", () => {
    expect(calculatePlatformFee(0, "starter")).toBe(0);
  });

  it("rounds to nearest integer (cents)", () => {
    // 3% of 333 = 9.99, should round to 10
    expect(calculatePlatformFee(333, "starter")).toBe(10);
  });
});
