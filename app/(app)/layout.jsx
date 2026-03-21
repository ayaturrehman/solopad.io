import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import AppShell from "@/components/shared/AppShell";

export const viewport = {
  width: 1280,
};

export default async function AppLayout({ children }) {
  const session = await getSession();

  // Not logged in — proxy.js handles redirect for most routes, but this is a safety net
  if (!session?.user?.businessId) {
    return <AppShell>{children}</AppShell>;
  }

  const subscription = await db.subscription.findUnique({
    where: { businessId: session.user.businessId },
    select: { status: true, trialEnd: true },
  });

  // Check if subscription is valid (active, trialing with time left, or no subscription record yet for legacy users)
  const now = new Date();
  const isActive = subscription?.status === "active";
  const isTrialing = subscription?.status === "trialing" && subscription?.trialEnd && new Date(subscription.trialEnd) > now;
  const hasValidSubscription = isActive || isTrialing;

  // If no valid subscription, redirect to subscribe page (but allow billing/pricing pages)
  if (subscription && !hasValidSubscription) {
    // Allow access to settings/billing and pricing so user can subscribe
    // We can't check the URL in a layout, so we use a context approach
    return <AppShell subscriptionExpired>{children}</AppShell>;
  }

  return <AppShell>{children}</AppShell>;
}
