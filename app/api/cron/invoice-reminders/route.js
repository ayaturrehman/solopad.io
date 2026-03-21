import { NextResponse } from "next/server";
import { Resend } from "resend";
import db from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
    const secret = req.headers.get("x-cron-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!resend) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
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
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || "noreply@solopad.app";
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

        await resend.emails.send({
          from: fromEmail,
          to: project.contact.email,
          subject: `Payment reminder: Invoice ${inv.invoiceNumber || inv.id.slice(0, 8)} is ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} overdue`,
          html: `
            <p>Hi ${project.contact.name || "there"},</p>
            <p>This is a friendly reminder that invoice <strong>${inv.invoiceNumber || inv.id.slice(0, 8)}</strong> for <strong>$${inv.total?.toFixed(2) || "0.00"}</strong> was due on <strong>${new Date(inv.dueDate).toLocaleDateString()}</strong>.</p>
            <p>
              <a href="${appUrl}/pay/${inv.id}" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
                Pay Now
              </a>
            </p>
            <p style="color:#71717a;font-size:12px;">Sent by ${project.user?.name || "your provider"} via SoloPad</p>
          `,
        });

        await db.invoice.update({
          where: { id: inv.id },
          data: { lastReminderAt: now },
        });

        sent++;
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
