import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import PaymentsClient from "./PaymentsClient";

export default async function PaymentsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      paymentMethods: true,
      stripePaymentsEnabled: true,
      bankTransferEnabled: true,
      bankDetails: true,
      stripeAccountId: true,
      stripeOnboarded: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <PaymentsClient
      stripe={{
        connected: !!user.stripeAccountId,
        onboarded: !!user.stripeOnboarded,
        accountId: user.stripeAccountId || null,
      }}
      initialBank={{ enabled: user.bankTransferEnabled, details: user.bankDetails || {} }}
      stripePaymentsEnabled={user.stripePaymentsEnabled}
      existingStripeAvailable={!!process.env.STRIPE_CONNECT_CLIENT_ID}
      paymentMethods={(user.paymentMethods || "card").split(",")}
    />
  );
}
