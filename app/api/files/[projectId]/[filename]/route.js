import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req, { params }) {
  const { projectId, filename } = await params;
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
