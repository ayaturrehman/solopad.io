
import { redirect } from "next/navigation";
import { Suspense } from "react";
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

  return <Suspense fallback={null}><TemplateBuilderClient savedTemplates={templates} /></Suspense>;
}
