// Stripe charge amounts use currency minor units, not always hundredths.
const ZERO_DECIMAL = new Set(['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']);
const THREE_DECIMAL = new Set(['bhd', 'jod', 'kwd', 'omr', 'tnd']);

export function invoicePaymentAmount(invoice) {
  const currency = (invoice.currency || 'GBP').toLowerCase();
  const factor = ZERO_DECIMAL.has(currency) ? 1 : THREE_DECIMAL.has(currency) ? 1000 : 100;
  const total = Number(invoice.total);
  const amount = Math.round(total * factor);
  if (!Number.isFinite(total) || total <= 0 || !Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('Invoice total must be a positive amount.');
  }
  // Three-decimal Stripe charges must be divisible by 10.
  if (THREE_DECIMAL.has(currency) && amount % 10 !== 0) {
    throw new Error('Invoice total has unsupported currency precision.');
  }
  return { currency, amount };
}

export function invoiceLineAmounts(item) {
  const quantity = Number(item.quantity ?? 1);
  const unitPrice = Number(item.unitPrice ?? item.rate ?? (quantity ? Number(item.amount || 0) / quantity : 0));
  const amount = Number(item.amount ?? quantity * unitPrice);
  return { quantity, unitPrice, amount };
}
