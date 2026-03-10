export const dynamic = "force-dynamic";

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Templates</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Start from a ready-made template or use one you have saved.
        </p>
      </div>
      <TemplatesClient savedTemplates={templates} />
    </div>
  );
}
