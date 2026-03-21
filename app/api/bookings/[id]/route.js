import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function PATCH(req, { params }) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const booking = await db.booking.findUnique({ where: { id: params.id } });
    if (!booking || booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { status } = body;

    const updated = await db.booking.update({
      where: { id: params.id },
      data: { ...(status !== undefined && { status }) },
    });

    revalidatePath("/calendar");

    return NextResponse.json({ booking: updated });

  } catch (err) {
    console.error("[Bookings PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const booking = await db.booking.findUnique({ where: { id: params.id } });
    if (!booking || booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.booking.delete({ where: { id: params.id } });

    revalidatePath("/calendar");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Bookings DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
