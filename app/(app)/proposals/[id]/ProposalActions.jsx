"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Copy, FileSignature, Mail, Pencil, Receipt, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/shared/Modal";
import DownloadPdfButton from "./DownloadPdfButton";
import SaveAsTemplateButton from "@/components/templates/SaveAsTemplateButton";

export default function ProposalActions({
  proposalId,
  title,
  clientName,
  clientEmail,
  status,
  proposal,
  className = "",
}) {
  const router = useRouter();
  const [sendOpen, setSendOpen] = useState(false);
  const [email, setEmail] = useState(clientEmail || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendError, setSendError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [converting, setConverting] = useState(false);

  const defaultSubject = useMemo(
    () => `${title || "Proposal"} from Solopad`,
    [title]
  );

  function openSendModal() {
    setEmail(clientEmail || "");
    setSubject(defaultSubject);
    setMessage(
      clientName
        ? `Hi ${clientName},\n\nI've attached the proposal for your review.\n\nLet me know if you'd like any changes.`
        : "Hi,\n\nI've attached the proposal for your review.\n\nLet me know if you'd like any changes."
    );
    setSendError("");
    setSendSuccess("");
    setSendOpen(true);
  }

  async function handleSend(event) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedEmail || !trimmedSubject) {
      setSendError("Email and subject are required.");
      return;
    }

    setSending(true);
    setSendError("");
    setSendSuccess("");

    try {
      const res = await fetch(`/api/proposals/${proposalId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          subject: trimmedSubject,
          message: trimmedMessage,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendError(data.error || "Failed to send proposal.");
        return;
      }

      setSendSuccess("Proposal sent successfully.");
      router.refresh();
      setTimeout(() => setSendOpen(false), 900);
    } catch {
      setSendError("Failed to send proposal.");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this proposal? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Failed to delete proposal.");
        return;
      }

      router.push("/proposals");
      router.refresh();
    } catch {
      setDeleteError("Failed to delete proposal.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleConvertToContract() {
    setConverting(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/to-contract`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to create contract."); return; }
      router.push(`/contracts/${data.contract.id}/edit`);
    } catch {
      alert("Failed to create contract.");
    } finally {
      setConverting(false);
    }
  }

  async function handleConvertToInvoice() {
    setConverting(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/to-invoice`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to create invoice."); return; }
      router.push(`/invoices/${data.invoice.id}/edit`);
    } catch {
      alert("Failed to create invoice.");
    } finally {
      setConverting(false);
    }
  }

  return (
    <>
      <div className={`w-full ${className}`.trim()}>
        {status === "accepted" && (
          <div className="mb-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleConvertToContract}
              disabled={converting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              <FileSignature className="h-3.5 w-3.5" />
              Create Contract
              <ChevronRight className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={handleConvertToInvoice}
              disabled={converting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:border-zinc-400 disabled:opacity-50"
            >
              <Receipt className="h-3.5 w-3.5" />
              Create Invoice
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center w-full rounded border border-zinc-200 bg-zinc-100 px-1">
          <Link
            href={`/proposals/${proposalId}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-transparent hover:text-zinc-900"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <div className="h-4 w-px bg-zinc-200 mx-0.5 shrink-0" />
          <button
            type="button"
            onClick={openSendModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-transparent hover:text-zinc-900"
          >
            <Mail className="h-3.5 w-3.5" />
            Send Email
          </button>
          <div className="h-4 w-px bg-zinc-200 mx-0.5 shrink-0" />
          <DownloadPdfButton proposalId={proposalId} title={title} />
          {proposal && (
            <>
              <div className="h-4 w-px bg-zinc-200 mx-0.5 shrink-0" />
              <SaveAsTemplateButton type="proposal" document={proposal} />
            </>
          )}
          <div className="h-4 w-px bg-zinc-200 mx-0.5 shrink-0" />
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-transparent hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {deleteError ? (
          <p className="mt-1 text-xs text-red-600">{deleteError}</p>
        ) : null}
      </div>

      <Modal
        open={sendOpen}
        onClose={() => {
          if (sending) return;
          setSendOpen(false);
        }}
        title="Send proposal"
        description="Email the proposal PDF directly to your client."
        className="max-w-xl"
      >
        <form className="space-y-4" onSubmit={handleSend}>
          <div className="space-y-1.5">
            <label className="block text-sm text-zinc-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10 w-full rounded border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-zinc-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="h-10 w-full rounded border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-zinc-700">Message</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              className="w-full rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
            />
          </div>
          {sendError ? <p className="text-sm text-red-600">{sendError}</p> : null}
          {sendSuccess ? (
            <p className="text-sm text-green-600">{sendSuccess}</p>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSendOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={sending}>
              Send proposal
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
