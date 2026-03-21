import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function DELETE(req, { params }) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const note = await db.note.findFirst({ where: { id, userId: session.user.id } });
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.note.delete({ where: { id } });
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[Notes DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const note = await db.note.findFirst({ where: { id, userId: session.user.id } });
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { title, body, visibleToClient, pinned } = await req.json();
    const updated = await db.note.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title?.trim() || null }),
        ...(body !== undefined && { body }),
        ...(visibleToClient !== undefined && { visibleToClient }),
        ...(pinned !== undefined && { pinned }),
      },
    });
    return NextResponse.json(updated);

  } catch (err) {
    console.error("[Notes PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
