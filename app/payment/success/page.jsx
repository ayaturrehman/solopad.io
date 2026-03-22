import { CheckCircle } from "lucide-react";
import { requireStripe } from "@/lib/stripe";
import db from "@/lib/db";

// Sync invoice/milestone status by verifying DIRECTLY with Stripe.
// Cannot be exploited — Stripe is the source of truth, not the URL.
async function syncPaymentStatus(invoiceId, milestoneId) {
  if (!invoiceId) return;

  try {
    const stripe = requireStripe();

    if (milestoneId) {
      // Milestone payment — find the milestone and check its checkout session
      const milestone = await db.paymentPlan.findUnique({
        where: { id: milestoneId },
        select: { status: true, invoiceId: true },
      });

      if (!milestone || milestone.status === "paid") return;

      // Find the checkout session for this milestone
      const sessions = await stripe.checkout.sessions.list({
        limit: 5,
      });

      for (const session of sessions.data) {
        if (
          session.metadata?.invoiceId === invoiceId &&
          session.metadata?.milestoneId === milestoneId &&
          session.payment_status === "paid"
        ) {
          // Mark milestone as paid
          await db.paymentPlan.update({
            where: { id: milestoneId },
            data: { status: "paid", paidAt: new Date() },
          });

          // Check if all milestones for this invoice are now paid
          const allMilestones = await db.paymentPlan.findMany({
            where: { invoiceId },
            select: { status: true },
          });

          const allPaid = allMilestones.length > 0 && allMilestones.every((m) => m.status === "paid");

          if (allPaid) {
            await db.invoice.update({
              where: { id: invoiceId },
              data: {
                status: "paid",
                paidAt: new Date(),
                stripePaymentIntentId: session.payment_intent,
              },
            });
          }
          break;
        }
      }
    } else {
      // Regular invoice payment
      const invoice = await db.invoice.findUnique({
        where: { id: invoiceId },
        select: { status: true, stripeSessionId: true },
      });

      if (!invoice || invoice.status === "paid" || !invoice.stripeSessionId) return;

      const session = await stripe.checkout.sessions.retrieve(invoice.stripeSessionId);

      if (session.payment_status === "paid") {
        await db.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "paid",
            paidAt: new Date(),
            stripePaymentIntentId: session.payment_intent,
          },
        });
      }
    }
  } catch (err) {
    console.error("[Payment Success] Sync failed:", err.message);
  }
}

export default async function PaymentSuccessPage({ searchParams }) {
  const { invoiceId, milestone } = await searchParams;

  await syncPaymentStatus(invoiceId, milestone);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Payment successful!</h1>
        <p className="mt-2 text-zinc-500">
          Thank you. Your payment has been received and the freelancer has been notified.
        </p>
      </div>
    </div>
  );
}
