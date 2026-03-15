"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn, formatDate } from "@/lib/utils";
import { inputClassName, selectClassName, textareaClassName, FormLabel } from "@/components/ui/Input";
import Modal from "@/components/shared/Modal";
import Button from "@/components/ui/Button";
import CollectionPageHeader, { collectionPageHeaderPrimaryActionClassName } from "@/components/shared/CollectionPageHeader";
import {
  Plus,
  ChevronDown,
  MoreHorizontal,
  Check,
  Pencil,
  Trash2,
  UserRound,
  ChevronRight,
  FileText,
  Sparkles,
  Loader2,
  CheckSquare,
  X,
} from "lucide-react";

import { PRIORITY_DOT, STATUS_OPTIONS, STATUS_PILL, makeSubtask, cleanSubtasks, isOverdue } from "./taskUtils";

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
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuccess, setAiSuccess] = useState(false);
  const [newTaskId, setNewTaskId] = useState(null);
  const [togglingTaskId, setTogglingTaskId] = useState(null);
  const [togglingSubtaskId, setTogglingSubtaskId] = useState(null);
  const newTaskTimerRef = useRef(null);

  function resetTaskForm() {
    setFormData({ ...emptyTaskForm, subtasks: [makeSubtask("")] });
    setAiOpen(false);
    setAiPrompt("");
    setAiError("");
    setAiSuccess(false);
  }

  async function handleAiGenerate() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/tasks/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiPrompt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to generate task.");
      const t = data.task;
      setFormData((prev) => ({
        ...prev,
        title: t.title,
        description: t.description || "",
        priority: t.priority,
        dueDate: t.dueDate || "",
        subtasks: t.subtasks.length ? t.subtasks : [makeSubtask("")],
      }));
      setAiOpen(false);
      setAiPrompt("");
      setAiSuccess(true);
      setTimeout(() => setAiSuccess(false), 2000);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
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
      // Highlight the new task row briefly
      setNewTaskId(task.id);
      if (newTaskTimerRef.current) clearTimeout(newTaskTimerRef.current);
      newTaskTimerRef.current = setTimeout(() => setNewTaskId(null), 1500);
    }

    setSubmitting(false);
  }

  async function toggleDone(task) {
    const nextStatus = task.status === "done" ? "todo" : "done";
    const hasSubtasks = (task.subtasks?.length ?? 0) > 0;

    // If marking done and has subtasks — expand to show them first, don't mark done yet
    if (nextStatus === "done" && hasSubtasks) {
      setExpandedTaskIds((prev) => {
        const next = new Set(prev);
        next.add(task.id);
        return next;
      });
      return;
    }

    // Show loading spinner on checkbox, disable it
    setTogglingTaskId(task.id);

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus,
        completedAt: nextStatus === "done" ? new Date().toISOString() : null,
      }),
    });

    setTogglingTaskId(null);

    if (res.ok) {
      const { task: updatedTask } = await res.json();
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updatedTask : item)));
    }
    // On failure, do nothing — checkbox returns to original state automatically
  }

  async function toggleSubtask(task, subtaskId) {
    if (togglingSubtaskId) return;

    const updatedSubtasks = task.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
    );

    setTogglingSubtaskId(subtaskId);

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtasks: updatedSubtasks }),
    });

    setTogglingSubtaskId(null);

    if (res.ok) {
      const { task: updatedTask } = await res.json();
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updatedTask : item)));

      // If all subtasks are now done, auto-complete the main task
      const allDone = updatedSubtasks.every((s) => s.done);
      if (allDone && task.status !== "done") {
        setTogglingTaskId(task.id);
        const mainRes = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "done", completedAt: new Date().toISOString() }),
        });
        setTogglingTaskId(null);
        if (mainRes.ok) {
          const { task: completedTask } = await mainRes.json();
          setTasks((prev) => prev.map((item) => (item.id === task.id ? completedTask : item)));
        }
      }
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

  const dateRanges = useMemo(() => {
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
    return { todayStart, todayEnd, tomorrowStart, tomorrowEnd, yesterdayStart, yesterdayEnd, thisWeekStart, thisWeekEnd, lastWeekStart, lastWeekEnd };
  }, []);

  const { todayStart, todayEnd, tomorrowStart, tomorrowEnd, yesterdayStart, yesterdayEnd, thisWeekStart, thisWeekEnd, lastWeekStart, lastWeekEnd } = dateRanges;

  const filtered = useMemo(() => tasks.filter((task) => {
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
  }), [tasks, filter, query, todayStart, todayEnd, tomorrowStart, tomorrowEnd, yesterdayStart, yesterdayEnd, thisWeekStart, thisWeekEnd, lastWeekStart, lastWeekEnd]);

  const active = useMemo(() => filtered.filter((task) => task.status !== "done"), [filtered]);
  const done = useMemo(() => filtered.filter((task) => task.status === "done"), [filtered]);

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
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              <FileText className="h-3.5 w-3.5" />
              Notes
            </div>
            <p className="whitespace-pre-wrap text-sm text-zinc-600">{task.description}</p>
          </div>
        )}

        {subtasks.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Subtasks</p>
            <div className="space-y-2">
              {subtasks.map((subtask) => {
                const isSubtaskToggling = togglingSubtaskId === subtask.id;
                return (
                  <button
                    key={subtask.id}
                    type="button"
                    disabled={isSubtaskToggling}
                    onClick={() => !isSubtaskToggling && toggleSubtask(task, subtask.id)}
                    className="flex w-full items-center gap-3 rounded border border-zinc-200 bg-white px-3 py-2 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-wait"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-all duration-200",
                        isSubtaskToggling
                          ? "rounded-full border-blue-300 bg-white text-blue-400"
                          : subtask.done
                          ? "rounded-full border-blue-600 bg-blue-600 text-white"
                          : "rounded-full border-zinc-300 bg-white text-transparent hover:border-blue-400"
                      )}
                    >
                      {isSubtaskToggling
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Check className="h-3 w-3" strokeWidth={3} />
                      }
                    </span>
                    <span className={cn("text-sm transition-all duration-200", subtask.done ? "text-zinc-400 line-through" : "text-zinc-700")}>
                      {subtask.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  function TaskEditor({ taskId }) {
    return (
      <div className="space-y-4 border-t border-zinc-100 bg-zinc-50/60 px-5 py-5">
        {/* Title */}
        <div>
          <FormLabel htmlFor={`edit-title-${taskId}`}>Task title</FormLabel>
          <input
            id={`edit-title-${taskId}`}
            className={inputClassName}
            value={editData.title}
            onChange={(e) => setEditData((data) => ({ ...data, title: e.target.value }))}
            placeholder="Task title"
          />
        </div>

        {/* Project + Assignee */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor={`edit-project-${taskId}`}>Project</FormLabel>
            <select
              id={`edit-project-${taskId}`}
              className={selectClassName}
              value={editData.projectId}
              onChange={(e) => setEditData((data) => ({ ...data, projectId: e.target.value }))}
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </div>
          <div>
            <FormLabel htmlFor={`edit-assignee-${taskId}`}>Assignee</FormLabel>
            <select
              id={`edit-assignee-${taskId}`}
              className={selectClassName}
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
          </div>
        </div>

        {/* Priority + Due Date + Status */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <FormLabel htmlFor={`edit-priority-${taskId}`}>Priority</FormLabel>
            <select
              id={`edit-priority-${taskId}`}
              className={selectClassName}
              value={editData.priority}
              onChange={(e) => setEditData((data) => ({ ...data, priority: e.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <FormLabel htmlFor={`edit-due-${taskId}`}>Due date</FormLabel>
            <input
              id={`edit-due-${taskId}`}
              type="date"
              className={inputClassName}
              value={editData.dueDate}
              onChange={(e) => setEditData((data) => ({ ...data, dueDate: e.target.value }))}
            />
          </div>
          <div>
            <FormLabel htmlFor={`edit-status-${taskId}`}>Status</FormLabel>
            <select
              id={`edit-status-${taskId}`}
              className={selectClassName}
              value={editData.status}
              onChange={(e) => setEditData((data) => ({ ...data, status: e.target.value }))}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <FormLabel htmlFor={`edit-desc-${taskId}`}>Notes</FormLabel>
          <textarea
            id={`edit-desc-${taskId}`}
            rows={3}
            value={editData.description}
            onChange={(e) => setEditData((data) => ({ ...data, description: e.target.value }))}
            placeholder="Add notes for this task"
            className={textareaClassName}
          />
        </div>

        {/* Subtasks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Subtasks</p>
            <button type="button" onClick={addEditSubtask} className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              + Add subtask
            </button>
          </div>
          {editData.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-zinc-200" />
              <input
                value={subtask.title}
                onChange={(e) => updateEditSubtask(subtask.id, e.target.value)}
                placeholder="Subtask title"
                className={inputClassName}
              />
              <button
                type="button"
                onClick={() => removeEditSubtask(subtask.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-zinc-200 text-zinc-400 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
            Cancel
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={() => saveEdit(taskId)}>
            Save task
          </Button>
        </div>
      </div>
    );
  }

  function TaskRow({ task }) {
    const overdue = isOverdue(task);
    const isDone = task.status === "done";
    const subtasks = task.subtasks || [];
    const subtaskDone = subtasks.filter((s) => s.done).length;
    const subtaskTotal = subtasks.length;
    const hasSubtasks = subtaskTotal > 0;
    const hasDetails = Boolean(task.description) || hasSubtasks;
    const isExpanded = expandedTaskIds.has(task.id) || editingId === task.id;
    const isNew = newTaskId === task.id;
    const subtaskRatio = subtaskTotal > 0 ? subtaskDone / subtaskTotal : 0;

    return (
      <div
        className={cn(
          "group transition-all duration-300",
          isDone && "opacity-60",
          isNew && "ring-2 ring-inset ring-blue-200 task-slide-down"
        )}
      >
        <div className={cn("flex items-start gap-3 px-4 py-4 transition-colors duration-150", "hover:bg-zinc-50/80")}>
          {/* Checkbox */}
          {(() => {
            const isToggling = togglingTaskId === task.id;
            return (
              <button
                type="button"
                onClick={() => !isToggling && toggleDone(task)}
                disabled={isToggling}
                className={cn(
                  "mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
                  isToggling
                    ? "border-blue-300 bg-white text-blue-400 cursor-wait"
                    : isDone
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-zinc-300 bg-white text-transparent hover:border-blue-400"
                )}
                aria-label={isDone ? "Mark task as incomplete" : "Mark task as complete"}
              >
                {isToggling
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Check className="h-3.5 w-3.5" strokeWidth={3} />
                }
              </button>
            );
          })()}

          {/* Priority dot */}
          <span className={cn("mt-[9px] h-2.5 w-2.5 shrink-0 rounded-full", PRIORITY_DOT[task.priority])} />

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium transition-all duration-300",
                    isDone ? "text-zinc-400 line-through" : "text-zinc-800"
                  )}
                >
                  {task.title}
                </p>

                {/* Subtask progress bar */}
                {subtaskTotal > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-zinc-900 transition-all duration-500"
                        style={{ width: `${subtaskRatio * 100}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-[11px] tabular-nums text-zinc-400">
                      {subtaskDone}/{subtaskTotal}
                    </span>
                  </div>
                )}

                {/* Badges row */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {task.project && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">
                      {task.project.title}
                    </span>
                  )}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_PILL[task.status] || STATUS_PILL.todo)}>
                    {STATUS_OPTIONS.find((o) => o.value === task.status)?.label || "To Do"}
                  </span>
                  {task.assigneeMember && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                      <UserRound className="h-3 w-3" />
                      {task.assigneeMember.name}
                    </span>
                  )}
                  {task.description && !subtaskTotal && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">Notes</span>
                  )}
                </div>
              </div>

              {/* Expand arrow — sits between content and right controls, always accessible */}
              {hasDetails && editingId !== task.id && (
                <button
                  type="button"
                  onClick={() => toggleExpanded(task.id)}
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                    hasSubtasks
                      ? "text-blue-500 hover:bg-blue-50 hover:text-blue-700"
                      : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  )}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}

              {/* Right-side controls */}
              <div className="flex shrink-0 items-center gap-1.5">
                {task.dueDate && (
                  overdue ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                      {formatDate(task.dueDate)}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-400">{formatDate(task.dueDate)}</span>
                  )
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenu(openMenu === task.id ? null : task.id)}
                    className="rounded p-1 text-zinc-300 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openMenu === task.id && (
                    <div className="absolute right-0 z-10 mt-1 w-32 rounded border border-zinc-200 bg-white shadow-md">
                      <button
                        type="button"
                        onClick={() => startEdit(task)}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-50"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(task.id)}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50"
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
      <CollectionPageHeader
        title={getFilterHeading(filter)}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((value) => !value)}
        filterSearch={filterSearch}
        onFilterSearchChange={setFilterSearch}
        filterOptions={filterOptions}
        selectedFilterKey={filter}
        onSelectFilter={(key) => {
          setFilter(key);
          setFilterOpen(false);
          setFilterSearch("");
        }}
        actions={(
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className={collectionPageHeaderPrimaryActionClassName}
          >
            <Plus className="h-4 w-4" />
            Add task
          </button>
        )}
      />

      {/* Add Task Modal */}
      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          resetTaskForm();
        }}
        title="Add Task"
        className="w-full max-w-3xl"
      >
        <form onSubmit={handleAddTask} className="flex flex-col gap-5">

          {/* AI success flash */}
          {aiSuccess && (
            <div className="ai-success-flash flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              <Check className="h-4 w-4" strokeWidth={2.5} />
              Form filled by AI
            </div>
          )}

          {/* AI generate panel */}
          <div
            className={cn(
              "overflow-hidden rounded border transition-all duration-300",
              aiOpen
                ? "border-purple-200 bg-gradient-to-br from-purple-50 to-white"
                : "border-dashed border-zinc-300"
            )}
            style={{ maxHeight: aiOpen ? "320px" : "44px" }}
          >
            {!aiOpen ? (
              <button
                type="button"
                onClick={() => setAiOpen(true)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
              >
                <Sparkles className="h-4 w-4 text-purple-500" />
                Describe your milestone — AI will generate tasks &amp; subtasks
              </button>
            ) : (
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-purple-500" />
                  <span className="text-xs font-semibold text-purple-700">AI Task Generator</span>
                  <button
                    type="button"
                    onClick={() => { setAiOpen(false); setAiPrompt(""); setAiError(""); }}
                    className="ml-auto flex h-6 w-6 items-center justify-center rounded text-purple-400 transition-colors hover:bg-purple-100 hover:text-purple-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <textarea
                  autoFocus
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => { setAiPrompt(e.target.value); setAiError(""); }}
                  placeholder="e.g. Build a landing page for a SaaS product — design, copywriting, development and deployment by end of month"
                  className="w-full resize-none rounded border border-purple-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-purple-400 focus:outline-none"
                />
                {aiError && <p className="text-xs text-red-600">{aiError}</p>}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-purple-500">AI will fill the form with a title, subtasks, priority &amp; due date</p>
                  <button
                    type="button"
                    disabled={aiLoading || !aiPrompt.trim()}
                    onClick={handleAiGenerate}
                    className="flex items-center gap-1.5 rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {aiLoading ? "Generating…" : "Generate"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Task title — prominent */}
          <div>
            <FormLabel htmlFor="new-task-title" required>Task title</FormLabel>
            <input
              id="new-task-title"
              type="text"
              required
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData((data) => ({ ...data, title: e.target.value }))}
              className={cn(inputClassName, "h-10 text-base font-medium")}
            />
          </div>

          {/* Project + Assignee */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FormLabel htmlFor="new-task-project">Project</FormLabel>
              <select
                id="new-task-project"
                value={formData.projectId}
                onChange={(e) => setFormData((data) => ({ ...data, projectId: e.target.value }))}
                className={selectClassName}
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
            <div>
              <FormLabel htmlFor="new-task-assignee">Assignee</FormLabel>
              <select
                id="new-task-assignee"
                value={formData.assigneeMemberId}
                onChange={(e) => setFormData((data) => ({ ...data, assigneeMemberId: e.target.value }))}
                className={selectClassName}
              >
                <option value="">Me</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.status === "pending" ? "(Pending)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority + Due Date + Status */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <FormLabel htmlFor="new-task-priority">Priority</FormLabel>
              <select
                id="new-task-priority"
                value={formData.priority}
                onChange={(e) => setFormData((data) => ({ ...data, priority: e.target.value }))}
                className={selectClassName}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <FormLabel htmlFor="new-task-due">Due date</FormLabel>
              <input
                id="new-task-due"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((data) => ({ ...data, dueDate: e.target.value }))}
                className={inputClassName}
              />
            </div>
            <div>
              <FormLabel htmlFor="new-task-status">Status</FormLabel>
              <select
                id="new-task-status"
                value={formData.status}
                onChange={(e) => setFormData((data) => ({ ...data, status: e.target.value }))}
                className={selectClassName}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <FormLabel htmlFor="new-task-desc">Notes</FormLabel>
            <textarea
              id="new-task-desc"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((data) => ({ ...data, description: e.target.value }))}
              placeholder="Add any notes or context for this task"
              className={textareaClassName}
            />
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Subtasks</p>
              <button type="button" onClick={addFormSubtask} className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900">
                + Add subtask
              </button>
            </div>
            {formData.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-zinc-200" />
                <input
                  value={subtask.title}
                  onChange={(e) => updateFormSubtask(subtask.id, e.target.value)}
                  placeholder="Subtask title"
                  className={inputClassName}
                />
                <button
                  type="button"
                  onClick={() => removeFormSubtask(subtask.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-zinc-200 text-zinc-400 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                resetTaskForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {submitting ? "Adding..." : "Add task"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Task list */}
      <div className="px-4 pb-4 md:px-6">
      <div className="rounded border border-zinc-200 bg-white shadow-sm">
        {active.length === 0 && done.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <CheckSquare className="mb-4 h-12 w-12 text-zinc-200" strokeWidth={1.5} />
            <p className="text-sm font-medium text-zinc-700">No tasks yet</p>
            <p className="mt-1 text-xs text-zinc-400">Add your first task or let AI break down a milestone</p>
          </div>
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
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
