export const dynamic = "force-dynamic";

import Link from "next/link";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { formatDate, formatCurrency, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

const STAGE_LABELS = {
  new: "New",
  discovery: "Discovery",
  proposal: "Proposal",
  contract_signed: "Contract Signed",
  kickoff: "Kickoff",
  onboarding: "Onboarding",
  planning: "Planning",
  delivery: "Delivery",
  complete: "Complete",
};

const OPPORTUNITY_STAGES = ["new", "discovery", "proposal", "contract_signed"];
const PROJECT_STAGES = ["kickoff", "onboarding", "planning", "delivery", "complete"];

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const projects = await db.project.findMany({
    where: { userId: session.user.id, archived: false },
    include: {
      invoices: { select: { total: true, status: true } },
      contact: { select: { name: true } },
      _count: { select: { files: true, comments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Stage counts
  function countStage(stageKey) {
    return projects.filter((p) => (p.stage || "new") === stageKey).length;
  }
  const totalAll = projects.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Projects</h1>
        <p className="text-sm text-zinc-500">{projects.length} active project{projects.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Pipeline stage summary — like HoneyBook */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-2 divide-x divide-zinc-100">
          {/* Opportunities column */}
          <div className="px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-amber-600">Opportunities</p>
            <div className="flex gap-5">
              <div className="text-center">
                <p className="text-lg font-bold text-zinc-900">{totalAll}</p>
                <p className="text-[10px] text-zinc-400">All</p>
              </div>
              {OPPORTUNITY_STAGES.map((s) => (
                <div key={s} className="text-center">
                  <p className="text-lg font-bold text-zinc-900">{countStage(s)}</p>
                  <p className="text-[10px] text-zinc-400">{STAGE_LABELS[s]}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Active projects column */}
          <div className="px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-blue-600">Active Projects</p>
            <div className="flex gap-5">
              {PROJECT_STAGES.map((s) => (
                <div key={s} className="text-center">
                  <p className="text-lg font-bold text-zinc-900">{countStage(s)}</p>
                  <p className="text-[10px] text-zinc-400">{STAGE_LABELS[s]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-8 py-16 text-center">
          <p className="text-sm font-medium text-zinc-400">No projects yet.</p>
          <Link href="/projects/new" className="mt-3 inline-block text-sm text-zinc-900 underline underline-offset-2">
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full table-fixed">
            <thead className="border-b border-zinc-100 bg-zinc-50">
              <tr>
                <th className="w-1/3 px-4 py-3 text-left text-xs font-semibold text-zinc-500">Project</th>
                <th className="hidden w-1/6 px-4 py-3 text-left text-xs font-semibold text-zinc-500 md:table-cell">Contact</th>
                <th className="hidden w-1/6 px-4 py-3 text-left text-xs font-semibold text-zinc-500 lg:table-cell">Stage</th>
                <th className="w-1/6 px-4 py-3 text-left text-xs font-semibold text-zinc-500">Status</th>
                <th className="hidden w-1/6 px-4 py-3 text-right text-xs font-semibold text-zinc-500 sm:table-cell">Revenue</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {projects.map((project) => {
                const revenue = project.invoices
                  .filter((i) => i.status === "paid")
                  .reduce((s, i) => s + i.total, 0);
                const unpaid = project.invoices
                  .filter((i) => i.status !== "paid" && i.status !== "cancelled")
                  .reduce((s, i) => s + i.total, 0);

                return (
                  <tr key={project.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <Link href={`/projects/${project.id}`} className="font-medium text-zinc-900 hover:underline">
                        {project.title}
                      </Link>
                      <p className="text-xs text-zinc-400">{formatDate(project.updatedAt)}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-zinc-500 md:table-cell">
                      {project.contact?.name || project.clientName}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-xs text-zinc-500">{STAGE_LABELS[project.stage] || project.stage}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_COLORS[project.status]}>
                        {STATUS_LABELS[project.status]}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-right sm:table-cell">
                      <span className="text-sm font-medium text-green-700">{formatCurrency(revenue)}</span>
                      {unpaid > 0 && (
                        <p className="text-[11px] text-red-500">{formatCurrency(unpaid)} due</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/projects/${project.id}`} className="text-zinc-400 hover:text-zinc-700">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
