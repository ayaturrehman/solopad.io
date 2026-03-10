import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { canManageTeam, getDefaultPermissionsForRole, parsePermissions, serializePermissions } from "@/lib/team";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await db.teamMember.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    canManageTeam: canManageTeam(session.user.plan),
    members: members.map((member) => ({
      ...member,
      permissions: parsePermissions(member.permissions),
    })),
  });
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageTeam(session.user.plan)) {
    return NextResponse.json({ error: "Upgrade to Solo to invite teammates." }, { status: 403 });
  }

  const body = await req.json();
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const role = body.role || "collaborator";
  const permissions = Array.isArray(body.permissions) && body.permissions.length
    ? body.permissions
    : getDefaultPermissionsForRole(role);

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const member = await db.teamMember.create({
    data: {
      userId: session.user.id,
      name,
      email,
      role,
      permissions: serializePermissions(permissions),
    },
  });

  return NextResponse.json({
    member: { ...member, permissions: parsePermissions(member.permissions) },
  }, { status: 201 });
}
