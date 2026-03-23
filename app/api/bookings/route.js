import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { bookingLimiter } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bookings = await db.booking.findMany({
      where: { userId: session.user.id },
      orderBy: { startAt: "asc" },
      take: 200,
    });

    return NextResponse.json(bookings);

  } catch (err) {
    console.error("[Bookings GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Public booking endpoint — userId comes from the URL/booking page (not from session)
// The userId here is the FREELANCER's userId whose calendar the client is booking.
// This is intentional: clients don't have accounts, they book via /book/[userId].
// Security: we only READ availability/bookings for that userId, never write to
// the caller's account. The booking is created FOR that freelancer, not by them.

export async function POST(req) { try {
    // Rate limit: 20 bookings per minute per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { success } = bookingLimiter.check(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }

    const body = await req.json();
    const { clientName, clientEmail, startAt, endAt, title, notes, userId } = body;

    if (!clientName || !clientEmail || !startAt || !endAt || !title || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the target userId exists (prevent booking for non-existent users)
    const freelancer = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!freelancer) return NextResponse.json({ error: "Freelancer not found" }, { status: 404 });

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (isNaN(start) || isNaN(end) || end <= start) {
      return NextResponse.json({ error: "Invalid time range" }, { status: 400 });
    }

    // Check availability rules
    const dayOfWeek = start.getDay();
    const rules = await db.availabilityRule.findMany({ where: { userId, dayOfWeek } });

    if (rules.length > 0) {
      const startHHMM = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
      const endHHMM = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
      const withinWindow = rules.some(
        (r) => startHHMM >= r.startTime && endHHMM <= r.endTime
      );
      if (!withinWindow) {
        return NextResponse.json({ error: "Slot is outside availability window" }, { status: 409 });
      }
    }

    // Check for overlapping bookings
    const overlap = await db.booking.findFirst({
      where: {
        userId,
        status: "confirmed",
        OR: [
          { startAt: { gte: start, lt: end } },
          { endAt: { gt: start, lte: end } },
          { startAt: { lte: start }, endAt: { gte: end } },
        ],
      },
    });

    if (overlap) {
      return NextResponse.json({ error: "Time slot is already booked" }, { status: 409 });
    }

    const booking = await db.booking.create({
      data: {
        userId,
        clientName,
        clientEmail,
        startAt: start,
        endAt: end,
        title,
        notes: notes || null,
      },
    });

    revalidatePath("/calendar");

    return NextResponse.json({ booking }, { status: 201 });

  } catch (err) {
    console.error("[Bookings POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
