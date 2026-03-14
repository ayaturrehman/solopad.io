"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ContactFormModal from "../ContactFormModal";
import { cn } from "@/lib/utils";

export default function ContactEditForm({
  contact,
  className,
  editButtonClassName,
  deleteButtonClassName,
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this contact? This will unlink them from all projects.")) return;
    const res = await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/contacts");
    }
  }

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex h-9 items-center justify-center rounded border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50",
            editButtonClassName
          )}
        >
          Edit contact
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className={cn(
            "inline-flex h-9 items-center justify-center rounded border border-red-200 px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50",
            deleteButtonClassName
          )}
        >
          Delete
        </button>
      </div>

      <ContactFormModal
        open={open}
        onOpenChange={setOpen}
        contact={contact}
      />
    </>
  );
}
