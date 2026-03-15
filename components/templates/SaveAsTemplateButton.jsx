"use client";

import { useState } from "react";
import { BookmarkPlus, Check } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Button from "@/components/ui/Button";

export default function SaveAsTemplateButton({ type, document, className = "" }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const CATEGORIES = {
    proposal: ["Design", "Development", "Marketing", "Consulting", "Photography", "Writing"],
    contract: ["Design", "Development", "Consulting", "Photography", "General"],
    invoice: ["General"],
  };

  function openModal() {
    setName(document.title || "");
    setCategory("");
    setError("");
    setSaved(false);
    setOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Template name is required."); return; }

    setSaving(true);
    setError("");

    // Build content based on type
    let content;
    if (type === "proposal") {
      content = {
        title: document.title,
        intro: document.intro || "",
        sections: document.sections || [],
        pricing: document.pricing || [],
        currency: document.currency || "USD",
      };
    } else if (type === "contract") {
      content = {
        title: document.title,
        clauses: document.clauses || [],
      };
    } else {
      content = {
        lineItems: document.lineItems || [],
        currency: document.currency || "USD",
        notes: document.notes || "",
      };
    }

    try {
      const res = await fetch("/api/content-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name: name.trim(), category: category || null, content }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save template."); return; }
      setSaved(true);
      setTimeout(() => setOpen(false), 1000);
    } catch {
      setError("Failed to save template.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-transparent hover:text-zinc-900 ${className}`}
      >
        <BookmarkPlus className="h-3.5 w-3.5" />
        Save as template
      </button>

      <Modal
        open={open}
        onClose={() => { if (!saving) setOpen(false); }}
        title="Save as template"
        description={`Save this ${type} as a reusable template in your gallery.`}
        className="max-w-sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm text-zinc-700">Template name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-zinc-700">Category (optional)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-full rounded border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 bg-white"
            >
              <option value="">— No category —</option>
              {(CATEGORIES[type] || []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Template saved!
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              Save template
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
