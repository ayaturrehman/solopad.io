"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { PLAN_ORDER, getPlan } from "@/lib/plans";
import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react";

const planColors = {
  free: "bg-zinc-100 text-zinc-600",
  solo: "bg-blue-100 text-blue-700",
  pro: "bg-violet-100 text-violet-700",
};

function BillingContent({ plan: initialPlan, billingStatus: initialBillingStatus }) {
  const searchParams = useSearchParams();
  const billingParam = searchParams?.get("billing");

  const [plan, setPlan] = useState(initialPlan);
  const [savingPlan, setSavingPlan] = useState(false);
  const [billingStatus, setBillingStatus] = useState(initialBillingStatus);
  const [billingData, setBillingData] = useState({ invoices: [], upcoming: null, paymentMethod: null });
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/billing/status").then((r) => r.json()).catch(() => ({ plan: "free", status: "active", subscription: null })),
      fetch("/api/billing/invoices").then((r) => r.json()).catch(() => ({ invoices: [], upcoming: null, paymentMethod: null })),
    ]).then(([statusData, invoiceData]) => {
      if (statusData) setBillingStatus(statusData);
      if (invoiceData) setBillingData(invoiceData);
    });
  }, []);

  async function changePlan(nextPlan) {
    if (nextPlan === plan) return;

    if (nextPlan === "free") {
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
        body: JSON.stringify({ plan: nextPlan, interval: "monthly" }),
      });
      const data = await res.json();
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
        <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Subscription activated! Your plan has been upgraded.
        </div>
      )}
      {billingParam === "cancelled" && (
        <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Checkout was cancelled. No changes were made.
        </div>
      )}

      {/* Plan Selection */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-zinc-900">Plan</h2>
          <p className="mt-0.5 text-xs text-zinc-400">Choose the plan that fits your workflow.</p>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium capitalize text-zinc-900">{plan} plan</p>
              <p className="text-sm text-zinc-500">{getPlan(plan).description}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${planColors[plan]}`}>
              {plan}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {PLAN_ORDER.map((planId) => {
              const item = getPlan(planId);
              const active = plan === planId;
              return (
                <div key={planId} className={`rounded border p-4 ${active ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">{item.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900">{item.price}{item.period}</span>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {item.features.slice(0, 3).map((f) => (
                      <li key={f} className="text-xs text-zinc-500">{f}</li>
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

      {/* Billing Details */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-zinc-900">Billing</h2>
          <p className="mt-0.5 text-xs text-zinc-400">Subscription status, payment method, and invoice history.</p>
        </CardHeader>
        <CardBody className="space-y-5">
          {billingStatus.plan === "free" && !billingData.invoices?.length ? (
            <div className="text-center py-6">
              <p className="text-sm text-zinc-500 mb-3">No billing history. Upgrade to a paid plan to get started.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded border border-zinc-200 p-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900 capitalize">{billingStatus.plan} Plan</p>
                  <p className="text-xs text-zinc-500">
                    Status:{" "}
                    <span className={`font-medium ${billingStatus.status === "active" ? "text-green-600" : billingStatus.status === "past_due" ? "text-red-600" : "text-zinc-500"}`}>
                      {billingStatus.status === "active" ? "Active" : billingStatus.status === "past_due" ? "Past due" : billingStatus.status === "canceled" ? "Canceled" : billingStatus.status}
                    </span>
                  </p>
                  {billingStatus.subscription?.currentPeriodEnd && (
                    <p className="text-xs text-zinc-400 mt-1">
                      {billingStatus.subscription.cancelAtPeriodEnd
                        ? `Cancels on ${new Date(billingStatus.subscription.currentPeriodEnd).toLocaleDateString()}`
                        : `Renews ${new Date(billingStatus.subscription.currentPeriodEnd).toLocaleDateString()}`}
                    </p>
                  )}
                </div>
                <Button size="sm" variant="secondary" loading={portalLoading} onClick={openBillingPortal}>
                  Manage
                </Button>
              </div>

              {billingData.paymentMethod && (
                <div className="flex items-center justify-between rounded border border-zinc-200 p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900 capitalize">{billingData.paymentMethod.brand} •••• {billingData.paymentMethod.last4}</p>
                      <p className="text-xs text-zinc-400">Expires {billingData.paymentMethod.expMonth}/{billingData.paymentMethod.expYear}</p>
                    </div>
                  </div>
                  <button onClick={openBillingPortal} className="text-xs text-blue-600 hover:underline">Update</button>
                </div>
              )}

              {billingData.upcoming && (
                <div className="rounded border border-zinc-200 p-4">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Next charge</p>
                  <p className="text-sm font-medium text-zinc-900">
                    ${billingData.upcoming.amount?.toFixed(2)} {billingData.upcoming.currency}
                    {billingData.upcoming.date && <span className="text-zinc-400 font-normal"> on {new Date(billingData.upcoming.date).toLocaleDateString()}</span>}
                  </p>
                  {billingData.upcoming.discount && (
                    <p className="text-xs text-green-600 mt-1">
                      Discount: {billingData.upcoming.discount.code}
                      {billingData.upcoming.discount.percentOff ? ` (${billingData.upcoming.discount.percentOff}% off)` : ""}
                      {billingData.upcoming.discount.amountOff ? ` ($${billingData.upcoming.discount.amountOff} off)` : ""}
                    </p>
                  )}
                </div>
              )}

              {billingData.invoices?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Invoice History</p>
                  <div className="divide-y divide-zinc-100 rounded border border-zinc-200">
                    {billingData.invoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm text-zinc-900">{inv.description}</p>
                          <p className="text-xs text-zinc-400">{inv.date ? new Date(inv.date).toLocaleDateString() : ""} · {inv.number}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-medium ${inv.status === "paid" ? "text-green-600" : inv.status === "open" ? "text-amber-600" : "text-red-600"}`}>
                            ${inv.amount?.toFixed(2)}
                          </span>
                          {inv.receiptUrl && (
                            <a href={inv.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">PDF</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
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
