import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { sendTestEmail } from "@/lib/email";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { session, error, status: permStatus } = await requirePermission("manage_settings");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, businessId: true },
    });

    if (!user?.email) {
      return NextResponse.json({ error: "No email address found" }, { status: 400 });
    }

    const result = await sendTestEmail(user.email, user.businessId);

    if (result.sent) {
      return NextResponse.json({ ok: true, email: user.email });
    }

    return NextResponse.json(
      { error: result.error || "Failed to send test email" },
      { status: 500 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
