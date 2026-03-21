import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FormSuccess({ message, className }) {
  if (!message) return null;
  return (
    <div className={cn("flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700", className)}>
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}