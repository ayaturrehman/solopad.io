"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { showNavigationLoading } from "@/components/shared/NavigationLoadingOverlay";
import CollectionPageHeader, {
  collectionPageHeaderPrimaryActionClassName,
  collectionPageHeaderSegmentedGroupClassName,
  getCollectionPageHeaderSegmentedButtonClassName,
} from "@/components/shared/CollectionPageHeader";
import { CollectionDataTable, CollectionEmptyState, CollectionTableFrame } from "@/components/shared/CollectionDataTable";
import { formatDate, formatCurrency, STATUS_LABELS, STATUS_COLORS, isInteractiveEventTarget } from "@/lib/utils";
import {
  ExternalLink, Pencil, Plus, List, Columns,
} from "lucide-react";
import PipelineBoard from "./PipelineBoard";
import ProjectFormModal from "./ProjectFormModal";

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
const MAX_BULK_SELECTION = 25;

function getProjectHeaderLabel(filterKey) {
  if (filterKey === "all") return "Projects";
  return `${STATUS_LABELS[filterKey]} Projects`;
}

function getProjectFilterLabel(filterKey) {
  if (filterKey === "all") return "All";
  return STATUS_LABELS[filterKey];
}

export default function ProjectsClient({ projects, currency = "USD", contacts = [] }) {
  const router = useRouter();
  const [view, setView] = useState(() => {
    if (typeof window === "undefined") return "list";
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "pipeline" || saved === "list" ? saved : "list";
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkError, setBulkError] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
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
      (project.contact?.name || "").toLowerCase().includes(query)
    );
  }, [projects, query, statusFilter]);

  useEffect(() => {
    setSelectedIds([]);
    setBulkError("");
  }, [query, statusFilter, view]);

  const visibleProjectIds = filteredProjects.map((project) => project.id);
  const selectedCount = selectedIds.length;
  const selectedVisibleCount = visibleProjectIds.filter((id) => selectedIds.includes(id)).length;
  const allVisibleSelected = visibleProjectIds.length > 0 && selectedVisibleCount === visibleProjectIds.length;
  const canSelectMore = selectedCount < MAX_BULK_SELECTION;

  function countStage(stageKey) {
    return filteredProjects.filter((p) => (p.stage || "new") === stageKey).length;
  }

  function handleRowDoubleClick(event, href) {
    if (isInteractiveEventTarget(event.target)) return;
    showNavigationLoading();
    router.push(href);
  }

  function toggleOne(id, checked) {
    setBulkError("");
    setSelectedIds((current) => {
      if (!checked) return current.filter((value) => value !== id);
      if (current.includes(id)) return current;
      if (current.length >= MAX_BULK_SELECTION) {
        setBulkError(`You can select up to ${MAX_BULK_SELECTION} projects at a time.`);
        return current;
      }
      return [...current, id];
    });
  }

  function toggleAllVisible() {
    setBulkError("");
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleProjectIds.includes(id));
      }

      const next = [...current];
      for (const id of visibleProjectIds) {
        if (next.includes(id)) continue;
        if (next.length >= MAX_BULK_SELECTION) {
          setBulkError(`You can select up to ${MAX_BULK_SELECTION} projects at a time.`);
          break;
        }
        next.push(id);
      }
      return next;
    });
  }

  async function bulkUpdateStatus(nextStatus) {
    if (!selectedCount || bulkLoading) return;
    setBulkLoading(true);
    setBulkError("");

    try {
      const responses = await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/projects/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
          })
        )
      );

      const failed = responses.find((response) => !response.ok);
      if (failed) {
        const data = await failed.json().catch(() => ({}));
        throw new Error(data.error || "Could not update selected projects.");
      }

      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      setBulkError(error.message || "Could not update selected projects.");
    } finally {
      setBulkLoading(false);
    }
  }

  async function bulkDelete() {
    if (!selectedCount || bulkLoading) return;
    if (!window.confirm(`Delete ${selectedCount} project${selectedCount === 1 ? "" : "s"}?`)) return;

    setBulkLoading(true);
    setBulkError("");

    try {
      const responses = await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/projects/${id}`, { method: "DELETE" })
        )
      );

      const failed = responses.find((response) => !response.ok);
      if (failed) {
        const data = await failed.json().catch(() => ({}));
        throw new Error(data.error || "Could not delete selected projects.");
      }

      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      setBulkError(error.message || "Could not delete selected projects.");
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <>
      <CollectionPageHeader
        title={getProjectHeaderLabel(statusFilter)}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((current) => !current)}
        filterSearch={filterSearch}
        onFilterSearchChange={setFilterSearch}
        filterOptions={filterOptions.map((filterKey) => ({
          key: filterKey,
          label: getProjectFilterLabel(filterKey),
        }))}
        selectedFilterKey={statusFilter}
        onSelectFilter={(key) => {
          setStatusFilter(key);
          setFilterOpen(false);
          setFilterSearch("");
        }}
        actions={(
          <>
            <div className={collectionPageHeaderSegmentedGroupClassName}>
              <button
                onClick={() => switchView("list")}
                className={getCollectionPageHeaderSegmentedButtonClassName(view === "list", "left")}
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => switchView("pipeline")}
                className={getCollectionPageHeaderSegmentedButtonClassName(view === "pipeline", "right")}
              >
                <Columns className="h-3.5 w-3.5" />
              </button>
            </div>

            {projects.length > 0 && (
              <button
                onClick={() => { setEditingProject(null); setModalOpen(true); }}
                className={collectionPageHeaderPrimaryActionClassName}
              >
                <Plus className="h-4 w-4" />
                New project
              </button>
            )}
          </>
        )}
      />

      <CollectionTableFrame>
        <div className="grid grid-cols-1 divide-y divide-zinc-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-4 pb-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-amber-600">Opportunities</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
              <div className="text-center sm:text-left">
                <p className="text-lg font-bold text-zinc-900">{filteredProjects.length}</p>
                <p className="text-[10px] text-zinc-400">All</p>
              </div>
              {OPPORTUNITY_STAGES.map((s) => (
                <div key={s} className="text-center sm:text-left">
                  <p className="text-lg font-bold text-zinc-900">{countStage(s)}</p>
                  <p className="text-[10px] text-zinc-400">{STAGE_LABELS[s]}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 py-4 pb-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-blue-600">Active Projects</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
              {PROJECT_STAGES.map((s) => (
                <div key={s} className="text-center sm:text-left">
                  <p className="text-lg font-bold text-zinc-900">{countStage(s)}</p>
                  <p className="text-[10px] text-zinc-400">{STAGE_LABELS[s]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollectionTableFrame>

      {filteredProjects.length === 0 ? (
        <CollectionEmptyState
          icon={Plus}
          title={projects.length === 0 ? "No projects yet" : "No projects found"}
          description={projects.length === 0
            ? "Create your first project to start tracking work, stages, and revenue."
            : "Try a different filter or top search term."}
          action={(
            <button
              onClick={() => { setEditingProject(null); setModalOpen(true); }}
              className={collectionPageHeaderPrimaryActionClassName}
            >
              <Plus className="h-4 w-4" />
              Add first project
            </button>
          )}
          className="border-dashed"
        />
      ) : view === "pipeline" ? (
        <PipelineBoard projects={filteredProjects} stages={STAGES} currency={currency} />
      ) : (
        <CollectionDataTable
          rows={filteredProjects}
          tableClassName="w-full table-fixed"
          selection={{
            allVisibleSelected,
            onToggleAll: toggleAllVisible,
            isSelected: (project) => selectedIds.includes(project.id),
            isRowDisabled: (project) => !selectedIds.includes(project.id) && !canSelectMore,
            onToggleRow: (project, checked) => toggleOne(project.id, checked),
            getRowLabel: (project) => `Select ${project.title}`,
          }}
          bulkActions={{
            count: selectedCount,
            maxCount: MAX_BULK_SELECTION,
            error: bulkError,
            isSubmitting: bulkLoading,
            actions: [
              { key: "not_started", label: "Not started", onClick: () => bulkUpdateStatus("not_started") },
              { key: "in_progress", label: "In progress", onClick: () => bulkUpdateStatus("in_progress") },
              { key: "in_review", label: "In review", onClick: () => bulkUpdateStatus("in_review") },
              { key: "complete", label: "Complete", onClick: () => bulkUpdateStatus("complete") },
              { key: "delete", label: bulkLoading ? "Working..." : "Delete", onClick: bulkDelete, variant: "danger" },
            ],
            onClear: () => {
              setSelectedIds([]);
              setBulkError("");
            },
          }}
          columns={[
            { key: "project", header: "Project", headerClassName: "w-1/3 px-4 text-xs normal-case tracking-normal text-zinc-500" },
            { key: "contact", header: "Contact", headerClassName: "hidden w-1/6 px-4 text-xs normal-case tracking-normal text-zinc-500 md:table-cell" },
            { key: "stage", header: "Stage", headerClassName: "hidden w-1/6 px-4 text-xs normal-case tracking-normal text-zinc-500 lg:table-cell" },
            { key: "status", header: "Status", headerClassName: "w-1/6 px-4 text-xs normal-case tracking-normal text-zinc-500" },
            { key: "deadline", header: "Deadline", headerClassName: "hidden w-1/6 px-4 text-xs normal-case tracking-normal text-zinc-500 sm:table-cell" },
            { key: "revenue", header: "Revenue", headerClassName: "hidden w-1/6 px-4 text-right text-xs normal-case tracking-normal text-zinc-500 sm:table-cell" },
            { key: "actions", header: "", headerClassName: "w-10 px-4" },
          ]}
          renderRow={(project) => {
            const revenue = project.invoices
              .filter((i) => i.status === "paid")
              .reduce((s, i) => s + i.total, 0);
            const unpaid = project.invoices
              .filter((i) => i.status !== "paid" && i.status !== "cancelled")
              .reduce((s, i) => s + i.total, 0);

            return (
              <>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/projects/${project.id}`)}
                  className="cursor-pointer px-4 py-3 transition-colors"
                >
                  <Link href={`/projects/${project.id}`} className="font-medium text-zinc-900 hover:underline">
                    {project.title}
                  </Link>
                  <p className="text-xs text-zinc-400">{formatDate(project.updatedAt)}</p>
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/projects/${project.id}`)}
                  className="hidden cursor-pointer px-4 py-3 text-sm text-zinc-500 transition-colors md:table-cell"
                >
                  {project.contact?.name || "—"}
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/projects/${project.id}`)}
                  className="hidden cursor-pointer px-4 py-3 transition-colors lg:table-cell"
                >
                  <span className="text-xs text-zinc-500">{STAGE_LABELS[project.stage] || project.stage}</span>
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/projects/${project.id}`)}
                  className="cursor-pointer px-4 py-3 transition-colors"
                >
                  <Badge className={STATUS_COLORS[project.status]}>
                    {STATUS_LABELS[project.status]}
                  </Badge>
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/projects/${project.id}`)}
                  className="hidden cursor-pointer px-4 py-3 text-left transition-colors sm:table-cell"
                >
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
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/projects/${project.id}`)}
                  className="hidden cursor-pointer px-4 py-3 text-right transition-colors sm:table-cell"
                >
                  <span className="text-sm font-medium text-green-700">{formatCurrency(revenue, currency)}</span>
                  {unpaid > 0 && (
                    <p className="text-[11px] text-red-500">{formatCurrency(unpaid, currency)} due</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditingProject(project); setModalOpen(true); }}
                      className="text-zinc-400 hover:text-zinc-700 transition-colors"
                      data-no-row-nav="true"
                      title="Edit project"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <Link href={`/projects/${project.id}`} className="text-zinc-400 hover:text-zinc-700" data-no-row-nav="true">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </>
            );
          }}
        />
      )}

      <ProjectFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProject(null); }}
        project={editingProject}
        contacts={contacts}
      />
    </>
  );
}
