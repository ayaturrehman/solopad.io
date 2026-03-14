"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Modal from "@/components/shared/Modal";

const PAGE_SIZE = 6;

export default function ExpenseCategoriesManager({ defaultCategories = [], customCategories = [], triggerClassName }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customCategories;
    return customCategories.filter((category) => category.name.toLowerCase().includes(q));
  }, [customCategories, query]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
  const paginatedCategories = filteredCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function addCategory(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/expense-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add category.");
      setName("");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function removeCategory(id) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/expense-categories/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete category.");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveCategory(id) {
    if (!editingName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/expense-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update category.");
      setEditingId(null);
      setEditingName("");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={triggerClassName || "inline-flex items-center gap-1.5 rounded border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"}
      >
        Manage categories
      </button>

      <Modal open={open} onClose={() => !loading && setOpen(false)} title="Expense categories">
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Default</p>
            <div className="flex flex-wrap gap-2">
              {defaultCategories.map((category) => (
                <span key={category} className="rounded-full bg-zinc-100 px-3 py-1 text-xs capitalize text-zinc-600">
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Custom</p>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded border border-zinc-200 px-10 py-2.5 text-sm outline-none focus:border-zinc-400"
                placeholder="Search categories"
              />
            </div>
            <div className="space-y-2">
              {customCategories.length === 0 && (
                <p className="text-sm text-zinc-400">No custom categories yet.</p>
              )}
              {customCategories.length > 0 && filteredCategories.length === 0 && (
                <p className="text-sm text-zinc-400">No categories found for that search.</p>
              )}
              {paginatedCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded border border-zinc-200 px-3 py-1.5">
                  <div className="min-w-0 flex-1">
                    {editingId === category.id ? (
                      <input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        className="w-full rounded border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-zinc-400"
                      />
                    ) : (
                      <>
                        <span className="block text-sm capitalize text-zinc-700">{category.name}</span>
                        {category.usageCount > 0 && (
                          <span className="mt-0.5 block text-xs text-zinc-400">
                            Used in {category.usageCount} expense{category.usageCount === 1 ? "" : "s"}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="ml-3 flex items-center gap-1">
                    {editingId === category.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveCategory(category.id)}
                          className="rounded border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName("");
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded text-zinc-400 hover:bg-zinc-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(category.id);
                            setEditingName(category.name);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
                          aria-label={`Edit ${category.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCategory(category.id)}
                          disabled={loading || category.usageCount > 0}
                          className="inline-flex h-8 w-8 items-center justify-center rounded text-zinc-400 hover:bg-zinc-50 hover:text-red-600 disabled:cursor-not-allowed disabled:text-zinc-200"
                          aria-label={`Delete ${category.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {filteredCategories.length > PAGE_SIZE && (
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredCategories.length)} of {filteredCategories.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="rounded border border-zinc-200 px-2 py-1 text-zinc-600 disabled:cursor-not-allowed disabled:text-zinc-300"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page === totalPages}
                    className="rounded border border-zinc-200 px-2 py-1 text-zinc-600 disabled:cursor-not-allowed disabled:text-zinc-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={addCategory} className="space-y-3 border-t border-zinc-100 pt-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-700">New category</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded border border-zinc-200 px-3 py-1.5.5 text-sm outline-none focus:border-zinc-400"
                placeholder="e.g. Rent"
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              <Plus className="h-3.5 w-3.5" />
              Add category
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}
