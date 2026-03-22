import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";
import DashboardClient from "./DashboardClient";

export const revalidate = 60;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const now = new Date();

  const urgentDeadline = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const [
    userWithBusiness, projects, openTasks, proposals, contracts, contacts,
    invoiceAgg, projectStatusCounts, sentProposals, unsignedContracts,
    urgentTasks, nextProjectDeadline, taskDone, openInvoiceCount,
  ] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { business: { select: { currency: true } } } }),
    db.project.findMany({
      where: { userId, archived: false, status: { not: "complete" } },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, status: true, stage: true, endDate: true, updatedAt: true, contact: { select: { name: true } } },
      take: 6,
    }),
    db.task.findMany({
      where: { userId, status: { not: "done" } },
      select: { id: true, title: true, status: true, priority: true, dueDate: true, project: { select: { id: true, title: true } } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 6,
    }),
    db.proposal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, createdAt: true },
      take: 4,
    }),
    db.contract.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, createdAt: true },
      take: 4,
    }),
    db.contact.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, company: true, createdAt: true },
      take: 5,
    }),
    // DB-level aggregate for outstanding total instead of fetching 20 invoices
    db.invoice.aggregate({
      where: { project: { userId }, status: { notIn: ["paid", "cancelled"] } },
      _sum: { total: true },
    }),
    // DB-level groupBy for project status counts instead of 4x .filter().length
    db.project.groupBy({
      by: ["status"],
      where: { userId, archived: false },
      _count: { _all: true },
    }),
    // DB-level count for sent proposals
    db.proposal.count({ where: { userId, status: "sent" } }),
    // DB-level count for unsigned contracts
    db.contract.count({ where: { userId, status: { not: "signed" } } }),
    // DB-level count for urgent tasks (due within 3 days)
    db.task.count({ where: { userId, status: { not: "done" }, dueDate: { lte: urgentDeadline } } }),
    // DB-level query for next project deadline
    db.project.findFirst({
      where: { userId, archived: false, status: { not: "complete" }, endDate: { not: null } },
      orderBy: { endDate: "asc" },
      select: { endDate: true },
    }),
    // DB-level count for completed tasks
    db.task.count({ where: { userId, status: "done" } }),
    // DB-level count for open invoices
    db.invoice.count({ where: { project: { userId }, status: { notIn: ["paid", "cancelled"] } } }),
  ]);

  const currency = userWithBusiness?.business?.currency || "USD";
  const firstName = session.user.name?.split(" ")[0] || "there";
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const activeProjects = projects; // already filtered at DB level (status !== "complete")
  const outstanding = invoiceAgg._sum.total || 0;
  const taskOpen = openTasks.length;

  // Convert groupBy result to status counts object
  const statusCounts = { not_started: 0, in_progress: 0, in_review: 0, complete: 0 };
  for (const row of projectStatusCounts) {
    if (row.status in statusCounts) statusCounts[row.status] = row._count._all;
  }

  const totalProjectCount = Object.values(statusCounts).reduce((s, c) => s + c, 0);
  const kpis = [
    { label: "Active projects", value: activeProjects.length, note: `${totalProjectCount} total` },
    { label: "Open tasks", value: openTasks.length, note: urgentTasks ? `${urgentTasks} urgent` : "Nothing urgent" },
    { label: "Proposals out", value: sentProposals, note: `${unsignedContracts} awaiting signature` },
    {
      label: "Outstanding",
      value: formatCurrency(outstanding, currency),
      note: nextProjectDeadline?.endDate
        ? `Next due ${formatDate(nextProjectDeadline.endDate)}`
        : `${openInvoiceCount} unpaid invoices`,
    },
  ];

  const proposalStatus = {
    draft: "bg-zinc-100 text-zinc-600",
    sent: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
  };

  const contractStatus = {
    draft: "bg-zinc-100 text-zinc-600",
    sent: "bg-blue-100 text-blue-700",
    signed: "bg-green-100 text-green-700",
  };

  return (
    <DashboardClient
      greeting={greeting}
      firstName={firstName}
      dateLabel={dateLabel}
      kpis={kpis}
      activeProjects={activeProjects}
      openTasks={openTasks}
      contacts={contacts}
      proposals={proposals}
      contracts={contracts}
      proposalStatus={proposalStatus}
      contractStatus={contractStatus}
      currency={currency}
      now={now.toISOString()}
      taskOpen={taskOpen}
      taskDone={taskDone}
      statusCounts={statusCounts}
    />
  );
}
