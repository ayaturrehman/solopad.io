import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { parsePermissions } from "@/lib/team";
import TeamClient from "./TeamClient";

export default async function TeamPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, role: true, businessId: true },
  });

  if (!user) redirect("/login");

  const members = await db.teamMember.findMany({
    where: user.businessId ? { businessId: user.businessId } : { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <TeamClient
      plan={user.plan ?? "free"}
      userRole={user.role ?? "owner"}
      members={members.map((m) => ({ ...m, permissions: parsePermissions(m.permissions) }))}
    />
  );
}
