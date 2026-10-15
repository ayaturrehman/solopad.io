import { expect, it } from 'vitest';
import { safePaymentReturn } from '@/lib/payment-return';
it('returns only internal client portal paths', () => {
  expect(safePaymentReturn('/p/example-token?tab=invoices')).toBe('/p/example-token?tab=invoices');
  for (const value of ['https://evil.test', '//evil.test', '/p/../settings', '/login', undefined]) expect(safePaymentReturn(value)).toBeNull();
});
