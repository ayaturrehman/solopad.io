import db from '@/lib/db';
import { requireStripe } from '@/lib/stripe';
import { settleStripeReceipt } from '@/lib/invoice-receipts';
// Return URLs never establish payment truth. Reuse webhook settlement so a
// page refresh and webhook delivery cannot credit the same payment twice.
export async function confirmInvoicePayment(invoiceId, milestoneId, sessionId) {
  if (!invoiceId) return false;
  try {
    const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, include: { paymentPlans: true } });
    if (!invoice || ['refunded','partially_refunded','cancelled'].includes(invoice.status)) return false;
    const plan = milestoneId ? invoice.paymentPlans.find(p => p.id === milestoneId) : null;
    if (milestoneId && !plan) return false;
    if (plan?.status === 'paid' || (!milestoneId && invoice.status === 'paid')) return true;
    const id = sessionId || (!milestoneId && invoice.stripeSessionId);
    if (!id) return false;
    const session = await requireStripe().checkout.sessions.retrieve(id);
    if (session.metadata?.invoiceId !== invoiceId || (session.metadata?.milestoneId || null) !== (milestoneId || null) || session.payment_status !== 'paid') return false;
    await settleStripeReceipt(db, session);
    return true;
  } catch (error) { console.error('[Payment Confirmation]', error.message); return false; }
}
