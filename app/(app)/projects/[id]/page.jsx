export const dynamic = "force-dynamic";

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
} from "lucide-react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import ProjectHeader from "./ProjectHeader";
import FilesSection from "./FilesSection";
import ProjectTasksSection from "./ProjectTasksSection";
import NotesSection from "./NotesSection";
import MessagesSection from "./MessagesSection";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/utils";
import { normalizeTask } from "@/lib/tasks";

const TABS = ["overview", "files", "activity", "tasks", "notes", "messages", "details"];

const TASK_STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
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

function StatCard({ label, value, note }) {
  return (
    <div className="rounded border border-zinc-200 bg-white px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-medium tracking-tight text-zinc-900">{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{note}</p>
    </div>
  );
}

function EmptyState({ label }) {
  return <p className="py-10 text-center text-sm text-zinc-400">{label}</p>;
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
          {/* date column */}
          <p className="hidden w-24 shrink-0 pt-0.5 text-right text-xs text-zinc-400 sm:block">
            {formatDate(item.date)}
          </p>

          {/* dot + line column */}
          <div className="flex shrink-0 flex-col items-center">
            <div className={`z-10 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${ACTIVITY_TYPE_COLORS[item.type] || "bg-zinc-100 text-zinc-500"}`}>
              {item.type[0]}
            </div>
            <div className="mt-1 w-px flex-1 bg-zinc-200" />
          </div>

          {/* content */}
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

function OverviewPanel({ project, tasks, files, invoices, outstanding, totalLoggedSeconds, notes }) {
  const openTasks = tasks.filter((task) => task.status !== "done");
  const doneTasks = tasks.filter((task) => task.status === "done");
  const dueTask = openTasks
    .filter((task) => task.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
  const recentFile = files[0];
  const latestNote = notes[0];
  const unpaidInvoices = invoices.filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled");
  const progress = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* stat row */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Status" value={STATUS_LABELS[project.status] || project.status} note={`Stage: ${project.stage.replaceAll("_", " ")}`} />
        <StatCard label="Open tasks" value={openTasks.length} note={dueTask?.dueDate ? `Next due ${formatDate(dueTask.dueDate)}` : "No upcoming deadline"} />
        <StatCard label="Files" value={files.length} note={recentFile ? `Latest: ${recentFile.name}` : "No uploads yet"} />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} note={unpaidInvoices.length ? `${unpaidInvoices.length} unpaid invoices` : "All invoices settled"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* left — description + progress */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-zinc-900">About this project</h2>
            </CardHeader>
            <CardBody className="space-y-5">
              <p className="text-sm leading-6 text-zinc-600">
                {project.description || "No project description added yet."}
              </p>

              {/* client + deadline row */}
              <dl className="divide-y divide-zinc-100">
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-zinc-500">Client</dt>
                  <dd className="text-sm font-medium text-zinc-900">{project.clientName}</dd>
                </div>
                {project.clientEmail && (
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-sm text-zinc-500">Email</dt>
                    <dd className="text-sm text-zinc-600">{project.clientEmail}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-zinc-500">Deadline</dt>
                  <dd className="text-sm font-medium text-zinc-900">
                    {project.endDate ? formatDate(project.endDate) : "Not set"}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-zinc-500">Time logged</dt>
                  <dd className="text-sm font-medium text-zinc-900">{formatDuration(totalLoggedSeconds)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

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

        {/* right sidebar */}
        <div className="space-y-5">
          {/* billing summary */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-zinc-900">Billing</h2>
            </CardHeader>
            <CardBody>
              <dl className="divide-y divide-zinc-100">
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-zinc-500">Invoices</dt>
                  <dd className="text-sm font-medium text-zinc-900">{invoices.length}</dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-zinc-500">Outstanding</dt>
                  <dd className="text-sm font-semibold text-zinc-900">{formatCurrency(outstanding)}</dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-zinc-500">Files</dt>
                  <dd className="text-sm font-medium text-zinc-900">{files.length}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* latest note */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900">Latest note</h2>
              <Link href={getTabHref(project.id, "notes")} className="text-xs text-zinc-400 hover:text-zinc-700">
                All notes
              </Link>
            </CardHeader>
            <CardBody>
              {latestNote ? (
                <div>
                  {latestNote.title && <p className="mb-1 text-sm font-medium text-zinc-800">{latestNote.title}</p>}
                  <p className="text-sm leading-6 text-zinc-600 line-clamp-3" dangerouslySetInnerHTML={{ __html: latestNote.body }} />
                  <p className="mt-3 text-xs text-zinc-400">
                    {formatDate(latestNote.createdAt)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-zinc-400">No notes added yet.</p>
              )}
            </CardBody>
          </Card>
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
          <h2 className="font-semibold text-zinc-900">Commercial details</h2>
        </CardHeader>
        <CardBody>
          <dl className="divide-y divide-zinc-100">
            <DetailRow icon={Receipt} label="Paid invoices" value={`${paidInvoices.length}`} />
            <DetailRow icon={Receipt} label="Open invoices" value={`${unpaidInvoices.length}`} />
            <div className="py-3.5">
              <dt className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                <Info className="h-3.5 w-3.5" />
                Portal link
              </dt>
              <dd className="break-all text-sm text-blue-600">{portalUrl}</dd>
            </div>
            <div className="py-3.5">
              <dt className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                <Info className="h-3.5 w-3.5" />
                Client
              </dt>
              <dd className="text-sm font-medium text-zinc-900">{project.clientName}</dd>
              <dd className="mt-0.5 text-sm text-zinc-500">{project.clientEmail || "No email on file"}</dd>
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
    include: { contact: { select: { name: true, email: true } } },
  });

  if (!project) redirect("/dashboard");

  const [files, comments, notes, invoices, rawTasks, timeEntries, teamMembers] = await Promise.all([
    db.file.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" } }),
    db.comment.findMany({ where: { projectId: id }, orderBy: { createdAt: "asc" } }),
    db.note.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" } }),
    db.invoice.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" } }),
    db.task.findMany({
      where: { projectId: id },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      include: { assigneeMember: { select: { name: true } } },
    }),
    db.timeEntry.findMany({ where: { projectId: id }, orderBy: { startedAt: "desc" } }),
    db.teamMember.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, status: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const tasks = rawTasks.map(normalizeTask);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const portalUrl = `${baseUrl}/p/${project.portalToken}`;
  const outstanding = invoices
    .filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled")
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const totalLoggedSeconds = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

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
    <div className="space-y-6">
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" />
        All projects
      </Link>

      <ProjectHeader project={project} portalUrl={portalUrl} />

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
