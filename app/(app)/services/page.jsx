
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
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
    <Suspense fallback={null}><ServicesManager initialServices={services} /></Suspense>
  );
}
