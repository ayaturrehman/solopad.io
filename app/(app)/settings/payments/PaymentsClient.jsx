"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { AlertCircle, Check, CheckCircle2, CreditCard, Link2, Link2Off, Clock, Banknote } from "lucide-react";

const PAYMENT_OPTIONS = [
  { id: "card", label: "Credit / Debit Card", description: "Visa, Mastercard, Amex - includes Apple Pay & Google Pay", required: true },
  { id: "paypal", label: "PayPal", description: "Let clients pay via their PayPal account", required: false },
  { id: "klarna", label: "Klarna", description: "Buy now, pay later - clients split into instalments", required: false },
];

function PaymentsContent({ stripe: initialStripe, paymentMethods: initialMethods }) {
  const searchParams = useSearchParams();
  const stripeParam = searchParams?.get("stripe");
  const stripeMsg = searchParams?.get("msg");

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
    if (!confirm("Disconnect your bank account? Clients will no longer be able to pay invoices until you reconnect.")) return;
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
          Bank account connected successfully. You can now receive payments.
        </div>
      )}
      {stripeParam === "incomplete" && (
        <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <Clock className="h-4 w-4 shrink-0" />
          Setup incomplete. Click below to finish connecting your bank account.
        </div>
      )}
      {stripeParam === "error" && (
        <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Connection failed{stripeMsg ? `: ${stripeMsg}` : ". Please try again."}
        </div>
      )}

      {/* Payment Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">Get Paid</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            Connect your bank account to receive client payments. When a client pays an invoice, the money is deposited directly to your bank account within 2-3 business days.
          </p>
        </CardHeader>
        <CardBody>
          {stripe.connected && stripe.onboarded ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-700">
                  Connected and active — ready to receive payments
                </span>
              </div>
              <div className="rounded border border-zinc-100 bg-zinc-50 px-3 py-2.5">
                <p className="text-xs text-zinc-500">
                  Client payments are processed securely via Stripe. Funds are deposited to your bank account within 2-3 business days after payment. A small platform fee is deducted based on your plan.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={disconnectStripe} loading={disconnecting}>
                <Link2Off className="mr-1.5 h-3.5 w-3.5" /> Disconnect bank account
              </Button>
            </div>
          ) : stripe.connected && !stripe.onboarded ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  Setup incomplete — finish adding your bank details
                </span>
              </div>
              <p className="text-sm text-zinc-500">
                You started the setup but didn't finish. Click below to complete adding your bank account details.
              </p>
              <a
                href="/api/settings/stripe/connect"
                className="inline-flex items-center gap-2 rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                <Link2 className="h-4 w-4" /> Complete setup
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-500">
                Connect your bank account to start accepting client payments. The setup takes about 2 minutes — you'll need your bank details and basic business information.
              </p>
              <div className="rounded border border-zinc-100 bg-zinc-50 px-3 py-2.5">
                <p className="text-xs font-medium text-zinc-700 mb-1">How it works</p>
                <ol className="text-xs text-zinc-500 space-y-1 list-decimal list-inside">
                  <li>You add your bank account details (takes 2 minutes)</li>
                  <li>Clients pay your invoices with card, Apple Pay, or Google Pay</li>
                  <li>Money is deposited to your bank within 2-3 business days</li>
                  <li>Processing fee (2.9% + 30p) is deducted automatically</li>
                </ol>
              </div>
              <a
                href="/api/settings/stripe/connect"
                className="inline-flex items-center gap-2 rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                <Link2 className="h-4 w-4" /> Connect bank account
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
              Connect your bank account above before enabling payment methods.
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
