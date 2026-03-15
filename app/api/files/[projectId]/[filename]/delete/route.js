import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { unlink } from "fs/promises";
import { safePath } from "@/lib/safeFilePath";

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, filename } = await params;

  const file = await db.file.findFirst({
    where: { path: `/api/files/${projectId}/${filename}` },
    include: { project: true },
  });

  if (!file || file.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let filepath;
  try {
    filepath = safePath(projectId, filename).full;
  } catch {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  try {
    await unlink(filepath);
  } catch {}

  await db.file.delete({ where: { id: file.id } });

  return NextResponse.json({ success: true });
}
