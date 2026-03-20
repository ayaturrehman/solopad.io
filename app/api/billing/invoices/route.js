import { NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET() {
  try {
    const stripe = requireStripe();
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true },
    });

    if (!user?.businessId) {
      return NextResponse.json({ invoices: [], upcoming: null, paymentMethod: null });
    }

    const subscription = await db.subscription.findUnique({
      where: { businessId: user.businessId },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ invoices: [], upcoming: null, paymentMethod: null });
    }

    const customerId = subscription.stripeCustomerId;

    // Fetch invoice history
    const stripeInvoices = await stripe.invoices.list({
      customer: customerId,
      limit: 20,
    });

    const invoices = stripeInvoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      date: inv.created ? new Date(inv.created * 1000).toISOString() : null,
      description: inv.lines?.data?.[0]?.description || inv.description || "Subscription",
      amount: (inv.amount_paid || 0) / 100,
      currency: inv.currency?.toUpperCase() || "USD",
      status: inv.status, // paid | open | draft | void | uncollectible
      receiptUrl: inv.invoice_pdf || null,
      hostedUrl: inv.hosted_invoice_url || null,
    }));

    // Fetch upcoming invoice (next charge)
    let upcoming = null;
    if (subscription.stripeSubscriptionId && subscription.status !== "canceled") {
      try {
        const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          customer: customerId,
        });
        upcoming = {
          amount: (upcomingInvoice.amount_due || 0) / 100,
          currency: upcomingInvoice.currency?.toUpperCase() || "USD",
          date: upcomingInvoice.next_payment_attempt
            ? new Date(upcomingInvoice.next_payment_attempt * 1000).toISOString()
            : null,
          discount: upcomingInvoice.discount
            ? {
                code: upcomingInvoice.discount.coupon?.name || upcomingInvoice.discount.coupon?.id,
                percentOff: upcomingInvoice.discount.coupon?.percent_off || null,
                amountOff: upcomingInvoice.discount.coupon?.amount_off
                  ? upcomingInvoice.discount.coupon.amount_off / 100
                  : null,
              }
            : null,
        };
      } catch {
        // No upcoming invoice (e.g., subscription canceled)
      }
    }

    // Fetch payment method on file
    let paymentMethod = null;
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.invoice_settings?.default_payment_method) {
        const pm = await stripe.paymentMethods.retrieve(
          customer.invoice_settings.default_payment_method
        );
        if (pm.card) {
          paymentMethod = {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          };
        }
      }
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ invoices, upcoming, paymentMethod });
  } catch (err) {
    console.error("[Billing Invoices]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
