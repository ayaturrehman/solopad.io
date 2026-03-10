"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

const CATEGORIES = ["software", "travel", "equipment", "contractor", "marketing", "other"];

export default function AddExpenseForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "software",
    date: new Date().toISOString().split("T")[0],
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) return setError("Description and amount are required.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add expense.");
      setOpen(false);
      setForm({ description: "", amount: "", category: "software", date: new Date().toISOString().split("T")[0] });
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700">
        <Plus className="h-3.5 w-3.5" />
        Add expense
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm mt-2">
      <h3 className="font-semibold text-zinc-900 text-sm">New Expense</h3>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700">Description *</label>
        <input value={form.description} onChange={set("description")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" placeholder="e.g. Adobe CC subscription" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700">Amount (USD) *</label>
          <input type="number" min="0" step="0.01" value={form.amount} onChange={set("amount")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" placeholder="0.00" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700">Date</label>
          <input type="date" value={form.date} onChange={set("date")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700">Category</label>
        <select value={form.category} onChange={set("category")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm capitalize outline-none focus:border-zinc-400">
          {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
          {loading ? "Saving…" : "Save expense"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
