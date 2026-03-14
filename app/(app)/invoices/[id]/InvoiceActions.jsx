"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Send, Trash2, MoreHorizontal, XCircle, LinkIcon, Pencil, Download
} from "lucide-react";

export default function InvoiceActions({ invoice }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function patch(body) {
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update invoice.");
        return;
      }
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    const res = await fetch(`/api/pdf/invoice/${invoice.id}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoice.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function del() {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete invoice.");
        setLoading(false);
        return;
      }
      router.push("/finance?tab=invoices");
    } catch {
      alert("Network error. Please try again.");
      setLoading(false);
    }
  }

  const { status } = invoice;
  const canEdit = status === "draft";

  return (
    <div className="relative flex items-center gap-2">
      {/* Download PDF */}
      <button
        onClick={downloadPdf}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
      >
        <Download className="h-3.5 w-3.5" /> PDF
      </button>

      {/* Edit — only on drafts */}
      {canEdit && (
        <Link
          href={`/invoices/${invoice.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Link>
      )}

      {/* Mark as sent — only on drafts */}
      {status === "draft" && (
        <button
          onClick={() => patch({ status: "sent" })}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" /> Send
        </button>
      )}

      {/* More menu */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-40 w-52 overflow-hidden rounded border border-zinc-200 bg-white shadow-lg">
            {!canEdit && status !== "cancelled" && (
              <Link
                href={`/invoices/${invoice.id}/edit`}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                onClick={() => setOpen(false)}
              >
                <Pencil className="h-4 w-4" /> Edit invoice
              </Link>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              <LinkIcon className="h-4 w-4" /> Copy link
            </button>
            {status !== "cancelled" && (
              <button
                onClick={() => patch({ status: "cancelled" })}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
              >
                <XCircle className="h-4 w-4" /> Cancel invoice
              </button>
            )}
            <div className="border-t border-zinc-100" />
            <button
              onClick={del}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Delete invoice
            </button>
          </div>
        </>
      )}
    </div>
  );
}
