"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  FileCheck2,
  ClipboardList,
  Plus,
  Star,
  Pencil,
  Trash2,
  Settings2,
} from "lucide-react";

const MODULES = [
  { key: "invoice", label: "Invoices", icon: FileText },
  { key: "proposal", label: "Proposals", icon: ClipboardList },
  { key: "contract", label: "Contracts", icon: FileCheck2 },
];

function DocumentThumbnail({ template }) {
  const accent = template.accentColor || "#18181b";
  const headerStyle = template.headerStyle || "classic";

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      {headerStyle === "bold" ? (
        <div
          className="px-3 py-2 flex justify-between items-end"
          style={{ backgroundColor: accent }}
        >
          <div>
            <div className="w-12 h-1.5 rounded bg-white opacity-80 mb-1" />
            <div className="w-8 h-1 rounded bg-white opacity-50" />
          </div>
          <div className="w-10 h-2 rounded bg-white opacity-80" />
        </div>
      ) : headerStyle === "minimal" ? (
        <div className="px-3 pt-3 pb-2 flex flex-col items-center">
          <div className="w-14 h-1.5 rounded bg-zinc-700 mb-1.5" />
          <div className="w-full h-px" style={{ backgroundColor: accent }} />
        </div>
      ) : (
        <div
          className="px-3 py-2 flex justify-between items-center border-b-2"
          style={{ borderColor: accent }}
        >
          <div>
            <div className="w-14 h-1.5 rounded bg-zinc-700 mb-1" />
            <div className="w-10 h-1 rounded bg-zinc-300 mb-0.5" />
          </div>
          <div className="w-8 h-3 rounded" style={{ backgroundColor: accent, opacity: 0.85 }} />
        </div>
      )}

      {/* Body */}
      <div className="flex-1 px-3 py-2 flex flex-col gap-1.5">
        {/* Bill to row */}
        <div className="flex justify-between mb-1">
          <div className="flex flex-col gap-0.5">
            <div className="w-6 h-0.5 rounded bg-zinc-300" />
            <div className="w-12 h-1 rounded bg-zinc-600" />
            <div className="w-10 h-0.5 rounded bg-zinc-300" />
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            <div className="w-6 h-0.5 rounded bg-zinc-300" />
            <div className="w-14 h-0.5 rounded bg-zinc-200" />
            <div className="w-10 h-0.5 rounded bg-zinc-200" />
          </div>
        </div>

        {/* Table header */}
        <div
          className="w-full h-2.5 rounded-sm flex items-center px-1 gap-1"
          style={{ backgroundColor: template.tableHeaderBg || accent }}
        >
          <div className="flex-1 h-0.5 rounded bg-white opacity-60" />
          <div className="w-4 h-0.5 rounded bg-white opacity-60" />
          <div className="w-5 h-0.5 rounded bg-white opacity-60" />
        </div>

        {/* Table rows */}
        {[0, 1, 2].map((i) => (
          <div key={i} className={`w-full flex gap-1 py-0.5 ${i % 2 === 1 ? "bg-zinc-50" : ""}`}>
            <div className="flex-1 h-0.5 rounded bg-zinc-200" />
            <div className="w-4 h-0.5 rounded bg-zinc-200" />
            <div className="w-5 h-0.5 rounded bg-zinc-300" />
          </div>
        ))}

        {/* Totals */}
        <div className="self-end flex flex-col gap-0.5 mt-1">
          <div className="flex gap-4">
            <div className="w-8 h-0.5 rounded bg-zinc-200" />
            <div className="w-6 h-0.5 rounded bg-zinc-200" />
          </div>
          <div className="flex gap-4 border-t border-zinc-200 pt-0.5">
            <div className="w-8 h-1 rounded bg-zinc-600" />
            <div className="w-6 h-1 rounded" style={{ backgroundColor: accent }} />
          </div>
        </div>
      </div>

      {/* Footer line */}
      <div className="mx-3 border-t border-zinc-100 py-1 flex justify-between">
        <div className="w-16 h-0.5 rounded bg-zinc-200" />
        <div className="w-6 h-0.5 rounded bg-zinc-200" />
      </div>
    </div>
  );
}

