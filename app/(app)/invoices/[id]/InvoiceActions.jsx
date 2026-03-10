"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Send, Trash2, MoreHorizontal, XCircle, LinkIcon, Pencil
} from "lucide-react";

export default function InvoiceActions({ invoice }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function patch(body) {
    setLoading(true);
    setOpen(false);
    await fetch(`/api/invoices`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: invoice.id, ...body }),
    });
    setLoading(false);
    router.refresh();
  }

  async function del() {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/invoices`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: invoice.id }),
    });
    router.push("/finance?tab=invoices");
  }

  const { status } = invoice;
  const canEdit = status === "draft";

  return (
    <div className="relative flex items-center gap-2">
      {/* Edit — only on drafts */}
      {canEdit && (
        <Link
          href={`/invoices/${invoice.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Link>
      )}

      {/* Mark as sent — only on drafts */}
      {status === "draft" && (
        <button
          onClick={() => patch({ status: "sent" })}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" /> Send
        </button>
      )}

      {/* More menu */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-40 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
            {!canEdit && status !== "cancelled" && (
              <Link
                href={`/invoices/${invoice.id}/edit`}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50"
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
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              <LinkIcon className="h-4 w-4" /> Copy link
            </button>
            {status !== "cancelled" && (
              <button
                onClick={() => patch({ status: "cancelled" })}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50"
              >
                <XCircle className="h-4 w-4" /> Cancel invoice
              </button>
            )}
            <div className="border-t border-zinc-100" />
            <button
              onClick={del}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Delete invoice
            </button>
          </div>
        </>
      )}
    </div>
  );
}
