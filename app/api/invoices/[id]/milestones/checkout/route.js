import { NextResponse } from "next/server";
import { requireStripe, calculatePlatformFee } from "@/lib/stripe";
import db from "@/lib/db";
import { invoicePaymentAmount } from "@/lib/invoice-payment";

/**
 * POST /api/invoices/[id]/milestones/checkout
 * Create a Stripe Checkout session for a specific milestone payment.
 * Body: { milestoneId }
 */
export async function POST(req, { params }) {
  try {
    const stripe = requireStripe();
    const { id: invoiceId } = await params;
    const { milestoneId } = await req.json();

    if (!milestoneId) {
      return NextResponse.json({ error: "milestoneId is required." }, { status: 400 });
    }

    // Fetch milestone with invoice + freelancer info
    const milestone = await db.paymentPlan.findUnique({
      where: { id: milestoneId },
      include: {
        invoice: {
          include: {
            project: {
              include: {
                user: {
                  select: { id: true, stripeAccountId: true, stripeOnboarded: true, plan: true },
                },
                contact: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found." }, { status: 404 });
    }

    if (milestone.invoiceId !== invoiceId) {
      return NextResponse.json({ error: "Milestone does not belong to this invoice." }, { status: 400 });
    }

    if (milestone.status === "paid") {
      return NextResponse.json({ error: "This milestone is already paid." }, { status: 400 });
    }

    const invoice = milestone.invoice;
    if (["draft", "cancelled", "paid", "refunded", "partially_refunded"].includes(invoice.status)) {
      return NextResponse.json({ error: "Invoice is not available for payment." }, { status: 400 });
    }
    const freelancer = invoice.project?.user;
    if (!freelancer?.stripeAccountId || !freelancer.stripeOnboarded) {
      return NextResponse.json({ error: "Online payments are not available yet. Please contact the business to arrange payment." }, { status: 409 });
    }
    const { currency, amount: amountCents } = invoicePaymentAmount({ currency: invoice.currency, total: milestone.amount });

    const sessionOptions = {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: milestone.label || `Milestone payment`,
              description: `Payment for "${invoice.project?.title || "Project"}"`,
              metadata: { invoiceId, milestoneId },
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      customer_email: invoice.project?.contact?.email || undefined,
      metadata: { invoiceId, milestoneId },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?invoiceId=${invoiceId}&milestone=${milestoneId}&session_id={CHECKOUT_SESSION_ID}&returnTo=${encodeURIComponent(`/p/${invoice.project.portalToken}?tab=invoices`)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel?returnTo=${encodeURIComponent(`/p/${invoice.project.portalToken}?tab=invoices`)}`,
    };

    // Route to freelancer's connected Stripe account
    if (freelancer?.stripeAccountId && freelancer?.stripeOnboarded) {
      const applicationFeeAmount = calculatePlatformFee(amountCents, freelancer.plan);
      sessionOptions.payment_intent_data = {
        application_fee_amount: applicationFeeAmount,
        transfer_data: { destination: freelancer.stripeAccountId },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Milestone Checkout]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
