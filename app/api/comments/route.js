import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  const { projectId, authorName, authorType, body } = await req.json();

  if (!projectId || !authorName || !body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const comment = await db.comment.create({
    data: { projectId, authorName, authorType: authorType || "client", body },
  });

  return NextResponse.json(comment);
}
