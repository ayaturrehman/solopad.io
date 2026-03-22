
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  FolderOpen,
  History,
  Info,
  ListTodo,
  NotebookPen,
  Receipt,
  FileSignature,
  ScrollText,
  ExternalLink,
  Plus,
  User,
  Clock,
} from "lucide-react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import ProjectHeader from "./ProjectHeader";
import FilesSection from "./FilesSection";
import ProjectTasksSection from "./ProjectTasksSection";
import NotesSection from "./NotesSection";
import MessagesSection from "./MessagesSection";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/utils";
import { normalizeTask } from "@/lib/tasks";
import SanitizedHtml from "./SanitizedHtml";

const TABS = ["overview", "files", "activity", "tasks", "notes", "messages", "details"];

const TASK_STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const PROPOSAL_STATUS_LABELS = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
};

const PROPOSAL_STATUS_COLORS = {
  draft: "bg-zinc-100 text-zinc-600",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
};

const CONTRACT_STATUS_LABELS = {
  draft: "Draft",
  sent: "Sent",
  signed: "Signed",
  expired: "Expired",
  cancelled: "Cancelled",
};

const CONTRACT_STATUS_COLORS = {
  draft: "bg-zinc-100 text-zinc-600",
  sent: "bg-blue-100 text-blue-700",
  signed: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-zinc-100 text-zinc-400",
};

function getTabHref(projectId, tab) {
  return tab === "overview" ? `/projects/${projectId}` : `/projects/${projectId}?tab=${tab}`;
}

