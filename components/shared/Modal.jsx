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
  layout = "center",
}) {
  if (!open) return null;

  const isSide = layout === "side";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 overflow-y-auto bg-black/30 transition-opacity duration-150",
        isSide ? "p-0" : "p-4"
      )}
    >
      <div
        className={cn(
          "flex w-full",
          isSide
            ? "min-h-screen items-stretch justify-end"
            : "my-6 min-h-[calc(100vh-3rem)] items-center justify-center",
        )}
      >
        <div
          className={cn(
            "transition-all duration-150 flex w-full flex-col overflow-hidden border border-zinc-200 bg-white shadow-xl",
            isSide
              ? "h-screen max-w-2xl rounded-none border-y-0 border-r-0"
              : "max-h-[calc(100vh-3rem)] w-full max-w-lg rounded mx-4",
            className
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-zinc-100 px-4 py-2">
            <div>
              {title && <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>}
              {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded p-2 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <hr className="border-zinc-300"/>

          <div className="overflow-y-auto px-5 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
