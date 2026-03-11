"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X, Check, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import dynamic from "next/dynamic";

const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false });

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "";
}

export default function NotesSection({ projectId, notes: initialNotes }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibleToClient, setVisibleToClient] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  function resetForm() {
    setTitle("");
    setBody("");
    setVisibleToClient(false);
    setShowForm(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    const plain = stripHtml(body);
    if (!plain) return;
    setSaving(true);

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, title, body, visibleToClient }),
    });
    const newNote = await res.json();
    setNotes((prev) => [newNote, ...prev]);
    resetForm();
    setSaving(false);
  }

  async function handleDelete(id) {
    setDeletingId(id);
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setDeletingId(null);
  }

  async function toggleVisibility(note) {
    setTogglingId(note.id);
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibleToClient: !note.visibleToClient }),
    });
    const updated = await res.json();
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
    setTogglingId(null);
  }

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-zinc-900">Notes</h2>
          <p className="mt-0.5 text-xs text-zinc-400">
            Private by default. Toggle visibility to share individual notes with clients.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "Cancel" : "New note"}
        </button>
      </div>

      {/* add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="rounded border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-4 py-3">
            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-medium placeholder:text-zinc-400 focus:outline-none"
            />
          </div>

          <RichEditor value={body} onChange={setBody} />

          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3">
            {/* visibility toggle */}
            <button
              type="button"
              onClick={() => setVisibleToClient((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                visibleToClient
                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}
            >
              {visibleToClient ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {visibleToClient ? "Visible to client" : "Hidden from client"}
            </button>

            <button
              type="submit"
              disabled={saving || !stripHtml(body)}
              className="inline-flex items-center gap-1.5 rounded bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40"
            >
              <Check className="h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save note"}
            </button>
          </div>
        </form>
      )}

      {/* empty state */}
      {notes.length === 0 && !showForm && (
        <div className="rounded border border-dashed border-zinc-200 py-14 text-center">
          <p className="text-sm font-medium text-zinc-400">No notes yet</p>
          <p className="mt-1 text-xs text-zinc-300">
            Add a note to track decisions, updates, or anything about this project.
          </p>
        </div>
      )}

      {/* notes list */}
      <div className="space-y-3">
        {notes.map((note) => {
          const isExpanded = expandedId === note.id;
          const plainText = stripHtml(note.body);
          const isLong = plainText.length > 250;

          return (
            <div key={note.id} className="rounded border border-zinc-200 bg-white">
              {/* note header */}
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  {note.title && (
                    <p className="text-sm font-semibold text-zinc-900">{note.title}</p>
                  )}
                  <p className="mt-0.5 text-xs text-zinc-400">{formatDate(note.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {/* client visibility toggle */}
                  <button
                    type="button"
                    onClick={() => toggleVisibility(note)}
                    disabled={togglingId === note.id}
                    title={note.visibleToClient ? "Visible to client — click to hide" : "Hidden from client — click to share"}
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                      note.visibleToClient
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
                    }`}
                  >
                    {note.visibleToClient ? (
                      <><Eye className="h-3 w-3" /> Client can see</>
                    ) : (
                      <><EyeOff className="h-3 w-3" /> Hidden</>
                    )}
                  </button>
                  {/* delete */}
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingId === note.id}
                    className="rounded p-1 text-zinc-300 hover:bg-zinc-50 hover:text-red-500 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* note body */}
              <div
                className={`px-4 pb-3 prose prose-sm max-w-none text-sm text-zinc-600 ${
                  !isExpanded && isLong ? "max-h-32 overflow-hidden" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: note.body }}
              />

              {/* show more / less */}
              {isLong && (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : note.id)}
                  className="flex w-full items-center justify-center gap-1 border-t border-zinc-100 py-2 text-xs text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
                >
                  {isExpanded ? (
                    <><ChevronUp className="h-3 w-3" /> Show less</>
                  ) : (
                    <><ChevronDown className="h-3 w-3" /> Show more</>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .prose ul { list-style: disc; padding-left: 1.25rem; }
        .prose ol { list-style: decimal; padding-left: 1.25rem; }
        .prose a { color: #2563eb; text-decoration: underline; }
        .prose img { max-width: 100%; border-radius: 4px; }
        .prose ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        .prose ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5rem; }
      `}</style>
    </div>
  );
}
