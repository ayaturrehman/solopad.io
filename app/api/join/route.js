import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { validatePassword } from "@/lib/passwordValidation";

export async function GET(req) { try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) return NextResponse.json({ error: "Token is required." }, { status: 400 });

    const teamMember = await db.teamMember.findUnique({
      where: { inviteToken: token },
      include: {
        business: { select: { name: true } },
      },
    });

    if (!teamMember) {
      return NextResponse.json({ error: "Invalid or expired invite link." }, { status: 404 });
    }

    return NextResponse.json({
      member: {
        name: teamMember.name,
        email: teamMember.email,
        role: teamMember.role,
        businessName: teamMember.business?.name ?? null,
      },
    });

  } catch (err) {
    console.error("[Join GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) { try {
    const body = await req.json();
    const token = body.token?.trim();
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!token || !name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const teamMember = await db.teamMember.findUnique({ where: { inviteToken: token } });

    if (!teamMember) {
      return NextResponse.json({ error: "Invalid or expired invite link." }, { status: 404 });
    }

    if (teamMember.email.toLowerCase() !== email) {
      return NextResponse.json({ error: "Email does not match the invite." }, { status: 400 });
    }

    // Check if user already exists with this email
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "member",
        businessId: teamMember.businessId ?? null,
      },
    });

    await db.teamMember.update({
      where: { id: teamMember.id },
      data: {
        status: "active",
        inviteToken: null,
      },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Join POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
