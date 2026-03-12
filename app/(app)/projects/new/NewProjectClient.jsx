"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, ChevronDown, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function NewProjectClient({ contacts }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Contact picker state
  const [contactMode, setContactMode] = useState("select"); // "select" | "manual"
  const [selectedContactId, setSelectedContactId] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [form, setForm] = useState({
    title: "",
    clientName: "",
    clientEmail: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "in_progress",
    stage: "kickoff",
  });

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectContact(contact) {
    setSelectedContactId(contact.id);
    setContactSearch(contact.name);
    set("clientName", contact.name);
    set("clientEmail", contact.email || "");
    setShowDropdown(false);
  }

  function clearContact() {
    setSelectedContactId("");
    setContactSearch("");
    set("clientName", "");
    set("clientEmail", "");
  }

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(contactSearch.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(contactSearch.toLowerCase())
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      ...(selectedContactId ? { contactId: selectedContactId } : {}),
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    router.push(`/projects/${data.id}`);
  }

  return (
    <div className="max-w-xl">
      <Link
        href="/projects"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-zinc-900">New project</h1>
      <p className="mb-8 text-sm text-zinc-500">
        Create a project and get a shareable client portal link instantly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4 rounded border border-zinc-200 bg-white p-6">
          <Input
            label="Project name"
            placeholder="Website redesign"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />

          {/* Client / Contact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700">Client</label>
              <button
                type="button"
                onClick={() => {
                  setContactMode(contactMode === "select" ? "manual" : "select");
                  clearContact();
                }}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
              >
                <UserPlus className="h-3 w-3" />
                {contactMode === "select" ? "Enter manually" : "Select from contacts"}
              </button>
            </div>

            {contactMode === "select" ? (
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={contacts.length === 0 ? "No contacts yet — enter manually" : "Search contacts…"}
                    value={contactSearch}
                    disabled={contacts.length === 0}
                    onFocus={() => setShowDropdown(true)}
                    onChange={(e) => {
                      setContactSearch(e.target.value);
                      setSelectedContactId("");
                      set("clientName", e.target.value);
                      setShowDropdown(true);
                    }}
                    className="h-10 w-full rounded border border-zinc-200 bg-white px-3 pr-8 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-400"
                  />
                  {contactSearch ? (
                    <button type="button" onClick={clearContact} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  )}
                </div>

                {showDropdown && filteredContacts.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <div className="absolute z-20 mt-1 w-full overflow-hidden rounded border border-zinc-200 bg-white shadow-lg">
                      {filteredContacts.slice(0, 8).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => selectContact(c)}
                          className="flex w-full items-center gap-3 px-3 py-1.5.5 text-left hover:bg-zinc-50"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                            {c.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{c.name}</p>
                            {(c.email || c.company) && (
                              <p className="text-xs text-zinc-400">{c.company || c.email}</p>
                            )}
                          </div>
                        </button>
                      ))}
                      <div className="border-t border-zinc-100 px-3 py-1.5">
                        <Link href="/contacts/new" className="text-xs text-zinc-500 hover:text-zinc-900">
                          + Add new contact
                        </Link>
                      </div>
                    </div>
                  </>
                )}

                {selectedContactId && form.clientEmail && (
                  <p className="mt-1 text-xs text-zinc-400">{form.clientEmail}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Client name"
                  value={form.clientName}
                  onChange={(e) => set("clientName", e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="client@email.com (optional)"
                  value={form.clientEmail}
                  onChange={(e) => set("clientEmail", e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">Description (optional)</label>
            <textarea
              className="min-h-[72px] resize-none rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="What's this project about?"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start date"
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
            <Input
              label="Deadline (end date)"
              type="date"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700">Stage</label>
              <select
                className="h-10 rounded border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                value={form.stage}
                onChange={(e) => set("stage", e.target.value)}
              >
                <option value="new">New</option>
                <option value="discovery">Discovery</option>
                <option value="proposal">Proposal</option>
                <option value="contract_signed">Contract Signed</option>
                <option value="kickoff">Kickoff</option>
                <option value="onboarding">Onboarding</option>
                <option value="planning">Planning</option>
                <option value="delivery">Delivery</option>
                <option value="complete">Complete</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded bg-red-50 px-3 py-1.5 text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Create project
          </Button>
          <Link href="/projects">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
