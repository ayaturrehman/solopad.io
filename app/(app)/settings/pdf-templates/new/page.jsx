"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, FileCheck2, ClipboardList } from "lucide-react";
import { selectClassName } from "@/components/ui/Input";

const TYPE_OPTIONS = [
  { value: "invoice", label: "Invoice", icon: FileText, desc: "For billing clients for your work" },
  { value: "proposal", label: "Proposal", icon: ClipboardList, desc: "For presenting project scopes and pricing" },
  { value: "contract", label: "Contract", icon: FileCheck2, desc: "For service agreements and terms" },
];

function NewTemplateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "invoice";

  const [type, setType] = useState(initialType);
  const [name, setName] = useState("");
  const [copyFrom, setCopyFrom] = useState("");
  const [existingTemplates, setExistingTemplates] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/pdf-templates?type=${type}`)
      .then((r) => r.json())
      .then((d) => setExistingTemplates(d.templates || []));
  }, [type]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/pdf-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: name.trim(),
          copyFrom: copyFrom || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create template");
      }
      const { template } = await res.json();
      router.push(`/settings/pdf-templates/${template.id}/edit`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <Link
        href="/settings/pdf-templates"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-8"
      >
        <ArrowLeft size={14} />
        Back to Templates
      </Link>

      <h1 className="text-2xl font-semibold text-zinc-900 mb-1">New Template</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Create a new PDF template to customise how your documents look.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Template name */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Template Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Modern Blue Invoice"
            required
            className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* Document type */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Document Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setType(opt.value); setCopyFrom(""); }}
                  className={`border rounded-lg p-3 text-left transition-colors ${
                    type === opt.value
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 hover:border-zinc-400 text-zinc-700"
                  }`}
                >
                  <Icon size={18} className="mb-1.5" />
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className={`text-xs mt-0.5 ${type === opt.value ? "text-zinc-300" : "text-zinc-400"}`}>
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Copy from existing */}
        {existingTemplates.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Start From (optional)
            </label>
            <select
              value={copyFrom}
              onChange={(e) => setCopyFrom(e.target.value)}
              className={selectClassName}
            >
              <option value="">Start from scratch</option>
              {existingTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}{t.isDefault ? " (Default)" : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-400 mt-1">
              Copy all settings from an existing template as a starting point.
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="bg-zinc-900 text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Creating..." : "Create & Customise"}
          </button>
          <Link
            href="/settings/pdf-templates"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NewTemplatePage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading...</div>}>
      <NewTemplateForm />
    </Suspense>
  );
}
