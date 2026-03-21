import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

export async function GET(req) {
  try {
    const { session, error, status: permStatus } = await requirePermission("view_time");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const projectId = searchParams.get("projectId");
    const billableFilter = searchParams.get("billable");

    if (!from || !to) {
      return NextResponse.json(
        { error: "from and to date parameters are required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const fromDate = new Date(`${from}T00:00:00Z`);
    const toDate = new Date(`${to}T23:59:59Z`);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const tenantFilter = await getTenantFilter(session);

    const whereClause = {
      ...tenantFilter,
      endedAt: {
        not: null,
        gte: fromDate,
        lte: toDate,
      },
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (billableFilter !== null) {
      whereClause.billable = billableFilter === "true";
    }

    const entries = await db.timeEntry.findMany({
      where: whereClause,
      include: { project: { select: { id: true, title: true } } },
      orderBy: { startedAt: "asc" },
    });

    // Aggregate in JS
    let totalSeconds = 0;
    let billableSeconds = 0;
    let nonBillableSeconds = 0;
    let billableAmount = 0;

    const byProjectMap = {};
    const byDayMap = {};

    for (const entry of entries) {
      totalSeconds += entry.duration;

      if (entry.billable) {
        billableSeconds += entry.duration;
        billableAmount += (entry.duration / 3600) * entry.hourlyRate;
      } else {
        nonBillableSeconds += entry.duration;
      }

      const projKey = entry.projectId || "unassigned";
      if (!byProjectMap[projKey]) {
        byProjectMap[projKey] = {
          projectId: entry.projectId,
          projectTitle: entry.project?.title || "No project",
          totalSeconds: 0,
          billableSeconds: 0,
          amount: 0,
          entryCount: 0,
        };
      }
      byProjectMap[projKey].totalSeconds += entry.duration;
      byProjectMap[projKey].entryCount += 1;
      if (entry.billable) {
        byProjectMap[projKey].billableSeconds += entry.duration;
        byProjectMap[projKey].amount += (entry.duration / 3600) * entry.hourlyRate;
      }

      const dateStr = new Date(entry.startedAt).toISOString().split("T")[0];
      if (!byDayMap[dateStr]) {
        byDayMap[dateStr] = {
          date: dateStr,
          totalSeconds: 0,
          billableSeconds: 0,
          entryCount: 0,
        };
      }
      byDayMap[dateStr].totalSeconds += entry.duration;
      byDayMap[dateStr].entryCount += 1;
      if (entry.billable) {
        byDayMap[dateStr].billableSeconds += entry.duration;
      }
    }

    const summary = {
      totalSeconds,
      billableSeconds,
      nonBillableSeconds,
      billableAmount: Math.round(billableAmount * 100) / 100,
      entryCount: entries.length,
    };

    const byProject = Object.values(byProjectMap).sort(
      (a, b) => b.totalSeconds - a.totalSeconds
    );

    const byDay = Object.values(byDayMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return NextResponse.json({
      summary,
      byProject,
      byDay,
      entries,
    });
  } catch (err) {
    console.error("[Time Entries Reports GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
