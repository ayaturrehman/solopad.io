"use client";

import { Children, cloneElement, isValidElement, useId } from "react";
import { cn } from "@/lib/utils";

export const inputClassName =
  "w-full h-9 rounded border border-zinc-200 px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-400 transition-colors";

export const selectClassName =
  "w-full h-9 rounded border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-400 transition-colors bg-white";

export const textareaClassName =
  "w-full rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-400 transition-colors resize-none";

export function FormLabel({ children, required, htmlFor, id }) {
  return (
    <label id={id} htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-zinc-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function FormField({ label, required, htmlFor, error, children, className }) {
  const fieldId = useId();
  const labelId = `${fieldId}-label`;
  function nameControls(nodes) {
    return Children.map(nodes, child => {
      if (!isValidElement(child)) return child;
      if (["input", "select", "textarea"].includes(child.type)) {
        return cloneElement(child, {
          "aria-labelledby": child.props["aria-label"] ? undefined : labelId,
          "aria-invalid": error ? "true" : child.props["aria-invalid"],
          "aria-describedby": error ? `${fieldId}-error` : child.props["aria-describedby"],
        });
      }
      return child.props.children ? cloneElement(child, {}, nameControls(child.props.children)) : child;
    });
  }
  return (
    <div className={cn("flex flex-col", className)}>
      {label && <FormLabel id={labelId} required={required} htmlFor={htmlFor}>{label}</FormLabel>}
      {label ? nameControls(children) : children}
      {error && <p id={`${fieldId}-error`} role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function Input({ label, error, className, required = false, id, ...props }) {
  const generatedId = useId();
  id = id || generatedId;
  return (
    <div className="flex flex-col">
      {label && <FormLabel required={required} htmlFor={id}>{label}</FormLabel>}
      <input
        id={id}
        required={required}
        className={cn(inputClassName, error && "border-red-400 focus:border-red-400", className)}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className, required = false, id, children, ...props }) {
  const generatedId = useId();
  id = id || generatedId;
  return (
    <div className="flex flex-col">
      {label && <FormLabel required={required} htmlFor={id}>{label}</FormLabel>}
      <select
        id={id}
        required={required}
        className={cn(selectClassName, error && "border-red-400 focus:border-red-400", className)}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {children}
      </select>
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, required = false, id, ...props }) {
  const generatedId = useId();
  id = id || generatedId;
  return (
    <div className="flex flex-col">
      {label && <FormLabel required={required} htmlFor={id}>{label}</FormLabel>}
      <textarea
        id={id}
        required={required}
        className={cn(textareaClassName, error && "border-red-400 focus:border-red-400", className)}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
