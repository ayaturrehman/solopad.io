"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Plus, MoreHorizontal, Check, X, Pencil, Trash2 } from "lucide-react";

const PRIORITY_DOT = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-zinc-400",
};

const PRIORITY_LABEL = { high: "High", medium: "Medium", low: "Low" };

function isOverdue(task) {
  if (!task.dueDate || task.status === "done") return false;
  return new Date(task.dueDate) < new Date();
}

export default function TasksClient({ tasks: initialTasks, projects }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    projectId: "",
    priority: "medium",
    dueDate: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "todo") return t.status === "todo";
    if (filter === "in_progress") return t.status === "in_progress";
    if (filter === "done") return t.status === "done";
    return true;
  });

  const active = filtered.filter((t) => t.status !== "done");
  const done = filtered.filter((t) => t.status === "done");

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  async function handleAddTask(e) {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.title,
        projectId: formData.projectId || null,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        description: formData.description || null,
      }),
    });
    if (res.ok) {
      const { task } = await res.json();
      setTasks((prev) => [task, ...prev]);
      setFormData({ title: "", projectId: "", priority: "medium", dueDate: "", description: "" });
      setShowForm(false);
    }
    setSubmitting(false);
  }

  async function toggleDone(task) {
    const newStatus = task.status === "done" ? "todo" : "done";
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        completedAt: newStatus === "done" ? new Date().toISOString() : null,
      }),
    });
    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, status: newStatus, completedAt: newStatus === "done" ? new Date() : null }
            : t
        )
      );
    }
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
    setOpenMenu(null);
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      projectId: task.projectId || "",
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toString().slice(0, 10) : "",
    });
    setOpenMenu(null);
  }

  async function saveEdit(id) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editData.title,
        projectId: editData.projectId || null,
        priority: editData.priority,
        dueDate: editData.dueDate || null,
      }),
    });
    if (res.ok) {
      const proj = projects.find((p) => p.id === editData.projectId) || null;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                title: editData.title,
                projectId: editData.projectId || null,
                priority: editData.priority,
                dueDate: editData.dueDate ? new Date(editData.dueDate) : null,
                project: proj,
              }
            : t
        )
      );
      setEditingId(null);
    }
  }

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "todo", label: "To Do" },
    { key: "in_progress", label: "In Progress" },
    { key: "done", label: "Done" },
  ];

  function TaskRow({ task }) {
    const overdue = isOverdue(task);
    const isDone = task.status === "done";

    if (editingId === task.id) {
      return (
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50">
          <input
            className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm focus:outline-none focus:border-zinc-500"
            value={editData.title}
            onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))}
          />
          <select
            className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-600 focus:outline-none"
            value={editData.projectId}
            onChange={(e) => setEditData((d) => ({ ...d, projectId: e.target.value }))}
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <select
            className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-600 focus:outline-none"
            value={editData.priority}
            onChange={(e) => setEditData((d) => ({ ...d, priority: e.target.value }))}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-600 focus:outline-none"
            value={editData.dueDate}
            onChange={(e) => setEditData((d) => ({ ...d, dueDate: e.target.value }))}
          />
          <button
            onClick={() => saveEdit(task.id)}
            className="rounded bg-zinc-900 px-2 py-1 text-xs text-white hover:bg-zinc-700"
          >
            Save
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="rounded px-2 py-1 text-xs text-zinc-500 hover:text-zinc-900"
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors group",
          isDone && "opacity-50"
        )}
      >
        {/* Checkbox */}
        <button
          onClick={() => toggleDone(task)}
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
            isDone
              ? "border-zinc-400 bg-zinc-400"
              : "border-zinc-300 hover:border-zinc-500"
          )}
        >
          {isDone && <Check className="h-2.5 w-2.5 text-white" />}
        </button>

        {/* Priority dot */}
        <span className={cn("h-2 w-2 shrink-0 rounded-full", PRIORITY_DOT[task.priority])} />

        {/* Title */}
        <span className={cn("flex-1 text-sm text-zinc-800", isDone && "line-through text-zinc-400")}>
          {task.title}
        </span>

        {/* Project badge */}
        {task.project && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">
            {task.project.title}
          </span>
        )}

        {/* Due date */}
        {task.dueDate && (
          <span className={cn("text-xs", overdue ? "text-red-500 font-medium" : "text-zinc-400")}>
            {formatDate(task.dueDate)}
          </span>
        )}

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === task.id ? null : task.id)}
            className="rounded p-1 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {openMenu === task.id && (
            <div className="absolute right-0 z-10 mt-1 w-32 rounded-lg border border-zinc-200 bg-white shadow-md">
              <button
                onClick={() => startEdit(task)}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900">Tasks</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add task
          </button>
        </div>

        {/* Stats */}
        <div className="mb-5 flex gap-2">
          {[
            { label: "Total", value: stats.total },
            { label: "To Do", value: stats.todo },
            { label: "In Progress", value: stats.in_progress },
            { label: "Done", value: stats.done },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600"
            >
              <span className="font-semibold text-zinc-900">{s.value}</span>
              {s.label}
            </div>
          ))}
        </div>

        {/* Inline add form */}
        {showForm && (
          <div className="mb-5 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <form onSubmit={handleAddTask} className="flex flex-col gap-3">
              <input
                type="text"
                required
                placeholder="Task title"
                value={formData.title}
                onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-zinc-400 focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData((d) => ({ ...d, projectId: e.target.value }))}
                  className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs text-zinc-600 focus:outline-none"
                >
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData((d) => ({ ...d, priority: e.target.value }))}
                  className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs text-zinc-600 focus:outline-none"
                >
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((d) => ({ ...d, dueDate: e.target.value }))}
                  className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs text-zinc-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                >
                  {submitting ? "Adding…" : "Add task"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter tabs */}
        <div className="mb-4 flex gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                filter === tab.key
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          {active.length === 0 && done.length === 0 && (
            <p className="px-6 py-12 text-center text-sm text-zinc-400">
              No tasks yet. Add your first task above.
            </p>
          )}

          {active.length > 0 && (
            <div className="divide-y divide-zinc-100">
              {active.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}

          {done.length > 0 && (
            <>
              {active.length > 0 && <div className="border-t border-zinc-100" />}
              <div className="px-4 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Completed ({done.length})
                </p>
              </div>
              <div className="divide-y divide-zinc-100">
                {done.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
