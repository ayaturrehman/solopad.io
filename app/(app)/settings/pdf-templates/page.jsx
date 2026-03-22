import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { seedDefaultTemplates } from "@/lib/pdf-templates/seedTemplates";
import PdfTemplatesClient from "./PdfTemplatesClient";

export const metadata = { title: "PDF Templates" };

export default async function PdfTemplatesPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  // Seed starter templates on first visit
  await seedDefaultTemplates(session.user.id);

  const templates = await db.pdfTemplate.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  const grouped = {
    invoice: templates.filter((t) => t.type === "invoice"),
    proposal: templates.filter((t) => t.type === "proposal"),
    contract: templates.filter((t) => t.type === "contract"),
  };

  return <PdfTemplatesClient grouped={grouped} />;
}
