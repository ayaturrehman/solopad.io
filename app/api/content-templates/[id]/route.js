import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const template = await db.contentTemplate.findUnique({ where: { id } });

    if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (template.isSystem) return NextResponse.json({ error: "Cannot edit system templates" }, { status: 403 });
    if (template.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, description, category, content } = body;

    const updated = await db.contentTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(content !== undefined && { content }),
      },
    });

    return NextResponse.json({ template: updated });

  } catch (err) {
    console.error("[Content Templates PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const template = await db.contentTemplate.findUnique({ where: { id } });

    if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (template.isSystem) return NextResponse.json({ error: "Cannot delete system templates" }, { status: 403 });
    if (template.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.contentTemplate.delete({ where: { id } });
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[Content Templates DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
