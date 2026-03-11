import { NextResponse } from "next/server";
import db from "@/lib/db";
import { publish } from "@/lib/commentBus";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  const comments = await db.comment.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ comments });
}

export async function POST(req) {
  const { projectId, authorName, authorType, body } = await req.json();

  if (!projectId || !authorName || !body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const comment = await db.comment.create({
    data: { projectId, authorName, authorType: authorType || "client", body },
  });

  publish(projectId, comment);

  return NextResponse.json(comment);
}
