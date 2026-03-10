export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, ArrowUpRight, FolderOpen, DollarSign, CheckCircle2, ReceiptText } from "lucide-react";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  formatDate,
  formatCurrency,
  cn,
} from "@/lib/utils";

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const now = new Date();
  const fourMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const [projects, tasks, invoices, expenses] = await Promise.all([
    db.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        invoices: { select: { total: true, status: true } },
        contact: { select: { name: true } },
      },
    }),
    db.task.findMany({
      where: { userId },
      include: { project: { select: { id: true, title: true } } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 8,
    }),
    db.invoice.findMany({
      where: { project: { userId } },
      include: { project: { select: { id: true, title: true, clientName: true } } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    }),
    db.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    }),
  ]);

  const activeProjects = projects.filter((project) => project.status !== "complete" && !project.archived);
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");
  const openInvoices = invoices.filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled");
  const overdueInvoices = openInvoices.filter(
    (invoice) => invoice.status === "overdue" || (invoice.dueDate && new Date(invoice.dueDate) < now)
  );
  const focusTasks = tasks.filter((task) => task.status !== "done").slice(0, 5);
  const dueSoonTasks = tasks.filter(
    (task) => task.status !== "done" && task.dueDate && new Date(task.dueDate) <= new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3)
  );
  const cashCollected = sum(paidInvoices.map((invoice) => invoice.total));
  const cashWaiting = sum(openInvoices.map((invoice) => invoice.total));
  const totalExpenses = sum(expenses.map((expense) => expense.amount));
  const netCash = cashCollected - totalExpenses;

  const cashMonths = Array.from({ length: 4 }, (_, index) => {
    const date = new Date(fourMonthsAgo.getFullYear(), fourMonthsAgo.getMonth() + index, 1);
    const label = date.toLocaleString("en-GB", { month: "short" });
    const received = sum(
      paidInvoices
        .filter((invoice) => {
          const invoiceDate = new Date(invoice.paidAt || invoice.createdAt);
          return invoiceDate.getMonth() === date.getMonth() && invoiceDate.getFullYear() === date.getFullYear();
        })
        .map((invoice) => invoice.total)
    );
    const spent = sum(
      expenses
        .filter((expense) => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === date.getFullYear();
        })
        .map((expense) => expense.amount)
    );

    return {
      label,
      received,
      spent,
    };
  });

  const maxCashValue = Math.max(...cashMonths.map((month) => Math.max(month.received, month.spent)), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Daily operating view</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Keep an eye on active work, money waiting to be collected, and what needs action today.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              <Plus className="h-4 w-4" />
              New project
            </Link>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              Open tasks
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Active Projects",
              value: activeProjects.length,
              helper: `${projects.length} total in pipeline`,
              icon: FolderOpen,
              tone: "bg-blue-50 text-blue-700",
            },
            {
              label: "Waiting on Payment",
              value: formatCurrency(cashWaiting),
              helper: `${overdueInvoices.length} overdue invoices`,
              icon: DollarSign,
              tone: "bg-amber-50 text-amber-700",
            },
            {
              label: "Need Attention",
              value: dueSoonTasks.length,
              helper: `${focusTasks.length} open tasks`,
              icon: CheckCircle2,
              tone: "bg-zinc-100 text-zinc-700",
            },
          ].map(({ label, value, helper, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="flex items-center justify-between">
                <div className={cn("rounded-xl p-2.5", tone)}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">{label}</span>
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight text-zinc-900">{value}</p>
              <p className="mt-1 text-sm text-zinc-500">{helper}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Cash Snapshot</p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-900">Money in vs money out</h2>
            </div>
            <p className={cn("text-sm font-semibold", netCash >= 0 ? "text-green-600" : "text-red-500")}>
              {netCash >= 0 ? "+" : ""}
              {formatCurrency(netCash)}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-3">
            {cashMonths.map((month) => (
              <div key={month.label} className="rounded-2xl bg-zinc-50 px-3 py-4">
                <div className="flex h-28 items-end justify-center gap-2">
                  <div
                    className="w-3 rounded-full bg-zinc-900"
                    style={{ height: `${Math.max((month.received / maxCashValue) * 88, month.received ? 10 : 0)}px` }}
                    title={`Received ${formatCurrency(month.received)}`}
                  />
                  <div
                    className="w-3 rounded-full bg-zinc-300"
                    style={{ height: `${Math.max((month.spent / maxCashValue) * 88, month.spent ? 10 : 0)}px` }}
                    title={`Spent ${formatCurrency(month.spent)}`}
                  />
                </div>
                <p className="mt-3 text-center text-xs font-medium text-zinc-500">{month.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Collected</p>
              <p className="mt-2 text-lg font-semibold text-zinc-900">{formatCurrency(cashCollected)}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Outstanding</p>
              <p className="mt-2 text-lg font-semibold text-zinc-900">{formatCurrency(cashWaiting)}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Spent</p>
              <p className="mt-2 text-lg font-semibold text-zinc-900">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Task Focus</p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-900">What to check today</h2>
            </div>
            <Link href="/tasks" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
              View all
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {focusTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center">
                <p className="text-sm text-zinc-400">No open tasks right now.</p>
              </div>
            ) : (
              focusTasks.map((task) => {
                const overdue = task.dueDate && new Date(task.dueDate) < now;

                return (
                  <div key={task.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900">{task.title}</p>
                        <p className="mt-1 text-xs text-zinc-500">{task.project?.title || "General task"}</p>
                      </div>
                      <Badge
                        className={
                          overdue
                            ? "bg-red-100 text-red-700"
                            : task.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-zinc-100 text-zinc-600"
                        }
                      >
                        {overdue ? "Overdue" : task.status.replace("_", " ")}
                      </Badge>
                    </div>
                    {task.dueDate && (
                      <p className={cn("mt-3 text-xs", overdue ? "font-medium text-red-500" : "text-zinc-400")}>
                        Due {formatDate(task.dueDate)}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Active Projects</p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-900">Current delivery work</h2>
            </div>
            <Link href="/projects" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
              View all
            </Link>
          </div>

          {activeProjects.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center">
              <p className="text-sm text-zinc-400">No active projects yet.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {activeProjects.slice(0, 4).map((project) => {
                const openAmount = sum(
                  project.invoices
                    .filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled")
                    .map((invoice) => invoice.total)
                );

                return (
                  <div key={project.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/projects/${project.id}`} className="text-base font-semibold text-zinc-900 hover:underline">
                            {project.title}
                          </Link>
                          <Badge className={STATUS_COLORS[project.status]}>{STATUS_LABELS[project.status]}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                          {project.contact?.name || project.clientName} · Updated {formatDate(project.updatedAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Open value</p>
                        <p className="mt-2 text-sm font-semibold text-zinc-900">{formatCurrency(openAmount)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Invoice Watchlist</p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-900">What needs collecting</h2>
            </div>
            <Link href="/finance?tab=invoices" className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900">
              Open finance <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {openInvoices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center">
                <p className="text-sm text-zinc-400">No open invoices right now.</p>
              </div>
            ) : (
              openInvoices.slice(0, 5).map((invoice) => {
                const overdue = invoice.status === "overdue" || (invoice.dueDate && new Date(invoice.dueDate) < now);

                return (
                  <div key={invoice.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          {invoice.invoiceNumber || `INV-${invoice.id.slice(-6).toUpperCase()}`}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">{invoice.project?.clientName || invoice.project?.title || "-"}</p>
                      </div>
                      <Badge className={overdue ? "bg-red-100 text-red-700" : INVOICE_STATUS_COLORS[invoice.status] || "bg-zinc-100 text-zinc-600"}>
                        {overdue ? "Overdue" : INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className={cn("text-xs", overdue ? "font-medium text-red-500" : "text-zinc-400")}>
                        {invoice.dueDate ? `Due ${formatDate(invoice.dueDate)}` : "No due date"}
                      </span>
                      <span className="font-semibold text-zinc-900">{formatCurrency(invoice.total, invoice.currency)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
