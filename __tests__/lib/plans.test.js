import { describe, it, expect } from "vitest";
import {
  PLAN_CONFIG,
  PLAN_ORDER,
  ALL_PLANS,
  isValidPlan,
  getPlan,
  getStripePriceId,
  getPlatformFeeRate,
} from "@/lib/plans";

// ─── Plan Structure ─────────────────────────────────────────────

describe("Plan Configuration", () => {
  it("PLAN_ORDER contains only public plans (no free)", () => {
    expect(PLAN_ORDER).toEqual(["starter", "solo", "pro"]);
    expect(PLAN_ORDER).not.toContain("free");
  });

  it("ALL_PLANS includes legacy free plan", () => {
    expect(ALL_PLANS).toContain("free");
    expect(ALL_PLANS).toContain("starter");
    expect(ALL_PLANS).toContain("solo");
    expect(ALL_PLANS).toContain("pro");
  });

  it("free plan is marked as hidden", () => {
    expect(PLAN_CONFIG.free.hidden).toBe(true);
  });

  it("every public plan has required fields", () => {
    for (const planId of PLAN_ORDER) {
      const plan = PLAN_CONFIG[planId];
      expect(plan.id).toBe(planId);
      expect(plan.name).toBeTruthy();
      expect(plan.price).toMatch(/^£\d+/);
      expect(plan.monthlyAmount).toBeGreaterThan(0);
      expect(plan.period).toBe("/mo");
      expect(plan.description).toBeTruthy();
      expect(plan.features).toBeInstanceOf(Array);
      expect(plan.features.length).toBeGreaterThan(0);
      expect(plan.cta).toBeTruthy();
      expect(plan.platformFee).toBeGreaterThan(0);
      expect(plan.platformFee).toBeLessThan(1);
    }
  });
});

// ─── Pricing Accuracy ───────────────────────────────────────────

describe("Pricing - Monthly", () => {
  it("Starter = £5/mo", () => {
    expect(PLAN_CONFIG.starter.monthlyAmount).toBe(5);
    expect(PLAN_CONFIG.starter.price).toBe("£5");
  });

  it("Solo = £12/mo", () => {
    expect(PLAN_CONFIG.solo.monthlyAmount).toBe(12);
    expect(PLAN_CONFIG.solo.price).toBe("£12");
  });

  it("Pro = £29/mo", () => {
    expect(PLAN_CONFIG.pro.monthlyAmount).toBe(29);
    expect(PLAN_CONFIG.pro.price).toBe("£29");
  });
});

describe("Pricing - Annual (2 months free = pay for 10)", () => {
  it("Starter annual = £50 (5 × 10)", () => {
    expect(PLAN_CONFIG.starter.annualPrice).toBe("£50");
  });

  it("Solo annual = £120 (12 × 10)", () => {
    expect(PLAN_CONFIG.solo.annualPrice).toBe("£120");
  });

  it("Pro annual = £290 (29 × 10)", () => {
    expect(PLAN_CONFIG.pro.annualPrice).toBe("£290");
  });
});

describe("Pricing - Promo (50% off first 6 months)", () => {
  it("Starter promo = £2.50/mo", () => {
    expect(PLAN_CONFIG.starter.promoPrice).toBe("£2.50");
  });

  it("Solo promo = £6/mo", () => {
    expect(PLAN_CONFIG.solo.promoPrice).toBe("£6");
  });

  it("Pro promo = £14.50/mo", () => {
    expect(PLAN_CONFIG.pro.promoPrice).toBe("£14.50");
  });
});

describe("Pricing - Annual Promo (50% off 6mo + 2mo free)", () => {
  // Formula: 6 months at half price + 4 months at full price
  it("Starter annual promo = £35 (6×£2.50 + 4×£5)", () => {
    expect(PLAN_CONFIG.starter.annualPromoPrice).toBe("£35");
    // Verify math: 6*2.5 + 4*5 = 15 + 20 = 35
    const expected = 6 * (5 / 2) + 4 * 5;
    expect(expected).toBe(35);
  });

  it("Solo annual promo = £84 (6×£6 + 4×£12)", () => {
    expect(PLAN_CONFIG.solo.annualPromoPrice).toBe("£84");
    const expected = 6 * (12 / 2) + 4 * 12;
    expect(expected).toBe(84);
  });

  it("Pro annual promo = £203 (6×£14.50 + 4×£29)", () => {
    expect(PLAN_CONFIG.pro.annualPromoPrice).toBe("£203");
    const expected = 6 * (29 / 2) + 4 * 29;
    expect(expected).toBe(203);
  });
});

