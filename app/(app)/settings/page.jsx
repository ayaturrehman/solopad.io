import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { parsePermissions } from "@/lib/team";
import SettingsClient from "./SettingsClient";

export const revalidate = 30;

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  // Single user query replaces 4 separate API calls (profile, business lookup, payments, stripe status, plan)
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      role: true,
      companyName: true,
      companyLogo: true,
      timezone: true,
      paymentMethods: true,
      stripeAccountId: true,
      stripeOnboarded: true,
      plan: true,
      businessId: true,
    },
  });

  if (!user) redirect("/login");

  // Parallel: business details + team members + subscription (if businessId exists)
  const [business, members, subscription] = await Promise.all([
    user.businessId
      ? db.business.findUnique({
          where: { id: user.businessId },
          select: { name: true, logoUrl: true, timezone: true, currency: true },
        })
      : null,
    db.teamMember.findMany({
      where: user.businessId ? { businessId: user.businessId } : { userId },
      orderBy: { createdAt: "desc" },
    }),
    user.businessId
      ? db.subscription.findUnique({ where: { businessId: user.businessId } })
      : null,
  ]);

  const initialData = {
    profile: {
      name: user.name ?? "",
      companyName: user.companyName ?? "",
      companyLogo: user.companyLogo ?? "",
      timezone: user.timezone ?? "UTC",
    },
    business: business
      ? {
          name: business.name ?? "",
          logoUrl: business.logoUrl ?? "",
          timezone: business.timezone ?? "UTC",
          currency: business.currency ?? "USD",
        }
      : null,
    paymentMethods: (user.paymentMethods || "card").split(","),
    stripe: {
      connected: !!user.stripeAccountId,
      onboarded: !!user.stripeOnboarded,
      accountId: user.stripeAccountId || null,
    },
    members: members.map((m) => ({
      ...m,
      permissions: parsePermissions(m.permissions),
    })),
    plan: user.plan ?? "free",
    billingStatus: subscription
      ? {
          plan: subscription.plan,
          status: subscription.status,
          subscription: {
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            trialEnd: subscription.trialEnd,
          },
        }
      : { plan: "free", status: "active", subscription: null },
  };

  return <SettingsClient initialData={initialData} />;
}
