
import Link from "next/link";
import { ChevronRight, Plus, CheckSquare, Briefcase, UserPlus, FileText, FileSignature, Clock3 } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { STATUS_LABELS, STATUS_COLORS, formatDate, formatCurrency, cn } from "@/lib/utils";

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function StatusBadge({ className, children }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", className)}>{children}</span>;
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

  const activeProjects = projects.filter((project) => project.status !== "complete");
  const openTasks = tasks.filter((task) => task.status !== "done");
  const sentProposals = proposals.filter((proposal) => proposal.status === "sent").length;
  const unsignedContracts = contracts.filter((contract) => contract.status !== "signed").length;
  const openInvoices = invoices.filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled");
  const outstanding = sum(openInvoices.map((invoice) => invoice.total));
  const urgentTasks = openTasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) <= new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3)
  ).length;
  const nextProjectDeadline = activeProjects
    .filter((project) => project.endDate)
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))[0];

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

  const quickActions = [
    { href: "/contacts/new", label: "Contact", icon: UserPlus },
    { href: "/projects/new", label: "Project", icon: Briefcase },
    { href: "/proposals/new", label: "Proposal", icon: FileText },
    { href: "/contracts", label: "Contract", icon: FileSignature },
    { href: "/tasks", label: "Task", icon: CheckSquare },
    { href: "/time-tracker", label: "Time entry", icon: Clock3 },
  ];

  return (
    <div className="space-y-5 px-4 py-4 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl tracking-tight text-zinc-900">{greeting}, {firstName}</p>
          <p className="mt-1 text-sm text-zinc-400">
            {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active projects", value: activeProjects.length, note: `${projects.length} total` },
          { label: "Open tasks", value: openTasks.length, note: urgentTasks ? `${urgentTasks} urgent` : "Nothing urgent" },
          { label: "Proposals out", value: sentProposals, note: `${unsignedContracts} awaiting signature` },
          {
            label: "Outstanding",
            value: formatCurrency(outstanding, currency),
            note: nextProjectDeadline ? `Next due ${formatDate(nextProjectDeadline.endDate)}` : `${openInvoices.length} unpaid invoices`,
          },
        ].map((item) => (
          <div key={item.label} className="rounded border border-zinc-200 bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{item.label}</p>
            <p className="mt-2 text-2xl md:text-3xl tracking-tight text-zinc-900">{item.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[220px_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
        <div className="rounded border border-zinc-200 bg-white px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">Create new</p>
          </div>
          <div className="space-y-2">
            {quickActions.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between rounded border border-zinc-200 px-4 py-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-zinc-400" />
                  {label}
                </span>
                <Plus className="h-3.5 w-3.5 text-zinc-400" />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded border border-zinc-200 bg-white px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Projects</p>
              <p className="mt-1 text-xs text-zinc-400">Current work with status and nearest due date</p>
            </div>
            <Link href="/projects" className="text-xs text-zinc-400 hover:text-zinc-700">
              View all
            </Link>
          </div>

          {activeProjects.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400">No active projects yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {activeProjects.map((project) => {
                const dueDate = project.endDate ? new Date(project.endDate) : null;
                const overdue = dueDate && dueDate < now && project.status !== "complete";

                return (
                  <div key={project.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link href={`/projects/${project.id}`} className="block truncate text-sm font-medium text-zinc-900 hover:underline">
                        {project.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-zinc-400">{project.contact?.name || project.clientName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge className={STATUS_COLORS[project.status]}>{STATUS_LABELS[project.status]}</StatusBadge>
                      <span className={cn("shrink-0 text-[11px] font-medium", overdue ? "text-red-500" : "text-zinc-400")}>
                        {dueDate ? `Due ${formatDate(dueDate)}` : `Updated ${formatDate(project.updatedAt)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded border border-zinc-200 bg-white px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Tasks</p>
              <p className="mt-1 text-xs text-zinc-400">What needs attention today</p>
            </div>
            <Link href="/tasks" className="text-xs text-zinc-400 hover:text-zinc-700">
              View all
            </Link>
          </div>

          {openTasks.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400">All clear. No open tasks.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {openTasks.slice(0, 4).map((task) => {
                const overdue = task.dueDate && new Date(task.dueDate) < now;

                return (
                  <div key={task.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">{task.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{task.project?.title || "General task"}</p>
                    </div>
                    {task.dueDate ? (
                      <span className={cn("shrink-0 text-[11px] font-medium", overdue ? "text-red-500" : "text-zinc-400")}>
                        {overdue ? "Overdue" : formatDate(task.dueDate)}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded border border-zinc-200 bg-white px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Contacts</p>
              <p className="mt-1 text-xs text-zinc-400">Recently added contacts</p>
            </div>
            <Link href="/contacts" className="text-xs text-zinc-400 hover:text-zinc-700">
              View all
            </Link>
          </div>

          {contacts.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400">No contacts yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link href={`/contacts/${contact.id}`} className="block truncate text-sm font-medium text-zinc-900 hover:underline">
                      {contact.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-zinc-400">{contact.company || contact.email || "-"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded border border-zinc-200 bg-white px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Documents</p>
            <p className="mt-1 text-xs text-zinc-400">Recent proposals and contracts</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Proposals</p>
            {proposals.length === 0 ? (
              <p className="text-xs text-zinc-400">No proposals yet.</p>
            ) : (
              <div className="space-y-2">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="flex items-center justify-between gap-2 border border-zinc-100 px-3 py-1.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">{proposal.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{proposal.clientName}</p>
                    </div>
                    <StatusBadge className={proposalStatus[proposal.status] || proposalStatus.draft}>{proposal.status}</StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Contracts</p>
            {contracts.length === 0 ? (
              <p className="text-xs text-zinc-400">No contracts yet.</p>
            ) : (
              <div className="space-y-2">
                {contracts.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between gap-2 border border-zinc-100 px-3 py-1.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">{contract.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{contract.clientName}</p>
                    </div>
                    <StatusBadge className={contractStatus[contract.status] || contractStatus.draft}>{contract.status}</StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Link href="/proposals" className="mt-4 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700">
          Open documents <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
