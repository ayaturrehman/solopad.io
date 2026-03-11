import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, filename } = await params;
  const { visibleToClient } = await req.json();

  const file = await db.file.findFirst({
    where: { projectId, name: decodeURIComponent(filename) },
    include: { project: true },
  });

  if (!file || file.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.file.update({
    where: { id: file.id },
    data: { visibleToClient },
  });

  return NextResponse.json({ file: updated });
}
