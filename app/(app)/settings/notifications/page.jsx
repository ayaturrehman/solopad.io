import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  });

  if (!user) redirect("/login");

  const business = user.businessId
    ? await db.business.findUnique({
        where: { id: user.businessId },
        select: {
          overdueRemindersEnabled: true,
          overdueReminderDays: true,
          preDueRemindersEnabled: true,
          preDueReminderDays: true,
          emailNotifications: true,
          notifyPaymentReceived: true,
          notifyInvoiceViewed: true,
          notifyProposalAccepted: true,
          notifyContractSigned: true,
          notifyTaskOverdue: true,
        },
      })
    : null;

  return (
    <NotificationsClient
      settings={business ?? {
        overdueRemindersEnabled: true,
        overdueReminderDays: 3,
        preDueRemindersEnabled: false,
        preDueReminderDays: "3,7",
        emailNotifications: true,
        notifyPaymentReceived: true,
        notifyInvoiceViewed: true,
        notifyProposalAccepted: true,
        notifyContractSigned: true,
        notifyTaskOverdue: false,
      }}
      hasBusiness={!!user.businessId}
    />
  );
}
