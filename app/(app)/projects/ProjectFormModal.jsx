"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const STAGE_OPTIONS = [
  { value: "new", label: "New" },
  { value: "discovery", label: "Discovery" },
  { value: "proposal", label: "Proposal" },
  { value: "contract_signed", label: "Contract Signed" },
  { value: "kickoff", label: "Kickoff" },
  { value: "onboarding", label: "Onboarding" },
  { value: "planning", label: "Planning" },
  { value: "delivery", label: "Delivery" },
  { value: "complete", label: "Complete" },
];

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "in_review", label: "In review" },
  { value: "complete", label: "Complete" },
];

function getInitialForm(project) {
  return {
    title: project?.title || "",
    contactId: project?.contactId || "",
    description: project?.description || "",
    stage: project?.stage || "new",
    status: project?.status || "not_started",
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
    endDate: project?.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
  };
}

function ContactPicker({ contacts, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const selected = contacts.find((c) => c.id === value) || null;

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.company || "").toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function select(contact) {
    onChange(contact.id);
    setOpen(false);
    setSearch("");
  }

  function clear(e) {
    e.stopPropagation();
    onChange("");
  }

  function handleTriggerClick() {
    setOpen((v) => !v);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div className="flex flex-col" ref={wrapperRef}>
      <label className="mb-1 text-[12px] font-medium text-zinc-700">
        Client <span className="ml-0.5 text-red-500">*</span>
      </label>

      {/* trigger */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className={`flex h-8 w-full items-center justify-between rounded border bg-white px-3 text-left text-sm focus:outline-none focus:ring-1 ${
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-400"
            : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
        }`}
      >
        {selected ? (
          <span className="flex-1 truncate text-zinc-900">
            {selected.name}
            {selected.company && <span className="ml-1 text-zinc-400">· {selected.company}</span>}
          </span>
        ) : (
          <span className="flex-1 text-zinc-400">Search contacts…</span>
        )}
        {selected ? (
          <X className="ml-2 h-3.5 w-3.5 shrink-0 text-zinc-400 hover:text-zinc-700" onClick={clear} />
        ) : (
          <Search className="ml-2 h-3.5 w-3.5 shrink-0 text-zinc-400" />
        )}
      </button>

      {selected && (
        <p className="mt-1 text-xs text-zinc-400">
          {selected.email || "No email on file"}
        </p>
      )}

      {/* dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-[calc(100%-3rem)] max-w-[calc(576px-3rem)] rounded border border-zinc-200 bg-white shadow-md" style={{ marginTop: "2.25rem" }}>
          <div className="border-b border-zinc-100 px-3 py-2">
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or company…"
                className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-zinc-400">No contacts found.</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => select(c)}
                  className="w-full px-3 py-2 text-left hover:bg-zinc-50"
                >
                  <p className="text-sm font-medium text-zinc-900">{c.name}</p>
                  <p className="text-xs text-zinc-400">
                    {[c.email, c.company].filter(Boolean).join(" · ") || "No details"}
                  </p>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-zinc-100 px-3 py-2">
            <Link
              href="/contacts/new"
              target="_blank"
              className="text-xs text-blue-600 hover:underline"
              onClick={() => setOpen(false)}
            >
              + Add new contact
            </Link>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ProjectFormModal({ open, onClose, project = null, contacts = [] }) {
  const router = useRouter();
  const isEdit = Boolean(project);
  const [form, setForm] = useState(() => getInitialForm(project));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Reset form when project changes (modal reopens with different project)
  useEffect(() => {
    if (open) {
      setForm(getInitialForm(project));
      setErrors({});
      setServerError("");
    }
  }, [open, project]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
    setServerError("");
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = "Project name is required.";
    if (!form.contactId) next.contactId = "Select a contact.";
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length) { setErrors(next); return; }

    setSubmitting(true);
    setServerError("");

    try {
      const payload = {
        title: form.title.trim(),
        contactId: form.contactId,
        description: form.description.trim() || null,
        stage: form.stage,
        status: form.status,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };

      const res = await fetch(isEdit ? `/api/projects/${project.id}` : "/api/projects", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setServerError(data.error || "Failed to save project."); return; }

      router.refresh();
      onClose();
    } catch {
      setServerError("Failed to save project.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? "Edit project" : "New project"}
      description={isEdit ? "Update the project details." : "Create a new project to track work, stages, and revenue."}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        <Input
          label="Project name"
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Brand identity for Acme"
          error={errors.title}
        />

        <div className="relative">
          <ContactPicker
            contacts={contacts}
            value={form.contactId}
            onChange={(id) => set("contactId", id)}
            error={errors.contactId}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Stage"
            value={form.stage}
            onChange={(e) => set("stage", e.target.value)}
          >
            {STAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
          <Input
            label="End date"
            type="date"
            value={form.endDate}
            onChange={(e) => set("endDate", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Optional project description…"
            className="min-h-[72px] resize-y rounded border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" size="sm" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={submitting}>
            {isEdit ? "Save changes" : "Create project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
