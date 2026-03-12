import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { parsePermissions, serializePermissions } from "@/lib/team";

async function getCallerBusiness(userId) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { businessId: true } });
  return user?.businessId ?? null;
}

async function getTeamMemberSafe(id, businessId, userId) {
  const member = await db.teamMember.findUnique({ where: { id } });
  if (!member) return null;
  // Verify ownership: match by businessId if available, else by userId
  if (businessId) {
    if (member.businessId !== businessId) return null;
  } else {
    if (member.userId !== userId) return null;
  }
  return member;
}

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const businessId = await getCallerBusiness(session.user.id);
  const member = await getTeamMemberSafe(id, businessId, session.user.id);

  if (!member) return NextResponse.json({ error: "Team member not found." }, { status: 404 });

  const body = await req.json();
  const role = body.role || member.role;
  const permissions = Array.isArray(body.permissions)
    ? serializePermissions(body.permissions)
    : member.permissions;

  const updated = await db.teamMember.update({
    where: { id },
    data: { role, permissions },
  });

  return NextResponse.json({
    member: { ...updated, permissions: parsePermissions(updated.permissions) },
  });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const businessId = await getCallerBusiness(session.user.id);
  const member = await getTeamMemberSafe(id, businessId, session.user.id);

  if (!member) return NextResponse.json({ error: "Team member not found." }, { status: 404 });

  await db.teamMember.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
