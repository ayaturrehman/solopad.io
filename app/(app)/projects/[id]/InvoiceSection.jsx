"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Bell, CheckCircle2, ArrowRight, ReceiptText } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "@/lib/utils";

export default function InvoiceSection({ projectId, invoices }) {
  const router = useRouter();

  const parsedInvoices = invoices.map((inv) => ({
    ...inv,
    lineItems: typeof inv.lineItems === "string" ? JSON.parse(inv.lineItems) : inv.lineItems,
  }));

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="font-semibold text-zinc-900">Invoices</h2>
        <Link
          href={`/invoices/new?projectId=${projectId}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900"
        >
          <Plus className="h-3.5 w-3.5" />
          New invoice
        </Link>
      </CardHeader>
      <CardBody className="space-y-4">
        {parsedInvoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 py-8 text-center">
            <ReceiptText className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
            <p className="text-sm text-zinc-400">No invoices yet</p>
            <Link
              href={`/invoices/new?projectId=${projectId}`}
              className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              Create first invoice <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          parsedInvoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} onRefresh={() => router.refresh()} />
          ))
        )}
      </CardBody>
    </Card>
  );
}

function InvoiceCard({ invoice, onRefresh }) {
  const [loading, setLoading] = useState(false);

  async function markPaid() {
    setLoading(true);
    await fetch("/api/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: invoice.id, status: "paid", paidAt: new Date().toISOString() }),
    });
    setLoading(false);
    onRefresh();
  }

  async function deleteInvoice() {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    setLoading(true);
    await fetch("/api/invoices", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: invoice.id }),
    });
    setLoading(false);
    onRefresh();
  }

  const isPaid = invoice.status === "paid";

  return (
    <div className="space-y-3 rounded-lg border border-zinc-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/invoices/${invoice.id}`}
            className="text-sm font-semibold text-zinc-900 hover:text-blue-600 hover:underline"
          >
            {formatCurrency(invoice.total, invoice.currency)}
          </Link>
          {invoice.invoiceNumber && (
            <span className="ml-2 text-xs text-zinc-400">#{invoice.invoiceNumber}</span>
          )}
        </div>
        <Badge className={INVOICE_STATUS_COLORS[invoice.status] || "bg-zinc-100 text-zinc-600"}>
          {INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
        </Badge>
      </div>

      {invoice.dueDate && (
        <p className="text-xs text-zinc-400">Due {formatDate(invoice.dueDate)}</p>
      )}
      {invoice.paidAt && (
        <p className="text-xs text-green-600">Paid {formatDate(invoice.paidAt)}</p>
      )}

      <div className="space-y-1">
        {invoice.lineItems?.map((item, i) => (
          <div key={i} className="flex justify-between text-xs text-zinc-500">
            <span>{item.description}</span>
            <span>{formatCurrency(parseFloat(item.amount), invoice.currency)}</span>
          </div>
        ))}
      </div>

      {invoice.notes && (
        <p className="rounded bg-zinc-50 px-2 py-1.5 text-xs text-zinc-500">{invoice.notes}</p>
      )}

      {invoice.remindersEnabled && !isPaid && (
        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <Bell className="h-3 w-3" /> Reminders active
        </div>
      )}

      <div className="flex gap-2 border-t border-zinc-100 pt-3">
        <Link
          href={`/invoices/${invoice.id}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <ArrowRight className="h-3.5 w-3.5" /> View
        </Link>
        {!isPaid && (
          <button
            onClick={markPaid}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            Mark paid
          </button>
        )}
        {!isPaid && (
          <button
            onClick={deleteInvoice}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
