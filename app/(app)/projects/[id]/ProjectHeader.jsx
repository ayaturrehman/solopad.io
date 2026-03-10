"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, ExternalLink, MoreHorizontal } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";

export default function ProjectHeader({ project, portalUrl }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(project.status);
  const [showMenu, setShowMenu] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function changeStatus(newStatus) {
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatus(newStatus);
    setShowMenu(false);
    router.refresh();
  }

  async function archiveProject() {
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: true }),
    });
    router.push("/dashboard");
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-900">{project.title}</h1>
            <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Client: <span className="font-medium text-zinc-700">{project.clientName}</span>
            {project.clientEmail && (
              <span className="ml-1 text-zinc-400">({project.clientEmail})</span>
            )}
          </p>
          {project.description && (
            <p className="mt-2 text-sm text-zinc-500">{project.description}</p>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50"
          >
            <MoreHorizontal className="h-4 w-4 text-zinc-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 z-10 w-44 rounded-lg border border-zinc-200 bg-white py-1 shadow-md">
              {["not_started", "in_progress", "in_review", "complete"].map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  Mark as {STATUS_LABELS[s]}
                </button>
              ))}
              <hr className="my-1 border-zinc-100" />
              <button
                onClick={archiveProject}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Archive project
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-lg bg-zinc-50 px-4 py-3">
        <span className="flex-1 truncate font-mono text-sm text-zinc-500">{portalUrl}</span>
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <ExternalLink className="h-3 w-3" />
          Preview
        </a>
      </div>
    </div>
  );
}
