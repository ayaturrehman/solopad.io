"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Download, FileText, Send, CheckCircle, Zap,
  MessageSquare, Calendar, User, Clock, ChevronDown, ChevronUp,
} from "lucide-react";
import { formatCurrency, formatDate, formatBytes } from "@/lib/utils";

const STATUS_LABELS_MAP = {
  not_started: "Not Started",
  in_progress: "In Progress",
  in_review:   "In Review",
  complete:    "Complete",
};

const STATUS_ORDER = ["not_started", "in_progress", "in_review", "complete"];

const STATUS_STEPS = [
  { key: "not_started", label: "Not Started" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review",   label: "In Review" },
  { key: "complete",    label: "Complete" },
];

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "";
}

function FileRow({ file }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-100">
          <FileText className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900">{file.name}</p>
          <p className="text-xs text-zinc-400">{formatBytes(file.sizeBytes)}</p>
        </div>
      </div>
      <a
        href={`/api/files/${file.projectId}/${encodeURIComponent(file.name)}`}
        download={file.name}
        className="shrink-0 rounded border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
      >
        <Download className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function InvoiceCard({ invoice }) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handlePay() {
    setLoading(true);
    const res = await fetch("/api/invoices/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: invoice.id }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(false);
  }

  const isPaid = invoice.status === "paid";
  const isCancelled = invoice.status === "cancelled";
  const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
  const subtotal = lineItems.reduce((s, item) => s + (item.quantity || 1) * (item.unitPrice || 0), 0);
  const hasLineItems = lineItems.length > 0;

  return (
    <div className={`rounded border ${isPaid ? "border-green-200 bg-green-50" : isCancelled ? "border-zinc-100 bg-zinc-50" : "border-zinc-200 bg-white"}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="font-semibold text-zinc-900">
            {invoice.invoiceNumber || `Invoice ${invoice.id.slice(-6).toUpperCase()}`}
          </p>
          {invoice.dueDate && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
              <Clock className="h-3 w-3" /> Due {formatDate(invoice.dueDate)}
            </p>
          )}
          {hasLineItems && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
            >
              {expanded ? <><ChevronUp className="h-3 w-3" /> Hide details</> : <><ChevronDown className="h-3 w-3" /> View details</>}
            </button>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-zinc-900">{formatCurrency(invoice.total, invoice.currency)}</p>
          <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
            isPaid      ? "bg-green-100 text-green-700" :
            isCancelled ? "bg-zinc-100 text-zinc-500" :
                          "bg-amber-100 text-amber-700"
          }`}>
            {isPaid ? "Paid" : isCancelled ? "Cancelled" : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Line items breakdown */}
      {expanded && hasLineItems && (
        <div className="border-t border-zinc-100 px-5 pb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="py-2.5 text-left text-xs font-medium text-zinc-400">Description</th>
                <th className="py-2.5 text-center text-xs font-medium text-zinc-400">Qty</th>
                <th className="py-2.5 text-right text-xs font-medium text-zinc-400">Unit price</th>
                <th className="py-2.5 text-right text-xs font-medium text-zinc-400">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {lineItems.map((item, i) => (
                <tr key={i}>
                  <td className="py-2.5 pr-4 text-zinc-700">{item.description || "—"}</td>
                  <td className="py-2.5 text-center text-zinc-500">{item.quantity ?? 1}</td>
                  <td className="py-2.5 text-right text-zinc-500">{formatCurrency(item.unitPrice || 0, invoice.currency)}</td>
                  <td className="py-2.5 text-right font-medium text-zinc-900">
                    {formatCurrency((item.quantity || 1) * (item.unitPrice || 0), invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {invoice.tax > 0 && (
                <>
                  <tr>
                    <td colSpan={3} className="pt-3 text-right text-xs text-zinc-400">Subtotal</td>
                    <td className="pt-3 text-right text-sm text-zinc-700">{formatCurrency(subtotal, invoice.currency)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-1 text-right text-xs text-zinc-400">Tax ({invoice.tax}%)</td>
                    <td className="py-1 text-right text-sm text-zinc-700">{formatCurrency(invoice.total - subtotal, invoice.currency)}</td>
                  </tr>
                </>
              )}
              <tr className="border-t border-zinc-200">
                <td colSpan={3} className="pt-2.5 text-right text-sm font-semibold text-zinc-900">Total</td>
                <td className="pt-2.5 text-right text-sm font-bold text-zinc-900">{formatCurrency(invoice.total, invoice.currency)}</td>
              </tr>
            </tfoot>
          </table>
          {invoice.notes && (
            <p className="mt-3 rounded bg-zinc-50 px-3 py-1.5 text-xs text-zinc-500">{invoice.notes}</p>
          )}
        </div>
      )}

      {/* Pay button */}
      {!isPaid && !isCancelled && (
        <div className="border-t border-zinc-100 flex justify-end px-5 pb-5 pt-4">
          <button onClick={handlePay} disabled={loading} className="rounded bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50">
            {loading ? "Redirecting…" : `Pay ${formatCurrency(invoice.total, invoice.currency)}`}
          </button>
        </div>
      )}
      {isPaid && (
        <div className="border-t border-green-100 px-5 pb-4 pt-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-green-600">
            <CheckCircle className="h-4 w-4" /> Payment received — thank you!
          </p>
        </div>
      )}
    </div>
  );
}

export default function ClientPortal({ project, files, comments: initialComments, invoices, notes = [] }) {
  const storedName = typeof window !== "undefined" ? localStorage.getItem("portalClientName") : "";
  const [clientName, setClientName] = useState(storedName || "");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [nameEntered, setNameEntered] = useState(!!storedName);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [messages, setMessages] = useState(initialComments);
  const messagesEndRef = useRef(null);

  const currentStep = STATUS_ORDER.indexOf(project.status);
  const unpaidInvoices = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled");
  const paidInvoices = invoices.filter((i) => i.status === "paid");

  // SSE — connect once on mount, receive new messages instantly
  useEffect(() => {
    const es = new EventSource(`/api/comments/stream?projectId=${project.id}&token=${project.portalToken}`);
    es.onmessage = (e) => {
      try {
        const comment = JSON.parse(e.data);
        setMessages((prev) => {
          // ignore if already in list (e.g. optimistic entry with same id)
          if (prev.some((m) => m.id === comment.id)) return prev;
          // replace any pending optimistic entry, then append real one
          return [...prev.filter((m) => !String(m.id).startsWith("tmp-")), comment];
        });
      } catch {}
    };
    return () => es.close();
  }, [project.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeTab === "messages") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const TABS = [
    { id: "overview",  label: "Overview" },
    { id: "files",     label: `Files${files.length ? ` (${files.length})` : ""}` },
    { id: "notes",     label: `Notes${notes.length ? ` (${notes.length})` : ""}`, hidden: !notes.length },
    { id: "messages",  label: `Messages${messages.length ? ` (${messages.length})` : ""}` },
    { id: "invoices",  label: `Invoices${invoices.length ? ` (${invoices.length})` : ""}`, hidden: !invoices.length },
  ].filter((t) => !t.hidden);

  async function sendComment(e) {
    e.preventDefault();
    if (!body.trim() || !clientName.trim()) return;
    setSending(true);
    // Optimistic update
    const optimistic = {
      id: `tmp-${Date.now()}`,
      authorName: clientName,
      authorType: "client",
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setBody("");
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, authorName: clientName, authorType: "client", body: optimistic.body, token: project.portalToken }),
    });
    setSending(false);
    // SSE will push the real comment back and replace the optimistic entry
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-900">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-zinc-900">Solopad</span>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            project.status === "complete"    ? "bg-green-100 text-green-700" :
            project.status === "in_review"   ? "bg-blue-100 text-blue-700" :
            project.status === "in_progress" ? "bg-amber-100 text-amber-700" :
            "bg-zinc-100 text-zinc-600"
          }`}>
            {STATUS_LABELS_MAP[project.status] || project.status}
          </span>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Project</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl">{project.title}</h1>
          {project.description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{project.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{project.clientName}</span>
            {project.endDate && (
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Due {formatDate(project.endDate)}</span>
            )}
            {paidInvoices.length > 0 && (
              <span className="flex items-center gap-1.5 text-green-600">
                <CheckCircle className="h-4 w-4" />{paidInvoices.length} invoice{paidInvoices.length > 1 ? "s" : ""} paid
              </span>
            )}
          </div>

          {/* progress bar */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-zinc-400">Project progress</p>
              <p className="text-xs font-semibold text-zinc-700">{STATUS_LABELS_MAP[project.status] || project.status}</p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-100">
              <div
                className="h-1.5 rounded-full bg-zinc-900 transition-all"
                style={{ width: `${Math.max(5, (Math.max(0, currentStep) / (STATUS_ORDER.length - 1)) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between">
              {STATUS_STEPS.map((step, i) => (
                <span key={step.key} className={`text-[10px] font-medium ${i <= currentStep ? "text-zinc-600" : "text-zinc-300"}`}>
                  {step.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6">
          <div className="flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment banner */}
      {unpaidInvoices.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p className="text-sm font-medium text-amber-800">
              {unpaidInvoices.length} payment{unpaidInvoices.length > 1 ? "s" : ""} outstanding — {formatCurrency(unpaidInvoices.reduce((s, i) => s + i.total, 0))} total
            </p>
            <button onClick={() => setActiveTab("invoices")} className="shrink-0 rounded bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800">
              View & Pay
            </button>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Files",     value: files.length,    tab: "files" },
                  { label: "Messages",  value: messages.length, tab: "messages" },
                  { label: "Invoices",  value: invoices.length, tab: "invoices" },
                  { label: "Notes",     value: notes.length,    tab: "notes" },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => s.value > 0 && setActiveTab(s.tab)}
                    className="rounded border border-zinc-200 bg-white px-4 py-4 text-center transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">{s.label}</p>
                  </button>
                ))}
              </div>

              {files.length > 0 && (
                <div className="rounded border border-zinc-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-zinc-900">Recent files</h2>
                    <button onClick={() => setActiveTab("files")} className="text-xs text-zinc-400 hover:text-zinc-700">View all</button>
                  </div>
                  <div className="space-y-3">
                    {files.slice(0, 3).map((file) => <FileRow key={file.id} file={file} />)}
                  </div>
                </div>
              )}

              {messages.length > 0 && (
                <div className="rounded border border-zinc-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-zinc-900">Latest message</h2>
                    <button onClick={() => setActiveTab("messages")} className="text-xs text-zinc-400 hover:text-zinc-700">View all</button>
                  </div>
                  {(() => {
                    const last = messages[messages.length - 1];
                    return (
                      <div className="flex gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${last.authorType === "freelancer" ? "bg-zinc-900 text-white" : "bg-blue-600 text-white"}`}>
                          {last.authorName?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">{last.authorName} · {formatDate(last.createdAt)}</p>
                          <p className="mt-1 text-sm text-zinc-700">{last.body}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {invoices.length > 0 && (
                <div className="rounded border border-zinc-200 bg-white p-5">
                  <h2 className="mb-4 font-semibold text-zinc-900">Billing</h2>
                  <dl className="divide-y divide-zinc-100">
                    <div className="flex justify-between py-2.5 text-sm">
                      <dt className="text-zinc-500">Total invoices</dt>
                      <dd className="font-medium text-zinc-900">{invoices.length}</dd>
                    </div>
                    <div className="flex justify-between py-2.5 text-sm">
                      <dt className="text-zinc-500">Outstanding</dt>
                      <dd className="font-semibold text-zinc-900">{formatCurrency(unpaidInvoices.reduce((s, i) => s + i.total, 0))}</dd>
                    </div>
                    <div className="flex justify-between py-2.5 text-sm">
                      <dt className="text-zinc-500">Paid</dt>
                      <dd className="font-medium text-green-600">{formatCurrency(paidInvoices.reduce((s, i) => s + i.total, 0))}</dd>
                    </div>
                  </dl>
                  {unpaidInvoices.length > 0 && (
                    <button onClick={() => setActiveTab("invoices")} className="mt-4 w-full rounded bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700">
                      Pay now
                    </button>
                  )}
                </div>
              )}

              <div className="rounded border border-zinc-200 bg-white p-5">
                <h2 className="mb-1 font-semibold text-zinc-900">Got a question?</h2>
                <p className="mb-3 text-xs text-zinc-400">Send a message and we'll get back to you.</p>
                <button onClick={() => setActiveTab("messages")} className="flex w-full items-center justify-center gap-2 rounded border border-zinc-200 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                  <MessageSquare className="h-4 w-4" /> Open messages
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FILES */}
        {activeTab === "files" && (
          <div>
            <h2 className="mb-5 text-lg font-semibold text-zinc-900">Files & Deliverables</h2>
            {files.length === 0 ? (
              <div className="rounded border border-dashed border-zinc-200 py-16 text-center">
                <p className="text-sm text-zinc-400">No files shared yet.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-start gap-3 rounded border border-zinc-200 bg-white p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-zinc-100">
                      <FileText className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">{file.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}</p>
                      <a
                        href={`/api/files/${file.projectId}/${encodeURIComponent(file.name)}`}
                        download={file.name}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                      >
                        <Download className="h-3 w-3" /> Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NOTES */}
        {activeTab === "notes" && (
          <div>
            <h2 className="mb-5 text-lg font-semibold text-zinc-900">Notes from your project team</h2>
            <div className="space-y-4">
              {notes.map((note) => {
                const isExpanded = expandedNoteId === note.id;
                const isLong = stripHtml(note.body).length > 300;
                return (
                  <div key={note.id} className="rounded border border-zinc-200 bg-white p-5">
                    {note.title && <p className="mb-2 font-semibold text-zinc-900">{note.title}</p>}
                    <div
                      className={`prose prose-sm max-w-none text-sm text-zinc-600 ${!isExpanded && isLong ? "max-h-32 overflow-hidden" : ""}`}
                      dangerouslySetInnerHTML={{ __html: note.body }}
                    />
                    {isLong && (
                      <button onClick={() => setExpandedNoteId(isExpanded ? null : note.id)} className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        {isExpanded ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Show more</>}
                      </button>
                    )}
                    <p className="mt-3 text-xs text-zinc-400">{formatDate(note.createdAt)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {activeTab === "messages" && (
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-5 text-lg font-semibold text-zinc-900">Messages</h2>
            <div className="rounded border border-zinc-200 bg-white">
              <div className="max-h-[480px] space-y-4 overflow-y-auto p-5">
                {messages.length === 0 && (
                  <p className="py-8 text-center text-sm text-zinc-400">No messages yet. Start the conversation below.</p>
                )}
                {messages.map((c) => (
                  <div key={c.id} className={`flex gap-3 ${c.authorType === "client" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${c.authorType === "freelancer" ? "bg-zinc-900 text-white" : "bg-blue-600 text-white"}`}>
                      {c.authorName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className={`flex max-w-[75%] flex-col ${c.authorType === "client" ? "items-end" : "items-start"}`}>
                      <p className="mb-1 text-xs text-zinc-400">{c.authorName} · {formatDate(c.createdAt)}</p>
                      <div className={`rounded px-3 py-1.5 text-sm ${c.authorType === "freelancer" ? "bg-zinc-100 text-zinc-900" : "bg-blue-600 text-white"}`}>
                        {c.body}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-zinc-100 p-4">
                {!nameEntered ? (
                  <div className="space-y-2">
                    <input className="h-10 w-full rounded border border-zinc-200 px-3 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none" placeholder="Your name..." value={clientName} onChange={(e) => setClientName(e.target.value)} />
                    <button onClick={() => { if (clientName.trim()) { localStorage.setItem("portalClientName", clientName.trim()); setNameEntered(true); } }} disabled={!clientName.trim()} className="w-full rounded bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40">
                      Continue
                    </button>
                  </div>
                ) : (
                  <form onSubmit={sendComment} className="flex gap-2">
                    <input className="h-10 flex-1 rounded border border-zinc-200 px-3 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none" placeholder={`Message as ${clientName}…`} value={body} onChange={(e) => setBody(e.target.value)} />
                    <button type="submit" disabled={sending || !body.trim()} className="flex h-10 w-10 items-center justify-center rounded bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-40">
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* INVOICES */}
        {activeTab === "invoices" && (
          <div>
            <h2 className="mb-5 text-lg font-semibold text-zinc-900">Invoices</h2>
            <div className="space-y-4 max-w-xl">
              {invoices.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)}
            </div>
          </div>
        )}
      </main>

      <footer className="py-10 text-center text-xs text-zinc-400">
        Powered by <Link href="/" className="font-medium text-zinc-600 hover:underline">Solopad</Link>
      </footer>

      <style>{`
        .prose ul { list-style: disc; padding-left: 1.25rem; }
        .prose ol { list-style: decimal; padding-left: 1.25rem; }
        .prose a { color: #2563eb; text-decoration: underline; }
        .prose img { max-width: 100%; border-radius: 4px; }
      `}</style>
    </div>
  );
}
