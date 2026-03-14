"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import Modal from "@/components/shared/Modal";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  RECURRING_FREQUENCIES,
} from "@/lib/expenses";
import { inputClassName, selectClassName, textareaClassName } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

function getDefaultForm(expense, recurringExpense) {
  if (recurringExpense) {
    return {
      description: recurringExpense.description || "",
      note: recurringExpense.note || "",
      amount: recurringExpense.amount ?? "",
      category: recurringExpense.category || "software",
      date: new Date(recurringExpense.nextDate).toISOString().split("T")[0],
      projectId: recurringExpense.projectId || "",
      isRecurring: true,
      frequency: recurringExpense.frequency || "monthly",
    };
  }

  if (expense) {
    return {
      description: expense.description || "",
      note: expense.note || "",
      amount: expense.amount ?? "",
      category: expense.category || "software",
      date: new Date(expense.date).toISOString().split("T")[0],
      projectId: expense.projectId || "",
      isRecurring: false,
      frequency: "monthly",
    };
  }

  return {
    description: "",
    note: "",
    amount: "",
    category: "software",
    date: new Date().toISOString().split("T")[0],
    projectId: "",
    isRecurring: false,
    frequency: "monthly",
  };
}

export default function AddExpenseForm({
  expense = null,
  recurringExpense = null,
  categories = DEFAULT_EXPENSE_CATEGORIES,
  projects = [],
  triggerClassName,
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => getDefaultForm(expense, recurringExpense));
  const [projectSearch, setProjectSearch] = useState("");

  const isRecurringEdit = Boolean(recurringExpense);
  const isEdit = Boolean(expense || recurringExpense);
  const initialForm = useMemo(
    () => getDefaultForm(expense, recurringExpense),
    [expense, recurringExpense]
  );

  useEffect(() => {
    if (!open) return;
    setForm(initialForm);
    setError("");
    setProjectSearch("");
  }, [initialForm, open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const recentProjects = useMemo(() => projects.slice(0, 10), [projects]);
  const filteredProjects = useMemo(() => {
    const term = projectSearch.trim().toLowerCase();
    if (!term) return recentProjects;

    return projects.filter((project) =>
      project.title.toLowerCase().includes(term)
    );
  }, [projectSearch, projects, recentProjects]);
  const projectOptions = useMemo(() => {
    if (!form.projectId) return filteredProjects;

    const selectedProject = projects.find((project) => project.id === form.projectId);
    if (!selectedProject) return filteredProjects;
    if (filteredProjects.some((project) => project.id === selectedProject.id)) return filteredProjects;
    return [selectedProject, ...filteredProjects];
  }, [filteredProjects, form.projectId, projects]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) return setError("Description and amount are required.");
    setLoading(true);
    setError("");
    try {
      const endpoint = form.isRecurring
        ? (isRecurringEdit ? `/api/recurring-expenses/${recurringExpense.id}` : "/api/recurring-expenses")
        : (expense ? `/api/expenses/${expense.id}` : "/api/expenses");
      const method = isEdit ? "PATCH" : "POST";

      const payload = form.isRecurring
        ? {
          description: form.description,
          note: form.note,
          amount: parseFloat(form.amount),
          category: form.category,
          nextDate: form.date,
          projectId: form.projectId || null,
          frequency: form.frequency,
        }
        : {
          description: form.description,
          note: form.note,
          amount: parseFloat(form.amount),
          category: form.category,
          date: form.date,
          projectId: form.projectId || null,
        };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || (isEdit ? "Failed to update expense." : "Failed to add expense.")
        );
      }
      setOpen(false);
      setForm(getDefaultForm(null, null));
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={triggerClassName || (isEdit
          ? "inline-flex items-center gap-1.5 rounded border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          : "inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700")}
      >
        {isEdit ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        {isEdit ? "Edit" : "Add expense"}
      </button>
    );
  }

  return (
    <Modal
      open={open}
      onClose={() => !loading && setOpen(false)}
      title={isEdit ? "Edit Expense" : "New Expense"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-left text-xs font-medium text-zinc-700">Description *</label>
          <input value={form.description} onChange={set("description")} className={inputClassName} placeholder="e.g. Adobe CC subscription" />
        </div>
        <div>
          <label className="mb-1.5 block text-left text-xs font-medium text-zinc-700">Project</label>
          {projects.length > 10 ? (
            <input
              type="text"
              value={projectSearch}
              onChange={(event) => setProjectSearch(event.target.value)}
              className={inputClassName}
              placeholder="Search projects"
            />
          ) : null}
          <select value={form.projectId} onChange={set("projectId")} className={selectClassName}>
            <option value="">No linked project</option>
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
          {projects.length > 10 && !projectSearch ? (
            <p className="mt-1.5 text-[11px] text-zinc-400">Showing 10 recent projects. Search to find older ones.</p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-left text-xs font-medium text-zinc-700">Amount (USD) *</label>
            <input type="number" min="0" step="0.01" value={form.amount} onChange={set("amount")} className={inputClassName} placeholder="0.00" />
          </div>
          <div>
            <label className="mb-1.5 block text-left text-xs font-medium text-zinc-700">{form.isRecurring ? "Next date" : "Date"}</label>
            <input type="date" value={form.date} onChange={set("date")} className={inputClassName} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-left text-xs font-medium text-zinc-700">Category</label>
          <select value={form.category} onChange={set("category")} className={selectClassName}>
            {categories.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-left">
            <label className="block text-left text-xs font-medium text-zinc-700">Note</label>
            <span className="text-[11px] text-zinc-400">{form.note.length}/100</span>
          </div>
          <textarea
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value.slice(0, 100) }))}
            className={cn(textareaClassName, "min-h-[78px]")}
            placeholder="Optional note"
            maxLength={100}
          />
        </div>
        <label className="flex items-center gap-2 rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={form.isRecurring}
            onChange={(e) => setForm((current) => ({ ...current, isRecurring: e.target.checked }))}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Is this a recurring expense?
        </label>
        {form.isRecurring && (
          <div>
            <label className="mb-1.5 block text-left text-xs font-medium text-zinc-700">Frequency</label>
            <select
              value={form.frequency}
              onChange={set("frequency")}
              className={selectClassName}
            >
              {Object.entries(RECURRING_FREQUENCIES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2 border-t border-zinc-100 pt-4">
          <button type="submit" disabled={loading} className="flex-1 rounded bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
            {loading ? "Saving…" : isEdit ? "Save changes" : "Save expense"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
