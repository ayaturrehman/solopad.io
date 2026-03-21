import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import db from "@/lib/db";

export async function GET() {
  try {
    const { session, error, status: permStatus } = await requirePermission("manage_billing");
    if (error) return NextResponse.json({ error }, { status: permStatus });

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
        plan: "starter",
        status: "active",
        subscription: null,
      });
    }

    const subscription = user.business?.subscription;

    if (!subscription) {
      return NextResponse.json({
        plan: "starter",
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
