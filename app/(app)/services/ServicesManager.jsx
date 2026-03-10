"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

const UNIT_LABELS = { flat: "Flat fee", hour: "Per hour", day: "Per day", word: "Per word" };

function ServiceForm({ initial = {}, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    description: initial.description || "",
    defaultRate: initial.defaultRate ?? "",
    unit: initial.unit || "flat",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-700">Service name *</label>
          <input value={form.name} onChange={set("name")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" placeholder="e.g. Logo design" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-700">Description</label>
          <input value={form.description} onChange={set("description")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" placeholder="Brief description shown on invoices" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700">Default rate (USD)</label>
          <input type="number" min="0" step="0.01" value={form.defaultRate} onChange={set("defaultRate")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" placeholder="0.00" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700">Unit</label>
          <select value={form.unit} onChange={set("unit")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400">
            {Object.entries(UNIT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onSave(form)}
          disabled={loading || !form.name.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" /> {loading ? "Saving…" : "Save"}
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function ServicesManager({ initialServices }) {
  const [services, setServices] = useState(initialServices);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleAdd(form) {
    setSaving(true);
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, defaultRate: form.defaultRate ? parseFloat(form.defaultRate) : undefined }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setServices((s) => [data, ...s]);
      setShowAdd(false);
    }
  }

  async function handleEdit(id, form) {
    setSaving(true);
    const res = await fetch(`/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, defaultRate: form.defaultRate ? parseFloat(form.defaultRate) : undefined }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setServices((s) => s.map((svc) => (svc.id === id ? data : svc)));
      setEditId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) setServices((s) => s.filter((svc) => svc.id !== id));
  }

  return (
    <div className="space-y-4">
      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          <Plus className="h-4 w-4" />
          New service
        </button>
      )}

      {showAdd && (
        <ServiceForm onSave={handleAdd} onCancel={() => setShowAdd(false)} loading={saving} />
      )}

      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-zinc-400">No services yet.</p>
          <p className="mt-1 text-xs text-zinc-400">Add your first reusable service item above.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) =>
            editId === svc.id ? (
              <div key={svc.id} className="sm:col-span-2 lg:col-span-3">
                <ServiceForm
                  key={svc.id}
                  initial={svc}
                  onSave={(form) => handleEdit(svc.id, form)}
                  onCancel={() => setEditId(null)}
                  loading={saving}
                />
              </div>
            ) : (
              <div key={svc.id} className="rounded-xl border border-zinc-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900">{svc.name}</p>
                    {svc.description && <p className="mt-0.5 text-sm text-zinc-500">{svc.description}</p>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => setEditId(svc.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(svc.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {svc.defaultRate != null && (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                      {formatCurrency(svc.defaultRate)}
                    </span>
                  )}
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-500">
                    {UNIT_LABELS[svc.unit]}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
