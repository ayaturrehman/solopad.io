import { beforeEach, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({ user: vi.fn(), subscription: vi.fn(), customer: vi.fn(), list: vi.fn(), preview: vi.fn(), retrieveSubscription: vi.fn(), paymentMethod: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: { user: { findUnique: m.user }, subscription: { findUnique: m.subscription } } }));
vi.mock('@/lib/permissions', () => ({ requirePermission: async () => ({ session: { user: { id: 'u' } } }) }));
vi.mock('@/lib/stripe', () => ({ requireStripe: () => ({ customers: { retrieve: m.customer }, subscriptions: { retrieve: m.retrieveSubscription }, invoices: { list: m.list, createPreview: m.preview }, paymentMethods: { retrieve: m.paymentMethod } }) }));
import { GET } from '@/app/api/billing/invoices/route';
beforeEach(() => {
  vi.resetAllMocks(); m.user.mockResolvedValue({ businessId: 'b' });
  m.subscription.mockResolvedValue({ stripeCustomerId: 'cus_test', stripeSubscriptionId: 'sub_test', status: 'trialing' });
  m.customer.mockResolvedValue({ id: 'cus_test', invoice_settings: {} });
  m.list.mockResolvedValue({ data: [{ id: 'inv_test', status: 'paid', amount_paid: 1200, currency: 'gbp' }] });
  m.preview.mockResolvedValue({ amount_due: 1200, currency: 'gbp' });
  m.retrieveSubscription.mockResolvedValue({ default_payment_method: null });
});
it('loads invoice history and preview using the current SDK', async () => {
  const r = await GET(); expect(r.status).toBe(200);
  const data = await r.json(); expect(data.invoices[0].amount).toBe(12); expect(data.upcoming.amount).toBe(12);
  expect(m.preview).toHaveBeenCalledWith({ customer: 'cus_test', subscription: 'sub_test' });
});
it('retains history when optional upcoming preview fails', async () => {
  m.preview.mockRejectedValue(new Error('no upcoming invoice'));
  const r = await GET(); expect(r.status).toBe(200);
  const data = await r.json(); expect(data.invoices).toHaveLength(1); expect(data.upcoming).toBeNull();
});

it('prefers the subscription card over the customer default', async () => {
  m.customer.mockResolvedValue({ invoice_settings: { default_payment_method: 'pm_customer' } });
  m.retrieveSubscription.mockResolvedValue({ default_payment_method: 'pm_sub' });
  m.paymentMethod.mockResolvedValue({ card: { brand: 'visa', last4: '0553', exp_month: 1, exp_year: 2031 } });
  const data = await (await GET()).json(); expect(data.paymentMethod.last4).toBe('0553');
  expect(m.paymentMethod).toHaveBeenCalledWith('pm_sub');
});
it('accepts an expanded subscription payment method', async () => {
  m.retrieveSubscription.mockResolvedValue({ default_payment_method: { card: { brand: 'visa', last4: '1234' } } });
  expect((await (await GET()).json()).paymentMethod.last4).toBe('1234');
  expect(m.paymentMethod).not.toHaveBeenCalled();
});
it('falls back to the customer card when the subscription has none', async () => {
  m.customer.mockResolvedValue({ invoice_settings: { default_payment_method: 'pm_customer' } });
  m.paymentMethod.mockResolvedValue({ card: { brand: 'visa', last4: '4321' } });
  expect((await (await GET()).json()).paymentMethod.last4).toBe('4321');
});
it('reports an unavailable card lookup rather than claiming no card exists', async () => {
  m.retrieveSubscription.mockResolvedValue({ default_payment_method: 'pm_sub' });
  m.paymentMethod.mockRejectedValue(new Error('unavailable'));
  expect((await GET()).status).toBe(502);
});
