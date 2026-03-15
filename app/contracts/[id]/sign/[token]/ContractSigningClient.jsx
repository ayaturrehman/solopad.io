"use client";

import { useState } from "react";
import { CheckCircle2, FileSignature, Shield } from "lucide-react";

function ClauseBlock({ clause, index }) {
  return (
    <div className="py-5 border-b border-zinc-100 last:border-0">
      <h3 className="mb-2 text-sm font-semibold text-zinc-900">
        {index + 1}. {clause.heading}
      </h3>
      <p className="text-sm leading-relaxed text-zinc-600 whitespace-pre-line">{clause.body}</p>
    </div>
  );
}

export default function ContractSigningClient({
  contractId,
  token,
  title,
  clientName,
  preparedBy,
  clauses,
  status,
  signedAt,
  signatureName,
}) {
  const [name, setName] = useState(clientName || "");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");
  const [signed, setSigned] = useState(status === "signed");
  const [signedTime, setSignedTime] = useState(signedAt);
  const [finalName, setFinalName] = useState(signatureName || "");

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  async function handleSign(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your full name to sign."); return; }
    if (!agreed) { setError("Please confirm you agree to the terms."); return; }

    setSigning(true);
    setError("");

    try {
      const res = await fetch(`/api/contracts/${contractId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, signatureName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signing failed. Please try again."); return; }
      setFinalName(name.trim());
      setSignedTime(data.signedAt);
      setSigned(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSigning(false);
    }
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Contract Signed</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {finalName || clientName} has signed <strong>{title}</strong>.
          </p>
          {signedTime && (
            <p className="mt-1 text-xs text-zinc-400">
              Signed on {new Date(signedTime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
            Both parties now have a signed record of this agreement. You can safely close this page.
          </div>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
            <Shield className="h-3.5 w-3.5" />
            Electronically signed via SoloPad
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-zinc-700" />
            <span className="text-sm font-semibold text-zinc-900">SoloPad</span>
          </div>
          <span className="text-xs text-zinc-400">Secure contract signing</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Contract header */}
        <div className="mb-6 rounded-xl border border-zinc-200 bg-white px-6 py-5">
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">Contract</div>
          <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-500">
            <span>Prepared by <strong className="text-zinc-700">{preparedBy}</strong></span>
            <span>For <strong className="text-zinc-700">{clientName}</strong></span>
          </div>
        </div>

        {/* Clauses */}
        <div className="mb-6 rounded-xl border border-zinc-200 bg-white px-6">
          {clauses.length === 0 ? (
            <p className="py-6 text-sm text-zinc-400">No clauses found in this contract.</p>
          ) : (
            clauses.map((clause, i) => <ClauseBlock key={i} clause={clause} index={i} />)
          )}
        </div>

        {/* Signing form */}
        <div className="rounded-xl border border-zinc-200 bg-white px-6 py-6">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">Sign this contract</h2>
          <form onSubmit={handleSign} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Your full legal name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={clientName || "Enter your full name"}
                className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400"
              />
              {name && (
                <div className="mt-3 rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Signature preview</p>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 22, color: "#111827" }}>{name}</p>
                  <p className="mt-1 text-xs text-zinc-400">{today}</p>
                </div>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-zinc-300 accent-zinc-900"
              />
              <span className="text-sm leading-relaxed text-zinc-600">
                I, <strong>{name || "[your name]"}</strong>, have read and agree to the terms of this contract. I understand that my typed name above constitutes a legally binding electronic signature.
              </span>
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={signing || !agreed || !name.trim()}
              className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {signing ? "Signing..." : "Sign Contract"}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
              <Shield className="h-3.5 w-3.5" />
              Your IP address and timestamp are recorded for verification purposes.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
