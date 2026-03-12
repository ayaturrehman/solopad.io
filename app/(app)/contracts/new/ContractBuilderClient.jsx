"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_CLAUSES = [
  { heading: "Scope of Work", body: "" },
  { heading: "Payment Terms", body: "" },
  { heading: "Termination", body: "" },
];

function Label({ children }) {
  return <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">{children}</label>;
}

function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200",
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
        "w-full rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 resize-none",
        className
      )}
      {...props}
    />
  );
}

export default function ContractBuilderClient({ projects }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [clauses, setClauses] = useState(DEFAULT_CLAUSES);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("contractTemplate");
      if (!raw) return;

      const template = JSON.parse(raw);
      sessionStorage.removeItem("contractTemplate");

      if (template.title) setTitle(template.title);
      if (Array.isArray(template.clauses) && template.clauses.length) setClauses(template.clauses);
    } catch {
      sessionStorage.removeItem("contractTemplate");
    }
  }, []);

  function handleProjectChange(id) {
    setProjectId(id);
    if (!id) return;

    const project = projects.find((item) => item.id === id);
    if (project) {
      setClientName(project.clientName || "");
      setClientEmail(project.clientEmail || "");
      if (!title.trim()) {
        setTitle(`${project.title} Contract`);
      }
    }
  }

  function addClause() {
    setClauses((prev) => [...prev, { heading: "", body: "" }]);
  }

  function removeClause(index) {
    setClauses((prev) => prev.filter((_, idx) => idx !== index));
  }

  function updateClause(index, field, value) {
    setClauses((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  }

  const clauseCount = useMemo(
    () => clauses.filter((clause) => clause.heading.trim() || clause.body.trim()).length,
    [clauses]
  );

  async function handleSave(status) {
    if (!title.trim()) {
      setError("Contract title is required");
      return;
    }
    if (!projectId) {
      setError("Select a project so the contract links to the correct job.");
      return;
    }
    if (!clientName.trim()) {
      setError("Client name is required");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          projectId,
          clientName,
          clientEmail,
          signatureName: signatureName || null,
          clauses: clauses.filter((clause) => clause.heading.trim() || clause.body.trim()),
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save contract");
        return;
      }
      router.push("/contracts");
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/contracts" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
          Contracts
        </Link>
        <span className="text-zinc-300">/</span>
        <span className="text-sm font-medium text-zinc-900">New contract</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div className="rounded border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">Contract details</h2>
            <div className="grid gap-4">
              <div>
                <Label>Contract title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Website Services Agreement" />
              </div>
              <div>
                <Label>Project *</Label>
                <select
                  value={projectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Client name *</Label>
                  <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Jane Smith" />
                </div>
                <div>
                  <Label>Client email</Label>
                  <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="jane@example.com" />
                </div>
              </div>
              <div>
                <Label>Signature name</Label>
                <Input value={signatureName} onChange={(e) => setSignatureName(e.target.value)} placeholder="Name that should appear on the signature line" />
              </div>
            </div>
          </div>

          <div className="rounded border border-zinc-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Clauses</h2>
                <p className="mt-1 text-xs text-zinc-400">Each section is saved into the contract record and reused later.</p>
              </div>
              <button
                type="button"
                onClick={addClause}
                className="inline-flex items-center gap-1.5 rounded border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add clause
              </button>
            </div>

            <div className="space-y-4">
              {clauses.map((clause, index) => (
                <div key={`${index}-${clause.heading}`} className="rounded border border-zinc-100 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Clause {index + 1}</p>
                    {clauses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeClause(index)}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <Label>Heading</Label>
                      <Input
                        value={clause.heading}
                        onChange={(e) => updateClause(index, "heading", e.target.value)}
                        placeholder="e.g. Payment Terms"
                      />
                    </div>
                    <div>
                      <Label>Body</Label>
                      <Textarea
                        rows={6}
                        value={clause.body}
                        onChange={(e) => updateClause(index, "body", e.target.value)}
                        placeholder="Write the contract clause here"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded border border-zinc-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Summary</p>
            <div className="mt-4 space-y-3 text-sm text-zinc-600">
              <div className="flex items-center justify-between gap-4">
                <span>Project link</span>
                <span className="text-zinc-900">{projectId ? "Connected" : "Required"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Clauses</span>
                <span className="text-zinc-900">{clauseCount}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Client</span>
                <span className="truncate text-zinc-900">{clientName || "Not set"}</span>
              </div>
            </div>
          </div>

          <div className="rounded border border-zinc-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</p>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="w-full rounded bg-zinc-900 px-3 py-1.5.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save draft"}
              </button>
              <button
                type="button"
                onClick={() => handleSave("sent")}
                disabled={saving}
                className="w-full rounded border border-zinc-200 px-3 py-1.5.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                Save as sent
              </button>
            </div>
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
