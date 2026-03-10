import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, clientName, clientEmail, description, startDate, status } = await req.json();

  const project = await db.project.create({
    data: {
      userId: session.user.id,
      title,
      clientName,
      clientEmail: clientEmail || null,
      description: description || null,
      startDate: startDate ? new Date(startDate) : null,
      status: status || "in_progress",
      portalToken: nanoid(12),
    },
  });

  return NextResponse.json(project);
}
