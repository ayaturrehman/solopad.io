"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-lg rounded border border-zinc-200 bg-white shadow-xl",
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-zinc-100 px-5 py-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
