export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import LeadsClient from "./LeadsClient";

export default async function LeadsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const leads = await db.lead.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return <LeadsClient leads={leads} />;
}
