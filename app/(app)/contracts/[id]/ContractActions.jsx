"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/shared/Modal";
import DownloadPdfButton from "./DownloadPdfButton";

export default function ContractActions({ contractId, title, clientName, clientEmail }) {
  const router = useRouter();
  const [sendOpen, setSendOpen] = useState(false);
  const [email, setEmail] = useState(clientEmail || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const defaultSubject = useMemo(() => `${title || "Contract"} — Signature Required`, [title]);

  function openSendModal() {
    setEmail(clientEmail || "");
    setSubject(defaultSubject);
    setMessage(
      clientName
        ? `Hi ${clientName},\n\nPlease find the attached contract for your review and signature.\n\nLet me know if you have any questions.`
        : `Hi,\n\nPlease find the attached contract for your review and signature.\n\nLet me know if you have any questions.`
    );
    setSendError("");
    setSendSuccess("");
    setSendOpen(true);
  }

  async function handleSend(e) {
    e.preventDefault();
    const trimEmail = email.trim();
    const trimSubject = subject.trim();
    if (!trimEmail || !trimSubject) { setSendError("Email and subject are required."); return; }

    setSending(true);
    setSendError("");
    setSendSuccess("");

    try {
      const res = await fetch(`/api/contracts/${contractId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimEmail, subject: trimSubject, message: message.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setSendError(data.error || "Failed to send contract."); return; }
      setSendSuccess("Contract sent successfully.");
      router.refresh();
      setTimeout(() => setSendOpen(false), 900);
    } catch {
      setSendError("Failed to send contract.");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this contract? This action cannot be undone.")) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/contracts/${contractId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Failed to delete contract.");
        return;
      }
      router.push("/contracts");
      router.refresh();
    } catch {
      setDeleteError("Failed to delete contract.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center rounded border border-zinc-200 bg-zinc-50 px-1">
          <Link
            href={`/contracts/${contractId}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <div className="mx-0.5 h-4 w-px bg-zinc-200" />
          <button
            type="button"
            onClick={openSendModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <Mail className="h-3.5 w-3.5" />
            Send email
          </button>
          <div className="mx-0.5 h-4 w-px bg-zinc-200" />
          <DownloadPdfButton contractId={contractId} title={title} />
          <div className="mx-0.5 h-4 w-px bg-zinc-200" />
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {deleteError && <p className="mt-1.5 text-xs text-red-600">{deleteError}</p>}
      </div>

      <Modal
        open={sendOpen}
        onClose={() => { if (!sending) setSendOpen(false); }}
        title="Send contract"
        description="Email the contract PDF to your client for review and signature."
        className="max-w-xl"
      >
        <form className="space-y-4" onSubmit={handleSend}>
          <div className="space-y-1.5">
            <label className="block text-sm text-zinc-700">Recipient email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-zinc-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-10 w-full rounded border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-zinc-700">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full rounded border border-zinc-200 px-3 py-2.5 text-sm leading-relaxed text-zinc-900 outline-none focus:border-zinc-400"
            />
          </div>
          {sendError && <p className="text-sm text-red-600">{sendError}</p>}
          {sendSuccess && <p className="text-sm text-green-600">{sendSuccess}</p>}
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setSendOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={sending}>
              Send contract
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
