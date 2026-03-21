import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { DEFAULT_TEMPLATES } from "@/lib/email";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true, email: true },
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

  // Load email templates server-side
  let initialTemplates = [];
  if (user.businessId) {
    const custom = await db.emailTemplate.findMany({
      where: { businessId: user.businessId },
    });
    const customMap = Object.fromEntries(custom.map((t) => [t.type, t]));

    initialTemplates = Object.entries(DEFAULT_TEMPLATES).map(([type, def]) => ({
      type,
      subject: customMap[type]?.subject || def.subject,
      body: customMap[type]?.body || def.body,
      isCustom: !!customMap[type],
      variables: def.variables,
      description: def.description,
    }));
  }

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
      userEmail={user.email}
      initialTemplates={initialTemplates}
    />
  );
}
