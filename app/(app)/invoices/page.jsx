export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import InvoicesClient from "./InvoicesClient";

export default async function InvoicesPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [invoices, projects] = await Promise.all([
    db.invoice.findMany({
      where: { project: { userId: session.user.id } },
      include: {
        project: { select: { id: true, title: true, clientName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.project.findMany({
      where: { userId: session.user.id, archived: false },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  // Summary totals
  const totals = {
    paid:    invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || 0), 0),
    sent:    invoices.filter(i => i.status === "sent").reduce((s, i) => s + (i.total || 0), 0),
    overdue: invoices.filter(i => i.status === "overdue").reduce((s, i) => s + (i.total || 0), 0),
    draft:   invoices.filter(i => i.status === "draft").length,
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Invoices</h1>
        <p className="mt-1 text-sm text-zinc-500">Track and manage all your invoices in one place.</p>
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Collected</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{formatCurrency(totals.paid)}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Outstanding</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{formatCurrency(totals.sent)}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Overdue</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{formatCurrency(totals.overdue)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Drafts</p>
          <p className="mt-1 text-2xl font-bold text-zinc-700">{totals.draft}</p>
        </div>
      </div>

      <InvoicesClient invoices={invoices} projects={projects} />
    </div>
  );
}
