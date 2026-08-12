"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import BrandLogo from "@/components/shared/BrandLogo";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PLAN_ORDER, getPlan, isValidPlan } from "@/lib/plans";

function SignupSeoCopy() {
  return (
    <div className="mt-10 max-w-lg text-left text-sm leading-relaxed text-zinc-600">
      <h2 className="text-base font-semibold text-zinc-900">What you get with SoloPad</h2>
      <p className="mt-2">
        Create a free SoloPad account and run your freelance business from one place —
        invoices with Stripe payments, AI-drafted proposals and contracts, e-signatures,
        CRM, time tracking, scheduling, and a client portal. Plans start at £5/mo after
        a 30-day trial. No credit card required to start.
      </p>
      <p className="mt-3">
        Solo freelancers and small teams use SoloPad as a lighter alternative to
        HoneyBook, Dubsado, Bonsai, Moxie, and Plutio when they want full invoicing and
        contracts without stacking multiple tools. Compare plans above, or explore{" "}
        <Link href="/features" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
          features
        </Link>
        ,{" "}
        <Link href="/compare" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
          competitor comparisons
        </Link>
        , and{" "}
        <Link href="/blog" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
          freelance guides
        </Link>{" "}
        before you sign up.
      </p>
    </div>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedPlan = isValidPlan(searchParams.get("plan")) ? searchParams.get("plan") : "starter";
  const plan = getPlan(selectedPlan);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, plan: selectedPlan }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-6 flex items-center gap-2">
            <BrandLogo markClassName="h-8 w-8" />
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Create your account</h1>
          <p className="mt-2 text-center text-sm text-zinc-500">
            Sign up free for SoloPad — invoicing, contracts, proposals, CRM, and AI
            drafting for freelancers. {plan.name} plan selected · {plan.price}
            {plan.period}.
          </p>
        </div>

        <div className="rounded border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5 rounded border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900">{plan.name}</p>
                <p className="text-xs text-zinc-500">{plan.description}</p>
              </div>
              <span className="text-sm font-semibold text-zinc-900">
                {plan.price}
                {plan.period}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PLAN_ORDER.map((planId) => {
                const item = getPlan(planId);
                const active = selectedPlan === planId;
                return (
                  <Link
                    key={planId}
                    href={`/signup?plan=${planId}`}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your name"
              type="text"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            {error && (
              <p className="rounded bg-red-50 px-3 py-1.5 text-sm text-red-600">{error}</p>
            )}
            <Button type="submit" loading={loading} className="w-full">
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-zinc-900 hover:underline">
            Sign in
          </Link>
        </p>

        <SignupSeoCopy />
      </div>
    </div>
  );
}

function SignupFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <BrandLogo markClassName="h-8 w-8" />
          <h1 className="mt-6 text-2xl font-bold text-zinc-900">Create your account</h1>
          <p className="mt-2 text-center text-sm text-zinc-500">
            Sign up free for SoloPad — invoicing, contracts, proposals, CRM, and AI
            drafting for freelancers. No credit card required for your 30-day trial.
          </p>
        </div>
        <SignupSeoCopy />
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupContent />
    </Suspense>
  );
}
