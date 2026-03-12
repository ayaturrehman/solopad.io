"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenInvalid(true);
      setFetching(false);
      return;
    }

    fetch(`/api/join?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) {
          setTokenInvalid(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.member) {
          setName(data.member.name || "");
          setEmail(data.member.email || "");
          setRole(data.member.role || "");
          setBusinessName(data.member.businessName || "");
        }
      })
      .catch(() => setTokenInvalid(true))
      .finally(() => setFetching(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Account created but sign-in failed. Please go to the login page.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <p className="text-sm text-zinc-500">Loading invite...</p>
      </div>
    );
  }

  if (tokenInvalid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-900">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-zinc-900">Solopad</span>
            </Link>
          </div>
          <div className="rounded border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-700">Invalid or expired invite</h1>
            <p className="mt-2 text-sm text-red-600">
              This invite link is no longer valid. Please ask your team owner to send a new invite.
            </p>
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-6 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-900">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">Solopad</span>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Accept your invite</h1>
          {businessName && (
            <p className="mt-1 text-sm text-zinc-500">
              You&apos;ve been invited to join <strong>{businessName}</strong>
              {role && <> as <strong>{role}</strong></>}
            </p>
          )}
          {!businessName && role && (
            <p className="mt-1 text-sm text-zinc-500">
              You&apos;ve been invited as <strong>{role}</strong>
            </p>
          )}
        </div>

        <div className="rounded border border-zinc-200 bg-white p-6 shadow-sm">
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
              readOnly
              className="cursor-not-allowed opacity-70"
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
              Create account &amp; join
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

export default function JoinPage() {
  return (
    <Suspense>
      <JoinContent />
    </Suspense>
  );
}
