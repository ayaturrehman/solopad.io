import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Payment cancelled</h1>
        <p className="mt-2 text-zinc-500">
          No charge was made. You can go back and try again when ready.
        </p>
      </div>
    </div>
  );
}
