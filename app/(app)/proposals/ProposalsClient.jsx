"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText, Plus, ChevronRight, List, Columns,
} from "lucide-react";
import { showNavigationLoading } from "@/components/shared/NavigationLoadingOverlay";
import CollectionPageHeader, {
  collectionPageHeaderPrimaryActionClassName,
  collectionPageHeaderSegmentedGroupClassName,
  getCollectionPageHeaderSegmentedButtonClassName,
} from "@/components/shared/CollectionPageHeader";
import { CollectionDataTable, CollectionEmptyState } from "@/components/shared/CollectionDataTable";
import { formatCurrency, formatDate, cn, isInteractiveEventTarget } from "@/lib/utils";

const STATUS_CONFIG = {
  all:      { label: "All" },
  draft:    { label: "Draft", color: "bg-zinc-100 text-zinc-600" },
  sent:     { label: "Sent", color: "bg-blue-100 text-blue-700" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700" },
  declined: { label: "Declined", color: "bg-red-100 text-red-700" },
};

const FILTERS = ["all", "draft", "sent", "accepted"];
const MAX_BULK_SELECTION = 25;
const PIPELINE_COLS = ["draft", "sent", "accepted", "declined"];
const STORAGE_KEY = "proposals-view";

function getHeaderLabel(filterKey) {
  if (filterKey === "all") return "Proposals";
  return `${STATUS_CONFIG[filterKey].label} Proposals`;
}

function getFilterLabel(filterKey) {
  if (filterKey === "all") return "All";
  return STATUS_CONFIG[filterKey].label;
}

export default function ProposalsClient({ proposals }) {
  const router = useRouter();
  const [view, setView] = useState(() => {
    if (typeof window === "undefined") return "list";
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "pipeline" ? "pipeline" : "list";
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkError, setBulkError] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const filterOptions = useMemo(
    () => FILTERS.filter((filterKey) =>
      STATUS_CONFIG[filterKey].label.toLowerCase().includes(filterSearch.trim().toLowerCase())
    ),
    [filterSearch]
  );

  const filteredProposals = useMemo(() => {
    let list = statusFilter === "all"
      ? proposals
      : proposals.filter((proposal) => proposal.status === statusFilter);

    if (!query) return list;

    return list.filter((proposal) =>
      proposal.title.toLowerCase().includes(query) ||
      (proposal.clientName || "").toLowerCase().includes(query) ||
      (proposal.project?.title || "").toLowerCase().includes(query)
    );
  }, [proposals, query, statusFilter]);

  useEffect(() => {
    setSelectedIds([]);
    setBulkError("");
  }, [query, statusFilter]);

  const visibleProposalIds = filteredProposals.map((proposal) => proposal.id);
  const selectedCount = selectedIds.length;
  const selectedVisibleCount = visibleProposalIds.filter((id) => selectedIds.includes(id)).length;
  const allVisibleSelected = visibleProposalIds.length > 0 && selectedVisibleCount === visibleProposalIds.length;
  const canSelectMore = selectedCount < MAX_BULK_SELECTION;

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
        setBulkError(`You can select up to ${MAX_BULK_SELECTION} proposals at a time.`);
        return current;
      }
      return [...current, id];
    });
  }

  function toggleAllVisible() {
    setBulkError("");
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleProposalIds.includes(id));
      }

      const next = [...current];
      for (const id of visibleProposalIds) {
        if (next.includes(id)) continue;
        if (next.length >= MAX_BULK_SELECTION) {
          setBulkError(`You can select up to ${MAX_BULK_SELECTION} proposals at a time.`);
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
          fetch(`/api/proposals/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
          })
        )
      );

      const failed = responses.find((response) => !response.ok);
      if (failed) {
        const data = await failed.json().catch(() => ({}));
        throw new Error(data.error || "Could not update selected proposals.");
      }

      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      setBulkError(error.message || "Could not update selected proposals.");
    } finally {
      setBulkLoading(false);
    }
  }

  async function bulkDelete() {
    if (!selectedCount || bulkLoading) return;
    if (!window.confirm(`Delete ${selectedCount} proposal${selectedCount === 1 ? "" : "s"}?`)) return;

    setBulkLoading(true);
    setBulkError("");

    try {
      const responses = await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/proposals/${id}`, { method: "DELETE" })
        )
      );

      const failed = responses.find((response) => !response.ok);
      if (failed) {
        const data = await failed.json().catch(() => ({}));
        throw new Error(data.error || "Could not delete selected proposals.");
      }

      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      setBulkError(error.message || "Could not delete selected proposals.");
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div>
      <CollectionPageHeader
        title={getHeaderLabel(statusFilter)}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((current) => !current)}
        filterSearch={filterSearch}
        onFilterSearchChange={setFilterSearch}
        filterOptions={filterOptions.map((filterKey) => ({
          key: filterKey,
          label: getFilterLabel(filterKey),
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
                title="List view"
                onClick={() => { setView("list"); localStorage.setItem(STORAGE_KEY, "list"); }}
                className={getCollectionPageHeaderSegmentedButtonClassName(view === "list", "left")}
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                title="Pipeline view"
                onClick={() => { setView("pipeline"); localStorage.setItem(STORAGE_KEY, "pipeline"); }}
                className={getCollectionPageHeaderSegmentedButtonClassName(view === "pipeline", "right")}
              >
                <Columns className="h-3.5 w-3.5" />
              </button>
            </div>
            <Link
              href="/proposals/new"
              className={collectionPageHeaderPrimaryActionClassName}
            >
              <Plus className="h-4 w-4" />
              New proposal
            </Link>
          </>
        )}
      />

      {filteredProposals.length === 0 ? (
        <CollectionEmptyState
          icon={FileText}
          title={proposals.length === 0 ? "No proposals yet" : "No proposals found"}
          description={proposals.length === 0
            ? "Create your first proposal to get started"
            : "Try a different filter or top search term"}
          action={(
            <Link
              href="/proposals/new"
              className={collectionPageHeaderPrimaryActionClassName}
            >
              <Plus className="h-4 w-4" />
              New proposal
            </Link>
          )}
          className="border-dashed"
        />
      ) : view === "pipeline" ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max px-4 pt-4">
            {PIPELINE_COLS.map((col) => {
              const colConfig = STATUS_CONFIG[col];
              const colProposals = filteredProposals.filter((p) => (p.status || "draft") === col);
              return (
                <div key={col} className="w-64 flex-shrink-0">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{colConfig.label}</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">{colProposals.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colProposals.map((proposal) => (
                      <Link
                        key={proposal.id}
                        href={`/proposals/${proposal.id}`}
                        className="block rounded border border-zinc-200 bg-white p-3 transition-shadow hover:shadow-sm"
                      >
                        <p className="text-sm font-medium text-zinc-900 leading-snug">{proposal.title}</p>
                        {proposal.clientName && (
                          <p className="mt-0.5 text-xs text-zinc-400">{proposal.clientName}</p>
                        )}
                        {proposal.total != null && (
                          <p className="mt-2 text-xs font-semibold text-zinc-700">{formatCurrency(proposal.total, "USD")}</p>
                        )}
                      </Link>
                    ))}
                    {colProposals.length === 0 && (
                      <div className="rounded border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-300">No proposals</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <CollectionDataTable
          rows={filteredProposals}
          tableClassName="w-full min-w-[600px]"
          selection={{
            allVisibleSelected,
            onToggleAll: toggleAllVisible,
            isSelected: (proposal) => selectedIds.includes(proposal.id),
            isRowDisabled: (proposal) => !selectedIds.includes(proposal.id) && !canSelectMore,
            onToggleRow: (proposal, checked) => toggleOne(proposal.id, checked),
            getRowLabel: (proposal) => `Select ${proposal.title}`,
          }}
          bulkActions={{
            count: selectedCount,
            maxCount: MAX_BULK_SELECTION,
            error: bulkError,
            isSubmitting: bulkLoading,
            actions: [
              { key: "draft", label: "Mark draft", onClick: () => bulkUpdateStatus("draft") },
              { key: "sent", label: "Mark sent", onClick: () => bulkUpdateStatus("sent") },
              { key: "accepted", label: "Accept", onClick: () => bulkUpdateStatus("accepted") },
              { key: "declined", label: "Decline", onClick: () => bulkUpdateStatus("declined") },
              { key: "delete", label: bulkLoading ? "Working..." : "Delete", onClick: bulkDelete, variant: "danger" },
            ],
            onClear: () => {
              setSelectedIds([]);
              setBulkError("");
            },
          }}
          columns={[
            { key: "title", header: "Title" },
            { key: "client", header: "Client" },
            { key: "project", header: "Project" },
            { key: "status", header: "Status" },
            { key: "validUntil", header: "Valid until" },
            { key: "total", header: "Total", headerClassName: "text-right" },
            { key: "createdAt", header: "Created" },
            { key: "actions", header: "", headerClassName: "w-16" },
          ]}
          renderRow={(proposal) => {
            const sc = STATUS_CONFIG[proposal.status] ?? STATUS_CONFIG.draft;
            const isExpired =
              proposal.validUntil &&
              new Date(proposal.validUntil) < new Date() &&
              proposal.status !== "accepted";
            return (
              <>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/proposals/${proposal.id}`)}
                  className="cursor-pointer px-5 py-3.5 text-sm font-medium text-zinc-900"
                >
                  {proposal.title}
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/proposals/${proposal.id}`)}
                  className="cursor-pointer px-5 py-3.5 text-sm text-zinc-600"
                >
                  {proposal.clientName}
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/proposals/${proposal.id}`)}
                  className="cursor-pointer px-5 py-3.5 text-sm"
                >
                  {proposal.project ? (
                    <Link
                      href={`/projects/${proposal.project.id}`}
                      className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
                    >
                      {proposal.project.title}
                    </Link>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/proposals/${proposal.id}`)}
                  className="cursor-pointer px-5 py-3.5"
                >
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", sc.color)}>
                    {sc.label}
                  </span>
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/proposals/${proposal.id}`)}
                  className="cursor-pointer px-5 py-3.5 text-sm"
                >
                  {proposal.validUntil ? (
                    <span className={cn(isExpired ? "font-medium text-red-500" : "text-zinc-600")}>
                      {formatDate(proposal.validUntil)}
                    </span>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/proposals/${proposal.id}`)}
                  className="cursor-pointer px-5 py-3.5 text-right text-sm font-semibold text-zinc-900"
                >
                  {formatCurrency(proposal.total, proposal.currency)}
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/proposals/${proposal.id}`)}
                  className="cursor-pointer px-5 py-3.5 text-sm text-zinc-500"
                >
                  {formatDate(proposal.createdAt)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/proposals/${proposal.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900"
                    data-no-row-nav="true"
                  >
                    View <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </>
            );
          }}
        />
      )}
    </div>
  );
}
