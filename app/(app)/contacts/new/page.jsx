"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function NewContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "lead",
    notes: "",
  });

  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    router.push(`/contacts/${data.id}`);
  }

  return (
    <div className="max-w-xl">
      <Link href="/contacts" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" />
        Back to contacts
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-zinc-900">New contact</h1>
      <p className="mb-8 text-sm text-zinc-500">Add a client or lead to your contact list.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4 rounded border border-zinc-200 bg-white p-6">
          <Input
            label="Full name"
            placeholder="Jane Smith"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
          <Input
            label="Company (optional)"
            placeholder="Acme Corp"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email (optional)"
              type="email"
              placeholder="jane@acme.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+1 555 000 0000"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">Status</label>
            <select
              className="h-10 rounded border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="lead">Lead</option>
              <option value="active">Active client</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">Notes (optional)</label>
            <textarea
              className="min-h-[80px] resize-none rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="Any notes about this contact..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="rounded bg-red-50 px-3 py-1.5 text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>Save contact</Button>
          <Link href="/contacts">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
