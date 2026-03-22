import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
  ".zip", ".rar", ".7z",
  ".txt", ".csv", ".md",
  ".mp4", ".mov", ".mp3", ".wav",
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB per file
const MAX_FILES_PER_PROJECT = 50;

export async function POST(req) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file");
    const projectId = formData.get("projectId");

    if (!file || !projectId) {
      return NextResponse.json({ error: "Missing file or projectId" }, { status: 400 });
    }

    // File size limit: 15MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum file size is 15MB." },
        { status: 413 }
      );
    }

    // File type validation
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: `File type ${ext} not allowed` }, { status: 400 });
    }

    // Verify project belongs to user
    const project = await db.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // File count limit: 20 per project
    const fileCount = await db.file.count({ where: { projectId } });
    if (fileCount >= MAX_FILES_PER_PROJECT) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES_PER_PROJECT} files per project. Delete existing files to upload new ones.` },
        { status: 400 }
      );
    }

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

  } catch (err) {
    console.error("[Files POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
