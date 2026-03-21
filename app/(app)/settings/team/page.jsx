import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { parsePermissions, hasPermission } from "@/lib/team";
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
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });

  // Check if current user can manage team (owner or has manage_team permission)
  const canManage = hasPermission(session.user, "manage_team");

  return (
    <TeamClient
      plan={user.plan ?? "starter"}
      userRole={user.role ?? "owner"}
      canManage={canManage}
      members={members.map((m) => ({ ...m, permissions: parsePermissions(m.permissions) }))}
    />
  );
}
