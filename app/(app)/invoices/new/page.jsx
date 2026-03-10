export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import InvoiceBuilderClient from "./InvoiceBuilderClient";

export default async function NewInvoicePage({ searchParams }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [projects, services] = await Promise.all([
    db.project.findMany({
      where: { userId: session.user.id, archived: false },
      select: { id: true, title: true, clientName: true, clientEmail: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.service.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, description: true, defaultRate: true, unit: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <InvoiceBuilderClient projects={projects} services={services} />;
}
