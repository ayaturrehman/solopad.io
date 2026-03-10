export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, ExternalLink, Clock, Eye, DollarSign, FolderOpen } from "lucide-react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { STATUS_LABELS, STATUS_COLORS, formatDate, formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const projects = await db.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { invoices: true },
  });

  const activeProjects = projects.filter((p) => p.status !== "complete" && !p.archived);
  const completedProjects = projects.filter((p) => p.status === "complete" || p.archived);

  const totalViews = projects.reduce((sum, p) => sum + p.viewCount, 0);
  const unpaidTotal = projects
    .flatMap((p) => p.invoices)
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div>
      {/* Stats bar */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4">
          <div className="mb-1 flex items-center gap-2 text-zinc-400">
            <FolderOpen className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Active</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{activeProjects.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4">
          <div className="mb-1 flex items-center gap-2 text-zinc-400">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Portal Views</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{totalViews}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4">
          <div className="mb-1 flex items-center gap-2 text-zinc-400">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Unpaid</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{formatCurrency(unpaidTotal)}</p>
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Projects</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {activeProjects.length} active project{activeProjects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          <Plus className="h-4 w-4" />
          New project
        </Link>
      </div>

      {activeProjects.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <Plus className="h-5 w-5 text-zinc-400" />
          </div>
          <h3 className="mb-2 font-semibold text-zinc-900">No projects yet</h3>
          <p className="mb-6 text-sm text-zinc-500">
            Create your first project and share the link with your client.
          </p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
            Create first project
          </Link>
        </div>
      )}

      {activeProjects.length > 0 && (
        <div className="space-y-2">
          {activeProjects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </div>
      )}

      {completedProjects.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-400">Completed</h2>
          <div className="space-y-2 opacity-60">
            {completedProjects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectRow({ project }) {
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${project.portalToken}`;

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 transition-colors hover:border-zinc-300">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${project.id}`}
              className="font-medium text-zinc-900 hover:underline"
            >
              {project.title}
            </Link>
            <Badge className={STATUS_COLORS[project.status]}>
              {STATUS_LABELS[project.status]}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-zinc-400">
            {project.clientName}
            <span className="ml-3 inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(project.updatedAt)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
        >
          <ExternalLink className="h-3 w-3" />
          Client link
        </a>
        <Link
          href={`/projects/${project.id}`}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
        >
          Manage
        </Link>
      </div>
    </div>
  );
}
