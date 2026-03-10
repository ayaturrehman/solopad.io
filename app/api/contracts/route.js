import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contracts = await db.contract.findMany({
    where: { userId: session.user.id },
    include: { project: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ contracts });
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, projectId, clientName, clientEmail, clauses, status } = body;

  if (!title || !clientName) {
    return NextResponse.json({ error: "Title and client name are required" }, { status: 400 });
  }

  const contract = await db.contract.create({
    data: {
      userId: session.user.id,
      projectId: projectId || null,
      title,
      clientName,
      clientEmail: clientEmail || null,
      clauses: typeof clauses === "string" ? clauses : JSON.stringify(clauses || []),
      status: status || "draft",
      sentAt: status === "sent" ? new Date() : null,
    },
  });

  return NextResponse.json({ contract }, { status: 201 });
}
