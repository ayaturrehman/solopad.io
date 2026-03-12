import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filter = await getTenantFilter(session);

  const notifications = await db.notification.findMany({
    where: filter,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await db.notification.count({
    where: { ...filter, read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filter = await getTenantFilter(session);

  // Mark all as read
  await db.notification.updateMany({
    where: { ...filter, read: false },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
