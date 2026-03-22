"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

  const isSide = layout === "side";
  const titleId = title ? "modal-title" : undefined;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-wrapper"
          className="fixed inset-0 z-50"
          initial="closed"
          animate="open"
          exit="closed"
          variants={{
            open: { transition: { staggerChildren: 0.05 } },
            closed: {},
          }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
            variants={{
              open: { opacity: 1 },
              closed: { opacity: 0 },
            }}
            transition={{ duration: 0.15 }}
          />

          {/* Panel container */}
          <div
            className={cn(
              "relative h-full overflow-y-auto",
              isSide ? "p-0" : "p-4"
            )}
            onClick={onClose}
          >
            <div
              className={cn(
                "flex w-full",
                isSide
                  ? "min-h-screen items-stretch justify-end"
                  : "my-6 min-h-[calc(100vh-3rem)] items-center justify-center",
              )}
            >
              <motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={cn(
                  "flex w-full flex-col overflow-hidden border border-zinc-200 bg-white shadow-xl outline-none",
                  isSide
                    ? "h-screen max-w-2xl rounded-none border-y-0 border-r-0"
                    : "max-h-[calc(100vh-3rem)] w-full max-w-lg rounded mx-4",
                  className
                )}
                onClick={(e) => e.stopPropagation()}
                variants={
                  isSide
                    ? { open: { x: 0 }, closed: { x: "100%" } }
                    : { open: { opacity: 1, scale: 1 }, closed: { opacity: 0, scale: 0.97 } }
                }
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
