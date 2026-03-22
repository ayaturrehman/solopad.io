"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, AlertCircle, FolderOpen, CalendarDays,
  CircleDollarSign, UserRound, Sparkles, ChevronDown, Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { selectClassName, textareaClassName } from "@/components/ui/Input";
import dynamic from "next/dynamic";
const ProposalRichTextEditor = dynamic(() => import("../ProposalRichTextEditor"), { ssr: false, loading: () => <div className="min-h-[160px] animate-pulse rounded bg-zinc-100" /> });
const RichTextToolbar = dynamic(() => import("../ProposalRichTextEditor").then((m) => ({ default: m.RichTextToolbar })), { ssr: false, loading: () => null });
import { normalizeRichText } from "../richText";

// A4 at 96dpi
const PAGE_W = 794;
const PAGE_H = 1123;
const PAGE_PAD_H = 72;  // ~1 inch top/bottom padding inside paper
const PAGE_PAD_V = 80;  // ~1.1 inch left/right padding inside paper

const DEFAULT_SECTIONS = [
  { heading: "Executive summary", body: "Summarize the client need, your recommendation, and the expected outcome." },
  { heading: "Scope of work", body: "Outline what is included, what you will deliver, and how the engagement will be structured." },
  { heading: "Timeline", body: "Explain phases, milestones, and the target delivery window." },
];
const DEFAULT_PRICING = [
  { description: "Discovery and planning", qty: "", rate: "", amount: "" },
  { description: "Delivery and implementation", qty: "", rate: "", amount: "" },
];

function fmtAmount(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return "0.00";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
const CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD"];

function parseJsonArray(value, fallback) {
  if (!value) return fallback;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) && parsed.length ? parsed : fallback;
  } catch { return fallback; }
}

function pt(n) { return Math.round(n * 1.333); }

