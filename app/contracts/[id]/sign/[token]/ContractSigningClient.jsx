"use client";

import { useState } from "react";
import { CheckCircle2, FileSignature, Shield } from "lucide-react";

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function ClauseBlock({ clause, index }) {
  return (
    <div className="py-5 border-b border-zinc-100 last:border-0">
      <h3 className="mb-2 text-sm font-semibold text-zinc-900">
        {index + 1}. {clause.heading}
      </h3>
      <p className="text-sm leading-relaxed text-zinc-600 whitespace-pre-line">{stripHtml(clause.body)}</p>
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
  providerSignatureName,
  providerSignedAt,
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
      <div className="min-h-screen bg-zinc-50">
        <header className="border-b border-zinc-200 bg-white px-4 py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-zinc-700" />
              <span className="text-sm font-semibold text-zinc-900">SoloPad</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Signed
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
          {/* Signed confirmation banner */}
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Contract signed</p>
                <p className="mt-0.5 text-sm text-green-700">
                  Signed by <strong>{finalName || clientName}</strong>
                  {signedTime && <> on {new Date(signedTime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</>}
                </p>
              </div>
            </div>
          </div>

          {/* Contract header */}
          <div className="rounded-xl border border-zinc-200 bg-white px-6 py-5">
            <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">Service Agreement</div>
            <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-500">
              <span>Prepared by <strong className="text-zinc-700">{preparedBy}</strong></span>
              <span>For <strong className="text-zinc-700">{clientName}</strong></span>
            </div>
          </div>

          {/* Full contract clauses */}
          <div className="rounded-xl border border-zinc-200 bg-white px-6">
            <p className="py-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 border-b border-zinc-100">Terms &amp; Conditions</p>
            {clauses.length === 0 ? (
              <p className="py-6 text-sm text-zinc-400">No clauses in this contract.</p>
            ) : (
              clauses.map((clause, i) => <ClauseBlock key={i} clause={clause} index={i} />)
            )}
          </div>

          {/* Signature record */}
          <div className="rounded-xl border border-zinc-200 bg-white px-6 py-6">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Signature Record</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Client</p>
                <div className="border-t border-zinc-300 pt-3">
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "#111827" }}>{finalName || clientName}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {signedTime
                      ? new Date(signedTime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                      : ""}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Service Provider</p>
                <div className="border-t border-zinc-300 pt-3">
                  {providerSignatureName ? (
                    <>
                      <p style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "#111827" }}>{providerSignatureName}</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {providerSignedAt
                          ? new Date(providerSignedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                          : ""}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-zinc-400 italic">Awaiting provider signature</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-xs text-zinc-400 border-t border-zinc-100 pt-4">
              <Shield className="h-3.5 w-3.5" />
              Electronically signed via SoloPad — timestamp and IP address on record
            </div>
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
