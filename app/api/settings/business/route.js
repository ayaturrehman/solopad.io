import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true },
    });

    if (!user?.businessId) return NextResponse.json({ business: null });

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      select: { name: true, logoUrl: true, timezone: true, currency: true },
    });

    return NextResponse.json({ business });

  } catch (err) {
    console.error("[Settings Business GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, logoUrl, timezone, currency } = await req.json();

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true, name: true },
    });

    const data = {
      ...(name !== undefined && { name: name?.trim() || "" }),
      ...(logoUrl !== undefined && { logoUrl: logoUrl?.trim() || null }),
      ...(timezone !== undefined && { timezone: timezone?.trim() || "UTC" }),
      ...(currency !== undefined && { currency }),
    };

    if (!user?.businessId) {
      // Create a new business and link the user to it
      const business = await db.business.create({
        data: {
          name: name?.trim() || user.name || "My Business",
          ownerId: session.user.id,
          logoUrl: logoUrl?.trim() || null,
          timezone: timezone?.trim() || "UTC",
          currency: currency || "USD",
        },
      });
      await db.user.update({
        where: { id: session.user.id },
        data: { businessId: business.id },
      });
    } else {
      await db.business.update({
        where: { id: user.businessId },
        data,
      });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Settings Business PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
