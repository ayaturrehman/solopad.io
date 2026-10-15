// Only allow a relative SoloPad portal path, never an arbitrary redirect.
export function safePaymentReturn(value) {
  if (typeof value !== 'string') return null;
  return /^\/p\/[A-Za-z0-9_-]+(?:\?tab=invoices)?$/.test(value) ? value : null;
}
