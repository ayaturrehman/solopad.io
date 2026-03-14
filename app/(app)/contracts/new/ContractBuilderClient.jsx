"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, AlertCircle, FolderOpen, UserRound, Sparkles, ChevronDown, Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProposalRichTextEditor, { RichTextToolbar } from "../../proposals/ProposalRichTextEditor";
import { normalizeRichText } from "../../proposals/richText";

// A4 at 96dpi
const PAGE_W = 794;
const PAGE_H = 1123;
const PAGE_PAD_H = 72;  // ~1 inch left/right padding inside paper
const PAGE_PAD_TOP = 64;
const PAGE_PAD_BOT = 64;

const DEFAULT_CLAUSES = [
  { heading: "Scope of Work", body: "" },
  { heading: "Payment Terms", body: "" },
  { heading: "Termination", body: "" },
];

function parseClauses(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) && parsed.length ? parsed : fallback;
  } catch { return fallback; }
}

export default function ContractBuilderClient({
  projects,
  user,
  initialContract = null,
  mode = "create",
}) {
  const router = useRouter();
  const isEdit = mode === "edit" || Boolean(initialContract);
  const paperRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState("");
  const [brief, setBrief] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [activeEditor, setActiveEditor] = useState(null);
  const [pageCount, setPageCount] = useState(1);

  const [title, setTitle] = useState(initialContract?.title || "Untitled contract");
  const [projectId, setProjectId] = useState(initialContract?.projectId || "");
  const [clientName, setClientName] = useState(initialContract?.clientName || "");
  const [clientEmail, setClientEmail] = useState(initialContract?.clientEmail || "");
  const [signatureName, setSignatureName] = useState(initialContract?.signatureName || "");
  const [clauses, setClauses] = useState(() => parseClauses(initialContract?.clauses, DEFAULT_CLAUSES));

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
    if (!clientName.trim()) setClientName(p.contact?.name || "");
    if (!clientEmail.trim()) setClientEmail(p.contact?.email || "");
    if (!title || title === "Untitled contract") setTitle(`${p.title} — Service Agreement`);
  }

  function addClause() { setClauses((c) => [...c, { heading: "New clause", body: "" }]); }
  function removeClause(i) { setClauses((c) => c.filter((_, idx) => idx !== i)); }
  function updateClause(i, field, value) { setClauses((c) => c.map((cl, idx) => idx === i ? { ...cl, [field]: value } : cl)); }

  function setDraftIntoForm(draft) {
    if (draft.title) setTitle(draft.title);
    if (draft.clientName) setClientName(draft.clientName);
    if (draft.clientEmail) setClientEmail(draft.clientEmail);
    if (draft.signatureName) setSignatureName(draft.signatureName);
    if (Array.isArray(draft.clauses) && draft.clauses.length) {
      setClauses(draft.clauses.map((cl) => ({ heading: cl.heading || "", body: cl.body || "" })));
    }
  }

  async function handleSave(status) {
    if (!title.trim()) { setError("Contract title is required."); return; }
    if (!clientName.trim()) { setError("Client name is required."); return; }
    setSaving(true); setError("");
    const payload = {
      title: title.trim(),
      projectId: projectId || null,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim() || null,
      signatureName: signatureName.trim() || null,
      clauses: clauses.map((cl) => ({
        heading: cl.heading?.trim() || "",
        body: normalizeRichText(cl.body) || "",
      })),
      status,
    };
    try {
      const res = await fetch(
        isEdit ? `/api/contracts/${initialContract.id}` : "/api/contracts",
        { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save contract."); return; }
      router.push(isEdit ? `/contracts/${initialContract.id}` : `/contracts/${data.contract.id}`);
    } catch { setError("Failed to save contract."); }
    finally { setSaving(false); }
  }

  async function handleDraftFromBrief() {
    if (!brief.trim()) { setError("Add a short brief first."); return; }
    setDrafting(true); setError("");
    try {
      const res = await fetch("/api/contracts/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements: brief.trim(),
          projectTitle: selectedProject?.title || null,
          clientName: clientName || null,
          clientEmail: clientEmail || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to draft contract."); return; }
      setDraftIntoForm(data.draft);
      setBriefOpen(false);
    } catch { setError("Failed to draft contract."); }
    finally { setDrafting(false); }
  }

  // Page break separator positions
  const pageBreaks = Array.from({ length: pageCount - 1 }, (_, i) => PAGE_H * (i + 1));

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col overflow-hidden contract-builder-root">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
          placeholder="Untitled contract"
        />
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors",
            settingsOpen ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
          )}
        >
          <Settings2 className="h-3.5 w-3.5" />
          Details
        </button>
        <div className="h-4 w-px bg-zinc-200" />
        <button
          type="button"
          onClick={() => handleSave("draft")}
          disabled={saving}
          className="h-7 rounded border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={() => handleSave("sent")}
          disabled={saving}
          className="h-7 rounded bg-blue-600 px-3 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save & update" : "Save & send"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => handleSave("signed")}
            disabled={saving}
            className="h-7 rounded bg-green-600 px-3 text-xs font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            Mark signed
          </button>
        )}
      </div>

      {/* ── Settings panel (collapsible) ─────────────────────────── */}
      {settingsOpen && (
        <div className="shrink-0 border-b border-zinc-100 bg-zinc-50 px-4 py-3">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                <UserRound className="inline h-3 w-3 mr-0.5" />
                Client name
              </label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Jane Smith"
                className="h-7 w-full rounded border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-zinc-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Client email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="jane@example.com"
                className="h-7 w-full rounded border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-zinc-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                <FolderOpen className="inline h-3 w-3 mr-0.5" />
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="h-7 w-full rounded border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-zinc-400"
              >
                <option value="">None</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Signature name</label>
              <input
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Name on signature line"
                className="h-7 w-full rounded border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-zinc-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky formatting toolbar ────────────────────────────── */}
      <div className={cn("shrink-0 border-b border-zinc-100 bg-white px-3 py-1 transition-all", !activeEditor && "opacity-40 pointer-events-none")}>
        <RichTextToolbar editor={activeEditor} />
      </div>

      {/* ── Document area ────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-zinc-300">
        <div className="flex justify-center py-10 pb-20">

          {/* Paper with page break overlays */}
          <div style={{ position: "relative", width: PAGE_W, flexShrink: 0 }}>

            {/* Page break lines */}
            {pageBreaks.map((top, i) => (
              <div key={i} style={{ position: "absolute", top, left: 0, right: 0, zIndex: 10, pointerEvents: "none" }}>
                <div style={{ height: 1, backgroundColor: "#d1d5db", marginBottom: 20 }} />
                <div style={{ position: "absolute", top: 20, left: 0, right: 0, height: 1, backgroundColor: "#d1d5db" }} />
                <div style={{ position: "absolute", top: 1, left: -100, right: -100, height: 18, backgroundColor: "#d1d5db" }} />
                <span style={{ position: "absolute", top: 3, right: 8, fontSize: 9, color: "#9ca3af", fontFamily: "Arial, sans-serif", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", userSelect: "none" }}>
                  Page {i + 2}
                </span>
              </div>
            ))}

            {/* White paper */}
            <div
              ref={paperRef}
              className="bg-white shadow-xl"
              style={{ width: PAGE_W, minHeight: PAGE_H, paddingLeft: PAGE_PAD_H, paddingRight: PAGE_PAD_H, paddingTop: PAGE_PAD_TOP, paddingBottom: PAGE_PAD_BOT, boxSizing: "border-box" }}
            >

              {/* Document header */}
              <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>
                  Service Agreement
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: "100%", border: 0, background: "transparent", fontSize: 26, fontWeight: 700, color: "#111827", outline: "none", padding: 0, lineHeight: 1.2 }}
                  placeholder="Contract title"
                />
                {clientName && (
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>
                    Prepared for <strong style={{ color: "#374151" }}>{clientName}</strong>
                    {selectedProject && (
                      <span style={{ marginLeft: 16 }}>· {selectedProject.title}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Terms & Conditions */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20 }}>
                  Terms &amp; Conditions
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {clauses.map((clause, i) => (
                    <div key={`clause-${i}`} style={{ paddingBottom: 24, marginBottom: 24, borderBottom: "1px solid #f3f4f6" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                        <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, color: "#d1d5db", marginTop: 3, minWidth: 20 }}>
                          {i + 1}.
                        </span>
                        <input
                          value={clause.heading}
                          onChange={(e) => updateClause(i, "heading", e.target.value)}
                          style={{ flex: 1, border: 0, background: "transparent", fontSize: 14, fontWeight: 700, color: "#111827", outline: "none", padding: 0 }}
                          placeholder="Clause heading"
                        />
                        {clauses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeClause(i)}
                            className="inline-flex h-5 w-5 items-center justify-center rounded text-zinc-200 transition-colors hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div style={{ paddingLeft: 20 }}>
                        <ProposalRichTextEditor
                          value={clause.body}
                          onChange={(v) => updateClause(i, "body", v)}
                          placeholder="Write the full text of this clause…"
                          minHeightClassName="min-h-[60px]"
                          noToolbar
                          onEditorFocus={setActiveEditor}
                          onEditorBlur={() => setActiveEditor(null)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addClause}
                  className="mt-2 inline-flex items-center gap-1.5 rounded border border-dashed border-zinc-300 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-400 hover:text-zinc-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add clause
                </button>
              </div>

              {/* Signature block */}
              <div style={{ display: "flex", gap: 40, marginTop: 48, paddingTop: 24, borderTop: "1px solid #e5e7eb" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 28 }}>
                    Service Provider
                  </div>
                  <div style={{ height: 1, backgroundColor: "#374151", marginBottom: 6 }} />
                  {signatureName && <div style={{ fontSize: 12, color: "#374151" }}>{signatureName}</div>}
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Date: _______________</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 28 }}>
                    Client Signature
                  </div>
                  <div style={{ height: 1, backgroundColor: "#374151", marginBottom: 6 }} />
                  {clientName && <div style={{ fontSize: 12, color: "#374151" }}>{clientName}</div>}
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Date: _______________</div>
                </div>
              </div>

            </div>{/* end paper */}
          </div>{/* end relative wrapper */}
        </div>

        {/* AI brief + error — below document */}
        <div className="mx-auto mb-8 w-full max-w-xl px-4 space-y-3">
          <div className="rounded border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setBriefOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                Draft from AI brief
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", briefOpen && "rotate-180")} />
            </button>
            {briefOpen && (
              <div className="px-4 pb-4 space-y-2 border-t border-zinc-100">
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  rows={4}
                  className="mt-3 w-full rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 resize-none"
                  placeholder="E.g. Website design contract for a cafe. 6-week timeline, $3,500 fixed fee, 50% deposit."
                />
                <button
                  type="button"
                  onClick={handleDraftFromBrief}
                  disabled={drafting}
                  className="h-8 w-full rounded bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {drafting ? "Drafting…" : "Fill from brief"}
                </button>
              </div>
            )}
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
