import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Single query with relation join instead of 2 sequential queries
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        businessId: true,
        business: {
          select: {
            subscription: true,
          },
        },
      },
    });

    if (!user?.businessId) {
      return NextResponse.json({
        plan: "free",
        status: "active",
        subscription: null,
      });
    }

    const subscription = user.business?.subscription;

    if (!subscription) {
      return NextResponse.json({
        plan: "free",
        status: "active",
        subscription: null,
      });
    }

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      subscription: {
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEnd: subscription.trialEnd,
      },
    });
  } catch (err) {
    console.error("[Billing Status]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
