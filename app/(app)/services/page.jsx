export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import ServicesManager from "./ServicesManager";
import db from "@/lib/db";

export default async function ServicesPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const services = await db.service.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Services</h1>
          <p className="text-sm text-zinc-500">Reusable service items for invoices and proposals</p>
        </div>
      </div>
      <ServicesManager initialServices={services} />
    </div>
  );
}
