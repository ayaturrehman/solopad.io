"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, ChevronDown, FileText, User, Calendar,
  DollarSign, Percent, Tag, AlignLeft, Bell, Sparkles, CreditCard, Zap
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const CURRENCIES = ["USD", "GBP", "EUR", "AUD", "CAD", "SGD", "INR"];

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-zinc-400" />
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{children}</span>
    </div>
  );
}

function emptyMilestone() {
  return { label: "", amount: "", dueDate: "" };
}

export default function InvoiceBuilderClient({ projects, services }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projectId, setProjectId] = useState(searchParams.get("projectId") || "");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState(0);
  const [discountType, setDiscountType] = useState("none");
  const [discountValue, setDiscountValue] = useState("");
  const [lineItems, setLineItems] = useState([{ description: "", quantity: 1, rate: "", amount: 0 }]);

  // Payment plan state
  const [paymentType, setPaymentType] = useState("lump_sum"); // "lump_sum" | "installments"
  const [milestones, setMilestones] = useState([emptyMilestone()]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("invoiceTemplate");
      if (!raw) return;

      const template = JSON.parse(raw);
      sessionStorage.removeItem("invoiceTemplate");

      if (Array.isArray(template.lineItems) && template.lineItems.length) {
        setLineItems(
          template.lineItems.map((item) => ({
            description: item.description || "",
            quantity: item.quantity ?? 1,
            rate: item.rate ?? "",
            amount: item.amount ?? (parseFloat(item.quantity || 1) * parseFloat(item.rate || 0)),
          }))
        );
      }

      if (template.notes) setNotes(template.notes);
      if (template.currency) setCurrency(template.currency);
      if (template.taxRate !== undefined) setTaxRate(template.taxRate);
    } catch {
      sessionStorage.removeItem("invoiceTemplate");
    }
  }, []);

  function updateLine(i, key, value) {
    setLineItems((prev) =>
      prev.map((l, idx) => {
        if (idx !== i) return l;
        const updated = { ...l, [key]: value };
        const qty = parseFloat(updated.quantity) || 0;
        const rate = parseFloat(updated.rate) || 0;
        updated.amount = qty * rate;
        return updated;
      })
    );
  }

  function addLine() {
    setLineItems((prev) => [...prev, { description: "", quantity: 1, rate: "", amount: 0 }]);
  }

  function removeLine(i) {
    setLineItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function applyService(svc) {
    setLineItems((prev) => [
      ...prev,
      { description: svc.name, quantity: 1, rate: svc.defaultRate, amount: svc.defaultRate },
    ]);
  }

  const subtotal = lineItems.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
  const taxAmt = subtotal * (parseFloat(taxRate || 0) / 100);
  const discAmt =
    discountType === "percent"
      ? subtotal * (parseFloat(discountValue || 0) / 100)
      : discountType === "fixed"
      ? Math.min(parseFloat(discountValue || 0), subtotal)
      : 0;
  const total = Math.max(0, subtotal + taxAmt - discAmt);

  // Milestone helpers
  function updateMilestone(i, key, value) {
    setMilestones((prev) => prev.map((m, idx) => idx === i ? { ...m, [key]: value } : m));
  }

  function addMilestone() {
    setMilestones((prev) => [...prev, emptyMilestone()]);
  }

  function removeMilestone(i) {
    setMilestones((prev) => prev.filter((_, idx) => idx !== i));
  }

  function splitEqually(n) {
    const perInstallment = n > 0 ? parseFloat((total / n).toFixed(2)) : 0;
    const newMilestones = Array.from({ length: n }, (_, i) => ({
      label: `Installment ${i + 1}`,
      amount: i === n - 1
        ? parseFloat((total - perInstallment * (n - 1)).toFixed(2)).toString()
        : perInstallment.toString(),
      dueDate: "",
    }));
    setMilestones(newMilestones);
  }

  const milestonesTotal = milestones.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0);
  const milestoneDiff = parseFloat((total - milestonesTotal).toFixed(2));

  async function handleSubmit(status = "draft") {
    if (!projectId) return setError("Please select a project.");
    if (lineItems.every((l) => !l.description.trim())) return setError("Add at least one line item.");

    if (paymentType === "installments") {
      if (milestones.some((m) => !m.label.trim() || !m.amount)) {
        return setError("All milestones need a label and amount.");
      }
      if (Math.abs(milestoneDiff) > 0.01) {
        return setError(`Milestone amounts must equal the invoice total (${formatCurrency(total, currency)}). Difference: ${formatCurrency(Math.abs(milestoneDiff), currency)}`);
      }
    }

    setSaving(true);
    setError("");
    try {
      const body = {
        projectId,
        invoiceNumber: invoiceNumber.trim() || null,
        lineItems: lineItems.map((l) => ({
          description: l.description,
          quantity: parseFloat(l.quantity) || 1,
          rate: parseFloat(l.rate) || 0,
          amount: parseFloat(l.amount) || 0,
        })),
        currency,
        dueDate: paymentType === "lump_sum" ? (dueDate || null) : null,
        notes: notes.trim() || null,
        remindersEnabled,
        taxRate: parseFloat(taxRate || 0),
        discountType,
        discountValue: parseFloat(discountValue || 0),
        status,
        paymentType,
        paymentPlan: paymentType === "installments"
          ? milestones.map((m) => ({
              label: m.label.trim(),
              amount: parseFloat(m.amount),
              dueDate: m.dueDate || null,
            }))
          : [],
      };
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server error (${res.status}). Please try again.`);
      }
      if (!res.ok) throw new Error(data?.error || "Failed to create invoice.");
      router.push(`/invoices/${data.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/finance?tab=invoices" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" /> All invoices
        </Link>
        <div className="flex items-center gap-2">
          {error && <span className="text-sm text-red-500">{error}</span>}
          <button
            onClick={() => handleSubmit("draft")}
            disabled={saving}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            onClick={() => handleSubmit("sent")}
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create & send"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left: builder ── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Header card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-900">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-zinc-900">New Invoice</h1>
                <p className="text-sm text-zinc-500">Fill in the details below to generate a professional invoice</p>
              </div>
            </div>
          </div>

          {/* Project & invoice number */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <SectionLabel icon={User}>Client & Project</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700">Project *</label>
                <div className="relative">
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                  >
                    <option value="">— Select a project —</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title} — {p.clientName}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-zinc-400" />
                </div>
                {selectedProject && (
                  <p className="mt-1.5 text-xs text-zinc-400">
                    Client: <span className="text-zinc-600">{selectedProject.clientName}</span>
                    {selectedProject.clientEmail && ` · ${selectedProject.clientEmail}`}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700">Invoice number</label>
                <input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-2026-001"
                  className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <SectionLabel icon={Calendar}>Dates & Currency</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700">Issue date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-900"
                />
              </div>
              {paymentType === "lump_sum" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-700">Due date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700">Currency</label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 text-sm outline-none focus:border-zinc-900"
                  >
                    {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-zinc-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <SectionLabel icon={Tag}>Line Items</SectionLabel>
              {services.length > 0 && (
                <div className="relative group">
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700">
                    <Sparkles className="h-3.5 w-3.5" /> Add from services
                  </button>
                  <div className="absolute right-0 top-8 z-20 hidden w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg group-hover:block">
                    {services.map((svc) => (
                      <button
                        key={svc.id}
                        onClick={() => applyService(svc)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-zinc-50"
                      >
                        <span className="text-sm text-zinc-800">{svc.name}</span>
                        <span className="text-xs text-zinc-400">{formatCurrency(svc.defaultRate)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-2 grid grid-cols-12 gap-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1" />
            </div>

            <div className="space-y-2">
              {lineItems.map((line, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2">
                  <input
                    value={line.description}
                    onChange={(e) => updateLine(i, "description", e.target.value)}
                    placeholder="Service or product description"
                    className="col-span-5 h-10 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-900"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.quantity}
                    onChange={(e) => updateLine(i, "quantity", e.target.value)}
                    className="col-span-2 h-10 rounded-lg border border-zinc-200 px-3 text-right text-sm outline-none focus:border-zinc-900"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.rate}
                    onChange={(e) => updateLine(i, "rate", e.target.value)}
                    placeholder="0.00"
                    className="col-span-2 h-10 rounded-lg border border-zinc-200 px-3 text-right text-sm outline-none focus:border-zinc-900"
                  />
                  <div className="col-span-2 text-right text-sm font-medium text-zinc-700">
                    {formatCurrency(parseFloat(line.amount) || 0, currency)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    disabled={lineItems.length === 1}
                    className="col-span-1 flex items-center justify-center text-zinc-300 hover:text-red-400 disabled:opacity-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addLine}
              className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
            >
              <Plus className="h-4 w-4" /> Add line item
            </button>
          </div>

          {/* ── Payment Schedule ── */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <SectionLabel icon={CreditCard}>Payment Schedule</SectionLabel>

            {/* Lump sum vs Installments toggle */}
            <div className="mb-5 flex gap-2">
              <button
                onClick={() => setPaymentType("lump_sum")}
                className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                  paymentType === "lump_sum"
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                }`}
              >
                Lump sum
              </button>
              <button
                onClick={() => setPaymentType("installments")}
                className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                  paymentType === "installments"
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                }`}
              >
                Installments / Milestones
              </button>
            </div>

            {paymentType === "lump_sum" && (
              <div className="rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                Full payment of{" "}
                <span className="font-semibold text-zinc-900">{formatCurrency(total, currency)}</span>{" "}
                due on{" "}
                {dueDate ? (
                  <span className="font-semibold text-zinc-900">
                    {new Date(dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                ) : (
                  <span className="italic text-zinc-400">no due date set</span>
                )}
                . Set the due date in Dates above.
              </div>
            )}

            {paymentType === "installments" && (
              <div className="space-y-4">
                {/* Quick split */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-zinc-400">Quick split:</span>
                  {[2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => splitEqually(n)}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50"
                    >
                      <Zap className="h-2.5 w-2.5" />
                      {n} equal
                    </button>
                  ))}
                  <span className="text-xs text-zinc-300">or build custom milestones below</span>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  <div className="col-span-5">Milestone / Label</div>
                  <div className="col-span-3 text-right">Amount</div>
                  <div className="col-span-3">Due Date</div>
                  <div className="col-span-1" />
                </div>

                {/* Rows */}
                <div className="space-y-2">
                  {milestones.map((m, i) => (
                    <div key={i} className="grid grid-cols-12 items-center gap-2">
                      <input
                        value={m.label}
                        onChange={(e) => updateMilestone(i, "label", e.target.value)}
                        placeholder={i === 0 ? "e.g. Deposit (50%)" : i === milestones.length - 1 ? "e.g. Final payment" : `Milestone ${i + 1}`}
                        className="col-span-5 h-10 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-900"
                      />
                      <div className="relative col-span-3">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-zinc-400">{currency}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={m.amount}
                          onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                          placeholder="0.00"
                          className="h-10 w-full rounded-lg border border-zinc-200 pl-10 pr-3 text-right text-sm outline-none focus:border-zinc-900"
                        />
                      </div>
                      <input
                        type="date"
                        value={m.dueDate}
                        onChange={(e) => updateMilestone(i, "dueDate", e.target.value)}
                        className="col-span-3 h-10 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={() => removeMilestone(i)}
                        disabled={milestones.length === 1}
                        className="col-span-1 flex items-center justify-center text-zinc-300 hover:text-red-400 disabled:opacity-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addMilestone}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
                >
                  <Plus className="h-4 w-4" /> Add milestone
                </button>

                {/* Running balance indicator */}
                <div className={`rounded-lg px-4 py-3 text-sm ${Math.abs(milestoneDiff) < 0.01 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  <span className="font-semibold">{formatCurrency(milestonesTotal, currency)}</span> planned
                  {" · "}invoice total <span className="font-semibold">{formatCurrency(total, currency)}</span>
                  {Math.abs(milestoneDiff) >= 0.01 ? (
                    <span className="ml-2 font-medium">
                      — {milestoneDiff > 0
                        ? `${formatCurrency(milestoneDiff, currency)} still unallocated`
                        : `${formatCurrency(-milestoneDiff, currency)} over total`}
                    </span>
                  ) : (
                    <span className="ml-2 font-semibold">✓ Balanced</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <SectionLabel icon={AlignLeft}>Notes & Terms</SectionLabel>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Payment terms, bank details, thank-you note, or any additional information for the client…"
              className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
            />
          </div>
        </div>

        {/* ── Right: summary ── */}
        <div className="space-y-5">
          {/* Totals */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <SectionLabel icon={DollarSign}>Summary</SectionLabel>

            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700">Tax rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-200 pl-3 pr-8 text-sm outline-none focus:border-zinc-900"
                    placeholder="0"
                  />
                  <Percent className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-zinc-300" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700">Discount</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={discountType}
                      onChange={(e) => { setDiscountType(e.target.value); setDiscountValue(""); }}
                      className="h-10 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-7 text-sm outline-none focus:border-zinc-900"
                    >
                      <option value="none">None</option>
                      <option value="percent">%</option>
                      <option value="fixed">Fixed $</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-3 h-4 w-4 text-zinc-400" />
                  </div>
                  {discountType !== "none" && (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder="0"
                      className="h-10 flex-1 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-900"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 rounded-lg bg-zinc-50 p-4 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              {taxAmt > 0 && (
                <div className="flex justify-between text-zinc-500">
                  <span>Tax ({taxRate}%)</span>
                  <span>+{formatCurrency(taxAmt, currency)}</span>
                </div>
              )}
              {discAmt > 0 && (
                <div className="flex justify-between text-zinc-500">
                  <span>Discount ({discountType === "percent" ? `${discountValue}%` : `Fixed`})</span>
                  <span className="text-red-500">-{formatCurrency(discAmt, currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-900">
                <span>Total</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
            </div>

            {/* Mini milestone list on sidebar */}
            {paymentType === "installments" && milestones.some((m) => m.label || m.amount) && (
              <div className="mt-4 space-y-1.5 border-t border-zinc-100 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Payment milestones</p>
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-600">{m.label || `Milestone ${i + 1}`}</span>
                    <span className="font-medium text-zinc-900">
                      {m.amount ? formatCurrency(parseFloat(m.amount), currency) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <SectionLabel icon={Bell}>Settings</SectionLabel>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={remindersEnabled}
                onChange={(e) => setRemindersEnabled(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-zinc-900"
              />
              <div>
                <span className="text-sm font-medium text-zinc-900">Auto payment reminders</span>
                <p className="mt-0.5 text-xs text-zinc-400">Automatically remind the client before and after the due date.</p>
              </div>
            </label>
          </div>

          {/* CTA */}
          <div className="space-y-2">
            <button
              onClick={() => handleSubmit("sent")}
              disabled={saving}
              className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {saving ? "Creating…" : "Create & send invoice"}
            </button>
            <button
              onClick={() => handleSubmit("draft")}
              disabled={saving}
              className="w-full rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
            >
              Save as draft
            </button>
            {error && <p className="text-center text-xs text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
