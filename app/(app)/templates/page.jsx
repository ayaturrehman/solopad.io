export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import TemplatesClient from "./TemplatesClient";

export default async function TemplatesPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const templates = await db.template.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Templates</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Start from a ready-made template or open the builder to create a reusable document experience.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/templates/builder?type=proposal"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
            New proposal
          </Link>
          <Link
            href="/templates/builder?type=contract"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            New contract
          </Link>
          <Link
            href="/templates/builder?type=questionnaire"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            New questionnaire
          </Link>
        </div>
      </div>
      <TemplatesClient savedTemplates={templates} />
    </div>
  );
}
