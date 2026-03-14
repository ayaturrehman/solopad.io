import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import db from "@/lib/db";
import TemplateEditor from "./TemplateEditor";

export const metadata = { title: "Edit PDF Template" };

export default async function EditTemplatePage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const template = await db.pdfTemplate.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!template) notFound();

  return <TemplateEditor initialTemplate={template} />;
}
