export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import TemplateBuilderClient from "./TemplateBuilderClient";

export default async function TemplateBuilderPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const templates = await db.template.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return <TemplateBuilderClient savedTemplates={templates} />;
}
