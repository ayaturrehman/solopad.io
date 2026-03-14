
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";
import DashboardClient from "./DashboardClient";

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const now = new Date();

  const user = await db.user.findUnique({ where: { id: userId }, select: { businessId: true } });
  const business = user?.businessId
    ? await db.business.findUnique({ where: { id: user.businessId }, select: { currency: true } })
    : null;
  const currency = business?.currency || "USD";

  const [projects, tasks, proposals, contracts, contacts, invoices] = await Promise.all([
    db.project.findMany({
      where: { userId, archived: false },
      orderBy: { updatedAt: "desc" },
      include: { contact: { select: { name: true } } },
      take: 6,
    }),
    db.task.findMany({
      where: { userId, status: { not: "done" } },
      include: { project: { select: { id: true, title: true } } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 6,
    }),
    db.proposal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.contract.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.contact.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.invoice.findMany({
      where: { project: { userId } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const firstName = session.user.name?.split(" ")[0] || "there";
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const activeProjects = projects.filter((p) => p.status !== "complete");
  const openTasks = tasks.filter((t) => t.status !== "done");
  const sentProposals = proposals.filter((p) => p.status === "sent").length;
  const unsignedContracts = contracts.filter((c) => c.status !== "signed").length;
  const openInvoices = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled");
  const outstanding = sum(openInvoices.map((i) => i.total));
  const urgentTasks = openTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) <= new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3)
  ).length;
  const nextProjectDeadline = activeProjects
    .filter((p) => p.endDate)
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))[0];

  // Monthly revenue for sparkline (last 6 months)
  const monthlyRevenue = Array(6).fill(0);
  const monthlyExpenses = Array(6).fill(0);
  const monthNames = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthNames.push(d.toLocaleString("en-US", { month: "short" }));
    const mi = 5 - i;
    invoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt);
        return invDate.getFullYear() === d.getFullYear() && invDate.getMonth() === d.getMonth();
      })
      .forEach((inv) => {
        if (inv.status === "paid") monthlyRevenue[mi] += inv.total;
        else if (inv.status !== "cancelled") monthlyExpenses[mi] += inv.total;
      });
  }

  // Task breakdown
  const taskDone = tasks.filter((t) => t.status === "done").length;
  const taskOpen = openTasks.length;

  // Project status breakdown
  const statusCounts = {
    not_started: projects.filter((p) => p.status === "not_started").length,
    in_progress: projects.filter((p) => p.status === "in_progress").length,
    in_review: projects.filter((p) => p.status === "in_review").length,
    complete: projects.filter((p) => p.status === "complete").length,
  };

  const kpis = [
    { label: "Active projects", value: activeProjects.length, note: `${projects.length} total` },
    { label: "Open tasks", value: openTasks.length, note: urgentTasks ? `${urgentTasks} urgent` : "Nothing urgent" },
    { label: "Proposals out", value: sentProposals, note: `${unsignedContracts} awaiting signature` },
    {
      label: "Outstanding",
      value: formatCurrency(outstanding, currency),
      note: nextProjectDeadline
        ? `Next due ${formatDate(nextProjectDeadline.endDate)}`
        : `${openInvoices.length} unpaid invoices`,
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
      monthlyRevenue={monthlyRevenue}
      monthlyExpenses={monthlyExpenses}
      monthNames={monthNames}
      taskOpen={taskOpen}
      taskDone={taskDone}
      statusCounts={statusCounts}
    />
  );
}
