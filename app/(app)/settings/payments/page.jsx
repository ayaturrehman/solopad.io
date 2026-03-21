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
      paymentMethods={(user.paymentMethods || "card").split(",")}
    />
  );
}