function formatDuration(seconds) {
  if (!seconds) return "0h";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (!hours) return `${minutes}m`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function StatCard({ label, value, note, accent }) {
  return (
    <div className="rounded border border-zinc-200 bg-white px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className={`mt-2 text-2xl font-medium tracking-tight ${accent || "text-zinc-900"}`}>{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{note}</p>
    </div>
  );
}

function EmptyState({ label }) {
  return <p className="py-8 text-center text-sm text-zinc-400">{label}</p>;
}

const ACTIVITY_TYPE_COLORS = {
  Note:    "bg-violet-100 text-violet-600",
  File:    "bg-blue-100 text-blue-600",
  Invoice: "bg-amber-100 text-amber-600",
  Task:    "bg-green-100 text-green-600",
};

function ActivityFeed({ items }) {
  if (!items.length) return <EmptyState label="No recent activity yet." />;

  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4">
          <p className="hidden w-24 shrink-0 pt-0.5 text-right text-xs text-zinc-400 sm:block">
            {formatDate(item.date)}
          </p>
          <div className="flex shrink-0 flex-col items-center">
            <div className={`z-10 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${ACTIVITY_TYPE_COLORS[item.type] || "bg-zinc-100 text-zinc-500"}`}>
              {item.type[0]}
            </div>
            <div className="mt-1 w-px flex-1 bg-zinc-200" />
          </div>
          <div className="min-w-0 flex-1 pb-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium text-zinc-900">{item.title}</p>
              <p className="shrink-0 text-xs text-zinc-400 sm:hidden">{formatDate(item.date)}</p>
            </div>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">{item.type}</p>
            {item.detail ? <p className="mt-1 text-sm text-zinc-500">{item.detail}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProposalsCard({ proposals, projectId }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-zinc-400" />
          <h2 className="font-semibold text-zinc-900">Proposals</h2>
          {proposals.length > 0 && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">{proposals.length}</span>
          )}
        </div>
        <Link
          href={`/proposals/new?projectId=${projectId}`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
        >
          <Plus className="h-3 w-3" />
          New
        </Link>
      </CardHeader>
      <CardBody className="p-0">
        {proposals.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-zinc-400">No proposals linked yet.</p>
            <Link href={`/proposals/new?projectId=${projectId}`} className="mt-2 inline-block text-xs text-blue-600 hover:underline">
              Create a proposal
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {proposals.map((p) => (
              <Link
                key={p.id}
                prefetch={false}
                href={`/proposals/${p.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{p.title}</p>
                  <p className="text-xs text-zinc-400">
                    {formatCurrency(p.total, p.currency)}
                    {p.sentAt && <> · Sent {formatDate(p.sentAt)}</>}
                    {!p.sentAt && p.createdAt && <> · {formatDate(p.createdAt)}</>}
                  </p>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-2">
                  <Badge className={PROPOSAL_STATUS_COLORS[p.status] || "bg-zinc-100 text-zinc-600"}>
                    {PROPOSAL_STATUS_LABELS[p.status] || p.status}
                  </Badge>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function ContractsCard({ contracts, projectId }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSignature className="h-4 w-4 text-zinc-400" />
          <h2 className="font-semibold text-zinc-900">Contracts</h2>
          {contracts.length > 0 && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">{contracts.length}</span>
          )}
        </div>
        <Link
          href={`/contracts/new?projectId=${projectId}`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
        >
          <Plus className="h-3 w-3" />
          New
        </Link>
      </CardHeader>
      <CardBody className="p-0">
        {contracts.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-zinc-400">No contracts linked yet.</p>
            <Link href={`/contracts/new?projectId=${projectId}`} className="mt-2 inline-block text-xs text-blue-600 hover:underline">
              Create a contract
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {contracts.map((c) => (
              <Link
                key={c.id}
                prefetch={false}
                href={`/contracts/${c.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{c.title}</p>
                  <p className="text-xs text-zinc-400">
                    {c.signedAt ? `Signed ${formatDate(c.signedAt)}` : c.sentAt ? `Sent ${formatDate(c.sentAt)}` : formatDate(c.createdAt)}
                  </p>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-2">
                  <Badge className={CONTRACT_STATUS_COLORS[c.status] || "bg-zinc-100 text-zinc-600"}>
                    {CONTRACT_STATUS_LABELS[c.status] || c.status}
                  </Badge>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function InvoicesCard({ invoices, outstanding }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-zinc-400" />
          <h2 className="font-semibold text-zinc-900">Invoices</h2>
          {invoices.length > 0 && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">{invoices.length}</span>
          )}
        </div>
        {outstanding > 0 && (
          <span className="text-xs font-medium text-red-500">{formatCurrency(outstanding)} due</span>
        )}
      </CardHeader>
      <CardBody className="p-0">
        {invoices.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-zinc-400">No invoices yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {invoices.slice(0, 5).map((inv) => (
              <Link
                key={inv.id}
                prefetch={false}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {inv.invoiceNumber || `INV-${inv.id.slice(-6).toUpperCase()}`}
                  </p>
                  <p className="text-xs text-zinc-400">{formatDate(inv.createdAt)}</p>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-3">
                  <span className="text-sm font-medium text-zinc-700">{formatCurrency(inv.total, inv.currency)}</span>
                  <Badge className={INVOICE_STATUS_COLORS[inv.status] || "bg-zinc-100 text-zinc-600"}>
                    {INVOICE_STATUS_LABELS[inv.status] || inv.status}
                  </Badge>
                </div>
              </Link>
            ))}
            {invoices.length > 5 && (
              <p className="px-4 py-2.5 text-xs text-zinc-400">+{invoices.length - 5} more invoices</p>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function OverviewPanel({ project, tasks, files, invoices, proposals, contracts, outstanding, totalLoggedSeconds, notes }) {
  const openTasks = tasks.filter((task) => task.status !== "done");
  const doneTasks = tasks.filter((task) => task.status === "done");
  const dueTask = openTasks
    .filter((task) => task.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
  const recentFile = files[0];
  const latestNote = notes[0];
  const progress = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  const daysLeft = project.endDate
    ? Math.ceil((new Date(project.endDate) - new Date()) / 86400000)
    : null;
  const deadlineLabel = daysLeft === null ? "No deadline"
    : daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue`
    : daysLeft === 0 ? "Due today"
    : daysLeft <= 7 ? `${daysLeft}d left`
    : formatDate(project.endDate);
  const deadlineAccent = daysLeft !== null && daysLeft < 0 ? "text-red-500"
    : daysLeft !== null && daysLeft <= 7 ? "text-amber-600"
    : undefined;

  return (
    <div className="space-y-6">
      {/* stat row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Status"
          value={STATUS_LABELS[project.status] || project.status}
          note={`Stage: ${project.stage.replaceAll("_", " ")}`}
        />
        <StatCard
          label="Deadline"
          value={deadlineLabel}
          note={project.startDate ? `Started ${formatDate(project.startDate)}` : "No start date"}
          accent={deadlineAccent}
        />
        <StatCard
          label="Open tasks"
          value={openTasks.length}
          note={dueTask?.dueDate ? `Next due ${formatDate(dueTask.dueDate)}` : "No upcoming deadline"}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(outstanding)}
          note={invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled").length
            ? `${invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled").length} unpaid invoices`
            : "All invoices settled"}
          accent={outstanding > 0 ? "text-red-500" : undefined}
        />
      </div>

      {/* main grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* left column */}
        <div className="space-y-5">
          {/* about */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900">About</h2>
              {project.contactId && (
                <Link href={`/contacts/${project.contactId}`} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700">
                  <User className="h-3.5 w-3.5" />
                  {project.contact?.name}
                </Link>
              )}
            </CardHeader>
            <CardBody>
              <p className="text-sm leading-6 text-zinc-500">
                {project.description || <span className="italic text-zinc-300">No description added.</span>}
              </p>
              <dl className="mt-4 divide-y divide-zinc-100">
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-xs text-zinc-400">Client</dt>
                  <dd className="text-sm font-medium text-zinc-900">
                    {project.contactId ? (
                      <Link href={`/contacts/${project.contactId}`} className="hover:underline">
                        {project.contact?.name || "—"}
                      </Link>
                    ) : project.contact?.name || "—"}
                  </dd>
                </div>
                {project.contact?.email && (
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-xs text-zinc-400">Email</dt>
                    <dd className="text-sm text-zinc-600">{project.contact.email}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-xs text-zinc-400">Time logged</dt>
                  <dd className="flex items-center gap-1.5 text-sm font-medium text-zinc-900">
                    <Clock className="h-3.5 w-3.5 text-zinc-300" />
                    {formatDuration(totalLoggedSeconds)}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-xs text-zinc-400">Files</dt>
                  <dd className="text-sm font-medium text-zinc-900">{files.length}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* proposals */}
          <ProposalsCard proposals={proposals} projectId={project.id} />

          {/* contracts */}
          <ContractsCard contracts={contracts} projectId={project.id} />

          {/* task progress */}
          {tasks.length > 0 && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900">Task progress</h2>
                <Link href={getTabHref(project.id, "tasks")} className="text-xs text-zinc-400 hover:text-zinc-700">
                  View all
                </Link>
              </CardHeader>
              <CardBody>
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-zinc-500">{doneTasks.length} of {tasks.length} done</span>
                  <span className="font-semibold text-zinc-900">{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {dueTask && (
                  <p className="mt-3 text-xs text-zinc-400">
                    Next: <span className="font-medium text-zinc-700">{dueTask.title}</span>
                    {dueTask.dueDate && <> · due {formatDate(dueTask.dueDate)}</>}
                  </p>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        {/* right column */}
        <div className="space-y-5">
          {/* invoices */}
          <InvoicesCard invoices={invoices} outstanding={outstanding} />

          {/* latest note */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <NotebookPen className="h-4 w-4 text-zinc-400" />
                <h2 className="font-semibold text-zinc-900">Latest note</h2>
              </div>
              <Link href={getTabHref(project.id, "notes")} className="text-xs text-zinc-400 hover:text-zinc-700">
                All notes
              </Link>
            </CardHeader>
            <CardBody>
              {latestNote ? (
                <div>
                  {latestNote.title && <p className="mb-1 text-sm font-medium text-zinc-800">{latestNote.title}</p>}
                  <SanitizedHtml html={latestNote.body} className="text-sm leading-6 text-zinc-600 line-clamp-4" />
                  <p className="mt-3 text-xs text-zinc-400">{formatDate(latestNote.createdAt)}</p>
                </div>
              ) : (
                <p className="text-sm text-zinc-400">No notes added yet.</p>
              )}
            </CardBody>
          </Card>

          {/* recent files */}
          {files.length > 0 && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-zinc-400" />
                  <h2 className="font-semibold text-zinc-900">Recent files</h2>
                </div>
                <Link href={getTabHref(project.id, "files")} className="text-xs text-zinc-400 hover:text-zinc-700">
                  All files
                </Link>
              </CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-zinc-100">
                  {files.slice(0, 4).map((f) => (
                    <div key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                      <FileText className="h-4 w-4 shrink-0 text-zinc-300" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-zinc-700">{f.name}</p>
                        <p className="text-xs text-zinc-400">{formatDate(f.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailsPanel({ project, invoices, files, notes, totalLoggedSeconds, portalUrl }) {
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");
  const unpaidInvoices = invoices.filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled");

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-zinc-900">Project details</h2>
        </CardHeader>
        <CardBody>
          <dl className="divide-y divide-zinc-100">
            <DetailRow icon={Info} label="Status" value={STATUS_LABELS[project.status] || project.status} />
            <DetailRow icon={Info} label="Stage" value={project.stage.replaceAll("_", " ")} />
            <DetailRow icon={CalendarDays} label="Start date" value={project.startDate ? formatDate(project.startDate) : "Not set"} />
            <DetailRow icon={CalendarDays} label="End date" value={project.endDate ? formatDate(project.endDate) : "Not set"} />
            <DetailRow icon={FolderOpen} label="Files" value={`${files.length} uploaded`} />
            <DetailRow icon={NotebookPen} label="Notes" value={`${notes.length} entries`} />
            <DetailRow icon={ListTodo} label="Time logged" value={formatDuration(totalLoggedSeconds)} />
            <DetailRow icon={Info} label="Last updated" value={formatDate(project.updatedAt)} />
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-zinc-900">Commercial</h2>
        </CardHeader>
        <CardBody>
          <dl className="divide-y divide-zinc-100">
            <DetailRow icon={Receipt} label="Paid invoices" value={`${paidInvoices.length}`} />
            <DetailRow icon={Receipt} label="Open invoices" value={`${unpaidInvoices.length}`} />
            <div className="py-3.5">
              <dt className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                <User className="h-3.5 w-3.5" />
                Client
              </dt>
              <dd className="text-sm font-medium text-zinc-900">
                {project.contactId ? (
                  <Link href={`/contacts/${project.contactId}`} className="hover:underline">
                    {project.contact?.name || "—"}
                  </Link>
                ) : project.contact?.name || "—"}
              </dd>
              {project.contact?.email && (
                <dd className="mt-0.5 text-sm text-zinc-500">{project.contact.email}</dd>
              )}
            </div>
            <div className="py-3.5">
              <dt className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                <Info className="h-3.5 w-3.5" />
                Portal link
              </dt>
              <dd className="break-all text-sm text-blue-600">{portalUrl}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <dt className="flex items-center gap-2 text-sm text-zinc-500">
        <Icon className="h-4 w-4 text-zinc-400" />
        {label}
      </dt>
      <dd className="text-sm font-medium capitalize text-zinc-900">{value}</dd>
    </div>
  );
}

export default async function ProjectPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const tab = TABS.includes(sp?.tab) ? sp.tab : "overview";

  const session = await getSession();
  if (!session?.user) redirect("/login");

  const project = await db.project.findFirst({
    where: { id, userId: session.user.id },
    include: { contact: { select: { id: true, name: true, email: true } } },
  });

  if (!project) redirect("/dashboard");

  const [files, comments, notes, invoices, rawTasks, timeEntries, teamMembers, contacts, proposals, contracts, outstandingAgg, timeAgg] = await Promise.all([
    db.file.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.comment.findMany({ where: { projectId: id }, orderBy: { createdAt: "asc" }, take: 50 }),
    db.note.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.invoice.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.task.findMany({
      where: { projectId: id },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      include: { assigneeMember: { select: { name: true } } },
      take: 100,
    }),
    db.timeEntry.findMany({ where: { projectId: id }, orderBy: { startedAt: "desc" }, take: 100 }),
    db.teamMember.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, status: true },
      orderBy: { name: "asc" },
    }),
    db.contact.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, email: true, company: true },
      orderBy: { name: "asc" },
    }),
    db.proposal.findMany({
      where: { projectId: id },
      select: { id: true, title: true, status: true, total: true, currency: true, sentAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.contract.findMany({
      where: { projectId: id },
      select: { id: true, title: true, status: true, sentAt: true, signedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    // DB-level aggregate for outstanding instead of in-memory filter+reduce
    db.invoice.aggregate({
      where: { projectId: id, status: { notIn: ["paid", "cancelled"] } },
      _sum: { total: true },
    }),
    // DB-level aggregate for total logged time instead of in-memory reduce
    db.timeEntry.aggregate({
      where: { projectId: id },
      _sum: { duration: true },
    }),
  ]);

  const tasks = rawTasks.map(normalizeTask);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const portalUrl = `${baseUrl}/p/${project.portalToken}`;
  const outstanding = outstandingAgg._sum.total || 0;
  const totalLoggedSeconds = timeAgg._sum.duration || 0;

  const activityItems = [
    ...comments.map((comment) => ({
      id: `comment-${comment.id}`,
      type: "Note",
      title: comment.authorName,
      detail: comment.body,
      date: comment.createdAt,
    })),
    ...files.map((file) => ({
      id: `file-${file.id}`,
      type: "File",
      title: file.name,
      detail: `Uploaded ${formatDate(file.createdAt)}`,
      date: file.createdAt,
    })),
    ...invoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      type: "Invoice",
      title: invoice.invoiceNumber || `Invoice ${invoice.id.slice(-6).toUpperCase()}`,
      detail: `${INVOICE_STATUS_LABELS[invoice.status] || invoice.status} · ${formatCurrency(invoice.total, invoice.currency)}`,
      date: invoice.createdAt,
    })),
    ...tasks.map((task) => ({
      id: `task-${task.id}`,
      type: "Task",
      title: task.title,
      detail: task.dueDate ? `Due ${formatDate(task.dueDate)}` : TASK_STATUS_LABELS[task.status] || task.status,
      date: task.updatedAt,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 12);

  return (
    <div className="space-y-6 px-4 py-4 md:px-6">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" />
        All projects
      </Link>

      <ProjectHeader project={project} portalUrl={portalUrl} contacts={contacts} />

      <div className="border-b border-zinc-200">
        {[
          { id: "overview", label: "Overview" },
          { id: "files", label: "Files" },
          { id: "activity", label: "Activity" },
          { id: "tasks", label: "Tasks" },
          { id: "notes", label: "Notes" },
          { id: "messages", label: "Messages" },
          { id: "details", label: "Details" },
        ].map((item) => (
          <Link
            key={item.id}
            prefetch={false}
            href={getTabHref(project.id, item.id)}
            className={`relative mr-8 inline-flex h-12 items-center text-sm font-medium transition-colors ${
              tab === item.id ? "text-blue-600" : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <span>{item.label}</span>
            <span
              className={`absolute inset-x-0 bottom-0 h-0.5 transition-opacity ${
                tab === item.id ? "bg-blue-600 opacity-100" : "bg-transparent opacity-0"
              }`}
            />
          </Link>
        ))}
      </div>

      {tab === "overview" && (
        <OverviewPanel
          project={project}
          tasks={tasks}
          files={files}
          notes={notes}
          invoices={invoices}
          proposals={proposals}
          contracts={contracts}
          outstanding={outstanding}
          totalLoggedSeconds={totalLoggedSeconds}
        />
      )}

      {tab === "files" && <FilesSection projectId={id} files={files} />}

      {tab === "activity" && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-zinc-900">Activity</h2>
              <p className="mt-1 text-xs text-zinc-400">Recent updates across notes, files, tasks, and invoices.</p>
            </div>
            <History className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardBody>
            <ActivityFeed items={activityItems} />
          </CardBody>
        </Card>
      )}

      {tab === "tasks" && (
        <ProjectTasksSection project={project} tasks={tasks} teamMembers={teamMembers} />
      )}

      {tab === "notes" && (
        <NotesSection projectId={id} notes={notes} />
      )}

      {tab === "messages" && (
        <MessagesSection projectId={id} initialComments={comments} />
      )}

      {tab === "details" && (
        <DetailsPanel
          project={project}
          invoices={invoices}
          files={files}
          notes={notes}
          totalLoggedSeconds={totalLoggedSeconds}
          portalUrl={portalUrl}
        />
      )}
    </div>
  );
}
