import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { paymentMethods: true },
    });

    return NextResponse.json({ paymentMethods: (user?.paymentMethods || "card").split(",") });

  } catch (err) {
    console.error("[Settings Payments GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { paymentMethods } = await req.json();
    if (!Array.isArray(paymentMethods)) {
      return NextResponse.json({ error: "paymentMethods must be an array" }, { status: 400 });
    }

    const allowed = ["card", "paypal", "klarna"];
    const filtered = paymentMethods.filter((m) => allowed.includes(m));
    if (!filtered.includes("card")) filtered.unshift("card"); // card is always required

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: { paymentMethods: filtered.join(",") },
    });

    return NextResponse.json({ paymentMethods: updated.paymentMethods.split(",") });

  } catch (err) {
    console.error("[Settings Payments PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
