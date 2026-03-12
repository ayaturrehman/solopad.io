"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText, Plus, ChevronRight, ChevronDown, Search, Star,
} from "lucide-react";
import { showNavigationLoading } from "@/components/shared/NavigationLoadingOverlay";
import { formatCurrency, formatDate, cn, isInteractiveEventTarget } from "@/lib/utils";

const STATUS_CONFIG = {
  all:      { label: "All" },
  draft:    { label: "Draft", color: "bg-zinc-100 text-zinc-600" },
  sent:     { label: "Sent", color: "bg-blue-100 text-blue-700" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700" },
  declined: { label: "Declined", color: "bg-red-100 text-red-700" },
};

const FILTERS = ["all", "draft", "sent", "accepted"];

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
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

  function handleRowDoubleClick(event, href) {
    if (isInteractiveEventTarget(event.target)) return;
    showNavigationLoading();
    router.push(href);
  }

  return (
    <div>
      <div className="mb-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((current) => !current)}
                className="inline-flex items-center justify-between gap-2 rounded-lg bg-zinc-100 px-2 py-1 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-200"
              >
                <span className="text-lg font-bold tracking-tight">
                  {getHeaderLabel(statusFilter)}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-blue-600 transition-transform",
                    filterOpen ? "rotate-180" : ""
                  )}
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
                        <span>{getFilterLabel(filterKey)}</span>
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
          <Link
            href="/proposals/new"
            className="inline-flex items-center gap-1.5 rounded bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
            New proposal
          </Link>
        </div>

      </div>

      {filteredProposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded border border-dashed border-zinc-200 bg-white py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-zinc-300" />
          <p className="font-medium text-zinc-500">{proposals.length === 0 ? "No proposals yet" : "No proposals found"}</p>
          <p className="mt-1 text-sm text-zinc-400">
            {proposals.length === 0
              ? "Create your first proposal to get started"
              : "Try a different filter or top search term"}
          </p>
          <Link
            href="/proposals/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
            New proposal
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-zinc-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-zinc-100 bg-zinc-50">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Title</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Client</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Project</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Valid until</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredProposals.map((proposal) => {
                const sc = STATUS_CONFIG[proposal.status] ?? STATUS_CONFIG.draft;
                const isExpired =
                  proposal.validUntil &&
                  new Date(proposal.validUntil) < new Date() &&
                  proposal.status !== "accepted";
                return (
                  <tr
                    key={proposal.id}
                    onDoubleClick={(event) => handleRowDoubleClick(event, `/proposals/${proposal.id}`)}
                    className="cursor-pointer transition-colors hover:bg-zinc-50/60"
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-zinc-900">{proposal.title}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-600">{proposal.clientName}</td>
                    <td className="px-5 py-3.5 text-sm">
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
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", sc.color)}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      {proposal.validUntil ? (
                        <span className={cn(isExpired ? "font-medium text-red-500" : "text-zinc-600")}>
                          {formatDate(proposal.validUntil)}
                        </span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm font-semibold text-zinc-900">
                      {formatCurrency(proposal.total, proposal.currency)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-500">{formatDate(proposal.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/proposals/${proposal.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900"
                      >
                        View <ChevronRight className="h-3.5 w-3.5" />
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
