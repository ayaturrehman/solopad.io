import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const expense = await db.expense.findFirst({ where: { id } });
  if (!expense || expense.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.expense.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const expense = await db.expense.findFirst({ where: { id } });
  if (!expense || expense.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.expense.update({
    where: { id },
    data: {
      description: body.description?.trim() ?? expense.description,
      amount: body.amount !== undefined ? parseFloat(body.amount) : expense.amount,
      category: body.category ?? expense.category,
      date: body.date ? new Date(body.date) : expense.date,
    },
  });

  return NextResponse.json(updated);
}
