import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, businessId: true },
  });

  if (!user) redirect("/login");

  const subscription = user.businessId
    ? await db.subscription.findUnique({ where: { businessId: user.businessId } })
    : null;

  return (
    <BillingClient
      plan={user.plan ?? "starter"}
      billingStatus={
        subscription
          ? {
              plan: subscription.plan,
              status: subscription.status,
              subscription: {
                currentPeriodEnd: subscription.currentPeriodEnd,
                cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                trialEnd: subscription.trialEnd,
              },
            }
          : { plan: "starter", status: "active", subscription: null }
      }
    />
  );
}
