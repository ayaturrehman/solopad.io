
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Send, Clock, XCircle, FileText,
  Building2, Mail, Calendar, Hash, CreditCard
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import InvoiceActions from "./InvoiceActions";

const STATUS_CONFIG = {
  draft:     { label: "Draft",     color: "bg-zinc-100 text-zinc-600",   icon: FileText },
  sent:      { label: "Sent",      color: "bg-blue-100 text-blue-700",   icon: Send },
  paid:      { label: "Paid",      color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  overdue:   { label: "Overdue",   color: "bg-red-100 text-red-700",     icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-zinc-100 text-zinc-400",   icon: XCircle },
};

export default async function InvoiceDetailPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const invoice = await db.invoice.findFirst({
    where: { id },
    include: {
      project: {
        select: {
          id: true, title: true, clientName: true, clientEmail: true,
          userId: true, contact: { select: { name: true, email: true, company: true } },
        },
      },
      paymentPlans: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!invoice || invoice.project.userId !== session.user.id) redirect("/finance?tab=invoices");

  const lineItems = typeof invoice.lineItems === "string"
    ? JSON.parse(invoice.lineItems)
    : invoice.lineItems || [];

  const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;

  return (
    <div className="px-4 py-4 md:px-6 mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/finance?tab=invoices" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" /> All invoices
        </Link>
        <InvoiceActions invoice={{ id: invoice.id, status: invoice.status, projectId: invoice.project.id }} />
      </div>

      {/* Invoice document */}
      <div className="overflow-hidden rounded border border-zinc-200 bg-white shadow-sm">
        <div className={`h-1.5 w-full ${invoice.status === "paid" ? "bg-green-400" : invoice.status === "overdue" ? "bg-red-400" : invoice.status === "sent" ? "bg-blue-400" : "bg-zinc-200"}`} />

        <div className="p-6 md:p-10">
          {/* Header row */}
          <div className="mb-10 flex items-start justify-between gap-6">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded bg-zinc-900">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="mt-4 text-3xl font-bold text-zinc-900">Invoice</h1>
              {invoice.invoiceNumber && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                  <Hash className="h-3.5 w-3.5" /> {invoice.invoiceNumber}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${status.color}`}>
                <StatusIcon className="h-4 w-4" />
                {status.label}
              </span>
              <p className="mt-3 text-2xl font-bold text-zinc-900">{formatCurrency(invoice.total, invoice.currency)}</p>
            </div>
          </div>

          {/* From / To */}
          <div className="mb-10 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Billed to</p>
              <p className="font-semibold text-zinc-900">{invoice.project.clientName}</p>
              {invoice.project.clientEmail && (
                <p className="flex items-center gap-1.5 text-sm text-zinc-500">
                  <Mail className="h-3.5 w-3.5" />{invoice.project.clientEmail}
                </p>
              )}
              {invoice.project.contact?.company && (
                <p className="flex items-center gap-1.5 text-sm text-zinc-500">
                  <Building2 className="h-3.5 w-3.5" />{invoice.project.contact.company}
                </p>
              )}
            </div>
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Invoice details</p>
              <div className="space-y-1.5 text-sm text-zinc-600">
                <p className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  Issued: {formatDate(invoice.createdAt)}
                </p>
                {invoice.dueDate && (
                  <p className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    Due: <span className={invoice.status === "overdue" ? "font-medium text-red-600" : ""}>{formatDate(invoice.dueDate)}</span>
                  </p>
                )}
                <p className="text-zinc-500">
                  Project:{" "}
                  <Link href={`/projects/${invoice.project.id}`} className="text-zinc-800 underline underline-offset-2 hover:text-zinc-900">
                    {invoice.project.title}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="mb-8 overflow-x-auto rounded border border-zinc-100">
            <table className="w-full min-w-[400px]">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Description</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Qty</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Rate</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {lineItems.map((item, i) => {
                  const qty = parseFloat(item.quantity) || 1;
                  const rate = parseFloat(item.rate || item.amount / (qty || 1)) || 0;
                  const amt = parseFloat(item.amount) || 0;
                  return (
                    <tr key={i}>
                      <td className="px-4 py-3 text-sm text-zinc-800">{item.description}</td>
                      <td className="px-4 py-3 text-right text-sm text-zinc-500">{qty}</td>
                      <td className="px-4 py-3 text-right text-sm text-zinc-500">{formatCurrency(rate, invoice.currency)}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-zinc-800">{formatCurrency(amt, invoice.currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals block */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal ?? invoice.total, invoice.currency)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-zinc-500">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span>+{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>
              )}
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-zinc-500">
                  <span>Discount ({invoice.discountType === "percent" ? `${invoice.discountValue}%` : "Fixed"})</span>
                  <span className="text-red-500">-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold">
                <span className="text-zinc-900">Total</span>
                <span>{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
              {invoice.paidAt && (
                <div className="flex justify-between text-green-600">
                  <span>Paid on</span>
                  <span>{formatDate(invoice.paidAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Plan Milestones */}
          {invoice.paymentPlans && invoice.paymentPlans.length > 0 && (
            <div className="mt-8 rounded border border-zinc-100 overflow-hidden">
              <div className="flex items-center gap-2 bg-zinc-50 px-4 py-3 border-b border-zinc-100">
                <CreditCard className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Payment Schedule</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-100">
                  <tr>
                    <th className="px-3 py-1.5.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">#</th>
                    <th className="px-3 py-1.5.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Milestone</th>
                    <th className="px-3 py-1.5.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Due Date</th>
                    <th className="px-3 py-1.5.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Status</th>
                    <th className="px-3 py-1.5.5 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {invoice.paymentPlans.map((plan, i) => {
                    const isOverdue = plan.status === "overdue" || (
                      plan.status === "upcoming" && plan.dueDate && new Date(plan.dueDate) < new Date()
                    );
                    const isPaid = plan.status === "paid";
                    return (
                      <tr key={plan.id} className="hover:bg-zinc-50/60">
                        <td className="px-4 py-3 text-zinc-400">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-zinc-800">
                          {plan.label || `Installment ${i + 1}`}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {plan.dueDate ? (
                            <span className={isOverdue && !isPaid ? "font-medium text-red-600" : ""}>
                              {new Date(plan.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          ) : (
                            <span className="text-zinc-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                              <CheckCircle2 className="h-3 w-3" /> Paid
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">
                              <Clock className="h-3 w-3" /> Overdue
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-500">
                              <Clock className="h-3 w-3" /> Upcoming
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-zinc-900">
                          {formatCurrency(plan.amount, invoice.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t border-zinc-200 bg-zinc-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-zinc-500">Total scheduled</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-zinc-900">
                      {formatCurrency(invoice.paymentPlans.reduce((s, p) => s + p.amount, 0), invoice.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 rounded bg-zinc-50 p-5">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Notes</p>
              <p className="whitespace-pre-wrap text-sm text-zinc-600">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
