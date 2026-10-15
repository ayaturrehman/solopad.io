import { beforeEach, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({ find: vi.fn(), update: vi.fn(), create: vi.fn(), retrieve: vi.fn(), expire: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: { invoice: { findUnique: m.find, update: m.update } } }));
vi.mock('@/lib/stripe', () => ({ requireStripe: () => ({ checkout: { sessions: { create: m.create, retrieve: m.retrieve, expire: m.expire } } }), calculatePlatformFee: (amount) => Math.round(amount * .02) }));
import { POST } from '@/app/api/invoices/checkout/route';
import { invoicePaymentAmount, invoiceLineAmounts } from '@/lib/invoice-payment';
let invoice;
beforeEach(() => {
  vi.resetAllMocks();
  invoice = { id: 'invoice-qa', status: 'sent', currency: 'USD', total: 2543.34, taxRate: 94,
    lineItems: JSON.stringify([{ description: 'Service', quantity: 57, rate: 23, amount: 1311 }]),
    project: { user: { plan: 'solo', stripeAccountId: 'acct_test', stripeOnboarded: true } } };
  m.find.mockImplementation(async () => invoice);
  m.create.mockImplementation(async o => ({ id: 'cs_mock', url: 'https://example.test/checkout', currency: o.line_items[0].price_data.currency, amount_total: o.line_items[0].price_data.unit_amount }));
});
const request = () => new Request('http://localhost/api/invoices/checkout', { method: 'POST', body: JSON.stringify({ invoiceId: 'invoice-qa' }) });
it('charges the displayed total including tax and bases the fee on that total', async () => {
  expect((await POST(request())).status).toBe(200);
  const o = m.create.mock.calls[0][0];
  expect(o.line_items.reduce((s, i) => s + i.quantity * i.price_data.unit_amount, 0)).toBe(254334);
  expect(o.payment_intent_data.application_fee_amount).toBe(5087);
});
it.each([['GBP', 108, 10800], ['USD', 90.25, 9025], ['JPY', 1500, 1500]])('preserves final discounted/fractional totals in %s', async (currency, total, amount) => {
  Object.assign(invoice, { currency, total });
  expect((await POST(request())).status).toBe(200);
  expect(m.create.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(amount);
});
it('expires a stale checkout before issuing the corrected amount', async () => {
  invoice.stripeSessionId = 'cs_old';
  m.retrieve.mockResolvedValue({ id: 'cs_old', status: 'open', payment_status: 'unpaid', amount_total: 7472700 });
  expect((await POST(request())).status).toBe(200);
  expect(m.expire).toHaveBeenCalledWith('cs_old');
});
it('fails closed if an old session cannot be checked or expired', async () => {
  invoice.stripeSessionId = 'cs_old'; m.retrieve.mockRejectedValue(new Error('Stripe unavailable'));
  expect((await POST(request())).status).toBe(500); expect(m.create).not.toHaveBeenCalled();
});
it('rejects zero or invalid totals', () => {
  for (const total of [0, -1, NaN, Infinity]) expect(() => invoicePaymentAmount({ total })).toThrow();
});
it('does not return a mismatched Stripe session', async () => {
  m.create.mockResolvedValue({ id: 'cs_bad', currency: 'usd', amount_total: 1 });
  expect((await POST(request())).status).toBe(500); expect(m.expire).toHaveBeenCalledWith('cs_bad');
});

it('blocks payment when the freelancer has not connected payouts', async () => {
  invoice.project.user.stripeAccountId = null;
  expect((await POST(request())).status).toBe(409);
  expect(m.create).not.toHaveBeenCalled();
});
it('blocks payment while connected-account onboarding is incomplete', async () => {
  invoice.project.user.stripeOnboarded = false;
  expect((await POST(request())).status).toBe(409);
  expect(m.create).not.toHaveBeenCalled();
});

it('renders legacy and current line amounts without multiplying a saved line total again', () => {
  expect(invoiceLineAmounts({ quantity: 57, rate: 23, amount: 1311 })).toEqual({ quantity: 57, unitPrice: 23, amount: 1311 });
  expect(invoiceLineAmounts({ quantity: 1.5, unitPrice: 100 })).toEqual({ quantity: 1.5, unitPrice: 100, amount: 150 });
  expect(invoiceLineAmounts({ quantity: 2, amount: 100 })).toEqual({ quantity: 2, unitPrice: 50, amount: 100 });
});
