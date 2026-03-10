"use client";

import Link from "next/link";
import { useState } from "react";
import { FileSignature } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-zinc-100 text-zinc-600" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700" },
  signed: { label: "Signed", color: "bg-green-100 text-green-700" },
};

const TABS = ["all", "draft", "sent", "signed"];

export default function ContractsClient({ contracts }) {
  const [tab, setTab] = useState("all");

  const counts = {
    total: contracts.length,
    draft: contracts.filter((contract) => contract.status === "draft").length,
    sent: contracts.filter((contract) => contract.status === "sent").length,
    signed: contracts.filter((contract) => contract.status === "signed").length,
  };

  const filtered = tab === "all" ? contracts : contracts.filter((contract) => contract.status === tab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Contracts</h1>
        <p className="mt-1 text-sm text-zinc-500">Review drafted, sent, and signed agreements in one place.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total", value: counts.total },
          { label: "Draft", value: counts.draft },
          { label: "Sent", value: counts.sent },
          { label: "Signed", value: counts.signed },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm">
            <span className="font-bold text-zinc-900">{stat.value}</span>
            <span className="text-zinc-500">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-zinc-200">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium capitalize transition-colors",
              tab === item ? "border-b-2 border-zinc-900 text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-8 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <FileSignature className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-lg font-semibold text-zinc-900">No contracts yet</p>
          <p className="mt-2 text-sm text-zinc-500">Contracts created through the API will appear here.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
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
                const status = STATUS_CONFIG[contract.status] ?? STATUS_CONFIG.draft;

                return (
                  <tr key={contract.id} className="hover:bg-zinc-50">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-zinc-900">{contract.title}</p>
                      {contract.clientEmail && <p className="text-xs text-zinc-400">{contract.clientEmail}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-600">{contract.clientName}</td>
                    <td className="px-5 py-3.5 text-sm">
                      {contract.project ? (
                        <Link
                          href={`/projects/${contract.project.id}`}
                          className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
                        >
                          {contract.project.title}
                        </Link>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", status.color)}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-500">{contract.sentAt ? formatDate(contract.sentAt) : "-"}</td>
                    <td className="px-5 py-3.5 text-sm text-zinc-500">{contract.signedAt ? formatDate(contract.signedAt) : "-"}</td>
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
