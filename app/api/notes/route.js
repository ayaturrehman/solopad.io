import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function POST(req) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, title, body, visibleToClient } = await req.json();
    if (!projectId || !body?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const project = await db.project.findFirst({ where: { id: projectId, userId: session.user.id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const note = await db.note.create({
      data: {
        projectId,
        userId: session.user.id,
        title: title?.trim() || null,
        body: body.trim(),
        visibleToClient: visibleToClient ?? false,
      },
    });

    return NextResponse.json(note, { status: 201 });

  } catch (err) {
    console.error("[Notes POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
