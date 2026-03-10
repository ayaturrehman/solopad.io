"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export default function ContactEditForm({ contact }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: contact.name,
    company: contact.company || "",
    email: contact.email || "",
    phone: contact.phone || "",
    status: contact.status,
    notes: contact.notes || "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave() {
    if (!form.name.trim()) return setError("Name is required.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this contact? This will unlink them from all projects.")) return;
    const res = await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
    if (res.ok) router.push("/contacts");
  }

  if (!open) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setOpen(true)}
          className="flex-1 rounded-lg border border-zinc-200 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Edit contact
        </button>
        <button
          onClick={handleDelete}
          className="rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h3 className="mb-4 font-semibold text-zinc-900">Edit contact</h3>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700">Name *</label>
          <input value={form.name} onChange={set("name")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700">Company</label>
          <input value={form.company} onChange={set("company")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700">Email</label>
          <input type="email" value={form.email} onChange={set("email")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700">Phone</label>
          <input type="tel" value={form.phone} onChange={set("phone")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700">Status</label>
          <select value={form.status} onChange={set("status")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400">
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700">Notes</label>
          <textarea value={form.notes} onChange={set("notes")} rows={3} className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button onClick={handleSave} disabled={loading} className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
            {loading ? "Saving…" : "Save changes"}
          </button>
          <button onClick={() => setOpen(false)} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
