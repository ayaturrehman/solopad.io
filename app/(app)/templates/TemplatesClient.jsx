"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ReceiptText, FileText, FileSignature, ClipboardList,
  X, Trash2, BookmarkPlus, SquarePen, Eye, ArrowRight,
  CheckCircle2, Clock, DollarSign, PenLine, FileCheck,
  ChevronRight, Star, Layers, Sparkles, ChevronDown, Plus, Search,
} from "lucide-react";
import { showNavigationLoading } from "@/components/shared/NavigationLoadingOverlay";
import { cn, isInteractiveEventTarget } from "@/lib/utils";
import {
  TEMPLATE_GALLERY,
  createBuilderDocumentFromTemplate,
  createContractDraftFromTemplate,
  isBuilderDocument,
  parseTemplateContent,
} from "@/lib/template-builder";

// ─── Config ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: "all", label: "All templates", count: null },
  { id: "proposal", label: "Proposals" },
  { id: "contract", label: "Contracts" },
  { id: "questionnaire", label: "Questionnaires" },
  { id: "invoice", label: "Invoices" },
];

const TYPE_CONFIG = {
  proposal:      { label: "Proposal",      icon: FileText,     badge: "bg-violet-100 text-violet-700",  accent: "#7C3AED", light: "#F5F3FF", preview: "#7C3AED" },
  contract:      { label: "Contract",      icon: FileSignature, badge: "bg-amber-100 text-amber-700",   accent: "#D97706", light: "#FFFBEB", preview: "#D97706" },
  questionnaire: { label: "Questionnaire", icon: ClipboardList, badge: "bg-green-100 text-green-700",   accent: "#059669", light: "#ECFDF5", preview: "#059669" },
  invoice:       { label: "Invoice",       icon: ReceiptText,   badge: "bg-blue-100 text-blue-700",     accent: "#0EA5E9", light: "#F0F9FF", preview: "#0EA5E9" },
};

const THEME_COLORS = {
  graphite: { bg: "#F3F4F6", text: "#111827", accent: "#111827" },
  coral:    { bg: "#FFF3F0", text: "#C2350A", accent: "#E8533A" },
  ocean:    { bg: "#E0F2FE", text: "#0369A1", accent: "#0EA5E9" },
  violet:   { bg: "#EDE9FE", text: "#5B21B6", accent: "#7C3AED" },
  amber:    { bg: "#FEF3C7", text: "#92400E", accent: "#D97706" },
  forest:   { bg: "#D1FAE5", text: "#065F46", accent: "#059669" },
};

function filterByTab(list, activeTab) {
  if (activeTab === "all") return list;
  return list.filter((t) => t.type === activeTab);
}

// ─── Mini Document Thumbnail ──────────────────────────────────────────────────

