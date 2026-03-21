"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLAN_ORDER, getPlan } from "@/lib/plans";
import { Check, Tag, Loader2, Sparkles } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const [interval, setInterval] = useState("monthly"); // monthly | yearly
  const [loading, setLoading] = useState(null); // plan id being checked out
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null); // { valid, coupon, error }
  const [validating, setValidating] = useState(false);

  async function validateCoupon() {
    if (!couponCode.trim()) return;
    setValidating(true);
    setCouponResult(null);
    try {
      const res = await fetch("/api/billing/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      const data = await res.json();
      setCouponResult(data);
    } catch {
      setCouponResult({ valid: false, error: "Could not validate code." });
    }
    setValidating(false);
  }

  async function handleUpgrade(planId) {
    if (planId === "free") return;
    setLoading(planId);
    try {
      const body = { plan: planId, interval };
      if (couponResult?.valid) {
        body.couponCode = couponCode.trim();
      }
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data.error || "Could not start checkout.");
    } catch {
      alert("Connection error. Please try again.");
    }
    setLoading(null);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Choose your plan</h1>
        <p className="mt-2 text-sm text-zinc-500">
          30-day free trial on all plans. No hidden fees. Cancel anytime.
        </p>
      </div>

      {/* Promo banner */}
      <div className="mx-auto max-w-lg mb-8 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-5 py-3 text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-700">
          <Sparkles className="h-4 w-4" />
          30-day free trial + 50% off for 6 months
        </div>
        <p className="mt-0.5 text-xs text-blue-500">Applied automatically at checkout</p>
      </div>

      {/* Interval toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setInterval("monthly")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            interval === "monthly" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setInterval("yearly")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            interval === "yearly" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          Yearly <span className="text-xs opacity-75">2 months free</span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {PLAN_ORDER.map((planId) => {
          const item = getPlan(planId);
          const isPopular = planId === "solo";
          const isYearly = interval === "yearly";
          const price = isYearly ? item.annualPrice : item.price;
          const period = isYearly ? item.annualPeriod : item.period;

          return (
            <div
              key={planId}
              className={`relative flex flex-col rounded-lg border p-6 ${
                isPopular ? "border-blue-500 ring-1 ring-blue-500" : "border-zinc-200"
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-0.5 text-xs font-medium text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-zinc-900">{item.name}</h3>
              <p className="mt-1 text-sm text-zinc-500">{item.description}</p>

              {/* Pricing display */}
              {!isYearly && item.promoPrice ? (
                /* Monthly with 50% off */
                <div className="mt-4">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-700 mb-2">
                    50% OFF
                  </span>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-zinc-900">{item.promoPrice}</span>
                    <span className="text-sm text-zinc-400 mb-1">/mo</span>
                  </div>
                  <p className="mt-1.5 text-sm text-zinc-500">
                    for first 6 months
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    <span className="line-through">{item.price}/mo</span>{" "}
                    · then {item.price}/mo after
                  </p>
                </div>
              ) : isYearly && item.annualPromoPrice ? (
                /* Annual with 50% off first 6mo + 2 months free */
                <div className="mt-4">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-700 mb-2">
                    50% OFF + 2 MONTHS FREE
                  </span>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-zinc-900">{item.annualPromoPrice}</span>
                    <span className="text-sm text-zinc-400 mb-1">/yr</span>
                  </div>
                  <p className="mt-1.5 text-sm text-zinc-500">
                    That&apos;s {item.annualPromoMonthly}/mo · save {item.annualPromoSave}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    <span className="line-through">{item.annualPrice}/yr</span>{" "}
                    · then {item.annualPrice}/yr after
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <span className="text-4xl font-black text-zinc-900">{price}</span>
                  <span className="text-sm text-zinc-400">{period}</span>
                </div>
              )}
              <ul className="mt-5 flex-1 space-y-2">
                {item.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-zinc-400">
                Platform fee: {Math.round(item.platformFee * 100)}% on client payments
              </p>
              <button
                onClick={() => handleUpgrade(planId)}
                disabled={loading === planId}
                className={`mt-5 w-full rounded-lg py-2.5 text-sm font-semibold transition ${
                  isPopular
                    ? "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    : "bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-50"
                }`}
              >
                {loading === planId ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  item.cta
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Coupon section */}
      <div className="mt-8 mx-auto max-w-md">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-zinc-400" />
          <p className="text-sm text-zinc-500">Have a promo code?</p>
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              setCouponResult(null);
            }}
            placeholder="Enter code"
            className="flex-1 rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
          />
          <button
            onClick={validateCoupon}
            disabled={!couponCode.trim() || validating}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {validating ? "Checking..." : "Apply"}
          </button>
        </div>
        {couponResult && (
          <div className={`mt-2 rounded p-2 text-sm ${couponResult.valid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {couponResult.valid ? (
              <>
                <span className="font-medium">{couponResult.coupon.name}</span>:{" "}
                {couponResult.coupon.percentOff ? `${couponResult.coupon.percentOff}% off` : ""}
                {couponResult.coupon.amountOff ? `£${couponResult.coupon.amountOff} off` : ""}
                {couponResult.coupon.duration === "once" ? " (first payment)" : ""}
                {couponResult.coupon.duration === "repeating" ? ` for ${couponResult.coupon.durationInMonths} months` : ""}
                {couponResult.coupon.duration === "forever" ? " forever" : ""}
              </>
            ) : (
              couponResult.error
            )}
          </div>
        )}
      </div>
    </div>
  );
}
