import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const businessId = session.user.businessId;

    const recurringInvoices = await db.recurringInvoice.findMany({
      where: {
        userId,
        ...(businessId && { businessId }),
      },
      include: {
        contact: { select: { id: true, name: true, email: true } },
      },
      orderBy: { nextRunAt: "asc" },
    });

    return NextResponse.json(recurringInvoices);
  } catch (err) {
    console.error("[GET /api/invoices/recurring]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const businessId = session.user.businessId;

    const body = await req.json();
    const { contactId, items, interval, startDate, endDate, notes, projectId, dueDays, subtotal, tax, total } = body;

    if (!contactId || !items || !interval) {
      return NextResponse.json(
        { error: "Missing required fields: contactId, items, interval" },
        { status: 400 }
      );
    }

    const start = startDate ? new Date(startDate) : new Date();
    const nextRun = new Date(start);

    const recurringInvoice = await db.recurringInvoice.create({
      data: {
        userId,
        businessId,
        contactId,
        projectId: projectId || null,
        items,
        subtotal: subtotal || 0,
        tax: tax || 0,
        total: total || 0,
        notes,
        dueDays: dueDays || 14,
        interval,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        nextRunAt: nextRun,
        active: true,
      },
      include: {
        contact: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(recurringInvoice, { status: 201 });
  } catch (err) {
    console.error("[POST /api/invoices/recurring]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