export default function ProposalBuilderClient({
  projects,
  user,
  initialProposal = null,
  defaultTemplate = null,
  mode = "create",
  forceAIBrief = false,
}) {
  const router = useRouter();
  const isEdit = mode === "edit" || Boolean(initialProposal);
  const paperRef = useRef(null);
  const pricingRef = useRef(null);

  // Use template margins (same as ProposalPreview / print page)
  const tpl = defaultTemplate || {};
  const paperPadH = pt((tpl.marginLeft || 0.55) * 72);
  const paperPadTop = pt((tpl.marginTop || 0.55) * 72);
  const paperPadBot = pt((tpl.marginBottom || 0.55) * 72);

  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState("");
  const [brief, setBrief] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(forceAIBrief);
  const [activeEditor, setActiveEditor] = useState(null);
  const [pageCount, setPageCount] = useState(1);

  const [title, setTitle] = useState(initialProposal?.title || "Untitled proposal");
  const [projectId, setProjectId] = useState(initialProposal?.projectId || "");
  const [clientName, setClientName] = useState(initialProposal?.clientName || "");
  const [clientEmail, setClientEmail] = useState(initialProposal?.clientEmail || "");
  const [validUntil, setValidUntil] = useState(
    initialProposal?.validUntil ? new Date(initialProposal.validUntil).toISOString().split("T")[0] : ""
  );
  const [currency, setCurrency] = useState(initialProposal?.currency || user?.currency || "USD");
  const [intro, setIntro] = useState(
    initialProposal?.intro || "Outline the opportunity, your recommendation, and why this proposal is the right fit."
  );
  const [sections, setSections] = useState(() => parseJsonArray(initialProposal?.sections, DEFAULT_SECTIONS));
  const [pricing, setPricing] = useState(() => parseJsonArray(initialProposal?.pricing, DEFAULT_PRICING));
  const [taxRate, setTaxRate] = useState(0);

  const subtotal = pricing.reduce((sum, row) => {
    const qty = parseFloat(row.qty) || 0;
    const rate = parseFloat(row.rate) || 0;
    const amount = parseFloat(row.amount) || 0;
    return sum + (qty && rate ? qty * rate : amount);
  }, 0);
  const taxAmount = subtotal * ((parseFloat(taxRate) || 0) / 100);
  const total = subtotal + taxAmount;
  const symbol = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$", AUD: "A$" }[currency] || "$";

  const selectedProject = useMemo(() => projects.find((p) => p.id === projectId) || null, [projectId, projects]);

  // Measure paper height and compute page count
  useEffect(() => {
    if (!paperRef.current) return;
    const ro = new ResizeObserver(() => {
      if (!paperRef.current) return;
      setPageCount(Math.max(1, Math.ceil(paperRef.current.scrollHeight / PAGE_H)));
    });
    ro.observe(paperRef.current);
    return () => ro.disconnect();
  }, []);

  function handleProjectChange(id) {
    setProjectId(id);
    if (!id) return;
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    setClientName(p.clientName || "");
    setClientEmail(p.clientEmail || "");
    if (!title || title === "Untitled proposal") setTitle(`${p.title} proposal`);
  }

  function addSection() { setSections((c) => [...c, { heading: "New section", body: "" }]); }
  function removeSection(i) { setSections((c) => c.filter((_, idx) => idx !== i)); }
  function updateSection(i, field, value) { setSections((c) => c.map((s, idx) => idx === i ? { ...s, [field]: value } : s)); }
  function addPricingRow() { setPricing((c) => [...c, { description: "", qty: "", rate: "", amount: "" }]); }
  function removePricingRow(i) { setPricing((c) => c.filter((_, idx) => idx !== i)); }
  function updatePricingRow(i, field, value) { setPricing((c) => c.map((r, idx) => idx === i ? { ...r, [field]: value } : r)); }

  function setDraftIntoForm(draft) {
    if (draft.title) setTitle(draft.title);
    if (draft.clientName) setClientName(draft.clientName);
    if (draft.clientEmail) setClientEmail(draft.clientEmail);
    if (draft.intro) setIntro(draft.intro);
    if (Array.isArray(draft.sections) && draft.sections.length) setSections(draft.sections);
    if (Array.isArray(draft.pricing) && draft.pricing.length)
      setPricing(draft.pricing.map((r) => ({ description: r.description || "", amount: r.amount?.toString?.() || "" })));
    if (typeof draft.taxRate === "number") setTaxRate(draft.taxRate.toString());
    if (typeof draft.validUntilDays === "number") {
      const d = new Date(); d.setDate(d.getDate() + draft.validUntilDays);
      setValidUntil(d.toISOString().split("T")[0]);
    }
  }

  async function handleSave(status) {
    if (!title.trim()) { setError("Proposal title is required."); return; }
    if (!clientName.trim()) { setError("Client name is required."); return; }
    setSaving(true); setError("");
    const payload = {
      title: title.trim(), projectId: projectId || null, clientName: clientName.trim(),
      clientEmail: clientEmail.trim() || null, intro: normalizeRichText(intro),
      sections: sections.map((s) => ({ ...s, heading: s.heading?.trim() || "", body: normalizeRichText(s.body) || "" })),
      pricing, total, currency, validUntil: validUntil || null, status,
    };
    try {
      const res = await fetch(isEdit ? `/api/proposals/${initialProposal.id}` : "/api/proposals", {
        method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save proposal."); return; }
      router.push(`/proposals/${isEdit ? initialProposal.id : data.proposal.id}`);
    } catch { setError("Failed to save proposal."); }
    finally { setSaving(false); }
  }

  async function handleDraftFromBrief() {
    if (!brief.trim()) { setError("Add a short brief first."); return; }
    setDrafting(true); setError("");
    try {
      const res = await fetch("/api/proposals/draft", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements: brief.trim(), projectTitle: selectedProject?.title || null, clientName: clientName || null, clientEmail: clientEmail || null, currency }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to draft proposal."); return; }
      setDraftIntoForm(data.draft); setBriefOpen(false);
    } catch { setError("Failed to draft proposal."); }
    finally { setDrafting(false); }
  }

  // Push pricing section below any page break it would cross
  useEffect(() => {
    if (!pricingRef.current || !paperRef.current) return;
    const recalc = () => {
      if (!pricingRef.current) return;
      const pricingTop = pricingRef.current.offsetTop;
      const pricingHeight = pricingRef.current.offsetHeight;
      const pricingBottom = pricingTop + pricingHeight;
      for (let page = 1; page < 20; page++) {
        const breakPoint = PAGE_H * page;
        if (pricingTop < breakPoint && pricingBottom > breakPoint) {
          const pushDown = breakPoint - pricingTop + PAGE_PAD_H;
          pricingRef.current.style.marginTop = `${pushDown}px`;
          return;
        }
      }
      pricingRef.current.style.marginTop = "0px";
    };
    const ro = new ResizeObserver(recalc);
    ro.observe(paperRef.current);
    recalc();
    return () => ro.disconnect();
  }, [pricing, sections, intro]);

  // Page break separator positions
  const pageBreaks = Array.from({ length: pageCount - 1 }, (_, i) => PAGE_H * (i + 1));

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col overflow-hidden proposal-builder-root">
      <style>{`
        @media print {
          @page { size: 210mm 297mm; margin: 0; }
          html, body { background: #fff !important; }
          .proposal-builder-root > *:not(.proposal-print-paper-wrap) { display: none !important; }
          .proposal-print-paper-wrap {
            display: block !important;
            background: #fff !important;
            padding: 0 !important;
          }
          .proposal-print-paper {
            width: 210mm !important;
            min-height: auto !important;
            box-shadow: none !important;
            padding: 19mm 21mm !important;
          }
          .proposal-print-section { break-inside: avoid; }
          .proposal-print-pagebreak { display: none !important; }
        }
      `}</style>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
          placeholder="Untitled proposal"
        />
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          className={cn("inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors", settingsOpen ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800")}
        >
          <Settings2 className="h-3.5 w-3.5" />
          Details
        </button>
        <div className="h-4 w-px bg-zinc-200" />
        <button type="button" onClick={() => handleSave("draft")} disabled={saving}
          className="h-7 rounded border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50">
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button type="button" onClick={() => handleSave("sent")} disabled={saving}
          className="h-7 rounded bg-blue-600 px-3 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Saving…" : isEdit ? "Save & update" : "Save & send"}
        </button>
      </div>

      {/* ── Settings panel (collapsible) ─────────────────────────── */}
      {settingsOpen && (
        <div className="shrink-0 border-b border-zinc-100 bg-zinc-50 px-4 py-3">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Client</label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Name" className="h-7 w-full rounded border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-zinc-400" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Email</label>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="email@co.com" className="h-7 w-full rounded border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-zinc-400" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400"><FolderOpen className="inline h-3 w-3 mr-0.5" />Project</label>
              <select value={projectId} onChange={(e) => handleProjectChange(e.target.value)} className={selectClassName}>
                <option value="">None</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400"><CalendarDays className="inline h-3 w-3 mr-0.5" />Valid until</label>
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="h-7 w-full rounded border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-zinc-400" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400"><CircleDollarSign className="inline h-3 w-3 mr-0.5" />Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClassName}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Tax %</label>
              <input type="number" min="0" max="100" step="0.1" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="h-7 w-full rounded border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-zinc-400" />
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky formatting toolbar ────────────────────────────── */}
      <div className={cn("shrink-0 border-b border-zinc-100 bg-white px-3 py-1 transition-all", !activeEditor && "opacity-40 pointer-events-none")}>
        <RichTextToolbar editor={activeEditor} />
      </div>

      {/* ── Document area ────────────────────────────────────────── */}
      <div className="proposal-print-paper-wrap flex-1 overflow-auto bg-zinc-300">
        <div className="flex justify-center py-10 pb-20">

          {/* Paper with page break overlays */}
          <div style={{ position: "relative", width: PAGE_W, flexShrink: 0 }}>

            {/* Page break lines */}
            {pageBreaks.map((top, i) => (
              <div key={i} className="proposal-print-pagebreak" style={{ position: "absolute", top, left: 0, right: 0, zIndex: 10, pointerEvents: "none" }}>
                {/* top border line over paper */}
                <div style={{ height: 1, backgroundColor: "#d1d5db" }} />
                {/* bottom border line over paper */}
                <div style={{ position: "absolute", top: 20, left: 0, right: 0, height: 1, backgroundColor: "#d1d5db" }} />
                {/* gray gap — only in the gutters, not over paper content */}
                <div style={{ position: "absolute", top: 1, left: -200, right: PAGE_W, height: 18, backgroundColor: "#d4d4d8" }} />
                <div style={{ position: "absolute", top: 1, left: PAGE_W, right: -200, height: 18, backgroundColor: "#d4d4d8" }} />
                <span style={{ position: "absolute", top: 3, right: 8, fontSize: 9, color: "#9ca3af", fontFamily: "Arial, sans-serif", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", userSelect: "none" }}>
                  Page {i + 2}
                </span>
              </div>
            ))}

            {/* White paper */}
            <div
              ref={paperRef}
              className="proposal-print-paper bg-white shadow-xl"
              style={{ width: PAGE_W, minHeight: PAGE_H, paddingLeft: paperPadH, paddingRight: paperPadH, paddingTop: paperPadTop, paddingBottom: paperPadBot, boxSizing: "border-box" }}
            >

              {/* Title */}
              <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Proposal</div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: "100%", border: 0, background: "transparent", fontSize: 26, fontWeight: 700, color: "#111827", outline: "none", padding: 0, lineHeight: 1.2 }}
                  placeholder="Proposal title"
                />
                {clientName && (
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>
                    Prepared for <strong style={{ color: "#374151" }}>{clientName}</strong>
                    {validUntil && <span style={{ marginLeft: 16 }}>· Valid until {new Date(validUntil).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                  </div>
                )}
              </div>

              {/* Introduction */}
              <div className="proposal-print-section" style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>Introduction</div>
                <ProposalRichTextEditor
                  value={intro}
                  onChange={setIntro}
                  placeholder="Outline the opportunity and your recommendation…"
                  minHeightClassName="min-h-[80px]"
                  noToolbar
                  onEditorFocus={setActiveEditor}
                  onEditorBlur={() => setActiveEditor(null)}
                />
              </div>

              {/* Scope sections */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Scope of Work</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {sections.map((section, i) => (
                    <div key={`section-${i}`} className="proposal-print-section group" style={{ paddingBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <input
                          value={section.heading}
                          onChange={(e) => updateSection(i, "heading", e.target.value)}
                          style={{ flex: 1, border: 0, background: "transparent", fontSize: 14, fontWeight: 700, color: "#111827", outline: "none", padding: 0 }}
                          placeholder="Section heading"
                        />
                        {sections.length > 1 && (
                          <button type="button" onClick={() => removeSection(i)} className="h-6 w-6 inline-flex items-center justify-center rounded text-zinc-200 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <ProposalRichTextEditor
                        value={section.body}
                        onChange={(v) => updateSection(i, "body", v)}
                        placeholder="Add details for this section…"
                        minHeightClassName="min-h-[60px]"
                        noToolbar
                        onEditorFocus={setActiveEditor}
                        onEditorBlur={() => setActiveEditor(null)}
                      />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addSection}
                  className="mt-3 inline-flex items-center gap-1.5 rounded border border-dashed border-zinc-300 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-400 hover:text-zinc-700">
                  <Plus className="h-3.5 w-3.5" /> Add section
                </button>
              </div>

              {/* Divider between scope and investment */}
              <div style={{ borderTop: "1px solid #e5e7eb", margin: "32px 0 24px" }} />

              {/* Pricing */}
              <div className="proposal-print-section" ref={pricingRef}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.14em", textTransform: "uppercase" }}>Investment</div>
                  <button type="button" onClick={addPricingRow} className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
                    <Plus className="h-3.5 w-3.5" /> Add line
                  </button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #111827" }}>
                      <th style={{ textAlign: "left", fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", paddingBottom: 6 }}>Description</th>
                      <th style={{ textAlign: "right", fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", paddingBottom: 6, width: 60 }}>Qty</th>
                      <th style={{ textAlign: "right", fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", paddingBottom: 6, width: 80 }}>Rate</th>
                      <th style={{ textAlign: "right", fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", paddingBottom: 6, width: 100 }}>Amount</th>
                      <th style={{ width: 28 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {pricing.map((row, i) => {
                      const qty = parseFloat(row.qty) || 0;
                      const rate = parseFloat(row.rate) || 0;
                      const rowAmount = qty && rate ? qty * rate : parseFloat(row.amount) || 0;
                      return (
                        <tr key={`pricing-${i}`} style={{ borderBottom: "1px solid #f3f4f6" }} className="group">
                          <td style={{ padding: "7px 0" }}>
                            <input value={row.description} onChange={(e) => updatePricingRow(i, "description", e.target.value)}
                              style={{ width: "100%", border: 0, background: "transparent", fontSize: 13, color: "#374151", outline: "none" }}
                              placeholder="Line item description" />
                          </td>
                          <td style={{ padding: "7px 0", textAlign: "right" }}>
                            <input type="number" min="0" step="1" value={row.qty} onChange={(e) => updatePricingRow(i, "qty", e.target.value)}
                              style={{ width: "100%", border: 0, background: "transparent", fontSize: 13, color: "#374151", outline: "none", textAlign: "right" }}
                              placeholder="-" />
                          </td>
                          <td style={{ padding: "7px 0", textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                              {row.rate && <span style={{ fontSize: 12, color: "#9ca3af" }}>{symbol}</span>}
                              <input type="number" min="0" step="0.01" value={row.rate} onChange={(e) => updatePricingRow(i, "rate", e.target.value)}
                                style={{ width: 60, border: 0, background: "transparent", fontSize: 13, color: "#374151", outline: "none", textAlign: "right" }}
                                placeholder="-" />
                            </div>
                          </td>
                          <td style={{ padding: "7px 0", textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af", userSelect: "none" }}>{symbol}</span>
                              {qty && rate ? (
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{fmtAmount(rowAmount)}</span>
                              ) : (
                                <input type="number" min="0" step="0.01" value={row.amount} onChange={(e) => updatePricingRow(i, "amount", e.target.value)}
                                  style={{ width: 80, border: 0, background: "transparent", fontSize: 13, fontWeight: 600, color: "#111827", outline: "none", textAlign: "right" }}
                                  placeholder="0.00" />
                              )}
                            </div>
                          </td>
                          <td style={{ padding: "7px 0 7px 8px" }}>
                            {pricing.length > 1 && (
                              <button type="button" onClick={() => removePricingRow(i)}
                                className="h-5 w-5 inline-flex items-center justify-center text-zinc-200 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    {taxAmount > 0 && (
                      <tr>
                        <td colSpan={3} style={{ paddingTop: 8, fontSize: 12, color: "#6b7280", textAlign: "right" }}>Subtotal: {symbol}{fmtAmount(subtotal)}</td>
                        <td />
                      </tr>
                    )}
                    {taxAmount > 0 && (
                      <tr>
                        <td colSpan={3} style={{ fontSize: 12, color: "#6b7280", textAlign: "right" }}>Tax ({taxRate}%): +{symbol}{fmtAmount(taxAmount)}</td>
                        <td />
                      </tr>
                    )}
                    <tr style={{ borderTop: "2px solid #111827" }}>
                      <td style={{ paddingTop: 8, fontSize: 13, fontWeight: 700, color: "#111827" }}>Total</td>
                      <td colSpan={2} />
                      <td style={{ paddingTop: 8, fontSize: 15, fontWeight: 700, color: "#111827", textAlign: "right" }}>{symbol}{fmtAmount(total)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>


            </div>{/* end paper */}
          </div>{/* end relative wrapper */}
        </div>

        {/* AI brief + error — below document */}
        <div className="mx-auto mb-8 w-full max-w-xl px-4 space-y-3">
          <div className="rounded border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <button type="button" onClick={() => setBriefOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors">
              <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-blue-500" /> Draft from AI brief</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", briefOpen && "rotate-180")} />
            </button>
            {briefOpen && (
              <div className="px-4 pb-4 space-y-2 border-t border-zinc-100">
                <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={4}
                  className={cn(textareaClassName, "mt-3 bg-zinc-50 transition")}
                  placeholder="E.g. Brand identity for a cafe. Budget ~£2,500. Logo, guidelines, launch assets in 3 weeks." />
                <button type="button" onClick={handleDraftFromBrief} disabled={drafting}
                  className="h-8 w-full rounded bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
                  {drafting ? "Drafting…" : "Fill from brief"}
                </button>
              </div>
            )}
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
