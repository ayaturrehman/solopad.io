import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import db from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req, { params }) {
  const { projectId, filename } = await params;

  // Allow client portal access via portalToken query param (no session required)
  const { searchParams } = new URL(req.url);
  const portalToken = searchParams.get("token");

  if (portalToken) {
    // Verify project belongs to this portal token
    const project = await db.project.findFirst({ where: { id: projectId, portalToken } });
    if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else {
    // Authenticated user — verify they own the project
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const project = await db.project.findFirst({ where: { id: projectId, userId: session.user.id } });
    if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const filepath = path.join(process.cwd(), "uploads", projectId, filename);

  try {
    const file = await readFile(filepath);
    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename.replace(/^\d+-/, "")}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
