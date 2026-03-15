import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // proposal | contract | invoice

  const where = {
    OR: [
      { isSystem: true },
      { userId: session.user.id },
    ],
    ...(type ? { type } : {}),
  };

  const templates = await db.contentTemplate.findMany({
    where,
    orderBy: [{ isSystem: "asc" }, { usageCount: "desc" }, { createdAt: "desc" }],
  });

  // User templates first, then system templates
  const sorted = [
    ...templates.filter((t) => !t.isSystem),
    ...templates.filter((t) => t.isSystem),
  ];

  return NextResponse.json({ templates: sorted });
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, name, description, category, content } = body;

  if (!type || !name || !content) {
    return NextResponse.json({ error: "type, name, and content are required" }, { status: 400 });
  }

  const template = await db.contentTemplate.create({
    data: {
      userId: session.user.id,
      businessId: session.user.businessId || null,
      type,
      name,
      description: description || null,
      category: category || null,
      content,
      isSystem: false,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
