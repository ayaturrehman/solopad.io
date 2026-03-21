import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import db from "@/lib/db";
import { sendNotificationEmail } from "@/lib/email";

export async function POST(req) {
  const { session, error, status: permStatus } = await requirePermission("manage_invoices");
  if (error) return NextResponse.json({ error }, { status: permStatus });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { ids } = body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
  }
  if (ids.length > 20) {
    return NextResponse.json({ error: "Maximum 20 invoices per bulk send" }, { status: 400 });
  }

  // Load invoices that belong to this user
  const invoices = await db.invoice.findMany({
    where: {
      id: { in: ids },
      project: { userId: session.user.id },
    },
    include: {
      project: { select: { title: true, portalToken: true, contact: { select: { name: true, email: true } } } },
    },
  });

  const results = { sent: 0, skipped: 0, errors: [] };

  for (const inv of invoices) {
    const email = inv.project?.contact?.email;
    if (!email) { results.skipped++; continue; }

    const invoiceLabel = inv.invoiceNumber || `INV-${inv.id.slice(0, 6).toUpperCase()}`;
    const portalLink = `${process.env.NEXT_PUBLIC_APP_URL}/p/${inv.project.portalToken}`;

    try {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { businessId: true },
      });

      const result = await sendNotificationEmail({
        businessId: user?.businessId,
        type: "invoice_sent",
        to: email,
        variables: {
          clientName: inv.project.contact?.name || "",
          invoiceNumber: invoiceLabel,
          senderName: session.user.name,
          portalLink,
        },
      });

      if (result.sent) {
        // Mark as sent if still draft
        if (inv.status === "draft") {
          await db.invoice.update({
            where: { id: inv.id },
            data: { status: "sent", sentAt: new Date() },
          });
        }
        results.sent++;
      } else {
        results.errors.push({ id: inv.id, error: result.error || "Email disabled" });
      }
    } catch (err) {
      results.errors.push({ id: inv.id, error: err.message });
    }
  }

  revalidatePath("/finance");

  return NextResponse.json(results);
}
