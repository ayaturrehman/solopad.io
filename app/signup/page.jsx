"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PLAN_ORDER, getPlan, isValidPlan } from "@/lib/plans";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedPlan = isValidPlan(searchParams.get("plan")) ? searchParams.get("plan") : "free";
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-6 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">PortalKit</span>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Create your account</h1>
          <p className="mt-1 text-sm text-zinc-500">{plan.name} plan selected · {plan.price}{plan.period}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900">{plan.name}</p>
                <p className="text-xs text-zinc-500">{plan.description}</p>
              </div>
              <span className="text-sm font-semibold text-zinc-900">{plan.price}{plan.period}</span>
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
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
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
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}
