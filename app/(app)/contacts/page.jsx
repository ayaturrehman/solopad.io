
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ContactsTable from "./ContactsTable";
import { getTenantFilter } from "@/lib/tenant";

export default async function ContactsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const filter = await getTenantFilter(session);

  const contacts = await db.contact.findMany({
    where: filter,
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { projects: true } } },
  });

  return (
    <Suspense fallback={null}><ContactsTable contacts={contacts} /></Suspense>
  );
}
