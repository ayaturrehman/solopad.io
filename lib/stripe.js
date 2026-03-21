/**
 * Shared Stripe client — single source of truth for Stripe initialization.
 * Import this instead of creating new Stripe instances in each route.
 */
import Stripe from "stripe";

// Server-side Stripe client (used in API routes)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia",
    })
  : null;

/**
 * Guard: throws if Stripe is not configured.
 * Use at the top of any API route that needs Stripe.
 */
export function requireStripe() {
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local");
  }
  return stripe;
}

/**
 * Platform fee percentage by plan tier.
 * Lower fees incentivize upgrades.
 */
export const PLATFORM_FEE_RATES = {
  free: 0.05,        // 5% — legacy free users
  starter: 0.03,     // 3%
  solo: 0.02,        // 2%
  pro: 0.01,         // 1%
  enterprise: 0.005, // 0.5%
};

/**
 * Get platform fee rate for a given plan.
 * Defaults to free tier rate if plan is unknown.
 */
export function getPlatformFeeRate(plan) {
  return PLATFORM_FEE_RATES[plan] || PLATFORM_FEE_RATES.free;
}

/**
 * Calculate platform fee in cents for a given amount and plan.
 * @param {number} amountCents - Total amount in cents
 * @param {string} plan - User's plan (free/solo/pro/enterprise)
 * @returns {number} Fee in cents
 */
export function calculatePlatformFee(amountCents, plan = "starter") {
  const rate = getPlatformFeeRate(plan);
  return Math.round(amountCents * rate);
}
