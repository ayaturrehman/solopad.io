// Drafts have not been issued to a client and are not money currently due.
export function isOutstandingInvoice(invoice) {
  return !['draft', 'paid', 'cancelled'].includes(invoice.status);
}
