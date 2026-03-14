"use client";

import { useMemo, useState, useRef } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
  X,
  CheckSquare,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { inputClassName, selectClassName, textareaClassName, FormLabel } from "@/components/ui/Input";
import Modal from "@/components/shared/Modal";
import Button from "@/components/ui/Button";
import { PRIORITY_DOT, STATUS_OPTIONS, STATUS_PILL, makeSubtask, cleanSubtasks, isOverdue } from "@/app/(app)/tasks/taskUtils";

const emptyForm = {
  title: "",
  assigneeMemberId: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  description: "",
  subtasks: [makeSubtask("")],
};

export default function ProjectTasksSection({ project, tasks: initialTasks, teamMembers }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState(() => new Set());
  const [togglingTaskId, setTogglingTaskId] = useState(null);
  const [togglingSubtaskId, setTogglingSubtaskId] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuccess, setAiSuccess] = useState(false);
  const [newTaskId, setNewTaskId] = useState(null);
  const newTaskTimerRef = useRef(null);

  const active = useMemo(() => tasks.filter((t) => t.status !== "done").sort((a, b) => {
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  }), [tasks]);

  const done = useMemo(() => tasks.filter((t) => t.status === "done"), [tasks]);

  function resetForm() {
    setFormData({ ...emptyForm, subtasks: [makeSubtask("")] });
    setAiOpen(false);
    setAiPrompt("");
    setAiError("");
    setAiSuccess(false);
  }

  function updateFormSubtask(id, title) {
    setFormData((prev) => ({ ...prev, subtasks: prev.subtasks.map((s) => (s.id === id ? { ...s, title } : s)) }));
  }
  function addFormSubtask() {
    setFormData((prev) => ({ ...prev, subtasks: [...prev.subtasks, makeSubtask("")] }));
  }
  function removeFormSubtask(id) {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.length === 1 ? [makeSubtask("")] : prev.subtasks.filter((s) => s.id !== id),
    }));
  }

  function updateEditSubtask(id, title) {
    setEditData((prev) => ({ ...prev, subtasks: prev.subtasks.map((s) => (s.id === id ? { ...s, title } : s)) }));
  }
  function addEditSubtask() {
    setEditData((prev) => ({ ...prev, subtasks: [...prev.subtasks, makeSubtask("")] }));
  }
  function removeEditSubtask(id) {
    setEditData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.length === 1 ? [makeSubtask("")] : prev.subtasks.filter((s) => s.id !== id),
    }));
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

  async function handleAddTask(e) {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.title,
        projectId: project.id,
        assigneeMemberId: formData.assigneeMemberId || null,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || null,
        description: formData.description.trim() || null,
        subtasks: cleanSubtasks(formData.subtasks),
      }),
    });
    if (res.ok) {
      const { task } = await res.json();
      setTasks((prev) => [task, ...prev]);
      setNewTaskId(task.id);
      clearTimeout(newTaskTimerRef.current);
      newTaskTimerRef.current = setTimeout(() => setNewTaskId(null), 1500);
      if (task.description || task.subtasks?.length) {
        setExpandedTaskIds((prev) => new Set(prev).add(task.id));
      }
      resetForm();
      setShowForm(false);
    }
    setSubmitting(false);
  }

  async function patchTask(taskId, payload) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const { task } = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
    return task;
  }

  async function toggleDone(task) {
    const nextStatus = task.status === "done" ? "todo" : "done";
    const hasSubtasks = (task.subtasks?.length ?? 0) > 0;
    if (nextStatus === "done" && hasSubtasks) {
      setExpandedTaskIds((prev) => { const next = new Set(prev); next.add(task.id); return next; });
      return;
    }
    setTogglingTaskId(task.id);
    await patchTask(task.id, { status: nextStatus, completedAt: nextStatus === "done" ? new Date().toISOString() : null });
    setTogglingTaskId(null);
  }

  async function toggleSubtask(task, subtaskId) {
    if (togglingSubtaskId) return;
    const updatedSubtasks = task.subtasks.map((s) => s.id === subtaskId ? { ...s, done: !s.done } : s);
    setTogglingSubtaskId(subtaskId);
    const updatedTask = await patchTask(task.id, { subtasks: updatedSubtasks });
    setTogglingSubtaskId(null);
    if (updatedTask && updatedSubtasks.every((s) => s.done) && task.status !== "done") {
      setTogglingTaskId(task.id);
      await patchTask(task.id, { status: "done", completedAt: new Date().toISOString() });
      setTogglingTaskId(null);
    }
  }

  async function handleDelete(taskId) {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setOpenMenu(null);
  }

  function toggleExpanded(taskId) {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId); else next.add(taskId);
      return next;
    });
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      assigneeMemberId: task.assigneeMemberId || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.toString().slice(0, 10) : "",
      description: task.description || "",
      subtasks: task.subtasks?.length ? task.subtasks : [makeSubtask("")],
    });
    setOpenMenu(null);
    setExpandedTaskIds((prev) => new Set(prev).add(task.id));
  }

  async function saveEdit(taskId) {
    const task = await patchTask(taskId, {
      title: editData.title,
      assigneeMemberId: editData.assigneeMemberId || null,
      priority: editData.priority,
      status: editData.status,
      dueDate: editData.dueDate || null,
      description: editData.description?.trim() || null,
      subtasks: cleanSubtasks(editData.subtasks),
      completedAt: editData.status === "done" ? new Date().toISOString() : null,
    });
    if (task) setEditingId(null);
  }

  function TaskEditor({ taskId }) {
    return (
      <div className="space-y-4 border-t border-zinc-100 bg-zinc-50 px-4 py-4">
        <input
          className={inputClassName}
          value={editData.title}
          onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))}
          placeholder="Task title"
        />
        <div className="grid gap-3 md:grid-cols-4">
          <select className={selectClassName} value={editData.assigneeMemberId} onChange={(e) => setEditData((d) => ({ ...d, assigneeMemberId: e.target.value }))}>
            <option value="">Me</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}{m.status === "pending" ? " (Pending)" : ""}</option>
            ))}
          </select>
          <select className={selectClassName} value={editData.priority} onChange={(e) => setEditData((d) => ({ ...d, priority: e.target.value }))}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select className={selectClassName} value={editData.status} onChange={(e) => setEditData((d) => ({ ...d, status: e.target.value }))}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input type="date" className={inputClassName} value={editData.dueDate} onChange={(e) => setEditData((d) => ({ ...d, dueDate: e.target.value }))} />
        </div>
        <textarea rows={3} value={editData.description} onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))} placeholder="Add notes" className={textareaClassName} />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Subtasks</p>
            <button type="button" onClick={addEditSubtask} className="text-xs font-medium text-zinc-500 hover:text-zinc-900">+ Add subtask</button>
          </div>
          {editData.subtasks.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-zinc-200" />
              <input value={s.title} onChange={(e) => updateEditSubtask(s.id, e.target.value)} placeholder="Subtask title" className={inputClassName} />
              <button type="button" onClick={() => removeEditSubtask(s.id)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setEditingId(null)} className="rounded px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900">Cancel</button>
          <button type="button" onClick={() => saveEdit(taskId)} className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Save task</button>
        </div>
      </div>
    );
  }

  function TaskDetails({ task }) {
    const subtasks = task.subtasks || [];
    if (!task.description && subtasks.length === 0) return null;
    return (
      <div className="border-t border-zinc-100 bg-zinc-50/60 px-5 py-4">
        {task.description && (
          <div className="mb-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Notes</p>
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
                  <button key={subtask.id} type="button" disabled={isSubtaskToggling}
                    onClick={() => !isSubtaskToggling && toggleSubtask(task, subtask.id)}
                    className="flex w-full items-center gap-3 rounded border border-zinc-200 bg-white px-3 py-2 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-wait"
                  >
                    <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-all duration-200",
                      isSubtaskToggling ? "rounded-full border-blue-300 bg-white text-blue-400"
                      : subtask.done ? "rounded-full border-blue-600 bg-blue-600 text-white"
                      : "rounded-full border-zinc-300 bg-white text-transparent hover:border-blue-400"
                    )}>
                      {isSubtaskToggling ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" strokeWidth={3} />}
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

  function TaskRow({ task }) {
    const overdue = isOverdue(task);
    const isDone = task.status === "done";
    const subtasks = task.subtasks || [];
    const subtaskDone = subtasks.filter((s) => s.done).length;
    const subtaskTotal = subtasks.length;
    const hasSubtasks = subtaskTotal > 0;
    const subtaskRatio = subtaskTotal > 0 ? subtaskDone / subtaskTotal : 0;
    const hasDetails = Boolean(task.description) || hasSubtasks;
    const isExpanded = expandedTaskIds.has(task.id) || editingId === task.id;
    const isNew = newTaskId === task.id;
    const isToggling = togglingTaskId === task.id;

    return (
      <div className={cn("group transition-all duration-300", isDone && "opacity-60", isNew && "ring-2 ring-inset ring-blue-200 task-slide-down")}>
        <div className="flex items-start gap-3 px-4 py-4 transition-colors duration-150 hover:bg-zinc-50/80">
          {/* Checkbox */}
          <button type="button" onClick={() => !isToggling && toggleDone(task)} disabled={isToggling}
            className={cn("mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
              isToggling ? "border-blue-300 bg-white text-blue-400 cursor-wait"
              : isDone ? "border-blue-600 bg-blue-600 text-white"
              : "border-zinc-300 bg-white text-transparent hover:border-blue-400"
            )}
            aria-label={isDone ? "Mark task as incomplete" : "Mark task as complete"}
          >
            {isToggling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          </button>

          {/* Priority dot */}
          <span className={cn("mt-[9px] h-2.5 w-2.5 shrink-0 rounded-full", PRIORITY_DOT[task.priority])} />

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium transition-all duration-300", isDone ? "text-zinc-400 line-through" : "text-zinc-800")}>
                  {task.title}
                </p>
                {subtaskTotal > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${subtaskRatio * 100}%` }} />
                    </div>
                    <span className="shrink-0 text-[11px] tabular-nums text-zinc-400">{subtaskDone}/{subtaskTotal}</span>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_PILL[task.status] || STATUS_PILL.todo)}>
                    {STATUS_OPTIONS.find((o) => o.value === task.status)?.label || "To Do"}
                  </span>
                  {task.assigneeMember && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                      <UserRound className="h-3 w-3" />{task.assigneeMember.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Expand arrow */}
              {hasDetails && editingId !== task.id && (
                <button type="button" onClick={() => toggleExpanded(task.id)}
                  className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                    hasSubtasks ? "text-blue-500 hover:bg-blue-50 hover:text-blue-700" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  )}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}

              {/* Right controls */}
              <div className="flex shrink-0 items-center gap-1.5">
                {task.dueDate && (
                  overdue
                    ? <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">{formatDate(task.dueDate)}</span>
                    : <span className="text-xs text-zinc-400">{formatDate(task.dueDate)}</span>
                )}
                <div className="relative">
                  <button type="button" onClick={() => setOpenMenu(openMenu === task.id ? null : task.id)}
                    className="rounded p-1 text-zinc-300 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openMenu === task.id && (
                    <div className="absolute right-0 z-10 mt-1 w-32 rounded border border-zinc-200 bg-white shadow-md">
                      <button type="button" onClick={() => startEdit(task)} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50">
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(task.id)} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-zinc-900">Project tasks</h2>
          <p className="mt-1 text-xs text-zinc-400">Create, assign, edit, and complete delivery work without leaving this project.</p>
        </div>
        <button type="button" onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </button>
      </div>

      {/* Add Task Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Add Task" className="w-full max-w-3xl">
        <form onSubmit={handleAddTask} className="flex flex-col gap-5">

          {/* AI success flash */}
          {aiSuccess && (
            <div className="ai-success-flash flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              <Check className="h-4 w-4" strokeWidth={2.5} />
              Form filled by AI
            </div>
          )}

          {/* AI generator */}
          <div className={cn("overflow-hidden rounded border transition-all duration-300",
            aiOpen ? "border-purple-200 bg-gradient-to-br from-purple-50 to-white" : "border-dashed border-zinc-300"
          )} style={{ maxHeight: aiOpen ? "320px" : "44px" }}>
            {!aiOpen ? (
              <button type="button" onClick={() => setAiOpen(true)}
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
                  <button type="button" onClick={() => { setAiOpen(false); setAiPrompt(""); setAiError(""); }}
                    className="ml-auto flex h-6 w-6 items-center justify-center rounded text-purple-400 transition-colors hover:bg-purple-100 hover:text-purple-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <textarea autoFocus rows={3} value={aiPrompt}
                  onChange={(e) => { setAiPrompt(e.target.value); setAiError(""); }}
                  placeholder="e.g. Build a landing page for a SaaS product — design, copywriting, development and deployment by end of month"
                  className="w-full resize-none rounded border border-purple-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-purple-400 focus:outline-none"
                />
                {aiError && <p className="text-xs text-red-600">{aiError}</p>}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-purple-500">AI will fill the form with a title, subtasks, priority &amp; due date</p>
                  <button type="button" disabled={aiLoading || !aiPrompt.trim()} onClick={handleAiGenerate}
                    className="flex items-center gap-1.5 rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {aiLoading ? "Generating…" : "Generate"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Task title */}
          <div>
            <FormLabel htmlFor="pt-title" required>Task title</FormLabel>
            <input id="pt-title" type="text" required placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
              className={cn(inputClassName, "h-10 text-base font-medium")}
            />
          </div>

          {/* Assignee only — project is pre-selected */}
          <div>
            <FormLabel htmlFor="pt-assignee">Assignee</FormLabel>
            <select id="pt-assignee" value={formData.assigneeMemberId}
              onChange={(e) => setFormData((d) => ({ ...d, assigneeMemberId: e.target.value }))}
              className={selectClassName}
            >
              <option value="">Me</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}{m.status === "pending" ? " (Pending)" : ""}</option>
              ))}
            </select>
          </div>

          {/* Priority + Due date + Status */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <FormLabel htmlFor="pt-priority">Priority</FormLabel>
              <select id="pt-priority" value={formData.priority} onChange={(e) => setFormData((d) => ({ ...d, priority: e.target.value }))} className={selectClassName}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <FormLabel htmlFor="pt-due">Due date</FormLabel>
              <input id="pt-due" type="date" value={formData.dueDate} onChange={(e) => setFormData((d) => ({ ...d, dueDate: e.target.value }))} className={inputClassName} />
            </div>
            <div>
              <FormLabel htmlFor="pt-status">Status</FormLabel>
              <select id="pt-status" value={formData.status} onChange={(e) => setFormData((d) => ({ ...d, status: e.target.value }))} className={selectClassName}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <FormLabel htmlFor="pt-desc">Notes</FormLabel>
            <textarea id="pt-desc" rows={3} value={formData.description}
              onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
              placeholder="Add any notes or context for this task"
              className={textareaClassName}
            />
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Subtasks</p>
              <button type="button" onClick={addFormSubtask} className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900">+ Add subtask</button>
            </div>
            {formData.subtasks.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-zinc-200" />
                <input value={s.title} onChange={(e) => updateFormSubtask(s.id, e.target.value)} placeholder="Subtask title" className={inputClassName} />
                <button type="button" onClick={() => removeFormSubtask(s.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-zinc-200 text-zinc-400 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>{submitting ? "Adding..." : "Add task"}</Button>
          </div>
        </form>
      </Modal>

      {/* Task list */}
      <div className="rounded border border-zinc-200 bg-white shadow-sm">
        {active.length === 0 && done.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <CheckSquare className="mb-4 h-12 w-12 text-zinc-200" strokeWidth={1.5} />
            <p className="text-sm font-medium text-zinc-700">No tasks yet</p>
            <p className="mt-1 text-xs text-zinc-400">Add the first task or let AI break down a milestone</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div className="divide-y divide-zinc-100">
                {active.map((task) => <TaskRow key={task.id} task={task} />)}
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
                  {done.map((task) => <TaskRow key={task.id} task={task} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
