"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_SECTIONS = [
  { heading: "Project Overview", body: "" },
  { heading: "Deliverables", body: "" },
];

const DEFAULT_PRICING = [{ description: "", amount: "" }];

const CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD"];

function Label({ children }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
      {children}
    </label>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200",
        className
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 resize-none",
        className
      )}
      {...props}
    />
  );
}

export default function ProposalBuilderClient({ projects }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [intro, setIntro] = useState("");
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [taxRate, setTaxRate] = useState(0);

  function handleProjectChange(id) {
    setProjectId(id);
    if (id) {
      const project = projects.find((p) => p.id === id);
      if (project) {
        setClientName(project.clientName || "");
        setClientEmail(project.clientEmail || "");
      }
    }
  }

  function addSection() {
    setSections((s) => [...s, { heading: "", body: "" }]);
  }

  function removeSection(i) {
    setSections((s) => s.filter((_, idx) => idx !== i));
  }

  function updateSection(i, field, value) {
    setSections((s) => s.map((sec, idx) => (idx === i ? { ...sec, [field]: value } : sec)));
  }

  function addPricingRow() {
    setPricing((p) => [...p, { description: "", amount: "" }]);
  }

  function removePricingRow(i) {
    setPricing((p) => p.filter((_, idx) => idx !== i));
  }

  function updatePricingRow(i, field, value) {
    setPricing((p) => p.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  const subtotal = pricing.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
  const taxAmount = subtotal * (parseFloat(taxRate) / 100 || 0);
  const total = subtotal + taxAmount;

  const currencySymbols = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$", AUD: "A$" };
  const symbol = currencySymbols[currency] || "$";

  async function handleSave(status) {
    if (!title.trim()) { setError("Title is required"); return; }
    if (!clientName.trim()) { setError("Client name is required"); return; }
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, projectId: projectId || null, clientName, clientEmail,
          intro, sections, pricing, total, currency, validUntil: validUntil || null, status,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
      router.push(`/proposals/${data.proposal.id}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/proposals" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
          Proposals
        </Link>
        <span className="text-zinc-300">/</span>
        <span className="text-sm font-medium text-zinc-900">New proposal</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left: Form */}
        <div className="space-y-5">
          {/* Details */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">Details</h2>
            <div className="grid gap-4">
              <div>
                <Label>Proposal title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Website Redesign Proposal"
                />
              </div>
              <div>
                <Label>Project (optional)</Label>
                <select
                  value={projectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                >
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Client name *</Label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <Label>Client email</Label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Valid until</Label>
                  <Input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Introduction */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">Introduction</h2>
            <Textarea
              rows={4}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="Thank you for considering us. We're excited to propose a solution that will help you achieve..."
            />
          </div>

          {/* Sections */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">Scope & Deliverables</h2>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add section
              </button>
            </div>
            <div className="space-y-4">
              {sections.map((section, i) => (
                <div key={i} className="rounded-xl border border-zinc-100 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <Input
                      value={section.heading}
                      onChange={(e) => updateSection(i, "heading", e.target.value)}
                      placeholder="Section heading"
                      className="flex-1"
                    />
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(i)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Textarea
                    rows={3}
                    value={section.body}
                    onChange={(e) => updateSection(i, "body", e.target.value)}
                    placeholder="Describe this section..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">Pricing</h2>
              <button
                type="button"
                onClick={addPricingRow}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add item
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {pricing.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={row.description}
                    onChange={(e) => updatePricingRow(i, "description", e.target.value)}
                    placeholder="Description"
                    className="flex-1"
                  />
                  <div className="relative w-36 shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">{symbol}</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.amount}
                      onChange={(e) => updatePricingRow(i, "amount", e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                  {pricing.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePricingRow(i)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {/* Tax + totals */}
            <div className="border-t border-zinc-100 pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <Label>Tax rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-24"
                />
              </div>
              <div className="ml-auto w-56 space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>{symbol}{subtotal.toFixed(2)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Tax ({taxRate}%)</span>
                    <span>+{symbol}{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-900">
                  <span>Total</span>
                  <span>{symbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary + actions */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-zinc-900">Summary</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Client</p>
                <p className="mt-0.5 font-medium text-zinc-900">{clientName || "—"}</p>
                {clientEmail && <p className="text-zinc-500">{clientEmail}</p>}
              </div>
              {projectId && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Project</p>
                  <p className="mt-0.5 text-zinc-700">{projects.find((p) => p.id === projectId)?.title}</p>
                </div>
              )}
              {validUntil && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Valid until</p>
                  <p className="mt-0.5 text-zinc-700">{new Date(validUntil).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
              )}
              <div className="border-t border-zinc-100 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total</p>
                <p className="mt-0.5 text-xl font-bold text-zinc-900">{symbol}{total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave("draft")}
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save as draft"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave("sent")}
              className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save & Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
