import { NextResponse } from "next/server";
import db from "@/lib/db";

function getNextRunDate(current, interval) {
  const d = new Date(current);
  switch (interval) {
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "biweekly":
      d.setDate(d.getDate() + 14);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setMonth(d.getMonth() + 1);
  }
  return d;
}

export async function POST(req) {
  try {
    const secret = req.headers.get("x-cron-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const due = await db.recurringInvoice.findMany({
      where: { active: true, nextRunAt: { lte: now } },
      include: { 
        contact: { select: { name: true } },
        user: { select: { id: true } },
      },
    });

    let generated = 0;

    for (const ri of due) {
      // Check end date
      if (ri.endDate && ri.endDate < now) {
        await db.recurringInvoice.update({ where: { id: ri.id }, data: { active: false } });
        continue;
      }

      try {
        // Generate invoice number
        const count = await db.invoice.count({ where: { projectId: ri.projectId || undefined } });
        const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;

        // Create the invoice
        await db.invoice.create({
          data: {
            projectId: ri.projectId || null,
            invoiceNumber,
            status: "draft",
            lineItems: JSON.stringify(ri.items),
            subtotal: ri.subtotal,
            taxRate: 0,
            taxAmount: ri.tax,
            total: ri.total,
            notes: ri.notes,
            dueDate: new Date(now.getTime() + (ri.dueDays || 14) * 86400000),
            recurringInvoiceId: ri.id,
          },
        });

        // Update next run
        await db.recurringInvoice.update({
          where: { id: ri.id },
          data: {
            nextRunAt: getNextRunDate(ri.nextRunAt, ri.interval),
            lastRunAt: now,
            runCount: { increment: 1 },
          },
        });

        generated++;
      } catch (itemErr) {
        console.error(`[Cron Generate Invoices] Error processing recurring invoice ${ri.id}:`, itemErr);
      }
    }

    return NextResponse.json({ success: true, generated, checked: due.length });
  } catch (err) {
    console.error("[Cron Generate Invoices]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
