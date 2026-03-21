import { NextResponse } from "next/server";
import { Resend } from "resend";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/session";
import { requirePermission } from "@/lib/permissions";
import db from "@/lib/db";
import { canManageTeam, getDefaultPermissionsForRole, parsePermissions, serializePermissions } from "@/lib/team";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { businessId: true } });
    const where = user?.businessId ? { businessId: user.businessId } : { userId: session.user.id };

    const members = await db.teamMember.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      canManageTeam: canManageTeam(session.user.plan),
      members: members.map((member) => ({
        ...member,
        permissions: parsePermissions(member.permissions),
      })),
    });

  } catch (err) {
    console.error("[Settings Team GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  const { session, error, status: permStatus } = await requirePermission("manage_team");
  if (error) return NextResponse.json({ error }, { status: permStatus });
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

  if (!resend) {
    return NextResponse.json({ error: "Invite email is not configured. Add RESEND_API_KEY and try again." }, { status: 500 });
  }

  const dbUser = await db.user.findUnique({ where: { id: session.user.id }, select: { businessId: true } });
  const inviteToken = nanoid(32);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const permissionLabels = permissions.map((permission) => permission.replaceAll("_", " "));
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || "noreply@solopad.app";
  const joinLink = `${appUrl}/join?token=${inviteToken}`;

  try {
    const member = await db.teamMember.create({
      data: {
        userId: session.user.id,
        businessId: dbUser?.businessId ?? null,
        name,
        email,
        role,
        permissions: serializePermissions(permissions),
        inviteToken,
      },
    });

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `${session.user.name} invited you to collaborate in Solopad`,
      html: `
        <p>Hi ${name},</p>
        <p><strong>${session.user.name}</strong> invited you to collaborate in Solopad.</p>
        <p>Your access has been prepared with the <strong>${role}</strong> role.</p>
        <p>Permissions: ${permissionLabels.length ? permissionLabels.join(", ") : "view assigned tasks"}</p>
        <p>Click the link below to set up your account and get started:</p>
        <p>
          <a href="${joinLink}" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            Accept Invite
          </a>
        </p>
        <p style="color:#71717a;font-size:12px;">Powered by Solopad</p>
      `,
    });

    return NextResponse.json({
      member: { ...member, permissions: parsePermissions(member.permissions) },
    }, { status: 201 });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "That teammate email has already been invited." }, { status: 409 });
    }

    return NextResponse.json({ error: error.message || "Could not send invite email." }, { status: 500 });
  }
}
