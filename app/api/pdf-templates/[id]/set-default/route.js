import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function POST(request, { params }) { try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const template = await db.pdfTemplate.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.$transaction(async (tx) => {
      await tx.pdfTemplate.updateMany({
        where: { userId: session.user.id, type: template.type },
        data: { isDefault: false },
      });
      return tx.pdfTemplate.update({
        where: { id },
        data: { isDefault: true },
      });
    });

    return NextResponse.json({ template: updated });

  } catch (err) {
    console.error("[Pdf Templates Set Default POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
