"use client";

import { useState } from "react";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import { GripVertical, ExternalLink } from "lucide-react";

const STATUS_BADGE = {
  not_started: "bg-zinc-100 text-zinc-500",
  in_progress: "bg-blue-100 text-blue-700",
  in_review: "bg-amber-100 text-amber-700",
  complete: "bg-green-100 text-green-700",
};

export default function PipelineBoard({ projects: initialProjects, stages, currency = "USD" }) {
  const [projects, setProjects] = useState(initialProjects);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  function projectsForStage(stageKey) {
    return projects.filter((p) => (p.stage || "new") === stageKey);
  }

  function onDragStart(e, projectId) {
    setDragging(projectId);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e, stageKey) {
    e.preventDefault();
    setDragOver(stageKey);
  }

  async function onDrop(e, stageKey) {
    e.preventDefault();
    setDragOver(null);
    if (!dragging) return;
    const project = projects.find((p) => p.id === dragging);
    if (!project || (project.stage || "new") === stageKey) return;

    setProjects((prev) => prev.map((p) => p.id === dragging ? { ...p, stage: stageKey } : p));
    setDragging(null);

    await fetch(`/api/projects/${dragging}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: stageKey }),
    });
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3" style={{ minWidth: "max-content" }}>
        {stages.map((stage) => {
          const cols = projectsForStage(stage.key);
          return (
            <div
              key={stage.key}
              className={cn(
                "flex w-56 flex-col rounded border border-zinc-200 bg-zinc-50 transition-colors",
                dragOver === stage.key && "border-zinc-900 bg-zinc-100"
              )}
              onDragOver={(e) => onDragOver(e, stage.key)}
              onDrop={(e) => onDrop(e, stage.key)}
              onDragLeave={() => setDragOver(null)}
            >
              <div className="flex items-center justify-between rounded-t border-b border-zinc-200 bg-white px-3 py-2">
                <span className="text-xs font-semibold text-zinc-700">{stage.label}</span>
                <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
                  {cols.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-2">
                {cols.map((project) => {
                  const unpaid = project.invoices
                    .filter((i) => i.status !== "paid" && i.status !== "cancelled")
                    .reduce((s, i) => s + i.total, 0);
                  const revenue = project.invoices
                    .filter((i) => i.status === "paid")
                    .reduce((s, i) => s + i.total, 0);

                  return (
                    <div
                      key={project.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, project.id)}
                      className={cn(
                        "cursor-grab rounded border border-zinc-200 bg-white p-3 shadow-sm active:cursor-grabbing",
                        dragging === project.id && "opacity-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-300" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-semibold text-zinc-900">{project.title}</p>
                          {project.contact && (
                            <p className="truncate text-[10px] text-zinc-400">{project.contact.name}</p>
                          )}
                        </div>
                        <Link prefetch={false} href={`/projects/${project.id}`} className="text-zinc-400 hover:text-zinc-700">
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", STATUS_BADGE[project.status] || STATUS_BADGE.not_started)}>
                          {project.status?.replace(/_/g, " ")}
                        </span>
                        {revenue > 0 && (
                          <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                            {formatCurrency(revenue, currency)}
                          </span>
                        )}
                        {unpaid > 0 && (
                          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                            {formatCurrency(unpaid, currency)} due
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {cols.length === 0 && (
                  <div className="rounded border border-dashed border-zinc-200 py-6 text-center">
                    <p className="text-[10px] text-zinc-300">Drop here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
