"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn, formatDate } from "@/lib/utils";
import Modal from "@/components/shared/Modal";
import {
  Plus,
  Search,
  ChevronDown,
  MoreHorizontal,
  Check,
  Pencil,
  Trash2,
  UserRound,
  ChevronRight,
  FileText,
} from "lucide-react";

const PRIORITY_DOT = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-zinc-400",
};

const FILTER_TABS = [
  { key: "all", label: "All", group: "Status" },
  { key: "todo", label: "To Do", group: "Status" },
  { key: "done", label: "Done", group: "Status" },
  { key: "today", label: "Today", group: "Date" },
  { key: "tomorrow", label: "Tomorrow", group: "Date" },
  { key: "yesterday", label: "Yesterday", group: "Date" },
  { key: "this_week", label: "This Week", group: "Date" },
  { key: "last_week", label: "Last Week", group: "Date" },
  { key: "overdue", label: "Overdue", group: "Date" },
];

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeek(date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function endOfWeek(date) {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  return endOfDay(next);
}

function isOverdue(task) {
  if (!task.dueDate || task.status === "done") return false;
  return new Date(task.dueDate) < new Date();
}

function makeSubtask(title = "") {
  return {
    id: `subtask-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    done: false,
  };
}

const emptyTaskForm = {
  title: "",
  projectId: "",
  assigneeMemberId: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  description: "",
  subtasks: [makeSubtask("")],
};

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const STATUS_PILL = {
  todo: "bg-zinc-100 text-zinc-600",
  in_progress: "bg-blue-50 text-blue-700",
  done: "bg-green-50 text-green-700",
};

function cleanSubtasks(subtasks) {
  return (subtasks || []).filter((subtask) => subtask.title.trim());
}

export default function TasksClient({ tasks: initialTasks, projects, teamMembers }) {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyTaskForm);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedTaskIds, setExpandedTaskIds] = useState(() => new Set());

  function resetTaskForm() {
    setFormData({
      ...emptyTaskForm,
      subtasks: [makeSubtask("")],
    });
  }

  function toggleExpanded(taskId) {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  function updateFormSubtask(id, title) {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((subtask) => (subtask.id === id ? { ...subtask, title } : subtask)),
    }));
  }

  function addFormSubtask() {
    setFormData((prev) => ({ ...prev, subtasks: [...prev.subtasks, makeSubtask("")] }));
  }

  function removeFormSubtask(id) {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.length === 1 ? [makeSubtask("")] : prev.subtasks.filter((subtask) => subtask.id !== id),
    }));
  }

  function updateEditSubtask(id, title) {
    setEditData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((subtask) => (subtask.id === id ? { ...subtask, title } : subtask)),
    }));
  }

  function addEditSubtask() {
    setEditData((prev) => ({ ...prev, subtasks: [...prev.subtasks, makeSubtask("")] }));
  }

  function removeEditSubtask(id) {
    setEditData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.length === 1 ? [makeSubtask("")] : prev.subtasks.filter((subtask) => subtask.id !== id),
    }));
  }

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
        assigneeMemberId: formData.assigneeMemberId || null,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        description: formData.description.trim() || null,
        subtasks: cleanSubtasks(formData.subtasks),
      }),
    });

    if (res.ok) {
      const { task } = await res.json();
      setTasks((prev) => [task, ...prev]);
      resetTaskForm();
      setShowForm(false);
      if (task.description || task.subtasks?.length) {
        setExpandedTaskIds((prev) => new Set(prev).add(task.id));
      }
    }

    setSubmitting(false);
  }

  async function toggleDone(task) {
    const nextStatus = task.status === "done" ? "todo" : "done";
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus,
        completedAt: nextStatus === "done" ? new Date().toISOString() : null,
      }),
    });

    if (res.ok) {
      const { task: updatedTask } = await res.json();
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updatedTask : item)));
    }
  }

  async function toggleSubtask(task, subtaskId) {
    const updatedSubtasks = task.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
    );

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtasks: updatedSubtasks }),
    });

    if (res.ok) {
      const { task: updatedTask } = await res.json();
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updatedTask : item)));
    }
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    }
    setOpenMenu(null);
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      projectId: task.projectId || "",
      assigneeMemberId: task.assigneeMemberId || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toString().slice(0, 10) : "",
      description: task.description || "",
      subtasks: task.subtasks?.length ? task.subtasks : [makeSubtask("")],
    });
    setOpenMenu(null);
    setExpandedTaskIds((prev) => new Set(prev).add(task.id));
  }

  async function saveEdit(id) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editData.title,
        projectId: editData.projectId || null,
        assigneeMemberId: editData.assigneeMemberId || null,
        status: editData.status,
        priority: editData.priority,
        dueDate: editData.dueDate || null,
        description: editData.description?.trim() || null,
        subtasks: cleanSubtasks(editData.subtasks),
      }),
    });

    if (res.ok) {
      const { task } = await res.json();
      setTasks((prev) => prev.map((item) => (item.id === id ? task : item)));
      setEditingId(null);
    }
  }

  const filterOptions = useMemo(
    () => FILTER_TABS.filter((o) => o.label.toLowerCase().includes(filterSearch.trim().toLowerCase())),
    [filterSearch]
  );

  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const tomorrowStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  const tomorrowEnd = endOfDay(tomorrowStart);
  const yesterdayStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const yesterdayEnd = endOfDay(yesterdayStart);
  const thisWeekStart = startOfWeek(now);
  const thisWeekEnd = endOfWeek(now);
  const lastWeekStart = startOfWeek(new Date(thisWeekStart.getFullYear(), thisWeekStart.getMonth(), thisWeekStart.getDate() - 7));
  const lastWeekEnd = endOfWeek(lastWeekStart);

  const filtered = tasks.filter((task) => {
    const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "todo" || filter === "in_progress" || filter === "done"
          ? task.status === filter
          : filter === "today"
            ? taskDueDate && taskDueDate >= todayStart && taskDueDate <= todayEnd
            : filter === "tomorrow"
              ? taskDueDate && taskDueDate >= tomorrowStart && taskDueDate <= tomorrowEnd
              : filter === "yesterday"
                ? taskDueDate && taskDueDate >= yesterdayStart && taskDueDate <= yesterdayEnd
                : filter === "this_week"
                  ? taskDueDate && taskDueDate >= thisWeekStart && taskDueDate <= thisWeekEnd
                    : filter === "last_week"
                    ? taskDueDate && taskDueDate >= lastWeekStart && taskDueDate <= lastWeekEnd
                    : filter === "overdue"
                      ? taskDueDate && task.status !== "done" && taskDueDate < todayStart
                      : true;
    const matchesQuery = !query
      ? true
      : task.title.toLowerCase().includes(query) ||
        (task.description || "").toLowerCase().includes(query) ||
        (task.project?.title || "").toLowerCase().includes(query) ||
        (task.assigneeMember?.name || "").toLowerCase().includes(query);

    return matchesFilter && matchesQuery;
  });

  const active = filtered.filter((task) => task.status !== "done");
  const done = filtered.filter((task) => task.status === "done");

  function getFilterHeading(filterKey) {
    if (filterKey === "all") return "Tasks";
    if (filterKey === "todo") return "To Do Tasks";
    if (filterKey === "today") return "Today Tasks";
    if (filterKey === "tomorrow") return "Tomorrow Tasks";
    if (filterKey === "yesterday") return "Yesterday Tasks";
    if (filterKey === "this_week") return "This Week Tasks";
    if (filterKey === "last_week") return "Last Week Tasks";
    if (filterKey === "overdue") return "Overdue Tasks";
    return "Done Tasks";
  }

  function TaskDetails({ task }) {
    const subtasks = task.subtasks || [];

    if (!task.description && subtasks.length === 0) return null;

    return (
      <div className="border-t border-zinc-100 bg-zinc-50/60 px-5 py-4">
        {task.description && (
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <FileText className="h-3.5 w-3.5" />
              Notes
            </div>
            <p className="whitespace-pre-wrap text-sm text-zinc-600">{task.description}</p>
          </div>
        )}

        {subtasks.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Subtasks</p>
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <button
                  key={subtask.id}
                  type="button"
                  onClick={() => toggleSubtask(task, subtask.id)}
                  className="flex w-full items-center gap-3 rounded border border-zinc-200 bg-white px-3 py-1.5 text-left hover:border-zinc-300"
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                      subtask.done ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white text-transparent"
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className={cn("text-sm text-zinc-700", subtask.done && "text-zinc-400 line-through")}>
                    {subtask.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function TaskEditor({ taskId }) {
    return (
      <div className="space-y-4 bg-zinc-50 px-4 py-4">
        <input
          className="w-full rounded border border-zinc-300 px-3 py-1.5 text-sm focus:border-zinc-500 focus:outline-none"
          value={editData.title}
          onChange={(e) => setEditData((data) => ({ ...data, title: e.target.value }))}
          placeholder="Task title"
        />

        <div className="grid gap-3 md:grid-cols-5">
          <select
            className="rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 focus:outline-none"
            value={editData.projectId}
            onChange={(e) => setEditData((data) => ({ ...data, projectId: e.target.value }))}
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
          <select
            className="rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 focus:outline-none"
            value={editData.assigneeMemberId}
            onChange={(e) => setEditData((data) => ({ ...data, assigneeMemberId: e.target.value }))}
          >
            <option value="">Me</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} {member.status === "pending" ? "(Pending)" : ""}
              </option>
            ))}
          </select>
          <select
            className="rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 focus:outline-none"
            value={editData.status}
            onChange={(e) => setEditData((data) => ({ ...data, status: e.target.value }))}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 focus:outline-none"
            value={editData.priority}
            onChange={(e) => setEditData((data) => ({ ...data, priority: e.target.value }))}
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <input
            type="date"
            className="rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 focus:outline-none"
            value={editData.dueDate}
            onChange={(e) => setEditData((data) => ({ ...data, dueDate: e.target.value }))}
          />
        </div>

        <textarea
          rows={3}
          value={editData.description}
          onChange={(e) => setEditData((data) => ({ ...data, description: e.target.value }))}
          placeholder="Add notes for this task"
          className="w-full rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-800 focus:border-zinc-400 focus:outline-none"
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-900">Subtasks</p>
            <button type="button" onClick={addEditSubtask} className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
              Add subtask
            </button>
          </div>
          {editData.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2">
              <input
                value={subtask.title}
                onChange={(e) => updateEditSubtask(subtask.id, e.target.value)}
                placeholder="Subtask title"
                className="flex-1 rounded border border-zinc-200 px-3 py-1.5 text-sm focus:border-zinc-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeEditSubtask(subtask.id)}
                className="rounded border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditingId(null)}
            className="rounded px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => saveEdit(taskId)}
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Save task
          </button>
        </div>
      </div>
    );
  }

  function TaskRow({ task }) {
    const overdue = isOverdue(task);
    const isDone = task.status === "done";
    const hasDetails = Boolean(task.description) || (task.subtasks?.length ?? 0) > 0;
    const isExpanded = expandedTaskIds.has(task.id) || editingId === task.id;

    return (
      <div className={cn("group transition-colors", isDone && "opacity-70")}>
        <div className="flex items-start gap-3 px-4 py-4 hover:bg-zinc-50">
          <button
            type="button"
            onClick={() => toggleDone(task)}
            className={cn(
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border-2 transition-colors",
              isDone ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white text-transparent hover:border-zinc-500"
            )}
            aria-label={isDone ? "Mark task as incomplete" : "Mark task as complete"}
          >
            <Check className="h-4 w-4" />
          </button>

          <span className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", PRIORITY_DOT[task.priority])} />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={cn("text-sm font-medium text-zinc-800", isDone && "line-through text-zinc-400")}>
                  {task.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {task.project && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">
                      {task.project.title}
                    </span>
                  )}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_PILL[task.status] || STATUS_PILL.todo)}>
                    {STATUS_OPTIONS.find((option) => option.value === task.status)?.label || "To Do"}
                  </span>
                  {task.assigneeMember && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                      <UserRound className="h-3 w-3" />
                      {task.assigneeMember.name}
                    </span>
                  )}
                  {task.subtasks?.length > 0 && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">
                      {task.subtasks.filter((subtask) => subtask.done).length}/{task.subtasks.length} subtasks
                    </span>
                  )}
                  {task.description && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">
                      Notes
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {task.dueDate && (
                  <span className={cn("text-xs", overdue ? "font-medium text-red-500" : "text-zinc-400")}>
                    {formatDate(task.dueDate)}
                  </span>
                )}

                {hasDetails && editingId !== task.id && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(task.id)}
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenu(openMenu === task.id ? null : task.id)}
                    className="rounded p-1 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openMenu === task.id && (
                    <div className="absolute right-0 z-10 mt-1 w-32 rounded border border-zinc-200 bg-white shadow-md">
                      <button
                        type="button"
                        onClick={() => startEdit(task)}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(task.id)}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {editingId === task.id ? <TaskEditor taskId={task.id} /> : isExpanded ? <TaskDetails task={task} /> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="inline-flex items-center justify-between gap-2 rounded-lg bg-zinc-100 px-2 py-1 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              <span className="text-lg font-bold tracking-tight">{getFilterHeading(filter)}</span>
              <ChevronDown className={cn("h-5 w-5 text-blue-600 transition-transform", filterOpen ? "rotate-180" : "")} />
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
                    className="h-11 w-full rounded-xl border border-blue-500 pl-11 pr-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                  />
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {["Status", "Date"].map((group) => {
                    const groupOptions = filterOptions.filter((option) => option.group === group);
                    if (groupOptions.length === 0) return null;

                    return (
                      <div key={group} className="mb-1 last:mb-0">
                        <div className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                          {group}
                        </div>
                        {groupOptions.map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => {
                              setFilter(option.key);
                              setFilterOpen(false);
                              setFilterSearch("");
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition-colors",
                              filter === option.key ? "bg-zinc-50 text-zinc-900" : "text-zinc-700 hover:bg-zinc-50"
                            )}
                          >
                            <span>{option.label}</span>
                            {filter === option.key && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                  {filterOptions.length === 0 && (
                    <div className="px-4 py-6 text-sm text-zinc-400">No filters found.</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
            Add task
          </button>
        </div>
      </div>

      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          resetTaskForm();
        }}
        title="Add Task"
        className="max-w-3xl"
      >
          <form onSubmit={handleAddTask} className="flex flex-col gap-4">
            <input
              type="text"
              required
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData((data) => ({ ...data, title: e.target.value }))}
              className="w-full rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-zinc-400 focus:outline-none"
            />

            <div className="grid gap-3 md:grid-cols-5">
              <select
                value={formData.projectId}
                onChange={(e) => setFormData((data) => ({ ...data, projectId: e.target.value }))}
                className="rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-600 focus:outline-none"
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
              <select
                value={formData.assigneeMemberId}
                onChange={(e) => setFormData((data) => ({ ...data, assigneeMemberId: e.target.value }))}
                className="rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-600 focus:outline-none"
              >
                <option value="">Me</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.status === "pending" ? "(Pending)" : ""}
                  </option>
                ))}
              </select>
              <select
                value={formData.status}
                onChange={(e) => setFormData((data) => ({ ...data, status: e.target.value }))}
                className="rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-600 focus:outline-none"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={formData.priority}
                onChange={(e) => setFormData((data) => ({ ...data, priority: e.target.value }))}
                className="rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-600 focus:outline-none"
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((data) => ({ ...data, dueDate: e.target.value }))}
                className="rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-600 focus:outline-none"
              />
            </div>

            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((data) => ({ ...data, description: e.target.value }))}
              placeholder="Add notes for this task"
              className="w-full rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-zinc-400 focus:outline-none"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-900">Subtasks</p>
                <button type="button" onClick={addFormSubtask} className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
                  Add subtask
                </button>
              </div>
              {formData.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <input
                    value={subtask.title}
                    onChange={(e) => updateFormSubtask(subtask.id, e.target.value)}
                    placeholder="Subtask title"
                    className="flex-1 rounded border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeFormSubtask(subtask.id)}
                    className="rounded border border-zinc-200 px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetTaskForm();
                }}
                className="rounded border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add task"}
              </button>
            </div>
          </form>
      </Modal>

      <div className="rounded border border-zinc-200 bg-white shadow-sm">
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
            <div className="px-3 py-1.5">
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
  );
}
