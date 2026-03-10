"use client";

import { useState } from "react";
import { Download, File, Send, CreditCard, CheckCircle, Zap } from "lucide-react";
import Badge from "@/components/ui/Badge";
import {
  STATUS_LABELS, STATUS_COLORS, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS,
  formatCurrency, formatDate, formatBytes,
} from "@/lib/utils";
import { useRouter } from "next/navigation";

const STATUS_STEPS = ["Not Started", "In Progress", "In Review", "Complete"];
const STATUS_ORDER = ["not_started", "in_progress", "in_review", "complete"];

export default function ClientPortal({ project, files, comments, invoices }) {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [nameEntered, setNameEntered] = useState(false);

  const currentStep = STATUS_ORDER.indexOf(project.status);
  const unpaidInvoices = invoices.filter((i) => i.status !== "paid");

  async function sendComment(e) {
    e.preventDefault();
    if (!body.trim() || !clientName.trim()) return;
    setSending(true);

    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        authorName: clientName,
        authorType: "client",
        body: body.trim(),
      }),
    });

    setBody("");
    setSending(false);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-900">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-zinc-900">PortalKit</span>
          </div>
          <Badge className={STATUS_COLORS[project.status]}>{STATUS_LABELS[project.status]}</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Project info */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h1 className="text-2xl font-bold text-zinc-900">{project.title}</h1>
          {project.description && <p className="mt-2 text-zinc-500">{project.description}</p>}

          <div className="mt-6">
            <div className="mb-2 flex justify-between">
              {STATUS_STEPS.map((step, i) => (
                <span key={step} className={`text-xs font-medium ${i <= currentStep ? "text-zinc-900" : "text-zinc-400"}`}>
                  {step}
                </span>
              ))}
            </div>
            <div className="h-2 rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full bg-zinc-900 transition-all"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Invoice payment */}
        {unpaidInvoices.length > 0 && (
          <div className="rounded-xl border border-zinc-900 bg-zinc-900 p-6 text-white">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <h2 className="font-semibold">Payment due</h2>
            </div>
            {unpaidInvoices.map((invoice) => (
              <InvoicePayBlock key={invoice.id} invoice={invoice} />
            ))}
          </div>
        )}

        {invoices.some((i) => i.status === "paid") && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Invoice paid — thank you!</span>
            </div>
          </div>
        )}

        {/* Files */}
        {files.length > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 font-semibold text-zinc-900">Files & Deliverables</h2>
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-lg border border-zinc-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-100">
                      <File className="h-4 w-4 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{file.name}</p>
                      <p className="text-xs text-zinc-400">{formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}</p>
                    </div>
                  </div>
                  <a
                    href={file.path}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-zinc-900">Comments & Feedback</h2>

          <div className="mb-5 max-h-72 space-y-3 overflow-y-auto">
            {comments.length === 0 && (
              <p className="text-center text-sm text-zinc-400">No comments yet. Leave feedback below.</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className={`flex gap-3 ${c.authorType === "client" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  c.authorType === "freelancer" ? "bg-zinc-900 text-white" : "bg-blue-600 text-white"
                }`}>
                  {c.authorName?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className={`flex max-w-[75%] flex-col ${c.authorType === "client" ? "items-end" : "items-start"}`}>
                  <p className="mb-1 text-xs text-zinc-400">{c.authorName} · {formatDate(c.createdAt)}</p>
                  <div className={`rounded-lg px-3 py-2 text-sm ${
                    c.authorType === "freelancer" ? "bg-zinc-100 text-zinc-900" : "bg-blue-600 text-white"
                  }`}>
                    {c.body}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!nameEntered ? (
            <div className="space-y-2">
              <input
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="Your name to leave a comment..."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
              <button
                onClick={() => clientName.trim() && setNameEntered(true)}
                disabled={!clientName.trim()}
                className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          ) : (
            <form onSubmit={sendComment} className="flex gap-2">
              <input
                className="h-10 flex-1 rounded-lg border border-zinc-200 px-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder={`Reply as ${clientName}...`}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <button
                type="submit"
                disabled={sending || !body.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-zinc-400">
        Powered by <a href="/" className="font-medium text-zinc-500 hover:underline">PortalKit</a>
      </footer>
    </div>
  );
}

function InvoicePayBlock({ invoice }) {
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {invoice.lineItems?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm text-zinc-300">
            <span>{item.description}</span>
            <span>{formatCurrency(parseFloat(item.amount), invoice.currency)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t border-zinc-700 pt-3">
        <span className="font-semibold">Total</span>
        <span className="font-semibold">{formatCurrency(invoice.total, invoice.currency)}</span>
      </div>
      {invoice.dueDate && <p className="text-sm text-zinc-400">Due {formatDate(invoice.dueDate)}</p>}
      <button
        onClick={handlePay}
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-white py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
      >
        {loading ? "Redirecting..." : `Pay ${formatCurrency(invoice.total, invoice.currency)}`}
      </button>
    </div>
  );
}
