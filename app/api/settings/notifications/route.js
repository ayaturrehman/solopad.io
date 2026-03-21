import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { requirePermission } from "@/lib/permissions";
import db from "@/lib/db";

const ALLOWED_FIELDS = [
  "overdueRemindersEnabled",
  "overdueReminderDays",
  "preDueRemindersEnabled",
  "preDueReminderDays",
  "emailNotifications",
  "notifyPaymentReceived",
  "notifyInvoiceViewed",
  "notifyProposalAccepted",
  "notifyContractSigned",
  "notifyTaskOverdue",
];

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true },
    });

    if (!user?.businessId) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    const business = await db.business.findUnique({
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
    });

    return NextResponse.json(business);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { session, error, status: permStatus } = await requirePermission("manage_settings");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true },
    });

    if (!user?.businessId) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    const body = await req.json();

    // Only allow known fields
    const data = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body) {
        data[key] = body[key];
      }
    }

    // Validate types
    if (data.overdueReminderDays !== undefined) {
      data.overdueReminderDays = Math.max(1, Math.min(30, parseInt(data.overdueReminderDays, 10) || 3));
    }

    if (data.preDueReminderDays !== undefined) {
      // Validate comma-separated day values
      const days = String(data.preDueReminderDays)
        .split(",")
        .map((d) => parseInt(d.trim(), 10))
        .filter((d) => d > 0 && d <= 30)
        .sort((a, b) => b - a);
      data.preDueReminderDays = days.length > 0 ? days.join(",") : "3";
    }

    const updated = await db.business.update({
      where: { id: user.businessId },
      data,
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
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
