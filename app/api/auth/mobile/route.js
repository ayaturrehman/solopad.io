import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import db from "@/lib/db";

/**
 * POST /api/auth/mobile
 * Authenticates mobile app users and returns a JWT + user profile.
 * The JWT is compatible with NextAuth's getToken() so all existing
 * API routes work with `Authorization: Bearer <token>`.
 */
export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Load team member data for permissions (same logic as NextAuth authorize)
    let teamRole = user.role === "owner" ? "owner" : "member";
    let permissions = "";

    if (user.businessId) {
      const teamMember = await db.teamMember.findFirst({
        where: {
          email: user.email,
          businessId: user.businessId,
          status: "active",
        },
        select: { role: true, permissions: true },
      });

      if (teamMember) {
        teamRole = teamMember.role;
        permissions = teamMember.permissions || "";
      }
    }

    // Build the same token payload as NextAuth JWT callback
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      role: user.role,
      teamRole,
      permissions,
      companyName: user.companyName,
      companyLogo: user.companyLogo,
      timezone: user.timezone,
      businessId: user.businessId || null,
    };

    // Encode using NextAuth's JWT encoder so getToken() can decode it
    const token = await encode({
      token: tokenPayload,
      secret: process.env.NEXTAUTH_SECRET,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
        teamRole,
        companyName: user.companyName,
        companyLogo: user.companyLogo,
        timezone: user.timezone,
        businessId: user.businessId || null,
      },
    });
  } catch (error) {
    console.error("[mobile-auth]", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
