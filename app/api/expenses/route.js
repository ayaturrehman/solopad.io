import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expenses = await db.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { description, amount, category, date } = await req.json();

  if (!description?.trim() || !amount) {
    return NextResponse.json({ error: "Description and amount are required" }, { status: 400 });
  }

  const expense = await db.expense.create({
    data: {
      userId: session.user.id,
      description: description.trim(),
      amount: parseFloat(amount),
      category: category || "other",
      date: date ? new Date(date) : new Date(),
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
