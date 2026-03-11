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
    <TemplatesClient savedTemplates={templates} />
  );
}
