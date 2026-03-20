import { Suspense } from "react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ProjectsClient from "./ProjectsClient";

export const revalidate = 30;

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const userRecord = await db.user.findUnique({ where: { id: session.user.id }, select: { businessId: true } });
  const business = userRecord?.businessId
    ? await db.business.findUnique({ where: { id: userRecord.businessId }, select: { currency: true } })
    : null;
  const currency = business?.currency || "USD";

  const [projects, contacts] = await Promise.all([
    db.project.findMany({
      where: { userId: session.user.id, archived: false },
      include: {
        invoices: { select: { total: true, status: true } },
        contact: { select: { name: true } },
        _count: { select: { files: true, comments: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    db.contact.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, email: true, company: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <Suspense fallback={null}><ProjectsClient projects={projects} currency={currency} contacts={contacts} /></Suspense>;
}
