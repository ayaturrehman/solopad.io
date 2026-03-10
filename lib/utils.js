import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const STATUS_LABELS = {
  not_started: "Not Started",
  in_progress: "In Progress",
  in_review: "In Review",
  complete: "Complete",
};

export const STATUS_COLORS = {
  not_started: "bg-zinc-100 text-zinc-600",
  in_progress: "bg-blue-100 text-blue-700",
  in_review: "bg-amber-100 text-amber-700",
  complete: "bg-green-100 text-green-700",
};

export const INVOICE_STATUS_LABELS = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  // legacy fallback
  unpaid: "Unpaid",
  partial: "Partially Paid",
};

export const INVOICE_STATUS_COLORS = {
  draft: "bg-zinc-100 text-zinc-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-zinc-100 text-zinc-400",
  // legacy fallback
  unpaid: "bg-red-100 text-red-700",
  partial: "bg-amber-100 text-amber-700",
};
