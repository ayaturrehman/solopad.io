import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET(request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const where = { userId: session.user.id };
  if (type) where.type = type;

  const templates = await db.pdfTemplate.findMany({
    where,
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ templates });
}

export async function POST(request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { type, name, copyFrom, ...rest } = body;

  if (!type || !name) {
    return NextResponse.json({ error: "type and name are required" }, { status: 400 });
  }

  // Check if this will be the first of this type (auto-set as default)
  const existingCount = await db.pdfTemplate.count({
    where: { userId: session.user.id, type },
  });

  let templateData = {
    userId: session.user.id,
    type,
    name,
    isDefault: existingCount === 0,
  };

  // Copy settings from an existing template
  if (copyFrom) {
    const source = await db.pdfTemplate.findFirst({
      where: { id: copyFrom, userId: session.user.id },
    });
    if (source) {
      const { id, userId, createdAt, updatedAt, name: sourceName, isDefault: sourceDefault, ...sourceFields } = source;
      templateData = { ...templateData, ...sourceFields };
    }
  }

  // Apply any overrides from body (excluding meta fields)
  const { id, userId, createdAt, updatedAt, isDefault, ...allowedOverrides } = rest;
  templateData = { ...templateData, ...allowedOverrides };

  const template = await db.pdfTemplate.create({ data: templateData });

  return NextResponse.json({ template }, { status: 201 });
}
