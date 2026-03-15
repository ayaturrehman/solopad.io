"use client";

import { useEffect, useState } from "react";
import { Boxes, Check, ChevronRight, Loader2, Search, Star, Trash2, X } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Button from "@/components/ui/Button";

const CATEGORY_COLORS = {
  Design: "bg-purple-50 text-purple-700",
  Development: "bg-blue-50 text-blue-700",
  Marketing: "bg-orange-50 text-orange-700",
  Consulting: "bg-teal-50 text-teal-700",
  Photography: "bg-pink-50 text-pink-700",
  Writing: "bg-yellow-50 text-yellow-700",
  General: "bg-zinc-100 text-zinc-600",
};

function CategoryBadge({ category }) {
  const cls = CATEGORY_COLORS[category] || CATEGORY_COLORS.General;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {category || "General"}
    </span>
  );
}

function TemplateCard({ template, onSelect, onDelete, selected }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className={`group relative w-full rounded-xl border text-left transition-all duration-150 ${
        selected
          ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
          : "border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm"
      }`}
    >
      {selected && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-white">
          <Check className="h-3 w-3 text-zinc-900" />
        </div>
      )}
      {!template.isSystem && onDelete && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(template.id); }}
          className={`absolute right-3 top-3 hidden h-6 w-6 items-center justify-center rounded-md transition-colors group-hover:flex ${
            selected ? "text-zinc-300 hover:text-white" : "text-zinc-400 hover:text-red-500 hover:bg-red-50"
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      <div className="p-4">
        <div className="mb-2 flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold leading-snug ${selected ? "text-white" : "text-zinc-900"}`}>
              {template.name}
            </div>
          </div>
        </div>
        {template.description && (
          <p className={`text-xs leading-relaxed ${selected ? "text-zinc-300" : "text-zinc-500"}`}>
            {template.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <CategoryBadge category={template.category} />
          {!template.isSystem && (
            <span className={`flex items-center gap-1 text-[11px] ${selected ? "text-zinc-400" : "text-zinc-400"}`}>
              <Star className="h-3 w-3" /> Saved
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function TemplateGallery({ open, onClose, type, onSelect }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelected(null);
    setSearch("");
    setCategoryFilter("All");
    fetch(`/api/content-templates?type=${type}`)
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates || []))
      .finally(() => setLoading(false));
  }, [open, type]);

  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category).filter(Boolean)))];

  const filtered = templates.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  async function handleDelete(id) {
    if (!window.confirm("Delete this template?")) return;
    setDeleting(id);
    await fetch(`/api/content-templates/${id}`, { method: "DELETE" });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleting(null);
  }

  function handleUse() {
    if (!selected) return;
    // Increment usage count in background
    fetch(`/api/content-templates/${selected.id}/use`, { method: "POST" }).catch(() => {});
    onSelect(selected);
    onClose();
  }

  const typeLabel = type === "proposal" ? "Proposal" : type === "contract" ? "Contract" : "Invoice";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${typeLabel} Templates`}
      description={`Choose a starting point for your ${typeLabel.toLowerCase()}. You can edit everything after selecting.`}
      className="max-w-3xl"
    >
      {/* Search + filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-zinc-400">
            <Boxes className="h-8 w-8" />
            <p className="text-sm">No templates found</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pb-1 pr-1">
            {filtered.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                selected={selected?.id === t.id}
                onSelect={setSelected}
                onDelete={deleting !== t.id ? handleDelete : null}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
        <p className="text-xs text-zinc-400">
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
          {selected ? <span className="ml-2 font-medium text-zinc-700">— {selected.name} selected</span> : null}
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!selected}
            onClick={handleUse}
            className="gap-1.5"
          >
            Use template
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
