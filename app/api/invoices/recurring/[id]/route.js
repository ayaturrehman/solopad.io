import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = params;

    // Verify ownership
    const existing = await db.recurringInvoice.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { interval, items, active, endDate, notes } = body;

    const updateData = {};
    if (interval !== undefined) updateData.interval = interval;
    if (items !== undefined) updateData.items = items;
    if (active !== undefined) updateData.active = active;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await db.recurringInvoice.update({
      where: { id },
      data: updateData,
      include: {
        contact: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/invoices/recurring/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = params;

    // Verify ownership
    const existing = await db.recurringInvoice.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Soft delete by setting active to false
    const updated = await db.recurringInvoice.update({
      where: { id },
      data: { active: false },
      include: {
        contact: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[DELETE /api/invoices/recurring/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
