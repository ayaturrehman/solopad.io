"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Plus, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

const STATUS_CONFIG = {
  draft:    { label: "Draft",    color: "bg-zinc-100 text-zinc-600" },
  sent:     { label: "Sent",     color: "bg-blue-100 text-blue-700" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700" },
  declined: { label: "Declined", color: "bg-red-100 text-red-700" },
};

const TABS = ["all", "draft", "sent", "accepted", "declined"];

export default function ProposalsClient({ proposals }) {
  const [tab, setTab] = useState("all");

  const counts = {
    total: proposals.length,
    draft: proposals.filter((p) => p.status === "draft").length,
    sent: proposals.filter((p) => p.status === "sent").length,
    accepted: proposals.filter((p) => p.status === "accepted").length,
  };

  const filtered = tab === "all" ? proposals : proposals.filter((p) => p.status === tab);

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Proposals</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Create and send client proposals</p>
        </div>
        <Link
          href="/proposals/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          <Plus className="h-4 w-4" />
          New proposal
        </Link>
      </div>

      {/* Stat pills */}
      <div className="mb-6 flex flex-wrap gap-3">
        {[
          { label: "Total", value: counts.total },
          { label: "Draft", value: counts.draft },
          { label: "Sent", value: counts.sent },
          { label: "Accepted", value: counts.accepted },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm">
            <span className="font-bold text-zinc-900">{stat.value}</span>
            <span className="text-zinc-500">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {t === "all" ? "All" : STATUS_CONFIG[t]?.label ?? t}
          </button>
        ))}
      </div>

      {/* Table / List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-zinc-300" />
          <p className="font-medium text-zinc-500">No proposals yet</p>
          <p className="mt-1 text-sm text-zinc-400">Create your first proposal to get started</p>
          <Link
            href="/proposals/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
            New proposal
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
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
              {filtered.map((proposal) => {
                const sc = STATUS_CONFIG[proposal.status] ?? STATUS_CONFIG.draft;
                const isExpired =
                  proposal.validUntil &&
                  new Date(proposal.validUntil) < new Date() &&
                  proposal.status !== "accepted";
                return (
                  <tr key={proposal.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-zinc-900 text-sm">{proposal.title}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-600">{proposal.clientName}</td>
                    <td className="px-5 py-3.5 text-sm">
                      {proposal.project ? (
                        <Link
                          href={`/projects/${proposal.project.id}`}
                          className="text-zinc-600 hover:text-zinc-900 underline underline-offset-2"
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
                        <span className={cn(isExpired ? "text-red-500 font-medium" : "text-zinc-600")}>
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
