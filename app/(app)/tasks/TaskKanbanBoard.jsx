"use client";

import { useState } from "react";
import { cn, formatDate } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import { PRIORITY_DOT, STATUS_OPTIONS, isOverdue } from "./taskUtils";

export default function TaskKanbanBoard({ tasks: initialTasks, onStatusChange }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  function tasksForStatus(statusKey) {
    return tasks.filter((t) => t.status === statusKey);
  }

  function onDragStart(e, taskId) {
    setDragging(taskId);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e, statusKey) {
    e.preventDefault();
    setDragOver(statusKey);
  }

  async function onDrop(e, statusKey) {
    e.preventDefault();
    setDragOver(null);
    if (!dragging) return;
    const task = tasks.find((t) => t.id === dragging);
    if (!task || task.status === statusKey) return;

    setTasks((prev) => prev.map((t) => t.id === dragging ? { ...t, status: statusKey } : t));
    setDragging(null);

    await fetch(`/api/tasks/${dragging}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: statusKey }),
    });

    if (onStatusChange) {
      onStatusChange(dragging, statusKey);
    }
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3" style={{ minWidth: "max-content" }}>
        {STATUS_OPTIONS.map((status) => {
          const cols = tasksForStatus(status.value);
          return (
            <div
              key={status.value}
              className={cn(
                "flex w-56 flex-col rounded border border-zinc-200 bg-zinc-50 transition-colors",
                dragOver === status.value && "border-zinc-900 bg-zinc-100"
              )}
              onDragOver={(e) => onDragOver(e, status.value)}
              onDrop={(e) => onDrop(e, status.value)}
              onDragLeave={() => setDragOver(null)}
            >
              <div className="flex items-center justify-between rounded-t border-b border-zinc-200 bg-white px-3 py-2">
                <span className="text-xs font-semibold text-zinc-700">{status.label}</span>
                <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
                  {cols.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-2">
                {cols.map((task) => {
                  const overdue = isOverdue(task);
                  const initials = task.assigneeMember
                    ? task.assigneeMember.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : null;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id)}
                      className={cn(
                        "cursor-grab rounded border border-zinc-200 bg-white p-3 shadow-sm active:cursor-grabbing",
                        dragging === task.id && "opacity-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-300" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-semibold text-zinc-900">{task.title}</p>
                          {task.project && (
                            <p className="truncate text-[10px] text-zinc-400">{task.project.title}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            PRIORITY_DOT[task.priority] || PRIORITY_DOT.low
                          )}
                        />
                        
                        {initials && (
                          <div className="h-5 w-5 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-semibold text-zinc-700">{initials}</span>
                          </div>
                        )}

                        {task.dueDate && (
                          <span
                            className={cn(
                              "text-[10px] font-medium",
                              overdue ? "text-red-600" : "text-zinc-500"
                            )}
                          >
                            {formatDate(task.dueDate)}
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
