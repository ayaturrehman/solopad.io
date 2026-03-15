import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { id } = await params;
  await db.contentTemplate.update({
    where: { id },
    data: { usageCount: { increment: 1 } },
  }).catch(() => {}); // best-effort
  return NextResponse.json({ ok: true });
}
