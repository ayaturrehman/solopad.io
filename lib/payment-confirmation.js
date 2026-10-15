import db from '@/lib/db';
import { requireStripe } from '@/lib/stripe';

// The return URL is only navigation context. Payment truth comes from the
// persisted webhook result or an exact Stripe session lookup.
export async function confirmInvoicePayment(invoiceId, milestoneId, sessionId) {
  if (!invoiceId) return false;
  try {
    const stripe = requireStripe();
    if (milestoneId) {
      const milestone = await db.paymentPlan.findUnique({ where: { id: milestoneId } });
      if (!milestone || milestone.invoiceId !== invoiceId) return false;
      if (milestone.status === 'paid') return true;
      if (!sessionId) return false;
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.metadata?.invoiceId !== invoiceId || session.metadata?.milestoneId !== milestoneId || session.payment_status !== 'paid') return false;
      await db.paymentPlan.update({ where: { id: milestoneId }, data: { status: 'paid', paidAt: new Date() } });
      const milestones = await db.paymentPlan.findMany({ where: { invoiceId }, select: { status: true } });
      if (milestones.length && milestones.every(item => item.status === 'paid')) {
        await db.invoice.update({ where: { id: invoiceId }, data: { status: 'paid', paidAt: new Date(), stripePaymentIntentId: session.payment_intent } });
      }
      return true;
    }
    const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, select: { status: true, stripeSessionId: true } });
    if (!invoice) return false;
    if (invoice.status === 'paid') return true;
    if (!invoice.stripeSessionId) return false;
    const session = await stripe.checkout.sessions.retrieve(invoice.stripeSessionId);
    if (session.metadata?.invoiceId !== invoiceId || session.payment_status !== 'paid') return false;
    await db.invoice.update({ where: { id: invoiceId }, data: { status: 'paid', paidAt: new Date(), stripePaymentIntentId: session.payment_intent } });
    return true;
  } catch (error) {
    console.error('[Payment Confirmation]', error.message);
    return false;
  }
}
