import { afterEach, beforeEach, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  find: vi.fn(), update: vi.fn(), businessUpdate: vi.fn(), usersUpdate: vi.fn(),
  notification: vi.fn(), userFind: vi.fn(), retrieve: vi.fn(), list: vi.fn(),
  processed: vi.fn(), mark: vi.fn(), event: null,
}));
vi.mock("@/lib/db", () => ({ default: {
  subscription: { findUnique: m.find, update: m.update },
  business: { update: m.businessUpdate },
  user: { updateMany: m.usersUpdate, findUnique: m.userFind },
  notification: { create: m.notification },
} }));
vi.mock("@/lib/stripe", () => ({ requireStripe: () => ({
  webhooks: { constructEvent: () => m.event },
  subscriptions: { retrieve: m.retrieve, list: m.list },
}) }));
vi.mock("@/lib/webhook-events", () => ({ isEventProcessed: m.processed, markEventProcessed: m.mark }));
vi.mock("@/lib/permissions", () => ({ requirePermission: async () => ({ session: { user: { id: "user-test" } } }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("resend", () => ({ Resend: class {} }));

import { POST } from "@/app/api/billing/webhook/route";
import { GET } from "@/app/api/billing/status/route";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("STRIPE_BILLING_WEBHOOK_SECRET", "qa-placeholder");
  vi.spyOn(console, "error").mockImplementation(() => {});
  m.processed.mockResolvedValue(false);
  m.update.mockImplementation(async ({ data }) => ({ id: "local", businessId: "business-test", ...data }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
const request = () => new Request("http://localhost/api/billing/webhook", { method: "POST", body: "{}" });
const local = () => ({
  id: "local", businessId: "business-test", stripeCustomerId: "cus-test",
  stripeSubscriptionId: "sub-old", status: "canceled", plan: "starter",
});
function prepareRecovery(oldStatus = "canceled") {
  m.userFind.mockResolvedValue({ businessId: "business-test", business: { subscription: local() } });
  m.retrieve.mockResolvedValue({ id: "sub-old", status: oldStatus, metadata: { plan: "starter" }, items: { data: [] } });
}

it("returns 500 on processing failure and allows the same event to be retried", async () => {
  m.event = { id: "evt-failure", type: "customer.subscription.updated", data: { object: { id: "sub-new", customer: "cus-test" } } };
  m.find.mockRejectedValueOnce(new Error("simulated database outage")).mockResolvedValue(local());
  const failed = await POST(request());
  expect(failed.status).toBe(500);
  expect(await failed.json()).toEqual({ error: "Webhook processing failed" });
  expect(m.mark).not.toHaveBeenCalled();
  expect((await POST(request())).status).toBe(200);
  expect(m.mark).toHaveBeenCalledWith("evt-failure", { type: m.event.type, source: "billing" });
});

it("ignores cancellation of an older subscription for the same customer", async () => {
  m.event = { id: "evt-old", type: "customer.subscription.deleted", data: { object: { id: "sub-old", customer: "cus-test" } } };
  m.find.mockResolvedValue({ ...local(), stripeSubscriptionId: "sub-new", status: "trialing", business: { ownerId: "owner" } });
  expect((await POST(request())).status).toBe(200);
  expect(m.update).not.toHaveBeenCalled();
  expect(m.businessUpdate).not.toHaveBeenCalled();
  expect(m.usersUpdate).not.toHaveBeenCalled();
  expect(m.notification).not.toHaveBeenCalled();
});

it("cancels the matching subscription and clears obsolete dates", async () => {
  m.event = { id: "evt-delete", type: "customer.subscription.deleted", data: { object: { id: "sub-old", customer: "cus-test" } } };
  m.find.mockResolvedValue(local());
  expect((await POST(request())).status).toBe(200);
  expect(m.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({
    status: "canceled", stripeSubscriptionId: null, currentPeriodStart: null, currentPeriodEnd: null, trialEnd: null,
  }) }));
  expect(m.businessUpdate).toHaveBeenCalledWith({ where: { id: "business-test" }, data: { plan: "starter" } });
});

it("skips an already processed event", async () => {
  m.event = { id: "evt-duplicate" };
  m.processed.mockResolvedValue(true);
  expect(await (await POST(request())).json()).toEqual({ received: true, duplicate: true });
  expect(m.find).not.toHaveBeenCalled();
});

it("recovers the new trial even when the old canceled subscription still exists", async () => {
  prepareRecovery();
  const trialEnd = Math.floor(Date.now() / 1000) + 86400;
  m.list.mockResolvedValue({ data: [
    { id: "sub-old", status: "canceled", items: { data: [] } },
    { id: "sub-new", status: "trialing", trial_end: trialEnd, metadata: { plan: "solo" }, items: { data: [{ price: { id: "price-solo" } }] } },
  ] });
  const result = await GET();
  expect(result.status).toBe(200);
  expect(await result.json()).toMatchObject({ plan: "solo", status: "trialing", subscription: { trialEnd: new Date(trialEnd * 1000).toISOString() } });
  expect(m.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ stripeSubscriptionId: "sub-new" }) }));
  expect(m.usersUpdate).toHaveBeenCalledWith({ where: { businessId: "business-test" }, data: { plan: "solo" } });
});

