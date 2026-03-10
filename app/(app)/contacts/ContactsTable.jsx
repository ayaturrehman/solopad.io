"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Mail, Phone, Building2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS_CONFIG = {
  lead:     { label: "Lead",     color: "bg-amber-50 text-amber-700" },
  active:   { label: "Client",   color: "bg-green-50 text-green-700" },
  archived: { label: "Archived", color: "bg-zinc-100 text-zinc-500" },
};

const TABS = [
  { key: "all",      label: "All" },
  { key: "lead",     label: "Leads" },
  { key: "active",   label: "Clients" },
  { key: "archived", label: "Archived" },
];

function relativeDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 30) return `${diff}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ContactsTable({ contacts }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");

  const byTab = tab === "all" ? contacts : contacts.filter((c) => c.status === tab);
  const filtered = query.trim()
    ? byTab.filter((c) =>
        [c.name, c.email, c.company, c.phone]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(query.toLowerCase()))
      )
    : byTab;

  const counts = {
    all: contacts.length,
    lead: contacts.filter((c) => c.status === "lead").length,
    active: contacts.filter((c) => c.status === "active").length,
    archived: contacts.filter((c) => c.status === "archived").length,
  };

  const isLeadView = tab === "lead";

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {t.label}
            <span className={cn("ml-1.5 text-xs", tab === t.key ? "text-zinc-400" : "text-zinc-400")}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder={`Search ${tab === "lead" ? "leads" : "contacts"}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded border border-zinc-200 bg-white py-2 pl-8 pr-3 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:border-zinc-400"
          />
        </div>
        {query && (
          <button onClick={() => setQuery("")} className="text-xs text-zinc-400 hover:text-zinc-700">
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white py-12 text-center">
          <p className="text-sm text-zinc-400">
            {query ? `No results for "${query}"` : `No ${tab === "all" ? "contacts" : STATUS_CONFIG[tab]?.label.toLowerCase() + "s"} yet`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Name</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Company</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Contact</th>
                {isLeadView && <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Source</th>}
                {isLeadView && <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Est. value</th>}
                {!isLeadView && <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Projects</th>}
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Added</th>
                {tab === "all" && <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Type</th>}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((contact) => {
                const sc = STATUS_CONFIG[contact.status] ?? STATUS_CONFIG.lead;
                return (
                  <tr key={contact.id} className="group hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/contacts/${contact.id}`} className="font-medium text-zinc-900 hover:underline">
                        {contact.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500">
                      {contact.company ? (
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                          {contact.company}
                        </span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        {contact.email && (
                          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                            <Mail className="h-3 w-3 shrink-0 text-zinc-400" />
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                            <Phone className="h-3 w-3 shrink-0 text-zinc-400" />
                            {contact.phone}
                          </div>
                        )}
                        {!contact.email && !contact.phone && <span className="text-zinc-300">—</span>}
                      </div>
                    </td>
                    {isLeadView && (
                      <td className="px-5 py-3.5 text-sm text-zinc-500 capitalize">
                        {contact.source || <span className="text-zinc-300">—</span>}
                      </td>
                    )}
                    {isLeadView && (
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-zinc-900">
                        {contact.value ? formatCurrency(contact.value) : <span className="text-zinc-300 font-normal">—</span>}
                      </td>
                    )}
                    {!isLeadView && (
                      <td className="px-5 py-3.5 text-center text-zinc-500">
                        {contact._count?.projects > 0 ? (
                          <span className="font-medium text-zinc-900">{contact._count.projects}</span>
                        ) : (
                          <span className="text-zinc-300">0</span>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-xs text-zinc-400">{relativeDate(contact.createdAt)}</td>
                    {tab === "all" && (
                      <td className="px-5 py-3.5">
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", sc.color)}>
                          {sc.label}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="rounded border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                      >
                        View
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
