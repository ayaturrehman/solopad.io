import { subscribe, unsubscribe } from "@/lib/commentBus";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return new Response("Missing projectId", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send a heartbeat comment every 30s to keep the connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {}
      }, 30000);

      const handler = (comment) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(comment)}\n\n`));
        } catch {}
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