it("preserves a retrieved subscription when listing fails", async () => {
  prepareRecovery();
  m.list.mockRejectedValue(new Error("temporary Stripe outage"));
  expect(await (await GET()).json()).toMatchObject({ status: "canceled", plan: "starter" });
});

it("does not query Stripe when local access is already valid", async () => {
  m.userFind.mockResolvedValue({ businessId: "business-test", business: { subscription: { ...local(), status: "active" } } });
  expect((await GET()).status).toBe(200);
  expect(m.retrieve).not.toHaveBeenCalled();
  expect(m.list).not.toHaveBeenCalled();
});

it("stores Clover subscription-item billing dates", async () => {
  m.event = { id: "evt-clover", type: "customer.subscription.created", data: { object: {
    id: "sub-new", customer: "cus-test", status: "trialing", metadata: { plan: "solo" },
    trial_end: 1794652634, items: { data: [{ current_period_start: 1792060634, current_period_end: 1794652634, price: { id: "price-solo" } }] },
  } } };
  m.find.mockResolvedValue(local());
  expect((await POST(request())).status).toBe(200);
  expect(m.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({
    currentPeriodStart: new Date(1792060634000), currentPeriodEnd: new Date(1794652634000),
  }) }));
});

it("keeps the trial status when a Clover zero-value invoice succeeds", async () => {
  m.event = { id: "evt-zero", type: "invoice.payment_succeeded", data: { object: {
    customer: "cus-test", amount_paid: 0, parent: { subscription_details: { subscription: "sub-new" } },
  } } };
  m.find.mockResolvedValue({ ...local(), stripeSubscriptionId: "sub-new", status: "trialing" });
  m.retrieve.mockResolvedValue({ id: "sub-new", customer: "cus-test", status: "trialing", trial_end: 1794652634, items: { data: [] } });
  expect((await POST(request())).status).toBe(200);
  expect(m.retrieve).toHaveBeenCalledWith("sub-new");
  expect(m.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "trialing", trialEnd: new Date(1794652634000) }) }));
});

it("ignores a failed invoice for a superseded subscription", async () => {
  m.event = { id: "evt-stale-invoice", type: "invoice.payment_failed", data: { object: {
    customer: "cus-test", parent: { subscription_details: { subscription: "sub-old" } },
  } } };
  m.find.mockResolvedValue({ ...local(), stripeSubscriptionId: "sub-new", status: "trialing" });
  expect((await POST(request())).status).toBe(200);
  expect(m.update).not.toHaveBeenCalled();
  expect(m.notification).not.toHaveBeenCalled();
});

it("handles legacy invoice subscription fields", async () => {
  m.event = { id: "evt-legacy", type: "invoice.payment_succeeded", data: { object: { customer: "cus-test", subscription: "sub-old" } } };
  m.find.mockResolvedValue({ ...local(), status: "past_due" });
  m.retrieve.mockResolvedValue({ id: "sub-old", customer: "cus-test", status: "active", current_period_end: 1794652634 });
  expect((await POST(request())).status).toBe(200);
  expect(m.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "active", currentPeriodEnd: new Date(1794652634000) }) }));
});
