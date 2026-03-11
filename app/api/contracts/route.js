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
  const { title, projectId, clientName, clientEmail, clauses, status, signatureName } = body;

  let project = null;
  if (projectId) {
    project = await db.project.findFirst({
      where: { id: projectId, userId: session.user.id },
      select: { id: true, clientName: true, clientEmail: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Invalid project." }, { status: 400 });
    }
  }

  const resolvedClientName = clientName?.trim() || project?.clientName || "";
  const resolvedClientEmail = clientEmail?.trim() || project?.clientEmail || null;

  if (!title?.trim() || !resolvedClientName) {
    return NextResponse.json({ error: "Title and client name are required" }, { status: 400 });
  }

  const contract = await db.contract.create({
    data: {
      userId: session.user.id,
      projectId: project?.id || null,
      title: title.trim(),
      clientName: resolvedClientName,
      clientEmail: resolvedClientEmail,
      clauses: typeof clauses === "string" ? clauses : JSON.stringify(clauses || []),
      status: status || "draft",
      signatureName: signatureName?.trim() || null,
      sentAt: status === "sent" ? new Date() : null,
    },
    include: { project: { select: { id: true, title: true } } },
  });

  return NextResponse.json({ contract }, { status: 201 });
}
