"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X, Users } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CONFIG = {
  new:       { label: "New",       color: "bg-zinc-100 text-zinc-600" },
  contacted: { label: "Contacted", color: "bg-blue-50 text-blue-700" },
  qualified: { label: "Qualified", color: "bg-violet-50 text-violet-700" },
  proposal:  { label: "Proposal",  color: "bg-amber-50 text-amber-700" },
  won:       { label: "Won",       color: "bg-green-50 text-green-700" },
  lost:      { label: "Lost",      color: "bg-red-50 text-red-700" },
};

const STATUSES = Object.keys(STATUS_CONFIG);
const SOURCES = ["referral", "website", "linkedin", "cold-outreach", "event", "social", "other"];

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default function LeadsClient({ leads: initial }) {
  const router = useRouter();
  const [leads, setLeads] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", source: "", status: "new", value: "", notes: "" });

  function field(key) {
    return { value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) };
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.lead) {
      setLeads((l) => [data.lead, ...l]);
      setShowForm(false);
      setForm({ name: "", email: "", company: "", phone: "", source: "", status: "new", value: "", notes: "" });
    }
    setSaving(false);
  }

  async function updateStatus(id, status) {
    setLeads((l) => l.map((lead) => lead.id === id ? { ...lead, status } : lead));
    await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  }

  async function deleteLead(id) {
    if (!confirm("Delete this lead?")) return;
    setLeads((l) => l.filter((lead) => lead.id !== id));
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
  }

  const inputCls = "w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Leads</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Track prospects through your pipeline</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          <Plus className="h-4 w-4" /> Add lead
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded border border-dashed border-zinc-200 bg-white py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-zinc-300" />
          <p className="font-medium text-zinc-500">No leads yet</p>
          <p className="mt-1 text-sm text-zinc-400">Add your first prospect to start tracking</p>
          <button onClick={() => setShowForm(true)} className="mt-4 inline-flex items-center gap-1.5 rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700">
            <Plus className="h-4 w-4" /> Add lead
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-zinc-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-zinc-100 bg-zinc-50">
              <tr>
                {["Name", "Company", "Source", "Value", "Status", "Added", ""].map((h) => (
                  <th key={h} className={cn("px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400", h === "Value" ? "text-right" : "text-left")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {leads.map((lead) => {
                const sc = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.new;
                return (
                  <tr key={lead.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-zinc-900">{lead.name}</p>
                      {lead.email && <p className="text-xs text-zinc-400 mt-0.5">{lead.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600">{lead.company || <span className="text-zinc-300">—</span>}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500 capitalize">{lead.source || <span className="text-zinc-300">—</span>}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-zinc-900">
                      {lead.value ? formatCurrency(lead.value) : <span className="text-zinc-300 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={cn("rounded px-2 py-1 text-xs font-semibold border-0 outline-none cursor-pointer", sc.color)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteLead(lead.id)} className="text-zinc-300 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-900">Add lead</p>
          <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-zinc-400" /></button>
        </div>
        <form onSubmit={handleCreate} className="space-y-3 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Name *</label>
              <input {...field("name")} required placeholder="Jane Smith" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Company</label>
              <input {...field("company")} placeholder="Acme Inc." className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Email</label>
              <input {...field("email")} type="email" placeholder="jane@acme.com" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Phone</label>
              <input {...field("phone")} placeholder="+1 555 000 0000" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Source</label>
              <select {...field("source")} className={inputCls}>
                <option value="">Select source</option>
                {SOURCES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Est. value</label>
              <input {...field("value")} type="number" min="0" step="0.01" placeholder="0.00" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Notes</label>
            <textarea {...field("notes")} rows={3} placeholder="Any context about this lead..." className={inputCls} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded border border-zinc-200 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50">
              {saving ? "Saving…" : "Add lead"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
