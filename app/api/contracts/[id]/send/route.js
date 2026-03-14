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

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#18181b;max-width:600px">
          <p>Hi ${contract.clientName || "there"},</p>
          <p>${message ? message.replace(/\n/g, "<br />") : "Please find the attached contract for your review and signature."}</p>
          <p style="color:#71717a;font-size:12px;margin-top:24px">Sent from Solopad</p>
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
