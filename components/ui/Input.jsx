import { cn } from "@/lib/utils";

export const inputClassName =
  "w-full rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-400 transition-colors";

export const selectClassName =
  "w-full rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-400 transition-colors bg-white";

export const textareaClassName =
  "w-full rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-400 transition-colors resize-none";

export function FormLabel({ children, required, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-zinc-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function FormField({ label, required, htmlFor, error, children, className }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <FormLabel required={required} htmlFor={htmlFor}>{label}</FormLabel>}
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function Input({ label, error, className, required = false, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <FormLabel required={required} htmlFor={id}>{label}</FormLabel>}
      <input
        id={id}
        className={cn(inputClassName, error && "border-red-400 focus:border-red-400", className)}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className, required = false, id, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <FormLabel required={required} htmlFor={id}>{label}</FormLabel>}
      <select
        id={id}
        className={cn(selectClassName, error && "border-red-400 focus:border-red-400", className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, required = false, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <FormLabel required={required} htmlFor={id}>{label}</FormLabel>}
      <textarea
        id={id}
        className={cn(textareaClassName, error && "border-red-400 focus:border-red-400", className)}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
