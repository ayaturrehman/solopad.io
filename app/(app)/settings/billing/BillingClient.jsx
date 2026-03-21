"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { PLAN_ORDER, getPlan } from "@/lib/plans";
import { AlertCircle, CheckCircle2, CreditCard, Clock, Shield, Sparkles } from "lucide-react";

const planColors = {
  free: "bg-zinc-100 text-zinc-600",
  starter: "bg-emerald-100 text-emerald-700",
  solo: "bg-blue-100 text-blue-700",
  pro: "bg-violet-100 text-violet-700",
};

function getTrialDaysLeft(trialEnd) {
  if (!trialEnd) return null;
  const now = new Date();
  const end = new Date(trialEnd);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

function BillingContent({ plan: initialPlan, billingStatus: initialBillingStatus }) {
  const searchParams = useSearchParams();
  const billingParam = searchParams?.get("billing");

  const [plan, setPlan] = useState(initialPlan);
  const [interval, setInterval] = useState("monthly");
  const [savingPlan, setSavingPlan] = useState(false);
  const [billingStatus, setBillingStatus] = useState(initialBillingStatus);
  const [billingData, setBillingData] = useState({ invoices: [], upcoming: null, paymentMethod: null });
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/billing/status").then((r) => r.json()).catch(() => ({ plan: "starter", status: "active", subscription: null })),
      fetch("/api/billing/invoices").then((r) => r.json()).catch(() => ({ invoices: [], upcoming: null, paymentMethod: null })),
    ]).then(([statusData, invoiceData]) => {
      if (statusData) {
        setBillingStatus(statusData);
        if (statusData.plan) setPlan(statusData.plan);
      }
      if (invoiceData) setBillingData(invoiceData);
    });
  }, []);

  const trialDaysLeft = getTrialDaysLeft(billingStatus?.subscription?.trialEnd);
  const isTrialing = billingStatus?.status === "trialing" || trialDaysLeft > 0;
  const hasSubscription = !!billingStatus?.subscription;
  const planInfo = getPlan(plan);

  async function changePlan(nextPlan) {
    if (nextPlan === plan) return;

    if (nextPlan === "free" || nextPlan === "starter") {
      setSavingPlan(true);
      try {
        const res = await fetch("/api/billing/portal", { method: "POST" });
        const data = await res.json();
        if (data.url) { window.location.href = data.url; return; }
      } catch {}
      setSavingPlan(false);
      return;
    }

    setSavingPlan(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: nextPlan, interval }),
      });
      const data = await res.json();
      if (data.updated) {
        setPlan(nextPlan);
        setBillingStatus((prev) => ({ ...prev, plan: nextPlan }));
        window.location.href = data.url;
        return;
      }
      if (data.url) { window.location.href = data.url; return; }
      if (data.error) alert(data.error);
    } catch {
      alert("Could not start checkout. Please try again.");
    }
    setSavingPlan(false);
  }

  async function openBillingPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      alert(data.error || "Could not open billing portal.");
    } catch {
      alert("Could not open billing portal. Please try again.");
    }
    setPortalLoading(false);
  }

  return (
    <div className="space-y-6">
      {billingParam === "success" && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Subscription activated! Your plan has been upgraded.
        </div>
      )}
      {billingParam === "cancelled" && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Checkout was cancelled. No changes were made.
        </div>
      )}

      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-zinc-900">Subscription</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Plan + Status row */}
          <div className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 p-5">
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-semibold text-zinc-900 capitalize">{plan} Plan</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${planColors[plan]}`}>
                  {isTrialing ? "Trial" : billingStatus.status === "active" ? "Active" : billingStatus.status === "past_due" ? "Past due" : billingStatus.status === "canceled" ? "Cancelled" : billingStatus.status || "Active"}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">{planInfo.description}</p>
              <p className="mt-2 text-xl font-bold text-zinc-900">{planInfo.price}<span className="text-sm font-normal text-zinc-400">{planInfo.period}</span></p>
            </div>
            {hasSubscription && (
              <Button size="sm" variant="secondary" loading={portalLoading} onClick={openBillingPortal}>
                Manage subscription
              </Button>
            )}
          </div>

          {/* Trial banner */}
          {isTrialing && (
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {trialDaysLeft ? `${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left in your free trial` : "You're on a free trial"}
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  {billingStatus.subscription?.trialEnd
                    ? `Your trial ends on ${new Date(billingStatus.subscription.trialEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. `
                    : ""}
                  {billingData.paymentMethod
                    ? "Your card will be charged automatically when the trial ends."
                    : "No payment method on file — add one before your trial ends to keep your plan."}
                </p>
                {!billingData.paymentMethod && hasSubscription && (
                  <Button size="sm" variant="primary" className="mt-3" loading={portalLoading} onClick={openBillingPortal}>
                    Add payment method
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* No subscription yet */}
          {!hasSubscription && !isTrialing && (
            <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <Sparkles className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-zinc-700">No active subscription</p>
                <p className="mt-1 text-xs text-zinc-500">Choose a plan below to start your 30-day free trial. No card required upfront.</p>
              </div>
            </div>
          )}

          {/* Period info */}
          {billingStatus.subscription?.currentPeriodEnd && !isTrialing && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Shield className="h-3.5 w-3.5" />
              {billingStatus.subscription.cancelAtPeriodEnd
                ? `Cancels on ${new Date(billingStatus.subscription.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
                : `Next billing date: ${new Date(billingStatus.subscription.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Payment Method & Billing */}
      {(billingData.paymentMethod || billingData.upcoming || billingData.invoices?.length > 0) && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900">Billing details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {billingData.paymentMethod && (
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                    <CreditCard className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 capitalize">{billingData.paymentMethod.brand} •••• {billingData.paymentMethod.last4}</p>
                    <p className="text-xs text-zinc-400">Expires {billingData.paymentMethod.expMonth}/{billingData.paymentMethod.expYear}</p>
                  </div>
                </div>
                <button onClick={openBillingPortal} className="text-xs font-medium text-zinc-600 hover:text-zinc-900">Change</button>
              </div>
            )}

            {billingData.upcoming && (
              <div className="rounded-lg border border-zinc-200 p-4">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">Next charge</p>
                <p className="text-sm font-semibold text-zinc-900">
                  {billingData.upcoming.currency === "gbp" ? "£" : "$"}{billingData.upcoming.amount?.toFixed(2)}
                  {billingData.upcoming.date && <span className="font-normal text-zinc-400"> on {new Date(billingData.upcoming.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>}
                </p>
                {billingData.upcoming.discount && (
                  <p className="text-xs text-green-600 mt-1">
                    {billingData.upcoming.discount.code}
                    {billingData.upcoming.discount.percentOff ? ` — ${billingData.upcoming.discount.percentOff}% off` : ""}
                  </p>
                )}
              </div>
            )}

            {billingData.invoices?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Invoice history</p>
                <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
                  {billingData.invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm text-zinc-900">{inv.description}</p>
                        <p className="text-xs text-zinc-400">{inv.date ? new Date(inv.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}{inv.number ? ` · ${inv.number}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${inv.status === "paid" ? "text-green-600" : inv.status === "open" ? "text-amber-600" : "text-red-600"}`}>
                          £{inv.amount?.toFixed(2)}
                        </span>
                        {inv.receiptUrl && (
                          <a href={inv.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-zinc-500 hover:text-zinc-900">View</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Change Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-zinc-900">Change plan</h2>
              <p className="mt-0.5 text-xs text-zinc-400">Switch plans anytime. Prices in GBP, local currency applied at checkout.</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 p-0.5">
              <button
                onClick={() => setInterval("monthly")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  interval === "monthly" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setInterval("yearly")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  interval === "yearly" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Yearly <span className="text-emerald-600">-17%</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid gap-3 md:grid-cols-3">
            {PLAN_ORDER.map((planId) => {
              const item = getPlan(planId);
              const active = plan === planId;
              const isYearly = interval === "yearly";
              const displayPrice = isYearly ? item.annualPrice : item.price;
              const displayPeriod = isYearly ? "/yr" : item.period;
              return (
                <div key={planId} className={`rounded-lg border p-4 transition ${active ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-300"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{item.tagline || item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900 whitespace-nowrap">{displayPrice}<span className="text-xs font-normal text-zinc-400">{displayPeriod}</span></p>
                      {isYearly && item.annualMonthly && (
                        <p className="text-xs text-zinc-400">{item.annualMonthly}/mo</p>
                      )}
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {item.features.slice(0, 3).map((f) => (
                      <li key={f} className="text-xs text-zinc-500">• {f}</li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant={active ? "secondary" : "primary"}
                    className="mt-4 w-full"
                    disabled={active || savingPlan}
                    loading={savingPlan && !active}
                    onClick={() => changePlan(planId)}
                  >
                    {active ? "Current plan" : `Switch to ${item.name}`}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-red-600">Danger zone</h2>
        </CardHeader>
        <CardBody>
          <p className="mb-4 text-sm text-zinc-500">Permanently delete your account and all data.</p>
          <Button variant="danger" size="sm">Delete account</Button>
        </CardBody>
      </Card>
    </div>
  );
}

export default function BillingClient(props) {
  return (
    <Suspense>
      <BillingContent {...props} />
    </Suspense>
  );
}
