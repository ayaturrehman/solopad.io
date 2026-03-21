/**
 * Plan configuration — defines features, pricing, and Stripe price IDs.
 *
 * Base currency: GBP (£) — shown to UK visitors
 * USD conversion: shown to all other visitors (approx 1 GBP = 1.27 USD, rounded nicely)
 * Annual billing: 2 months free (pay for 10 months)
 * Launch offer: 30-day free trial + 50% off for first 6 months
 *
 * Stripe Price IDs must be set in env vars for each plan:
 *   STRIPE_PRICE_STARTER_MONTHLY, STRIPE_PRICE_STARTER_YEARLY
 *   STRIPE_PRICE_SOLO_MONTHLY, STRIPE_PRICE_SOLO_YEARLY
 *   STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_YEARLY
 *
 * If not set, plan upgrade will show "coming soon".
 */

export const CURRENCY = "£";

/** USD equivalents (rounded to clean numbers) for non-UK visitors */
const USD_PRICES = {
  starter: { monthly: 6, promo: 3, annual: 59, annualPromo: 42, annualPromoMonthly: 3.50, annualPromoSave: 17 },
  solo:    { monthly: 15, promo: 7.50, annual: 149, annualPromo: 105, annualPromoMonthly: 8.75, annualPromoSave: 44 },
  pro:     { monthly: 36, promo: 18, annual: 359, annualPromo: 253, annualPromoMonthly: 21.08, annualPromoSave: 106 },
};

/**
 * Detect if the user is in the UK based on browser locale or timezone.
 * Returns true for UK visitors, false for everyone else.
 * Only works client-side — returns true (GBP default) on server.
 */
export function isUKVisitor() {
  if (typeof window === "undefined") return true; // SSR default to GBP
  const lang = navigator.language || navigator.languages?.[0] || "";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  return lang === "en-GB" || tz.startsWith("Europe/London");
}

/**
 * Format a price amount with the correct currency symbol.
 */
export function formatPrice(amount, isUK = true) {
  const symbol = isUK ? "£" : "$";
  const formatted = Number(amount) % 1 === 0 ? String(Math.round(amount)) : amount.toFixed(2);
  return `${symbol}${formatted}`;
}

/**
 * Get a plan config with prices localised for the visitor's region.
 * Pass isUK=false for USD pricing.
 */
export function getLocalisedPlan(plan, isUK = true) {
  const config = PLAN_CONFIG[plan];
  if (!config || isUK) return config;

  const usd = USD_PRICES[plan];
  if (!usd) return config; // free plan — no USD mapping

  return {
    ...config,
    price: formatPrice(usd.monthly, false),
    monthlyAmount: usd.monthly,
    promoPrice: formatPrice(usd.promo, false),
    annualPrice: formatPrice(usd.annual, false),
    annualMonthly: formatPrice(usd.annual / 12, false),
    annualPromoPrice: formatPrice(usd.annualPromo, false),
    annualPromoMonthly: formatPrice(usd.annualPromoMonthly, false),
    annualPromoSave: formatPrice(usd.annualPromoSave, false),
  };
}

export const PLAN_CONFIG = {
  free: {
    id: "free",
    name: "Free",
    price: "£0",
    period: "/mo",
    description: "Legacy free tier (no longer offered to new users)",
    features: [],
    cta: "—",
    stripePriceMonthly: null,
    stripePriceYearly: null,
    platformFee: 0.05, // 5% — legacy users pay higher fee
    hidden: true, // not shown on pricing pages
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: "£5",
    monthlyAmount: 5,
    period: "/mo",
    annualPrice: "£50",
    annualMonthly: "£4.17",
    annualPeriod: "/yr (2 months free)",
    annualPromoPrice: "£35",        // 6×£2.50 + 4×£5
    annualPromoMonthly: "£2.92",    // £35 ÷ 12
    annualPromoSave: "£15",
    promoPrice: "£2.50",
    promoPeriod: "/mo for first 6 months",
    description: "Everything you need to start freelancing",
    tagline: "Get started",
    features: [
      "Unlimited projects",
      "Unlimited invoices",
      "Basic proposals",
      "Basic contracts",
      "Finance & expenses",
      "Tasks & to-do",
      "AI drafting (proposals & contracts)",
      "E-signature workflows",
      "Client portal",
      "1GB storage",
    ],
    cta: "Start 30-day free trial",
    stripePriceMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || null,
    stripePriceYearly: process.env.STRIPE_PRICE_STARTER_YEARLY || null,
    platformFee: 0.03, // 3%
  },
  solo: {
    id: "solo",
    name: "Solo",
    price: "£12",
    monthlyAmount: 12,
    period: "/mo",
    annualPrice: "£120",
    annualMonthly: "£10",
    annualPeriod: "/yr (2 months free)",
    annualPromoPrice: "£84",        // 6×£6 + 4×£12
    annualPromoMonthly: "£7",       // £84 ÷ 12
    annualPromoSave: "£36",
    promoPrice: "£6",
    promoPeriod: "/mo for first 6 months",
    description: "Automate your workflow and grow faster",
    tagline: "Work smarter",
    features: [
      "Everything in Starter",
      "Up to 2 team members",
      "Scheduler & booking page",
      "Email notifications & reminders",
      "Time tracking with reports",
      "CRM & contact management",
      "Recurring invoices",
      "5GB storage",
    ],
    cta: "Start 30-day free trial",
    stripePriceMonthly: process.env.STRIPE_PRICE_SOLO_MONTHLY || null,
    stripePriceYearly: process.env.STRIPE_PRICE_SOLO_YEARLY || null,
    platformFee: 0.02, // 2%
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "£29",
    monthlyAmount: 29,
    period: "/mo",
    annualPrice: "£290",
    annualMonthly: "£24.17",
    annualPeriod: "/yr (2 months free)",
    annualPromoPrice: "£203",       // 6×£14.50 + 4×£29
    annualPromoMonthly: "£16.92",   // £203 ÷ 12
    annualPromoSave: "£87",
    promoPrice: "£14.50",
    promoPeriod: "/mo for first 6 months",
    description: "Scale with your team and own your brand",
    tagline: "Scale up",
    features: [
      "Everything in Solo",
      "Team collaboration & permissions",
      "Custom branding & white-label",
      "PDF templates (custom design)",
      "Advanced reporting & analytics",
      "Priority support",
      "20GB storage",
    ],
    cta: "Start 30-day free trial",
    stripePriceMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || null,
    stripePriceYearly: process.env.STRIPE_PRICE_PRO_YEARLY || null,
    platformFee: 0.01, // 1%
  },
};

/** Plans shown on public pricing pages (excludes legacy free) */
export const PLAN_ORDER = ["starter", "solo", "pro"];

/** All valid plan IDs including legacy */
export const ALL_PLANS = ["free", "starter", "solo", "pro"];

export function isValidPlan(plan) {
  return ALL_PLANS.includes(plan);
}

export function getPlan(plan) {
  return PLAN_CONFIG[plan] ?? PLAN_CONFIG.starter;
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
  return PLAN_CONFIG[plan]?.platformFee ?? PLAN_CONFIG.starter.platformFee;
}
