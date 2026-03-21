import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

export async function PATCH(req, { params }) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_time");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const filter = await getTenantFilter(session);
    const entry = await db.timeEntry.findFirst({ where: { id: params.id, ...filter } });
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { endedAt, duration, description, billable, hourlyRate } = body;

    const updated = await db.timeEntry.update({
      where: { id: params.id },
      data: {
        ...(endedAt !== undefined && { endedAt: endedAt ? new Date(endedAt) : null }),
        ...(duration !== undefined && { duration }),
        ...(description !== undefined && { description }),
        ...(billable !== undefined && { billable }),
        ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) || 0 }),
      },
      include: { project: { select: { id: true, title: true } } },
    });

    revalidatePath("/time-tracker");

    return NextResponse.json({ entry: updated });

  } catch (err) {
    console.error("[Time Entries PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_time");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const filter = await getTenantFilter(session);
    const entry = await db.timeEntry.findFirst({ where: { id: params.id, ...filter } });
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.timeEntry.delete({ where: { id: params.id } });

    revalidatePath("/time-tracker");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Time Entries DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
