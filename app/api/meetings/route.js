import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, clientName, clientEmail, startAt, endAt, notes } = body ?? {};

  if (!title?.trim() || !clientName?.trim() || !startAt || !endAt) {
    return NextResponse.json({ error: "Title, client name, start and end time are required." }, { status: 400 });
  }

  const start = new Date(startAt);
  const end = new Date(endAt);

  if (isNaN(start) || isNaN(end) || end <= start) {
    return NextResponse.json({ error: "Invalid time range." }, { status: 400 });
  }

  const booking = await db.booking.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail?.trim() || "",
      startAt: start,
      endAt: end,
      notes: notes?.trim() || null,
      status: "confirmed",
    },
  });

  return NextResponse.json({ booking }, { status: 201 });
}
