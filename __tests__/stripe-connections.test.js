import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const m = vi.hoisted(() => ({
  permission: vi.fn(),
  token: vi.fn(),
  retrieve: vi.fn(),
  find: vi.fn(),
  duplicate: vi.fn(),
  update: vi.fn(),
  deauthorize: vi.fn(),
  deleteAccount: vi.fn(),
}));
vi.mock("@/lib/permissions", () => ({ requirePermission: m.permission }));
vi.mock("@/lib/db", () => ({
  default: {
    user: {
      findUnique: m.find,
      findFirst: m.duplicate,
      updateMany: m.update,
      update: m.update,
    },
  },
}));
vi.mock("@/lib/stripe", () => ({
  requireStripe: () => ({
    oauth: { token: m.token, deauthorize: m.deauthorize },
    accounts: { retrieve: m.retrieve, del: m.deleteAccount },
  }),
}));
import { GET as start } from "@/app/api/settings/stripe/oauth/route";
import { GET as callback } from "@/app/api/settings/stripe/oauth/callback/route";
import { POST as disconnect } from "@/app/api/settings/stripe/disconnect/route";
import { createOAuthState, OAUTH_COOKIE } from "@/lib/stripe-oauth";
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3110");
  vi.stubEnv("NEXTAUTH_SECRET", "qa-secret");
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fake");
  vi.stubEnv("STRIPE_CONNECT_CLIENT_ID", "ca_test");
  m.permission.mockResolvedValue({ session: { user: { id: "owner" } } });
  m.find.mockResolvedValue({ stripeAccountId: null });
  m.token.mockResolvedValue({
    stripe_user_id: "acct_existing",
    livemode: false,
    scope: "read_write",
  });
  m.retrieve.mockResolvedValue({
    id: "acct_existing",
    type: "standard",
    charges_enabled: true,
    payouts_enabled: true,
  });
  m.update.mockResolvedValue({ count: 1 });
});
function req(state, cookie = state) {
  return new NextRequest(
    `http://localhost:3110/api/settings/stripe/oauth/callback?code=ac_test&state=${state}`,
    { headers: { cookie: `${OAUTH_COOKIE}=${cookie}` } },
  );
}
it("redirects to Stripe with a user-bound HttpOnly state cookie", async () => {
  const r = await start();
  const url = new URL(r.headers.get("location"));
  expect(url.hostname).toBe("connect.stripe.com");
  expect(url.searchParams.get("redirect_uri")).toBe(
    "http://localhost:3110/api/settings/stripe/oauth/callback",
  );
  expect(r.headers.get("set-cookie")).toContain("HttpOnly");
  expect(url.searchParams.get("state")).toBeTruthy();
});
it("connects an existing Standard account without accepting API keys from freelancers", async () => {
  const state = createOAuthState("owner", "qa-secret");
  const r = await callback(req(state));
  expect(r.headers.get("location")).toContain("stripe=connected");
  expect(m.token).toHaveBeenCalledWith({
    grant_type: "authorization_code",
    code: "ac_test",
  });
  expect(m.update).toHaveBeenCalledWith({
    where: { id: "owner", stripeAccountId: null },
    data: { stripeAccountId: "acct_existing", stripeOnboarded: true },
  });
});
it("rejects mismatched state before exchanging the authorization code", async () => {
  const r = await callback(
    req(createOAuthState("owner", "qa-secret"), "wrong"),
  );
  expect(r.headers.get("location")).toContain("stripe=error");
  expect(m.token).not.toHaveBeenCalled();
});
it("does not connect a live account with test configuration", async () => {
  m.token.mockResolvedValue({
    stripe_user_id: "acct_live",
    livemode: true,
    scope: "read_write",
  });
  const r = await callback(req(createOAuthState("owner", "qa-secret")));
  expect(r.headers.get("location")).toContain("stripe=error");
  expect(m.update).not.toHaveBeenCalled();
});
it("does not attach the same account to another freelancer", async () => {
  m.duplicate.mockResolvedValue({ id: "other" });
  await callback(req(createOAuthState("owner", "qa-secret")));
  expect(m.update).not.toHaveBeenCalled();
});
it("does not overwrite a connection changed during onboarding", async () => {
  m.update.mockResolvedValue({ count: 0 });
  const r = await callback(req(createOAuthState("owner", "qa-secret")));
  expect(r.headers.get("location")).toContain("stripe=error");
});
it("revokes Standard OAuth access without deleting the Stripe account", async () => {
  m.find.mockResolvedValue({ stripeAccountId: "acct_existing" });
  expect((await disconnect()).status).toBe(200);
  expect(m.deauthorize).toHaveBeenCalledWith({
    client_id: "ca_test",
    stripe_user_id: "acct_existing",
  });
  expect(m.deleteAccount).not.toHaveBeenCalled();
});
it("keeps Express accounts intact on disconnect", async () => {
  m.find.mockResolvedValue({ stripeAccountId: "acct_express" });
  m.retrieve.mockResolvedValue({ type: "express" });
  expect((await disconnect()).status).toBe(200);
  expect(m.deleteAccount).not.toHaveBeenCalled();
  expect(m.deauthorize).not.toHaveBeenCalled();
});
it("keeps local connection data when Stripe is unavailable", async () => {
  m.find.mockResolvedValue({ stripeAccountId: "acct_existing" });
  m.retrieve.mockRejectedValue(new Error("Unavailable"));
  expect((await disconnect()).status).toBe(502);
  expect(m.update).not.toHaveBeenCalled();
});
it("rejects unauthorized settings access", async () => {
  m.permission.mockResolvedValue({ error: "Forbidden", status: 403 });
  expect((await start()).status).toBe(403);
  expect((await disconnect()).status).toBe(403);
});
