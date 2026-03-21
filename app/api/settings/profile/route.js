import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        role: true,
        companyName: true,
        companyLogo: true,
        timezone: true,
      },
    });

    return NextResponse.json({ user });

  } catch (err) {
    console.error("[Settings Profile GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, role, companyName, companyLogo, timezone } = await req.json();

    await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name: name?.trim() || "" }),
        ...(role !== undefined && { role }),
        ...(companyName !== undefined && { companyName: companyName?.trim() || null }),
        ...(companyLogo !== undefined && { companyLogo: companyLogo?.trim() || null }),
        ...(timezone !== undefined && { timezone: timezone?.trim() || "UTC" }),
      },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Settings Profile PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