// ─── Platform Fees ──────────────────────────────────────────────

describe("Platform Fees", () => {
  it("free = 5%", () => {
    expect(PLAN_CONFIG.free.platformFee).toBe(0.05);
  });

  it("starter = 3%", () => {
    expect(PLAN_CONFIG.starter.platformFee).toBe(0.03);
  });

  it("solo = 2%", () => {
    expect(PLAN_CONFIG.solo.platformFee).toBe(0.02);
  });

  it("pro = 1%", () => {
    expect(PLAN_CONFIG.pro.platformFee).toBe(0.01);
  });

  it("getPlatformFeeRate returns correct rate", () => {
    expect(getPlatformFeeRate("starter")).toBe(0.03);
    expect(getPlatformFeeRate("solo")).toBe(0.02);
    expect(getPlatformFeeRate("pro")).toBe(0.01);
  });

  it("getPlatformFeeRate defaults to starter for unknown plans", () => {
    expect(getPlatformFeeRate("nonexistent")).toBe(0.03);
    expect(getPlatformFeeRate(null)).toBe(0.03);
    expect(getPlatformFeeRate(undefined)).toBe(0.03);
  });
});

// ─── Feature Lists ──────────────────────────────────────────────

describe("Feature Lists", () => {
  it("Starter has unlimited projects", () => {
    expect(PLAN_CONFIG.starter.features).toContain("Unlimited projects");
  });

  it("Starter has unlimited invoices", () => {
    expect(PLAN_CONFIG.starter.features).toContain("Unlimited invoices");
  });

  it("Starter has AI drafting", () => {
    expect(PLAN_CONFIG.starter.features).toContain("AI drafting (proposals & contracts)");
  });

  it("Starter has e-signature", () => {
    expect(PLAN_CONFIG.starter.features).toContain("E-signature workflows");
  });

  it("Starter has unlimited file uploads", () => {
    expect(PLAN_CONFIG.starter.features).toContain("Unlimited file uploads");
  });

  it("no plan has storage limits (removed)", () => {
    for (const planId of PLAN_ORDER) {
      const features = PLAN_CONFIG[planId].features;
      const hasStorage = features.some((f) => /\d+GB storage/.test(f));
      expect(hasStorage).toBe(false);
    }
  });

  it("Solo has up to 2 team members", () => {
    expect(PLAN_CONFIG.solo.features).toContain("Up to 2 team members");
  });

  it("Solo inherits from Starter", () => {
    expect(PLAN_CONFIG.solo.features[0]).toBe("Everything in Starter");
  });

  it("Pro inherits from Solo", () => {
    expect(PLAN_CONFIG.pro.features[0]).toBe("Everything in Solo");
  });

  it("Pro has team collaboration", () => {
    expect(PLAN_CONFIG.pro.features).toContain("Team collaboration & permissions");
  });
});

// ─── Helper Functions ───────────────────────────────────────────

describe("isValidPlan", () => {
  it("accepts all valid plans", () => {
    expect(isValidPlan("free")).toBe(true);
    expect(isValidPlan("starter")).toBe(true);
    expect(isValidPlan("solo")).toBe(true);
    expect(isValidPlan("pro")).toBe(true);
  });

  it("rejects invalid plans", () => {
    expect(isValidPlan("enterprise")).toBe(false);
    expect(isValidPlan("")).toBe(false);
    expect(isValidPlan(null)).toBe(false);
    expect(isValidPlan(undefined)).toBe(false);
    expect(isValidPlan("FREE")).toBe(false);
  });
});

describe("getPlan", () => {
  it("returns correct plan config", () => {
    expect(getPlan("solo").name).toBe("Solo");
    expect(getPlan("pro").name).toBe("Pro");
  });

  it("defaults to starter for unknown plans", () => {
    expect(getPlan("nonexistent").name).toBe("Starter");
    expect(getPlan(null).name).toBe("Starter");
    expect(getPlan(undefined).name).toBe("Starter");
  });
});

describe("getStripePriceId", () => {
  it("returns null when env vars not set", () => {
    // In test environment, env vars are not set
    expect(getStripePriceId("starter", "monthly")).toBeNull();
    expect(getStripePriceId("starter", "yearly")).toBeNull();
  });

  it("returns null for invalid plan", () => {
    expect(getStripePriceId("nonexistent", "monthly")).toBeNull();
  });
});