function DocThumbnail({ template }) {
  const cfg = TYPE_CONFIG[template.type] || TYPE_CONFIG.proposal;
  const theme = THEME_COLORS[template.theme] || THEME_COLORS.graphite;
  const Icon = cfg.icon;

  return (
    <div className="relative flex h-44 w-full flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white">
      {/* Mini cover bar */}
      <div className="flex shrink-0 flex-col justify-end px-4 pt-3 pb-2.5" style={{ background: theme.bg, minHeight: 56 }}>
        <div className="h-2 w-28 rounded-full opacity-70" style={{ background: theme.accent }} />
        <div className="mt-1.5 h-1.5 w-20 rounded-full opacity-30" style={{ background: theme.text }} />
      </div>

      {/* Content lines */}
      <div className="flex-1 px-4 py-3 space-y-2">
        <div className="h-2 w-full rounded-full bg-zinc-100" />
        <div className="h-2 w-5/6 rounded-full bg-zinc-100" />
        <div className="h-2 w-4/6 rounded-full bg-zinc-100" />

        {template.type === "invoice" && (
          <div className="mt-3 rounded border border-zinc-100 p-2 space-y-1">
            {[70, 55, 80].map((w, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="h-1.5 rounded-full bg-zinc-100" style={{ width: `${w}%` }} />
                <div className="h-1.5 w-10 shrink-0 rounded-full bg-zinc-100" />
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-zinc-100 pt-1">
              <div className="h-2 w-10 rounded-full" style={{ background: theme.accent + "22" }} />
              <div className="h-2 w-14 shrink-0 rounded-full" style={{ background: theme.accent + "44" }} />
            </div>
          </div>
        )}

        {template.type === "proposal" && (
          <div className="mt-2 grid grid-cols-3 gap-1">
            {[false, true, false].map((highlight, i) => (
              <div key={i} className={cn("rounded p-1.5 text-center", highlight ? "border" : "border border-zinc-100")} style={{ borderColor: highlight ? theme.accent : undefined, background: highlight ? theme.bg : undefined }}>
                <div className="mx-auto mb-1 h-2 w-8 rounded-full" style={{ background: highlight ? theme.accent + "88" : "#E5E7EB" }} />
                <div className="h-1.5 w-full rounded-full bg-zinc-100" />
              </div>
            ))}
          </div>
        )}

        {template.type === "contract" && (
          <div className="mt-2 space-y-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-1.5">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ background: theme.accent + "66" }} />
                <div className="h-1.5 flex-1 rounded-full bg-zinc-100" />
              </div>
            ))}
          </div>
        )}

        {template.type === "questionnaire" && (
          <div className="mt-2 space-y-2">
            {["60%", "80%", "45%"].map((w, i) => (
              <div key={i} className="space-y-0.5">
                <div className="h-1.5 rounded-full bg-zinc-100" style={{ width: w }} />
                <div className="h-3 w-full rounded border border-zinc-100 bg-zinc-50" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Type chip */}
      <div className="absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest" style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.accent}33` }}>
        {cfg.label}
      </div>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({ template, isSaved, onPreview, onDelete, onSave, onCustomize, onOpen }) {
  const cfg = TYPE_CONFIG[template.type] || TYPE_CONFIG.proposal;
  const theme = THEME_COLORS[template.theme] || THEME_COLORS.graphite;
  const includes = template.includes || [];
  const pages = template.pages || 1;

  return (
    <div
      onDoubleClick={(event) => {
        if (isInteractiveEventTarget(event.target)) return;
        onOpen(template);
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded border border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative p-4 pb-3 bg-zinc-50 border-b border-zinc-100">
        <DocThumbnail template={template} />
        {/* Hover overlay */}
        <button
          onClick={() => onPreview(template)}
          className="absolute inset-4 bottom-3 flex items-center justify-center rounded-xl bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100"
        >
          <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-md">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </span>
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className={cn("mb-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", cfg.badge)}>
              {cfg.label}
            </span>
            <h3 className="text-sm font-semibold text-zinc-900 leading-snug">{template.name}</h3>
          </div>
          <div className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-zinc-400">
            <Layers className="h-3 w-3" />
            {pages}p
          </div>
        </div>

        {/* What's included chips */}
        {includes.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {includes.map((item) => (
              <span key={item} className="inline-flex items-center gap-1 rounded-full border border-zinc-100 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                <CheckCircle2 className="h-2.5 w-2.5 text-zinc-400" />
                {item}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => onPreview(template)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded border border-zinc-200 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
            <button
              onClick={() => onCustomize(template)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded border border-zinc-200 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
            >
              <SquarePen className="h-3.5 w-3.5" />
              Customise
            </button>
          </div>
          {!isSaved ? (
            <button
              onClick={() => onSave(template)}
              className="w-full flex items-center justify-center gap-1.5 rounded border border-dashed border-zinc-200 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-50"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              Save to my templates
            </button>
          ) : (
            <button
              onClick={() => onDelete(template.id)}
              className="w-full flex items-center justify-center gap-1.5 rounded border border-dashed border-red-100 py-2 text-xs font-medium text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Preview Modal Block Renderers ─────────────────────────────────────────────

function PreviewBlock({ block, accentColor }) {
  const { type, data } = block;

  if (type === "cover") {
    return (
      <div className="rounded-xl overflow-hidden mb-2" style={{ background: data.background || "#111827", color: data.textColor || "#fff", padding: "32px 28px" }}>
        {data.logoText && <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">{data.logoText}</p>}
        <h1 className="text-2xl font-bold leading-tight mb-2">{data.title}</h1>
        <p className="text-sm opacity-70">{data.subtitle}</p>
        {data.showDate && <p className="mt-4 text-xs opacity-50">Prepared on {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>}
      </div>
    );
  }

  if (type === "richText") {
    return (
      <div
        className="prose prose-sm max-w-none text-zinc-700 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-zinc-900 [&_h2]:mt-5 [&_h2]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-zinc-600 [&_ul]:text-sm [&_ul]:text-zinc-600 [&_li]:mb-1"
        dangerouslySetInnerHTML={{ __html: data.html || "" }}
      />
    );
  }

  if (type === "callout") {
    return (
      <div className="rounded-xl border-l-4 p-4 my-2" style={{ background: data.background, borderColor: data.borderColor }}>
        <div className="flex items-start gap-3">
          {data.icon && <span className="text-xl leading-none">{data.icon}</span>}
          <div>
            <p className="text-sm font-semibold text-zinc-900 mb-1">{data.title}</p>
            <p className="text-xs leading-relaxed text-zinc-600">{data.text}</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === "columns") {
    return (
      <div className="grid grid-cols-2 gap-4 my-2">
        {(data.columns || []).map((col) => (
          <div key={col.id} className="rounded border border-zinc-100 bg-zinc-50 p-4">
            <p className="text-xs font-semibold text-zinc-700 mb-2">{col.title}</p>
            <p className="text-xs leading-relaxed text-zinc-500">{col.content}</p>
          </div>
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="my-3 overflow-hidden rounded-xl border border-zinc-200">
        {data.caption && <p className="px-4 pt-3 text-xs font-semibold text-zinc-500">{data.caption}</p>}
        <table className="w-full text-xs">
          <thead className="border-b border-zinc-100 bg-zinc-50">
            <tr>
              {(data.headers || []).map((h, i) => (
                <th key={i} className="px-3 py-1.5.5 text-left font-semibold uppercase tracking-wider text-zinc-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {(data.rows || []).map((row, ri) => (
              <tr key={ri} className="bg-white">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5.5 text-zinc-700">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "pricing") {
    return (
      <div className="my-4">
        {data.title && <h3 className="text-sm font-bold text-zinc-900 mb-1">{data.title}</h3>}
        {data.subtitle && <p className="text-xs text-zinc-500 mb-4">{data.subtitle}</p>}
        <div className="grid grid-cols-3 gap-3">
          {(data.packages || []).map((pkg) => (
            <div key={pkg.id} className={cn("rounded-xl border p-4 text-xs", pkg.highlighted ? "border-2 shadow-sm" : "border-zinc-200 bg-zinc-50")} style={pkg.highlighted ? { borderColor: accentColor, background: accentColor + "08" } : {}}>
              {pkg.highlighted && (
                <div className="mb-2 flex items-center gap-1">
                  <Star className="h-3 w-3" style={{ color: accentColor }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>Best</span>
                </div>
              )}
              <p className="font-bold text-zinc-900">{pkg.name}</p>
              <p className="mt-1 text-lg font-bold" style={{ color: accentColor }}>{pkg.price}</p>
              {pkg.period && <p className="text-zinc-400 text-[10px]">{pkg.period}</p>}
              <p className="mt-2 text-zinc-500 leading-relaxed">{pkg.description}</p>
              <ul className="mt-3 space-y-1.5">
                {(pkg.features || []).slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-zinc-600">
                    <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: accentColor }} />
                    {f}
                  </li>
                ))}
                {(pkg.features || []).length > 4 && (
                  <li className="text-zinc-400">+{pkg.features.length - 4} more</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "lineItems") {
    const items = data.items || [];
    const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
    const tax = subtotal * ((data.taxRate || 0) / 100);
    const discount = data.discount || 0;
    const total = subtotal - discount + tax;
    const sym = { USD: "$", GBP: "£", EUR: "€" }[data.currency] || "$";

    return (
      <div className="my-3 overflow-hidden rounded-xl border border-zinc-200">
        {data.title && <p className="border-b border-zinc-100 px-3 py-1.5.5 text-xs font-semibold text-zinc-700">{data.title}</p>}
        <table className="w-full text-xs">
          <thead className="border-b border-zinc-100 bg-zinc-50">
            <tr>
              <th className="px-3 py-1.5 text-left font-semibold text-zinc-400">Description</th>
              <th className="px-3 py-1.5 text-center font-semibold text-zinc-400">Qty</th>
              <th className="px-3 py-1.5 text-right font-semibold text-zinc-400">Rate</th>
              <th className="px-3 py-1.5 text-right font-semibold text-zinc-400">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 bg-white">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-1.5.5 text-zinc-700">{item.description}</td>
                <td className="px-3 py-1.5.5 text-center text-zinc-500">{item.qty}</td>
                <td className="px-3 py-1.5.5 text-right text-zinc-500">{sym}{item.rate?.toLocaleString()}</td>
                <td className="px-3 py-1.5.5 text-right font-medium text-zinc-900">{sym}{item.total?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-zinc-200 bg-zinc-50">
            {data.taxRate > 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-1.5 text-right text-zinc-500">Subtotal</td>
                <td className="px-3 py-1.5 text-right text-zinc-700">{sym}{subtotal.toLocaleString()}</td>
              </tr>
            )}
            {data.taxRate > 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-1 text-right text-zinc-500">Tax ({data.taxRate}%)</td>
                <td className="px-4 py-1 text-right text-zinc-500">+{sym}{tax.toFixed(2)}</td>
              </tr>
            )}
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-zinc-900">Total</td>
              <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: accentColor }}>{sym}{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        {data.notes && <p className="border-t border-zinc-100 px-4 py-3 text-[11px] text-zinc-400">{data.notes}</p>}
      </div>
    );
  }

  if (type === "timeline") {
    return (
      <div className="my-3">
        {data.title && <h3 className="mb-4 text-sm font-bold text-zinc-900">{data.title}</h3>}
        <div className="relative space-y-4 pl-6 before:absolute before:left-1.5 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-zinc-200">
          {(data.milestones || []).map((ms, i) => (
            <div key={ms.id} className="relative">
              <div className="absolute -left-[19px] top-1 h-3 w-3 rounded-full border-2 border-white shadow-sm" style={{ background: accentColor }} />
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>{ms.phase}</span>
                    <span className="text-[10px] text-zinc-400">{ms.date}</span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-900 mt-0.5">{ms.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{ms.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "signature") {
    return (
      <div className="my-3 rounded-xl border border-zinc-200 p-5">
        {data.title && <p className="text-sm font-semibold text-zinc-900 mb-2">{data.title}</p>}
        {data.agreementText && <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{data.agreementText}</p>}
        <div className="grid grid-cols-2 gap-3">
          {(data.fields || []).map((field) => (
            <div key={field.id} className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{field.label}</label>
              <div className={cn("rounded border border-zinc-200 bg-zinc-50", field.type === "signature" ? "h-12 flex items-center justify-center" : "h-8")}>
                {field.type === "signature" && <PenLine className="h-4 w-4 text-zinc-300" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className="my-3 rounded-xl border border-zinc-200 p-5">
        {data.title && <p className="text-sm font-semibold text-zinc-900 mb-1">{data.title}</p>}
        {data.description && <p className="text-xs text-zinc-500 mb-4">{data.description}</p>}
        <div className="grid grid-cols-2 gap-3">
          {(data.fields || []).slice(0, 8).map((field) => (
            <div key={field.id} className={cn("space-y-1", field.width === "full" ? "col-span-2" : "")}>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                {field.label}
                {field.required && <span className="ml-0.5 text-red-400">*</span>}
              </label>
              {field.type === "textarea" ? (
                <div className="h-12 rounded border border-zinc-200 bg-zinc-50" />
              ) : field.type === "radio" || field.type === "checkbox" ? (
                <div className="flex flex-wrap gap-1.5">
                  {(field.options || []).slice(0, 3).map((opt, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] text-zinc-500">
                      <span className="h-2 w-2 rounded-full border border-zinc-300" />
                      {opt}
                    </span>
                  ))}
                </div>
              ) : field.type === "rating" ? (
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((i) => <Star key={i} className="h-4 w-4 text-zinc-200" />)}
                </div>
              ) : (
                <div className="h-7 rounded border border-zinc-200 bg-zinc-50" />
              )}
            </div>
          ))}
          {(data.fields || []).length > 8 && (
            <p className="col-span-2 text-[10px] text-zinc-400 text-center pt-1">+{(data.fields || []).length - 8} more fields</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Preview Modal ─────────────────────────────────────────────────────────────

function PreviewModal({ template, onClose, onUse, onCustomize }) {
  if (!template) return null;

  const cfg = TYPE_CONFIG[template.type] || TYPE_CONFIG.proposal;
  const theme = THEME_COLORS[template.theme] || THEME_COLORS.graphite;
  const doc = createBuilderDocumentFromTemplate(template);
  const pages = doc?.pages || [];
  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-zinc-100 px-6 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: theme.bg, border: `1px solid ${theme.accent}33` }}>
            <Icon className="h-5 w-5" style={{ color: theme.accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", cfg.badge)}>{cfg.label}</span>
              {template.pages && (
                <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <Layers className="h-3 w-3" />
                  {template.pages} {template.pages === 1 ? "page" : "pages"}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-zinc-900">{template.name}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{template.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onCustomize(template)}
              className="flex items-center gap-1.5 rounded border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <SquarePen className="h-3.5 w-3.5" />
              Customise
            </button>
            <button
              onClick={() => onUse(template)}
              className="flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-semibold text-white"
              style={{ background: theme.accent }}
            >
              Use template
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button onClick={onClose} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {pages.length > 0 ? (
              <div className="mx-auto max-w-2xl">
                {(template.includes || []).length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {(template.includes || []).map((item) => (
                      <span key={item} className="inline-flex items-center gap-1 rounded-full border border-zinc-100 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-500">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {item}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-8">
                  {pages.map((page, index) => (
                    <div key={page.id} className="overflow-hidden rounded border border-zinc-100 bg-white shadow-sm">
                      {pages.length > 1 && (
                        <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Page {index + 1}</p>
                          <p className="mt-1 text-sm font-medium text-zinc-900">{page.title}</p>
                        </div>
                      )}
                      <div className="space-y-2 py-2">
                        {page.blocks.map((block) => (
                          <PreviewBlock key={block.id} block={block} accentColor={theme.accent} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-zinc-400">No preview available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TemplatesClient({ savedTemplates }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [myTemplates, setMyTemplates] = useState(savedTemplates);
  const [banner, setBanner] = useState({ msg: "", type: "success" });
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  function showBanner(msg, type = "success") {
    setBanner({ msg, type });
    setTimeout(() => setBanner({ msg: "", type: "success" }), 3500);
  }

  function createProposalDraft(template) {
    const content = parseTemplateContent(template.content);
    if (content && typeof content === "object" && !Array.isArray(content) && !isBuilderDocument(content)) {
      return {
        title: template.name,
        intro: content.intro || template.description || "",
        sections: Array.isArray(content.sections) && content.sections.length
          ? content.sections
          : [{ heading: "Project Overview", body: "" }],
        pricing: Array.isArray(content.pricing) && content.pricing.length
          ? content.pricing
          : [{ description: "", amount: "" }],
        currency: content.currency || "USD",
      };
    }
    return null;
  }

  function handleUse(template) {
    if (template.type === "invoice") {
      const content = typeof template.content === "string" ? template.content : JSON.stringify(template.content);
      try { sessionStorage.setItem("invoiceTemplate", content); } catch {}
      router.push("/invoices/new");
      return;
    }
    if (template.type === "proposal") {
      const draft = createProposalDraft(template);
      if (draft) {
        try { sessionStorage.setItem("proposalTemplate", JSON.stringify(draft)); } catch {}
        router.push("/proposals/new");
        return;
      }
    }
    if (template.type === "contract") {
      const draft = createContractDraftFromTemplate(template);
      if (draft) {
        try { sessionStorage.setItem("contractTemplate", JSON.stringify(draft)); } catch {}
        router.push("/contracts/new");
        return;
      }
    }
    handleCustomize(template);
  }

  function handleCustomize(template) {
    setPreviewTemplate(null);
    if (template.id.startsWith("sys-")) {
      router.push(`/templates/builder?preset=${template.id}`);
      return;
    }
    if (template.id.startsWith("gallery-")) {
      router.push(`/templates/builder?type=${template.type}`);
      return;
    }
    router.push(`/templates/builder?templateId=${template.id}`);
  }

  function handleOpen(template) {
    showNavigationLoading();
    router.push(`/templates/${template.id}`);
  }

  async function handleSaveTemplate(template) {
    const payload = {
      type: template.type,
      name: template.name,
      description: template.description,
      content: typeof template.content === "string" ? template.content : JSON.stringify(template.content),
    };
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) { showBanner(data.error || "Could not save template.", "error"); return; }
    setMyTemplates((prev) => [data.template, ...prev]);
    showBanner(`"${template.name}" saved to My Templates.`);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this saved template?")) return;
    const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMyTemplates((prev) => prev.filter((t) => t.id !== id));
      showBanner("Template removed.", "error");
    }
  }

  const filterOptions = useMemo(
    () => TABS.filter((tab) =>
      tab.label.toLowerCase().includes(filterSearch.trim().toLowerCase())
    ),
    [filterSearch]
  );

  const galleryItems = useMemo(() => {
    const list = filterByTab(TEMPLATE_GALLERY, activeTab);
    if (!query) return list;
    return list.filter((template) =>
      template.name.toLowerCase().includes(query) ||
      template.type.toLowerCase().includes(query) ||
      (template.includes || []).some((item) => item.toLowerCase().includes(query))
    );
  }, [activeTab, query]);

  const myItems = useMemo(() => {
    const list = filterByTab(
      myTemplates.map((t) => ({ ...t, content: parseTemplateContent(t.content) })),
      activeTab
    );
    if (!query) return list;
    return list.filter((template) =>
      template.name.toLowerCase().includes(query) ||
      template.type.toLowerCase().includes(query) ||
      (template.description || "").toLowerCase().includes(query)
    );
  }, [activeTab, myTemplates, query]);

  const tabCounts = {
    all: TEMPLATE_GALLERY.length,
    proposal: TEMPLATE_GALLERY.filter((t) => t.type === "proposal").length,
    contract: TEMPLATE_GALLERY.filter((t) => t.type === "contract").length,
    questionnaire: TEMPLATE_GALLERY.filter((t) => t.type === "questionnaire").length,
    invoice: TEMPLATE_GALLERY.filter((t) => t.type === "invoice").length,
  };

  function getHeaderLabel() {
    if (activeTab === "all") return "Templates";
    return TABS.find((tab) => tab.id === activeTab)?.label || "Templates";
  }

  return (
    <>
      {/* Banner */}
      {banner.msg && (
        <div className={cn(
          "mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
          banner.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
        )}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="flex-1 font-medium">{banner.msg}</span>
          <button onClick={() => setBanner({ msg: "" })} className="opacity-50 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((current) => !current)}
            className="inline-flex items-center justify-between gap-2 rounded-lg bg-zinc-100 px-2 py-1 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            <span className="text-lg font-bold tracking-tight">{getHeaderLabel()}</span>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-blue-600 transition-transform",
                filterOpen ? "rotate-180" : ""
              )}
            />
          </button>

          {filterOpen && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-[15rem] max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-200 bg-white p-2 shadow-xl">
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Search filters"
                  className="h-11 w-full rounded-xl border border-blue-500 pl-11 pr-4 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-blue-500"
                />
              </div>

              <div className="max-h-72 overflow-y-auto py-1">
                {filterOptions.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setFilterOpen(false);
                      setFilterSearch("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition-colors",
                      activeTab === tab.id
                        ? "bg-zinc-50 text-zinc-900"
                        : "text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <span>{tab.id === "all" ? "All" : tab.label}</span>
                    {activeTab === tab.id && (
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/templates/builder?type=proposal"
            className="inline-flex items-center gap-2 rounded bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
            New proposal
          </Link>
          <Link
            href="/contracts/new"
            className="rounded border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            New contract
          </Link>
          <Link
            href="/templates/builder?type=questionnaire"
            className="rounded border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            New questionnaire
          </Link>
        </div>
      </div>

      {/* Gallery */}
      <section className="mb-12">
        {galleryItems.length === 0 ? (
          <div className="flex items-center justify-center rounded border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
            <div>
              <FileText className="mx-auto h-8 w-8 text-zinc-300 mb-3" />
              <p className="text-sm font-medium text-zinc-500">No templates in this category yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {galleryItems.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSaved={false}
                onPreview={setPreviewTemplate}
                onSave={handleSaveTemplate}
                onDelete={() => {}}
                onCustomize={handleCustomize}
                onOpen={handleOpen}
              />
            ))}
          </div>
        )}
      </section>

      {/* My Templates */}
      <section>
        <div className="mb-5">
          <h2 className="text-sm font-bold text-zinc-900 mb-1">My Templates</h2>
          <p className="text-xs text-zinc-400">Saved templates you can reopen, refine, and reuse.</p>
        </div>

        {myItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded border border-dashed border-zinc-200 bg-zinc-50 py-14 text-center">
            <BookmarkPlus className="h-8 w-8 text-zinc-300 mb-3" />
            <p className="text-sm font-semibold text-zinc-500">No saved templates yet</p>
            <p className="mt-1 text-xs text-zinc-400 max-w-xs">
              Click &quot;Save to my templates&quot; on any gallery template to build your personal library.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {myItems.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSaved={true}
                onPreview={setPreviewTemplate}
                onSave={() => {}}
                onDelete={handleDelete}
                onCustomize={handleCustomize}
                onOpen={handleOpen}
              />
            ))}
          </div>
        )}
      </section>

      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={handleUse}
          onCustomize={handleCustomize}
        />
      )}
    </>
  );
}
