// Closed invoices and unissued drafts are not money still owed by the client.
export const NON_OUTSTANDING_STATUSES = ['draft', 'paid', 'cancelled', 'refunded', 'partially_refunded'];
export function isOutstandingInvoice(invoice) {
  return !NON_OUTSTANDING_STATUSES.includes(invoice.status);
}
export function outstandingInvoiceAmount(invoice) {
  if (!isOutstandingInvoice(invoice)) return 0;
  return invoice.paymentPlans?.length
    ? invoice.paymentPlans.filter(item => item.status !== 'paid').reduce((sum, item) => sum + item.amount, 0)
    : Number(invoice.total || 0);
}
