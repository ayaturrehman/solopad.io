import { NextResponse } from "next/server";
import db from "@/lib/db";
import { sendNotificationEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const secret = req.headers.get("x-cron-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Get businesses with overdue reminders enabled
    const businesses = await db.business.findMany({
      where: { overdueRemindersEnabled: true },
      select: { id: true, overdueReminderDays: true },
    });

    const businessMap = Object.fromEntries(businesses.map((b) => [b.id, b]));

    const overdueInvoices = await db.invoice.findMany({
      where: {
        status: { in: ["sent", "viewed"] },
        remindersEnabled: true,
        dueDate: { lt: now },
      },
      include: {
        project: { select: { id: true, businessId: true } },
      },
      take: 50,
    });

    // Filter by per-business reminder frequency
    const filteredInvoices = overdueInvoices.filter((inv) => {
      const bizId = inv.project?.businessId;
      const biz = bizId ? businessMap[bizId] : null;
      if (bizId && !biz) return false; // business has reminders disabled
      const days = biz?.overdueReminderDays ?? 3;
      const cutoff = new Date(now.getTime() - days * 86400000);
      return !inv.lastReminderAt || inv.lastReminderAt < cutoff;
    });

    let sent = 0;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    for (const inv of filteredInvoices) {
      if (!inv.project) continue;

      try {
        // Get contact info from project
        const project = await db.project.findUnique({
          where: { id: inv.project.id },
          include: {
            contact: { select: { name: true, email: true } },
            user: { select: { name: true } },
          },
        });

        if (!project?.contact?.email) continue;

        const daysOverdue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000);
        const invoiceNumber = inv.invoiceNumber || inv.id.slice(0, 8);

        const result = await sendNotificationEmail({
          businessId: inv.project.businessId,
          type: "invoice_reminder",
          to: project.contact.email,
          variables: {
            clientName: project.contact.name || "there",
            invoiceNumber,
            amount: `$${inv.total?.toFixed(2) || "0.00"}`,
            dueDate: new Date(inv.dueDate).toLocaleDateString(),
            daysOverdue: String(daysOverdue),
            payLink: `${appUrl}/pay/${inv.id}`,
            senderName: project.user?.name || "your provider",
          },
        });

        if (result.sent) {
          await db.invoice.update({
            where: { id: inv.id },
            data: { lastReminderAt: now },
          });
          sent++;
        }
      } catch (emailErr) {
        console.error(`[Invoice Reminder] Failed for ${inv.id}:`, emailErr.message);
      }
    }

    return NextResponse.json({ success: true, sent, checked: filteredInvoices.length });
  } catch (err) {
    console.error("[Cron Invoice Reminders]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
