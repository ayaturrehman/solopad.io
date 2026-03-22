import db from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req, { params }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db.contentTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    }).catch(() => {}); // best-effort
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[Content Templates Use POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
