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
