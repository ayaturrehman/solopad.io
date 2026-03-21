import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { getTenantFilter, getTenantData } from "@/lib/tenant";
import db from "@/lib/db";

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filter = await getTenantFilter(session);

    const entries = await db.timeEntry.findMany({
      where: filter,
      include: { project: { select: { id: true, title: true } } },
      orderBy: { startedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ entries });

  } catch (err) {
    console.error("[Time Entries GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { description, projectId, startedAt, endedAt, billable, hourlyRate } = body;

    if (!startedAt) {
      return NextResponse.json({ error: "startedAt is required" }, { status: 400 });
    }

    let duration = 0;
    if (endedAt) {
      duration = Math.round((new Date(endedAt) - new Date(startedAt)) / 1000);
      if (duration < 0) duration = 0;
    }

    const tenantData = await getTenantData(session);

    const entry = await db.timeEntry.create({
      data: {
        ...tenantData,
        description: description || null,
        projectId: projectId || null,
        startedAt: new Date(startedAt),
        endedAt: endedAt ? new Date(endedAt) : null,
        duration,
        billable: billable !== undefined ? billable : true,
        hourlyRate: parseFloat(hourlyRate) || 0,
      },
      include: { project: { select: { id: true, title: true } } },
    });

    revalidatePath("/time-tracker");

    return NextResponse.json({ entry }, { status: 201 });

  } catch (err) {
    console.error("[Time Entries POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
