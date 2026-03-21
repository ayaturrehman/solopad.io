import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req, { params }) { try {
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
