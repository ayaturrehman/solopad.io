"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { AlertCircle, Check, CheckCircle2, CreditCard, Link2, Link2Off } from "lucide-react";

const PAYMENT_OPTIONS = [
  { id: "card", label: "Credit / Debit Card", description: "Visa, Mastercard, Amex - includes Apple Pay & Google Pay", required: true },
  { id: "paypal", label: "PayPal", description: "Let clients pay via their PayPal account", required: false },
  { id: "klarna", label: "Klarna", description: "Buy now, pay later - clients split into instalments", required: false },
];

function PaymentsContent({ stripe: initialStripe, paymentMethods: initialMethods }) {
  const searchParams = useSearchParams();
  const stripeParam = searchParams?.get("stripe");

  const [stripe, setStripe] = useState(initialStripe);
  const [methods, setMethods] = useState(initialMethods);
  const [savingPayments, setSavingPayments] = useState(false);
  const [savedPayments, setSavedPayments] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  function toggleMethod(id) {
    if (id === "card") return;
    setMethods((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  async function savePayments() {
    setSavingPayments(true);
    await fetch("/api/settings/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethods: methods }),
    });
    setSavedPayments(true);
    setSavingPayments(false);
    setTimeout(() => setSavedPayments(false), 2000);
  }

  async function disconnectStripe() {
    if (!confirm("Disconnect your Stripe account? Clients will no longer be able to pay invoices until you reconnect.")) return;
    setDisconnecting(true);
    await fetch("/api/settings/stripe/disconnect", { method: "POST" });
    setStripe({ connected: false, onboarded: false, accountId: null });
    setDisconnecting(false);
  }

  return (
    <div className="space-y-6">
      {stripeParam === "connected" && (
        <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Stripe account connected successfully.
        </div>
      )}
      {stripeParam === "error" && (
        <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Stripe connection failed. Please try again.
        </div>
      )}

      {/* Stripe Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 32 32" fill="none">
              <path d="M13.3 11.5c0-.8.7-1.1 1.8-1.1 1.6 0 3.6.5 5.2 1.4V7.4A13.8 13.8 0 0015.1 7c-4.6 0-7.7 2.4-7.7 6.4 0 6.2 8.6 5.2 8.6 7.9 0 .9-.8 1.2-2 1.2-1.7 0-3.9-.7-5.6-1.7v4.5c1.9.8 3.8 1.2 5.6 1.2 4.7 0 8-2.3 8-6.4-.1-6.8-8.7-5.5-8.7-8.6z" fill="#635BFF" />
            </svg>
            <h2 className="font-semibold text-zinc-900">Stripe Account</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">Connect your Stripe account so clients pay directly to you.</p>
        </CardHeader>
        <CardBody>
          {stripe.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-700">
                  {stripe.onboarded ? "Connected and active" : "Connected - finish onboarding in Stripe"}
                </span>
              </div>
              <p className="text-xs text-zinc-400">Account: <span className="font-mono">{stripe.accountId}</span></p>
              <Button variant="secondary" size="sm" onClick={disconnectStripe} loading={disconnecting}>
                <Link2Off className="mr-1.5 h-3.5 w-3.5" /> Disconnect Stripe
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-500">No Stripe account connected. Connect now to accept card, Apple Pay, Google Pay, and more.</p>
              <a
                href="/api/settings/stripe/connect"
                className="inline-flex items-center gap-2 rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Link2 className="h-4 w-4" /> Connect with Stripe
              </a>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">Client Payment Methods</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">Choose how clients can pay their invoices.</p>
        </CardHeader>
        <CardBody className="space-y-3">
          {!stripe.connected && (
            <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Connect your Stripe account above before enabling payment methods.
            </div>
          )}
          {PAYMENT_OPTIONS.map((option) => {
            const enabled = methods.includes(option.id);
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-3 rounded border p-3.5 transition-colors ${
                  enabled ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white"
                } ${option.required ? "cursor-default" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={enabled}
                  disabled={option.required}
                  onChange={() => toggleMethod(option.id)}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-zinc-900"
                />
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {option.label}
                    {option.required && <span className="ml-2 text-xs text-zinc-400">(required)</span>}
                  </p>
                  <p className="text-xs text-zinc-500">{option.description}</p>
                </div>
              </label>
            );
          })}
          <Button size="sm" onClick={savePayments} loading={savingPayments}>
            {savedPayments ? <><Check className="h-4 w-4" /> Saved</> : "Save payment methods"}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

export default function PaymentsClient(props) {
  return (
    <Suspense>
      <PaymentsContent {...props} />
    </Suspense>
  );
}
