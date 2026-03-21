import { NextResponse } from "next/server";
import db from "@/lib/db";
import { publish } from "@/lib/commentBus";
import { getSession } from "@/lib/session";

// Verify caller owns the project — or it's a client portal request (portalToken)
async function verifyProjectAccess(projectId, req) {
  const { searchParams } = new URL(req.url);
  const portalToken = searchParams.get("token");

  if (portalToken) {
    return db.project.findFirst({ where: { id: projectId, portalToken } });
  }

  const session = await getSession();
  if (!session?.user) return null;
  return db.project.findFirst({ where: { id: projectId, userId: session.user.id } });
}

export async function GET(req) { try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

    const project = await verifyProjectAccess(projectId, req);
    if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const comments = await db.comment.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ comments });

  } catch (err) {
    console.error("[Comments GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) { try {
    const body = await req.json();
    const { projectId, authorName, authorType, body: text, token } = body;

    if (!projectId || !authorName || !text) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Allow client portal posts (via token) or authenticated freelancer posts
    let project;
    if (token) {
      project = await db.project.findFirst({ where: { id: projectId, portalToken: token } });
    } else {
      const session = await getSession();
      if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      project = await db.project.findFirst({ where: { id: projectId, userId: session.user.id } });
    }

    if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const comment = await db.comment.create({
      data: { projectId, authorName, authorType: authorType || "client", body: text },
    });

    publish(projectId, comment);

    return NextResponse.json(comment);

  } catch (err) {
    console.error("[Comments POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
