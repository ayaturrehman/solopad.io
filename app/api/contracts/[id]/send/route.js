import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!resend) {
    return NextResponse.json(
      { error: "Email sending is not configured. Add RESEND_API_KEY to your environment." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const subject = body.subject?.trim();
  const message = body.message?.trim();

  if (!email || !subject) {
    return NextResponse.json({ error: "Email and subject are required." }, { status: 400 });
  }

  const contract = await db.contract.findFirst({
    where: { id, userId: session.user.id },
    include: { project: { select: { id: true, title: true } } },
  });

  if (!contract) return NextResponse.json({ error: "Contract not found." }, { status: 404 });

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    "noreply@solopad.app";

  // Build the signing URL using the contract's signingToken
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const signingUrl = `${process.env.NEXTAUTH_URL || baseUrl}/contracts/${contract.id}/sign/${contract.signingToken}`;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#18181b;max-width:600px">
          <p>Hi ${contract.clientName || "there"},</p>
          <p>${message ? message.replace(/\n/g, "<br />") : "Please find the contract below for your review and signature."}</p>
          <p style="margin:28px 0">
            <a href="${signingUrl}" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
              Review &amp; Sign Contract →
            </a>
          </p>
          <p style="color:#71717a;font-size:12px">Or copy this link: <a href="${signingUrl}" style="color:#3b82f6">${signingUrl}</a></p>
          <p style="color:#71717a;font-size:12px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px">Sent from SoloPad</p>
        </div>
      `,
    });

    await db.contract.update({
      where: { id: contract.id },
      data: {
        clientEmail: email,
        status: contract.status === "signed" ? "signed" : "sent",
        sentAt: contract.sentAt || new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Could not send contract." },
      { status: 500 }
    );
  }
}
