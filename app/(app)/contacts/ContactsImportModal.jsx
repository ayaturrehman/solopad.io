"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Button from "@/components/ui/Button";
import { parseContactImportCsv } from "@/lib/contacts";

const TEMPLATE_HEADERS = ["Name", "Email", "Phone", "Company", "Status", "Source", "Value", "Notes"];
const TEMPLATE_EXAMPLE = ["Jane Smith", "jane@acme.com", "+1 555 100 2000", "Acme Corp", "lead", "Referral", "4500", "Interested in a website redesign"];

function makeCsvLine(values) {
  return values
    .map((value) => {
      const text = String(value ?? "");
      if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, "\"\"")}"`;
      }
      return text;
    })
    .join(",");
}

function downloadTemplate() {
  const csv = [makeCsvLine(TEMPLATE_HEADERS), makeCsvLine(TEMPLATE_EXAMPLE)].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "contacts-import-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function ContactsImportModal() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [summary, setSummary] = useState(null);
  const [parsed, setParsed] = useState({ validRows: [], invalidRows: [] });
  const [loading, setLoading] = useState(false);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    setSummary(null);
    setParseError("");
    setParsed({ validRows: [], invalidRows: [] });

    if (!file) {
      setFileName("");
      return;
    }

    setFileName(file.name);

    const text = await file.text();
    const result = parseContactImportCsv(text);

    if (!result.validRows.length && result.invalidRows.length) {
      setParseError(result.invalidRows[0].errors.join(", "));
    }

    setParsed(result);
  }

  async function handleImport() {
    if (!parsed.validRows.length) return;

    setLoading(true);
    setParseError("");
    setSummary(null);

    try {
      const res = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: parsed.validRows }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (Array.isArray(data.invalidRows) && data.invalidRows.length) {
          setParseError(`Row ${data.invalidRows[0].rowNumber}: ${data.invalidRows[0].errors.join(", ")}`);
        } else {
          setParseError(data.error || "Import failed");
        }
        return;
      }

      setSummary(data);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function resetState() {
    setOpen(false);
    setFileName("");
    setParseError("");
    setSummary(null);
    setParsed({ validRows: [], invalidRows: [] });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" />
        Import CSV
      </Button>

      <Modal
        open={open}
        onClose={resetState}
        title="Import contacts"
        description="Upload a CSV with contact details. Name is required. Existing contacts with the same email are skipped."
        className="max-w-2xl"
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-900">CSV template</p>
                <p className="text-sm text-zinc-500">Accepted columns: Name, Email, Phone, Company, Status, Source, Value, Notes.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4" />
                Download template
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-5">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{fileName || "Choose a contacts CSV file"}</p>
                  <p className="text-sm text-zinc-500">First row should contain headers. Maximum 500 contacts per import.</p>
                </div>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
                Select file
              </Button>
            </div>
          </div>

          {(parsed.validRows.length > 0 || parsed.invalidRows.length > 0) && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Ready to import</p>
                <p className="mt-2 text-2xl font-bold text-zinc-900">{parsed.validRows.length}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Invalid rows</p>
                <p className="mt-2 text-2xl font-bold text-zinc-900">{parsed.invalidRows.length}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Previewing</p>
                <p className="mt-2 text-2xl font-bold text-zinc-900">{Math.min(parsed.validRows.length, 5)}</p>
              </div>
            </div>
          )}

          {parsed.validRows.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-zinc-200">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {parsed.validRows.slice(0, 5).map((contact, index) => (
                    <tr key={`${contact.email || contact.name}-${index}`}>
                      <td className="px-4 py-3 font-medium text-zinc-900">{contact.name}</td>
                      <td className="px-4 py-3 text-zinc-500">{contact.email || "—"}</td>
                      <td className="px-4 py-3 text-zinc-500">{contact.company || "—"}</td>
                      <td className="px-4 py-3 capitalize text-zinc-500">{contact.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {parsed.invalidRows.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">Some rows will not import</p>
              <div className="mt-2 space-y-1 text-sm text-amber-800">
                {parsed.invalidRows.slice(0, 5).map((row) => (
                  <p key={row.rowNumber}>Row {row.rowNumber}: {row.errors.join(", ")}</p>
                ))}
                {parsed.invalidRows.length > 5 && (
                  <p>+{parsed.invalidRows.length - 5} more invalid rows</p>
                )}
              </div>
            </div>
          )}

          {parseError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{parseError}</p>
          )}

          {summary && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
              Imported {summary.imported} contacts.
              {summary.skippedExisting ? ` Skipped ${summary.skippedExisting} existing emails.` : ""}
              {summary.skippedDuplicateInFile ? ` Skipped ${summary.skippedDuplicateInFile} duplicate emails in the file.` : ""}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={resetState}>
              Close
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              loading={loading}
              disabled={!parsed.validRows.length}
            >
              Import contacts
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
