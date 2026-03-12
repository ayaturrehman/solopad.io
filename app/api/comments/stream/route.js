import { subscribe, unsubscribe } from "@/lib/commentBus";
import db from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const portalToken = searchParams.get("token");

  if (!projectId) {
    return new Response("Missing projectId", { status: 400 });
  }

  // Verify access — either session owner or valid portal token
  if (portalToken) {
    const project = await db.project.findFirst({ where: { id: projectId, portalToken } });
    if (!project) return new Response("Forbidden", { status: 403 });
  } else {
    const session = await getSession();
    if (!session?.user) return new Response("Unauthorized", { status: 401 });
    const project = await db.project.findFirst({ where: { id: projectId, userId: session.user.id } });
    if (!project) return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const heartbeat = setInterval(() => {
        try { controller.enqueue(encoder.encode(": heartbeat\n\n")); } catch {}
      }, 30000);

      const handler = (comment) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(comment)}\n\n`)); } catch {}
      };

      subscribe(projectId, handler);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe(projectId, handler);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
