import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ServicesManager from "./ServicesManager";
import db from "@/lib/db";
import { getTenantFilter } from "@/lib/tenant";
import { buildServiceUsageMap } from "@/lib/services";

export const revalidate = 120;

export default async function ServicesPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const filter = await getTenantFilter(session);
  const [services, invoices] = await Promise.all([
    db.service.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.invoice.findMany({
      where: { project: filter },
      select: { id: true, lineItems: true },
      take: 200,
    }),
  ]);

  const usageMap = buildServiceUsageMap(services, invoices);
  const servicesWithUsage = services.map((service) => ({
    ...service,
    usageCount: usageMap[service.id] || 0,
  }));

  return (
    <Suspense fallback={null}><ServicesManager initialServices={servicesWithUsage} /></Suspense>
  );
}
