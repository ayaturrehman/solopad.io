"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Mail, Phone, Building2 } from "lucide-react";
import Badge from "@/components/ui/Badge";

const STATUS_COLORS = {
  lead: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  archived: "bg-zinc-100 text-zinc-500",
};

const STATUS_LABELS = {
  lead: "Lead",
  active: "Active",
  archived: "Archived",
};

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

  const filtered = query.trim()
    ? contacts.filter((c) =>
        [c.name, c.email, c.company, c.phone]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(query.toLowerCase()))
      )
    : contacts;

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search contacts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-3 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:border-zinc-400"
          />
        </div>
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-xs text-zinc-400 hover:text-zinc-700"
          >
            Clear
          </button>
        )}
        <p className="shrink-0 text-xs text-zinc-400">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white py-12 text-center">
          <p className="text-sm text-zinc-400">No contacts match "{query}"</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Name</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Company</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Email / Phone</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Last Interaction</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Projects</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((contact) => (
                <tr key={contact.id} className="group hover:bg-zinc-50">
                  <td className="px-5 py-4">
                    <Link href={`/contacts/${contact.id}`} className="font-medium text-zinc-900 hover:underline">
                      {contact.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-zinc-500">
                    {contact.company ? (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        {contact.company}
                      </span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      {contact.email && (
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                          {contact.email}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                          {contact.phone}
                        </div>
                      )}
                      {!contact.email && !contact.phone && <span className="text-zinc-300">—</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-zinc-500">
                    {contact.updatedAt ? (
                      <span className="text-xs">{relativeDate(contact.updatedAt)}</span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-500">
                    {contact._count.projects > 0 ? (
                      <span className="font-medium text-zinc-900">{contact._count.projects}</span>
                    ) : (
                      <span className="text-zinc-300">0</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Badge className={STATUS_COLORS[contact.status]}>
                      {STATUS_LABELS[contact.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
