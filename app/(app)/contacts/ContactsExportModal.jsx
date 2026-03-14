"use client";

import { useEffect, useState } from "react";
import { Download, FileArchive, FileSpreadsheet, FileText, LockKeyhole } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { inputClassName } from "@/components/ui/Input";

function readErrorMessage(text) {
  if (!text) return "Export failed. Please try again.";

  try {
    const parsed = JSON.parse(text);
    return parsed.error || "Export failed. Please try again.";
  } catch {
    return "Export failed. Please try again.";
  }
}

function getFilenameFromDisposition(disposition, fallback) {
  if (!disposition) return fallback;
  const match = disposition.match(/filename="([^"]+)"/i);
  return match?.[1] || fallback;
}

export default function ContactsExportModal({
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
  query = "",
  status = "all",
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [format, setFormat] = useState("csv");
  const [scope, setScope] = useState("filtered");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const open = controlledOpen ?? internalOpen;

  function setOpen(nextOpen) {
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  }

  useEffect(() => {
    if (!open) {
      setFormat("csv");
      setScope("filtered");
      setPassword("");
      setError("");
      setLoading(false);
    }
  }, [open]);

  async function handleExport() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contacts/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          scope,
          query,
          status,
          password,
        }),
      });

      if (!res.ok) {
        setError(readErrorMessage(await res.text()));
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const filename = getFilenameFromDisposition(
        disposition,
        password ? `contacts-export.zip` : `contacts-export.${format}`
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setOpen(false);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isFiltered = scope === "filtered";
  const hasActiveFilter = Boolean(query) || status !== "all";

  return (
    <>
      {!hideTrigger && (
        <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Export contacts"
        description="Download your contacts as CSV or XLSX. Add a password to receive a protected ZIP containing the export."
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setFormat("csv")}
              className={cn(
                "rounded border px-4 py-3 text-left transition-colors",
                format === "csv" ? "border-blue-200 bg-blue-50" : "border-zinc-200 bg-white hover:bg-zinc-50"
              )}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                <FileText className="h-4 w-4" />
                CSV
              </div>
              <p className="mt-1 text-xs text-zinc-500">Best for quick import into other tools.</p>
            </button>

            <button
              type="button"
              onClick={() => setFormat("xlsx")}
              className={cn(
                "rounded border px-4 py-3 text-left transition-colors",
                format === "xlsx" ? "border-blue-200 bg-blue-50" : "border-zinc-200 bg-white hover:bg-zinc-50"
              )}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                <FileSpreadsheet className="h-4 w-4" />
                XLSX
              </div>
              <p className="mt-1 text-xs text-zinc-500">Keeps spreadsheet columns ready for Excel.</p>
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setScope("filtered")}
              className={cn(
                "rounded border px-4 py-3 text-left transition-colors",
                isFiltered ? "border-blue-200 bg-blue-50" : "border-zinc-200 bg-white hover:bg-zinc-50"
              )}
            >
              <p className="text-sm font-medium text-zinc-900">Current results</p>
              <p className="mt-1 text-xs text-zinc-500">
                {hasActiveFilter ? "Uses the current search and status filter." : "Exports the contacts visible in this view."}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setScope("all")}
              className={cn(
                "rounded border px-4 py-3 text-left transition-colors",
                scope === "all" ? "border-blue-200 bg-blue-50" : "border-zinc-200 bg-white hover:bg-zinc-50"
              )}
            >
              <p className="text-sm font-medium text-zinc-900">All contacts</p>
              <p className="mt-1 text-xs text-zinc-500">Ignores the current search and status filter.</p>
            </button>
          </div>

          <div className="rounded border border-zinc-200 bg-white p-4">
            <label htmlFor="contacts-export-password" className="flex items-center gap-2 text-sm font-medium text-zinc-900">
              <LockKeyhole className="h-4 w-4 text-zinc-500" />
              Optional password
            </label>
            <input
              id="contacts-export-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Leave blank for a regular download"
              className={`mt-3 ${inputClassName}`}
            />
            <div className="mt-3 flex items-start gap-2 rounded bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
              <FileArchive className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
              {password
                ? "A password creates a protected ZIP that contains your CSV or XLSX export."
                : "Add a password only if you want the export wrapped in a protected ZIP file."}
            </div>
          </div>

          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleExport} loading={loading}>
              Export contacts
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
