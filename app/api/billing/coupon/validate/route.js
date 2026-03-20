import { NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";
import { getSession } from "@/lib/session";

export async function POST(req) {
  try {
    const stripe = requireStripe();
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ valid: false, error: "Please enter a coupon code." }, { status: 400 });
    }

    // Look up promotion code in Stripe
    const promoCodes = await stripe.promotionCodes.list({
      code: code.trim().toUpperCase(),
      active: true,
      limit: 1,
    });

    if (promoCodes.data.length === 0) {
      return NextResponse.json({ valid: false, error: "Invalid or expired code." });
    }

    const promo = promoCodes.data[0];
    const coupon = promo.coupon;

    // Check if coupon has remaining redemptions
    if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
      return NextResponse.json({ valid: false, error: "This code has reached its redemption limit." });
    }

    // Check if coupon has expired
    if (coupon.redeem_by && coupon.redeem_by * 1000 < Date.now()) {
      return NextResponse.json({ valid: false, error: "This code has expired." });
    }

    // Return coupon details
    return NextResponse.json({
      valid: true,
      coupon: {
        code: code.trim().toUpperCase(),
        name: coupon.name || code.trim().toUpperCase(),
        percentOff: coupon.percent_off || null,
        amountOff: coupon.amount_off ? coupon.amount_off / 100 : null,
        currency: coupon.currency?.toUpperCase() || null,
        duration: coupon.duration, // once | repeating | forever
        durationInMonths: coupon.duration_in_months || null,
      },
    });
  } catch (err) {
    console.error("[Coupon Validate]", err);
    return NextResponse.json({ valid: false, error: "Could not validate code. Try again." }, { status: 500 });
  }
}
