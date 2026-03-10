export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import NewProjectClient from "./NewProjectClient";

export default async function NewProjectPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const contacts = await db.contact.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, email: true, company: true },
    orderBy: { name: "asc" },
  });

  return <NewProjectClient contacts={contacts} />;
}
