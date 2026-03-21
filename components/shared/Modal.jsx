"use client";

import { useEffect, useRef } from "react";
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
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      previousFocus.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isSide = layout === "side";
  const titleId = title ? "modal-title" : undefined;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 overflow-y-auto bg-black/30 transition-opacity duration-150",
        isSide ? "p-0" : "p-4"
      )}
      onClick={onClose}
      role="presentation"
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
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={cn(
            "transition-all duration-150 flex w-full flex-col overflow-hidden border border-zinc-200 bg-white shadow-xl outline-none",
            isSide
              ? "h-screen max-w-2xl rounded-none border-y-0 border-r-0"
              : "max-h-[calc(100vh-3rem)] w-full max-w-lg rounded mx-4",
            className
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-zinc-100 px-4 py-2">
            <div>
              {title && <h2 id={titleId} className="text-lg font-semibold text-zinc-900">{title}</h2>}
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
