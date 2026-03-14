
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import InvoiceBuilderClient from "./InvoiceBuilderClient";
import { getTenantFilter, resolveTenantUser } from "@/lib/tenant";

export default async function NewInvoicePage({ searchParams }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const filter = await getTenantFilter(session);
  const currentUser = await resolveTenantUser(session);

  const [projects, services, user] = await Promise.all([
    db.project.findMany({
      where: { ...filter, archived: false },
      select: { id: true, title: true, contact: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    db.service.findMany({
      where: { ...filter, status: "active" },
      select: { id: true, name: true, description: true, defaultRate: true, unit: true, status: true },
      orderBy: { name: "asc" },
    }),
    db.user.findUnique({
      where: { id: currentUser?.id ?? session.user.id },
      select: { currency: true },
    }),
  ]);

  return <Suspense fallback={null}><InvoiceBuilderClient projects={projects} services={services} user={user} /></Suspense>;
}
