import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  const projectId = formData.get("projectId");

  if (!file || !projectId) {
    return NextResponse.json({ error: "Missing file or projectId" }, { status: 400 });
  }

  // Verify project belongs to user
  const project = await db.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "uploads", projectId);
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);

  const record = await db.file.create({
    data: {
      projectId,
      name: file.name,
      path: `/api/files/${projectId}/${filename}`,
      sizeBytes: buffer.length,
      uploadedBy: "freelancer",
    },
  });

  return NextResponse.json(record);
}
