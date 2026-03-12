"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { cn, formatDate, formatCurrency, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import {
  ExternalLink, Plus, List, Columns, ChevronDown, Search, Star,
} from "lucide-react";
import PipelineBoard from "./PipelineBoard";

const STAGES = [
  { key: "new", label: "New" },
  { key: "discovery", label: "Discovery" },
  { key: "proposal", label: "Proposal" },
  { key: "contract_signed", label: "Contract Signed" },
  { key: "kickoff", label: "Kickoff" },
  { key: "onboarding", label: "Onboarding" },
  { key: "planning", label: "Planning" },
  { key: "delivery", label: "Delivery" },
  { key: "complete", label: "Complete" },
];

const STAGE_LABELS = Object.fromEntries(STAGES.map((s) => [s.key, s.label]));
const OPPORTUNITY_STAGES = ["new", "discovery", "proposal", "contract_signed"];
const PROJECT_STAGES = ["kickoff", "onboarding", "planning", "delivery", "complete"];
const STORAGE_KEY = "projects-view";
const PROJECT_FILTERS = ["all", "not_started", "in_progress", "in_review", "complete"];

function getProjectHeaderLabel(filterKey) {
  if (filterKey === "all") return "Projects";
  return `${STATUS_LABELS[filterKey]} Projects`;
}

function getProjectFilterLabel(filterKey) {
  if (filterKey === "all") return "All";
  return STATUS_LABELS[filterKey];
}

export default function ProjectsClient({ projects, currency = "USD" }) {
  const [view, setView] = useState(() => {
    if (typeof window === "undefined") return "list";
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "pipeline" || saved === "list" ? saved : "list";
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  function switchView(v) {
    setView(v);
    localStorage.setItem(STORAGE_KEY, v);
  }

  const filterOptions = useMemo(
    () => PROJECT_FILTERS.filter((filterKey) =>
      getProjectFilterLabel(filterKey).toLowerCase().includes(filterSearch.trim().toLowerCase())
    ),
    [filterSearch]
  );

  const filteredProjects = useMemo(() => {
    let list = statusFilter === "all"
      ? projects
      : projects.filter((project) => project.status === statusFilter);

    if (!query) return list;

    return list.filter((project) =>
      project.title.toLowerCase().includes(query) ||
      (project.contact?.name || "").toLowerCase().includes(query) ||
      (project.clientName || "").toLowerCase().includes(query)
    );
  }, [projects, query, statusFilter]);

  function countStage(stageKey) {
    return filteredProjects.filter((p) => (p.stage || "new") === stageKey).length;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((current) => !current)}
                className="inline-flex items-center justify-between gap-2 rounded-lg bg-zinc-100 px-2 py-1 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-200"
              >
                <span className="text-lg font-bold tracking-tight">
                  {getProjectHeaderLabel(statusFilter)}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-blue-600 transition-transform ${filterOpen ? "rotate-180" : ""}`}
                />
              </button>

              {filterOpen && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-[15rem] max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-200 bg-white p-2 shadow-xl">
                  <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      placeholder="Search filters"
                      className="h-11 w-full rounded-xl border border-blue-500 pl-11 pr-4 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-blue-500"
                    />
                  </div>

                  <div className="max-h-72 overflow-y-auto py-1">
                    {filterOptions.map((filterKey) => (
                      <button
                        key={filterKey}
                        type="button"
                        onClick={() => {
                          setStatusFilter(filterKey);
                          setFilterOpen(false);
                          setFilterSearch("");
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition-colors",
                          statusFilter === filterKey
                            ? "bg-zinc-50 text-zinc-900"
                            : "text-zinc-700 hover:bg-zinc-50"
                        )}
                      >
                        <span>{getProjectFilterLabel(filterKey)}</span>
                        {statusFilter === filterKey && (
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded border border-zinc-200 bg-white">
              <button
                onClick={() => switchView("list")}
                className={`inline-flex items-center gap-1.5 rounded-l px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === "list" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => switchView("pipeline")}
                className={`inline-flex items-center gap-1.5 rounded-r px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === "pipeline" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
              </button>
            </div>

            {projects.length > 0 && (
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
              >
                <Plus className="h-4 w-4" />
                New project
              </Link>
            )}
          </div>
        </div>

      </div>

      <div className="overflow-hidden rounded border border-zinc-200 bg-white">
        <div className="grid grid-cols-2 divide-x divide-zinc-100">
          <div className="px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-amber-600">Opportunities</p>
            <div className="flex gap-5">
              <div className="text-center">
                <p className="text-lg font-bold text-zinc-900">{filteredProjects.length}</p>
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

      {filteredProjects.length === 0 ? (
        <div className="rounded border border-dashed border-zinc-200 bg-white px-8 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <Plus className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-lg font-semibold text-zinc-900">{projects.length === 0 ? "No projects yet" : "No projects found"}</p>
          <p className="mt-2 text-sm text-zinc-500">
            {projects.length === 0
              ? "Create your first project to start tracking work, stages, and revenue."
              : "Try a different filter or top search term."}
          </p>
          <Link
            href="/projects/new"
            className="mt-6 inline-flex items-center gap-2 rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
            Add first project
          </Link>
        </div>
      ) : view === "pipeline" ? (
        <PipelineBoard projects={filteredProjects} stages={STAGES} currency={currency} />
      ) : (
        <div className="overflow-hidden rounded border border-zinc-200 bg-white">
          <table className="w-full table-fixed">
            <thead className="border-b border-zinc-100 bg-zinc-50">
              <tr>
                <th className="w-1/3 px-4 py-3 text-left text-xs font-semibold text-zinc-500">Project</th>
                <th className="hidden w-1/6 px-4 py-3 text-left text-xs font-semibold text-zinc-500 md:table-cell">Contact</th>
                <th className="hidden w-1/6 px-4 py-3 text-left text-xs font-semibold text-zinc-500 lg:table-cell">Stage</th>
                <th className="w-1/6 px-4 py-3 text-left text-xs font-semibold text-zinc-500">Status</th>
                <th className="hidden w-1/6 px-4 py-3 text-left text-xs font-semibold text-zinc-500 sm:table-cell">Deadline</th>
                <th className="hidden w-1/6 px-4 py-3 text-right text-xs font-semibold text-zinc-500 sm:table-cell">Revenue</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredProjects.map((project) => {
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
                    <td className="hidden px-4 py-3 text-left sm:table-cell">
                      {project.endDate ? (
                        <span className={(() => {
                          const daysLeft = Math.ceil((new Date(project.endDate) - new Date()) / 86400000);
                          return daysLeft < 0 ? "text-xs font-medium text-red-500" : daysLeft <= 7 ? "text-xs font-medium text-amber-600" : "text-xs text-zinc-500";
                        })()}>
                          {(() => {
                            const daysLeft = Math.ceil((new Date(project.endDate) - new Date()) / 86400000);
                            if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
                            if (daysLeft === 0) return "Due today";
                            if (daysLeft <= 7) return `${daysLeft}d left`;
                            return formatDate(project.endDate);
                          })()}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-right sm:table-cell">
                      <span className="text-sm font-medium text-green-700">{formatCurrency(revenue, currency)}</span>
                      {unpaid > 0 && (
                        <p className="text-[11px] text-red-500">{formatCurrency(unpaid, currency)} due</p>
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
