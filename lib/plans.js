/**
 * Plan configuration — defines features, pricing, and Stripe price IDs.
 *
 * Stripe Price IDs must be set in env vars for each plan:
 *   STRIPE_PRICE_SOLO_MONTHLY, STRIPE_PRICE_SOLO_YEARLY
 *   STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_YEARLY
 *
 * If not set, plan upgrade will show "coming soon".
 */

export const PLAN_CONFIG = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "1 active project, 100MB storage",
    features: [
      "1 active project",
      "100MB storage",
      "Client portal link",
      "Files & comments",
      "1 invoice with Stripe",
    ],
    cta: "Start free",
    stripePriceMonthly: null,
    stripePriceYearly: null,
    platformFee: 0.03, // 3%
  },
  solo: {
    id: "solo",
    name: "Solo",
    price: "$12",
    period: "/mo",
    annualPrice: "$10",
    annualPeriod: "/mo billed annually",
    description: "Unlimited projects, 5GB storage, teammate invites, and task assignment",
    features: [
      "Unlimited projects",
      "5GB storage",
      "Everything in Free",
      "CRM & contact management",
      "Proposals with AI drafting",
      "Payment reminders",
      "Time tracking",
      "Email notifications",
    ],
    cta: "Get started",
    stripePriceMonthly: process.env.STRIPE_PRICE_SOLO_MONTHLY || null,
    stripePriceYearly: process.env.STRIPE_PRICE_SOLO_YEARLY || null,
    platformFee: 0.02, // 2%
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/mo",
    annualPrice: "$24",
    annualPeriod: "/mo billed annually",
    description: "Unlimited projects, 20GB storage, custom branding, and advanced collaboration",
    features: [
      "Unlimited projects",
      "20GB storage",
      "Everything in Solo",
      "Contracts & e-signature",
      "Custom branding",
      "Scheduler & booking page",
      "Team collaboration",
      "PDF templates",
      "Finance & expense tracking",
    ],
    cta: "Go Pro",
    stripePriceMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || null,
    stripePriceYearly: process.env.STRIPE_PRICE_PRO_YEARLY || null,
    platformFee: 0.01, // 1%
  },
};

export const PLAN_ORDER = ["free", "solo", "pro"];

export function isValidPlan(plan) {
  return PLAN_ORDER.includes(plan);
}

export function getPlan(plan) {
  return PLAN_CONFIG[plan] ?? PLAN_CONFIG.free;
}

/**
 * Get the Stripe Price ID for a plan + billing interval.
 * Returns null if no price is configured.
 */
export function getStripePriceId(plan, interval = "monthly") {
  const config = PLAN_CONFIG[plan];
  if (!config) return null;
  return interval === "yearly" ? config.stripePriceYearly : config.stripePriceMonthly;
}

/**
 * Get the platform fee rate for a given plan.
 */
export function getPlatformFeeRate(plan) {
  return PLAN_CONFIG[plan]?.platformFee ?? PLAN_CONFIG.free.platformFee;
}