function TemplateCard({ template, onSetDefault, onDelete, type }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSetDefault(e) {
    e.stopPropagation();
    setLoading(true);
    await fetch(`/api/pdf-templates/${template.id}/set-default`, { method: "POST" });
    onSetDefault();
    setLoading(false);
  }

  async function handleDelete(e) {
    e.stopPropagation();
    if (!confirm(`Delete template "${template.name}"?`)) return;
    setLoading(true);
    await fetch(`/api/pdf-templates/${template.id}`, { method: "DELETE" });
    onDelete();
    setLoading(false);
  }

  return (
    <div className="group relative border border-zinc-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-white">
      {/* Thumbnail */}
      <div
        className="h-52 bg-zinc-50 overflow-hidden"
        onClick={() => router.push(`/settings/pdf-templates/${template.id}/edit`)}
      >
        <DocumentThumbnail template={template} />
      </div>

      {/* Card footer */}
      <div className="p-3 border-t border-zinc-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-zinc-900 truncate">{template.name}</span>
            {template.isDefault && (
              <span className="shrink-0 bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded">
                DEFAULT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover action overlay */}
      <div className="absolute inset-0 bg-zinc-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
        <Link
          href={`/settings/pdf-templates/${template.id}/edit`}
          className="flex items-center gap-1.5 bg-white text-zinc-900 text-sm font-medium px-4 py-2 rounded-md hover:bg-zinc-100 transition-colors w-40 justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil size={14} />
          Edit
        </Link>
        {!template.isDefault && (
          <button
            onClick={handleSetDefault}
            disabled={loading}
            className="flex items-center gap-1.5 bg-amber-400 text-amber-900 text-sm font-medium px-4 py-2 rounded-md hover:bg-amber-300 transition-colors w-40 justify-center"
          >
            <Star size={14} />
            Set as Default
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-1.5 bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-40 justify-center"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
}

export default function PdfTemplatesClient({ grouped: initialGrouped }) {
  const router = useRouter();
  const [activeType, setActiveType] = useState("invoice");
  const [grouped, setGrouped] = useState(initialGrouped);

  async function refresh() {
    const res = await fetch("/api/pdf-templates");
    const data = await res.json();
    const templates = data.templates || [];
    setGrouped({
      invoice: templates.filter((t) => t.type === "invoice"),
      proposal: templates.filter((t) => t.type === "proposal"),
      contract: templates.filter((t) => t.type === "contract"),
    });
  }

  const templates = grouped[activeType] || [];
  const activeModule = MODULES.find((m) => m.key === activeType);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left sidebar */}
      <div className="w-52 shrink-0 bg-white border-r border-zinc-200 flex flex-col py-6 px-3 gap-1">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-3">
          Document Types
        </p>
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = mod.key === activeType;
          return (
            <button
              key={mod.key}
              onClick={() => setActiveType(mod.key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-full text-left ${
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <Icon size={16} />
              {mod.label}
            </button>
          );
        })}
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-y-auto bg-zinc-50">
        {/* Top bar */}
        <div className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">
              {activeModule?.label} Templates
            </h1>
            <p className="text-sm text-zinc-500">
              {templates.length} template{templates.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {templates.length > 0 && (
              <Link
                href={`/settings/pdf-templates/${templates.find((t) => t.isDefault)?.id || templates[0].id}/edit`}
                className="flex items-center gap-1.5 border border-zinc-300 text-zinc-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-zinc-50 transition-colors"
              >
                <Settings2 size={14} />
                Customise Layout
              </Link>
            )}
            <Link
              href={`/settings/pdf-templates/new?type=${activeType}`}
              className="flex items-center gap-1.5 bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-zinc-800 transition-colors"
            >
              <Plus size={14} />
              New Template
            </Link>
          </div>
        </div>

        {/* Template grid */}
        <div className="p-8">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                {activeModule && <activeModule.icon size={28} className="text-zinc-400" />}
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mb-1">
                No {activeModule?.label.toLowerCase()} templates yet
              </h3>
              <p className="text-sm text-zinc-500 mb-6">
                Create your first template to customise how your PDFs look.
              </p>
              <Link
                href={`/settings/pdf-templates/new?type=${activeType}`}
                className="flex items-center gap-1.5 bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-zinc-800 transition-colors"
              >
                <Plus size={14} />
                Create Template
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  type={activeType}
                  onSetDefault={refresh}
                  onDelete={refresh}
                />
              ))}
              <Link
                href={`/settings/pdf-templates/new?type=${activeType}`}
                className="border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center gap-2 text-zinc-400 hover:border-zinc-400 hover:text-zinc-500 transition-colors h-52 cursor-pointer"
              >
                <Plus size={20} />
                <span className="text-xs font-medium">Add Template</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
