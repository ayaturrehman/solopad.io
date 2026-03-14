import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function POST(request, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const template = await db.pdfTemplate.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Unset all defaults for this user+type
  await db.pdfTemplate.updateMany({
    where: { userId: session.user.id, type: template.type },
    data: { isDefault: false },
  });

  // Set this one as default
  const updated = await db.pdfTemplate.update({
    where: { id },
    data: { isDefault: true },
  });

  return NextResponse.json({ template: updated });
}
