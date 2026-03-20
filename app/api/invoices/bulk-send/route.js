import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@solopad.app",
        to: email,
        subject: `Invoice ${invoiceLabel} from ${session.user.name}`,
        html: `
          <p>Hi ${inv.project.contact?.name || ""},</p>
          <p>${session.user.name} has sent you invoice <strong>${invoiceLabel}</strong>.</p>
          <p>
            <a href="${portalLink}" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
              View &amp; Pay Invoice
            </a>
          </p>
          <p style="color:#71717a;font-size:12px;">Powered by Solopad</p>
        `,
      });

      // Mark as sent if still draft
      if (inv.status === "draft") {
        await db.invoice.update({
          where: { id: inv.id },
          data: { status: "sent", sentAt: new Date() },
        });
      }

      results.sent++;
    } catch (err) {
      results.errors.push({ id: inv.id, error: err.message });
    }
  }

  revalidatePath("/finance");

  return NextResponse.json(results);
}
