"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, ChevronDown, FileText, User, Calendar,
  DollarSign, Percent, Tag, AlignLeft, Bell, Sparkles, CreditCard, Zap
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { inputClassName, selectClassName, textareaClassName } from "@/components/ui/Input";

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

export default function InvoiceEditClient({ invoice, projects, services }) {
  const router = useRouter();

  const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoiceNumber);
  const [projectId, setProjectId] = useState(invoice.projectId);
  const [currency, setCurrency] = useState(invoice.currency);
  const [dueDate, setDueDate] = useState(invoice.dueDate);
  const [notes, setNotes] = useState(invoice.notes);
  const [remindersEnabled, setRemindersEnabled] = useState(invoice.remindersEnabled);
  const [taxRate, setTaxRate] = useState(invoice.taxRate);
  const [discountType, setDiscountType] = useState(invoice.discountType || "none");
  const [discountValue, setDiscountValue] = useState(invoice.discountValue || "");
  const [lineItems, setLineItems] = useState(
    invoice.lineItems.length > 0
      ? invoice.lineItems
      : [{ serviceId: null, description: "", quantity: 1, rate: "", amount: 0 }]
  );

  const hasExistingPlan = invoice.paymentPlans && invoice.paymentPlans.length > 0;
  const [paymentType, setPaymentType] = useState(hasExistingPlan ? "installments" : "lump_sum");
  const [milestones, setMilestones] = useState(
    hasExistingPlan
      ? invoice.paymentPlans.map((p) => ({
          label: p.label || "",
          amount: String(p.amount),
          dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split("T")[0] : "",
        }))
      : [emptyMilestone()]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    setLineItems((prev) => [...prev, { serviceId: null, description: "", quantity: 1, rate: "", amount: 0 }]);
  }

  function removeLine(i) {
    setLineItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function applyService(svc) {
    setLineItems((prev) => [
      ...prev,
      { serviceId: svc.id, description: svc.name, quantity: 1, rate: svc.defaultRate, amount: svc.defaultRate },
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

  function updateMilestone(i, key, value) {
    setMilestones((prev) => prev.map((m, idx) => idx === i ? { ...m, [key]: value } : m));
  }
  function addMilestone() { setMilestones((prev) => [...prev, emptyMilestone()]); }
  function removeMilestone(i) { setMilestones((prev) => prev.filter((_, idx) => idx !== i)); }

  function splitEqually(n) {
    const per = n > 0 ? parseFloat((total / n).toFixed(2)) : 0;
    setMilestones(Array.from({ length: n }, (_, i) => ({
      label: `Installment ${i + 1}`,
      amount: i === n - 1
        ? parseFloat((total - per * (n - 1)).toFixed(2)).toString()
        : per.toString(),
      dueDate: "",
    })));
  }

  const milestonesTotal = milestones.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0);
  const milestoneDiff = parseFloat((total - milestonesTotal).toFixed(2));

  async function handleSave(status) {
    if (!projectId) return setError("Please select a project.");
    if (lineItems.every((l) => !l.description.trim())) return setError("Add at least one line item.");

    if (paymentType === "installments") {
      if (milestones.some((m) => !m.label.trim() || !m.amount)) {
        return setError("All milestones need a label and amount.");
      }
      if (Math.abs(milestoneDiff) > 0.01) {
        return setError(`Milestone amounts must equal the invoice total (${formatCurrency(total, currency)}).`);
      }
    }

    setSaving(true);
    setError("");
    try {
      const body = {
        projectId,
        invoiceNumber: invoiceNumber.trim() || null,
        lineItems: lineItems.map((l) => ({
          serviceId: l.serviceId || null,
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
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      let data;
      try { data = await res.json(); } catch { throw new Error(`Server error (${res.status})`); }
      if (!res.ok) throw new Error(data?.error || "Failed to save invoice.");
      router.push(`/invoices/${invoice.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <div className="px-4 py-4 md:px-6">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/invoices/${invoice.id}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to invoice
        </Link>
        <div className="flex items-center gap-2">
          {error && <span className="text-sm text-red-500">{error}</span>}
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="rounded border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            onClick={() => handleSave("sent")}
            disabled={saving}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save & send"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left ── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Header */}
          <div className="rounded border border-zinc-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-zinc-900">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Edit Invoice</h1>
                <p className="text-sm text-zinc-500">Update the details below</p>
              </div>
            </div>
          </div>

          {/* Project & invoice number */}
          <div className="rounded border border-zinc-200 bg-white p-6">
            <SectionLabel icon={User}>Client & Project</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700">Project *</label>
                <div className="relative">
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className={selectClassName}
                  >
                    <option value="">— Select a project —</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}{p.contact?.name ? ` — ${p.contact.name}` : ""}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-zinc-400" />
                </div>
                {selectedProject && (
                  <p className="mt-1.5 text-xs text-zinc-400">
                    Client: <span className="text-zinc-600">{selectedProject.contact?.name || "—"}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700">Invoice number</label>
                <input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-2026-001"
                  className={inputClassName}
                />
              </div>
            </div>
          </div>

          {/* Dates & currency */}
          <div className="rounded border border-zinc-200 bg-white p-6">
            <SectionLabel icon={Calendar}>Dates & Currency</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              {paymentType === "lump_sum" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-700">Due date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={inputClassName}
                  />
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700">Currency</label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={selectClassName}
                  >
                    {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-zinc-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="rounded border border-zinc-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <SectionLabel icon={Tag}>Line Items</SectionLabel>
              {services.length > 0 && (
                <div className="relative group">
                  <button className="inline-flex items-center gap-1.5 rounded border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:border-zinc-400">
                    <Sparkles className="h-3.5 w-3.5" /> Add from services
                  </button>
                  <div className="absolute right-0 top-8 z-20 hidden w-56 rounded border border-zinc-200 bg-white p-1.5 shadow-lg group-hover:block">
                    {services.map((svc) => (
                      <button key={svc.id} onClick={() => applyService(svc)}
                        className="flex w-full items-center justify-between rounded px-3 py-1.5 text-left hover:bg-zinc-50">
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
                  <input value={line.description} onChange={(e) => updateLine(i, "description", e.target.value)}
                    placeholder="Service or product description"
                    className={cn(inputClassName, "col-span-5")} />
                  <input type="number" min="0" step="0.01" value={line.quantity} onChange={(e) => updateLine(i, "quantity", e.target.value)}
                    className={cn(inputClassName, "col-span-2 text-right")} />
                  <input type="number" min="0" step="0.01" value={line.rate} onChange={(e) => updateLine(i, "rate", e.target.value)}
                    placeholder="0.00"
                    className={cn(inputClassName, "col-span-2 text-right")} />
                  <div className="col-span-2 text-right text-sm font-medium text-zinc-700">
                    {formatCurrency(parseFloat(line.amount) || 0, currency)}
                  </div>
                  <button type="button" onClick={() => removeLine(i)} disabled={lineItems.length === 1}
                    className="col-span-1 flex items-center justify-center text-zinc-300 hover:text-red-400 disabled:opacity-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addLine} className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
              <Plus className="h-4 w-4" /> Add line item
            </button>
          </div>

          {/* Payment Schedule */}
          <div className="rounded border border-zinc-200 bg-white p-6">
            <SectionLabel icon={CreditCard}>Payment Schedule</SectionLabel>
            <div className="mb-5 flex gap-2">
              <button onClick={() => setPaymentType("lump_sum")}
                className={`flex-1 rounded border py-2.5 text-sm font-medium transition-colors ${paymentType === "lump_sum" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500 hover:border-zinc-400"}`}>
                Lump sum
              </button>
              <button onClick={() => setPaymentType("installments")}
                className={`flex-1 rounded border py-2.5 text-sm font-medium transition-colors ${paymentType === "installments" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500 hover:border-zinc-400"}`}>
                Installments / Milestones
              </button>
            </div>

            {paymentType === "lump_sum" && (
              <div className="rounded bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                Full payment of <span className="font-semibold text-zinc-900">{formatCurrency(total, currency)}</span> due on{" "}
                {dueDate ? (
                  <span className="font-semibold text-zinc-900">
                    {new Date(dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                ) : <span className="italic text-zinc-400">no due date set</span>}.
              </div>
            )}

            {paymentType === "installments" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-zinc-400">Quick split:</span>
                  {[2, 3, 4].map((n) => (
                    <button key={n} onClick={() => splitEqually(n)}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50">
                      <Zap className="h-2.5 w-2.5" /> {n} equal
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  <div className="col-span-5">Milestone</div>
                  <div className="col-span-3 text-right">Amount</div>
                  <div className="col-span-3">Due Date</div>
                  <div className="col-span-1" />
                </div>

                <div className="space-y-2">
                  {milestones.map((m, i) => (
                    <div key={i} className="grid grid-cols-12 items-center gap-2">
                      <input value={m.label} onChange={(e) => updateMilestone(i, "label", e.target.value)}
                        placeholder={i === 0 ? "e.g. Deposit" : i === milestones.length - 1 ? "e.g. Final payment" : `Milestone ${i + 1}`}
                        className={cn(inputClassName, "col-span-5")} />
                      <div className="relative col-span-3">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-zinc-400">{currency}</span>
                        <input type="number" min="0" step="0.01" value={m.amount}
                          onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                          placeholder="0.00"
                          className={cn(inputClassName, "pl-10 pr-3 text-right")} />
                      </div>
                      <input type="date" value={m.dueDate} onChange={(e) => updateMilestone(i, "dueDate", e.target.value)}
                        className={cn(inputClassName, "col-span-3")} />
                      <button type="button" onClick={() => removeMilestone(i)} disabled={milestones.length === 1}
                        className="col-span-1 flex items-center justify-center text-zinc-300 hover:text-red-400 disabled:opacity-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={addMilestone} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
                  <Plus className="h-4 w-4" /> Add milestone
                </button>

                <div className={`rounded px-4 py-3 text-sm ${Math.abs(milestoneDiff) < 0.01 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  <span className="font-semibold">{formatCurrency(milestonesTotal, currency)}</span> planned · invoice total{" "}
                  <span className="font-semibold">{formatCurrency(total, currency)}</span>
                  {Math.abs(milestoneDiff) >= 0.01 ? (
                    <span className="ml-2 font-medium">— {milestoneDiff > 0 ? `${formatCurrency(milestoneDiff, currency)} unallocated` : `${formatCurrency(-milestoneDiff, currency)} over`}</span>
                  ) : (
                    <span className="ml-2 font-semibold">✓ Balanced</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="rounded border border-zinc-200 bg-white p-6">
            <SectionLabel icon={AlignLeft}>Notes & Terms</SectionLabel>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
              placeholder="Payment terms, bank details, or any notes for the client…"
              className={textareaClassName} />
          </div>
        </div>

        {/* ── Right: summary ── */}
        <div className="space-y-5">
          <div className="rounded border border-zinc-200 bg-white p-5">
            <SectionLabel icon={DollarSign}>Summary</SectionLabel>
            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700">Tax rate (%)</label>
                <div className="relative">
                  <input type="number" min="0" max="100" step="0.01" value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className={cn(inputClassName, "pr-8")} placeholder="0" />
                  <Percent className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-zinc-300" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700">Discount</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select value={discountType} onChange={(e) => { setDiscountType(e.target.value); setDiscountValue(""); }}
                      className={selectClassName}>
                      <option value="none">None</option>
                      <option value="percent">%</option>
                      <option value="fixed">Fixed $</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-3 h-4 w-4 text-zinc-400" />
                  </div>
                  {discountType !== "none" && (
                    <input type="number" min="0" step="0.01" value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)} placeholder="0"
                      className={inputClassName} />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded bg-zinc-50 p-4 text-sm">
              <div className="flex justify-between text-zinc-500"><span>Subtotal</span><span>{formatCurrency(subtotal, currency)}</span></div>
              {taxAmt > 0 && <div className="flex justify-between text-zinc-500"><span>Tax ({taxRate}%)</span><span>+{formatCurrency(taxAmt, currency)}</span></div>}
              {discAmt > 0 && <div className="flex justify-between text-zinc-500"><span>Discount</span><span className="text-red-500">-{formatCurrency(discAmt, currency)}</span></div>}
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-900">
                <span>Total</span><span>{formatCurrency(total, currency)}</span>
              </div>
            </div>
          </div>

          <div className="rounded border border-zinc-200 bg-white p-5">
            <SectionLabel icon={Bell}>Settings</SectionLabel>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={remindersEnabled} onChange={(e) => setRemindersEnabled(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-zinc-900" />
              <div>
                <span className="text-sm font-medium text-zinc-900">Auto payment reminders</span>
                <p className="mt-0.5 text-xs text-zinc-400">Remind client before and after due date.</p>
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <button onClick={() => handleSave("sent")} disabled={saving}
              className="w-full rounded bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50">
              {saving ? "Saving…" : "Save & send"}
            </button>
            <button onClick={() => handleSave("draft")} disabled={saving}
              className="w-full rounded border border-zinc-200 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50">
              Save as draft
            </button>
            {error && <p className="text-center text-xs text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
