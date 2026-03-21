import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

export async function GET(req) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get("countOnly") === "1";

    const filter = await getTenantFilter(session);

    // Lightweight poll: only count unread (single fast query)
    if (countOnly) {
      const unreadCount = await db.notification.count({
        where: { ...filter, read: false },
      });
      return NextResponse.json({ unreadCount });
    }

    // Full fetch: both queries in parallel
    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: filter,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.notification.count({
        where: { ...filter, read: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });

  } catch (err) {
    console.error("[Notifications GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filter = await getTenantFilter(session);

    // Mark all as read
    await db.notification.updateMany({
      where: { ...filter, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Notifications PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
