"use client";

import Link from "next/link";
import { useState } from "react";
import { FileSignature, Plus } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

const STATUS_CONFIG = {
  draft:  { label: "Draft",  color: "bg-zinc-100 text-zinc-600" },
  sent:   { label: "Sent",   color: "bg-blue-100 text-blue-700" },
  signed: { label: "Signed", color: "bg-green-100 text-green-700" },
};

const TABS = ["all", "draft", "sent", "signed"];

export default function ContractsClient({ contracts }) {
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? contracts : contracts.filter((c) => c.status === tab);

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Contracts</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Review drafted, sent, and signed agreements</p>
        </div>
        <Link
          href="/templates/builder?type=contract"
          className="inline-flex items-center gap-1.5 rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          <Plus className="h-4 w-4" />
          New contract
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              tab === t ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {t === "all" ? "All" : STATUS_CONFIG[t]?.label ?? t}
          </button>
        ))}
      </div>

      {/* Table / list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white py-16 text-center">
          <FileSignature className="mb-3 h-10 w-10 text-zinc-300" />
          <p className="font-medium text-zinc-500">No contracts yet</p>
          <p className="mt-1 text-sm text-zinc-400">Create a contract template to get started</p>
          <Link
            href="/templates/builder?type=contract"
            className="mt-4 inline-flex items-center gap-1.5 rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
            New contract
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
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Sent</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Signed</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.map((contract) => {
                const sc = STATUS_CONFIG[contract.status] ?? STATUS_CONFIG.draft;
                return (
                  <tr key={contract.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-zinc-900">{contract.title}</p>
                      {contract.clientEmail && <p className="text-xs text-zinc-400 mt-0.5">{contract.clientEmail}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-600">{contract.clientName}</td>
                    <td className="px-5 py-3.5 text-sm">
                      {contract.project ? (
                        <Link href={`/projects/${contract.project.id}`} className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900">
                          {contract.project.title}
                        </Link>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", sc.color)}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-500">{contract.sentAt ? formatDate(contract.sentAt) : <span className="text-zinc-300">—</span>}</td>
                    <td className="px-5 py-3.5 text-sm text-zinc-500">{contract.signedAt ? formatDate(contract.signedAt) : <span className="text-zinc-300">—</span>}</td>
                    <td className="px-5 py-3.5 text-sm text-zinc-500">{formatDate(contract.createdAt)}</td>
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
