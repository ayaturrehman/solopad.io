import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

export async function PATCH(request, { params }) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const filter = await getTenantFilter(session);

    await db.notification.updateMany({
      where: { id, ...filter, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Notifications PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
