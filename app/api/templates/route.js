import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await db.template.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ templates });
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, name, description, content } = body;

  if (!type || !name || !content) {
    return NextResponse.json({ error: "type, name, and content are required" }, { status: 400 });
  }

  const template = await db.template.create({
    data: {
      userId: session.user.id,
      type,
      name,
      description: description || null,
      content: typeof content === "string" ? content : JSON.stringify(content),
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
