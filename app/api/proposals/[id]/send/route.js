import { NextResponse } from "next/server";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { ProposalPDF } from "@/lib/pdf-templates/ProposalPDF";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const DEFAULT_TEMPLATE = {
  accentColor: "#18181b",
  fontFamily: "helvetica",
  fontSize: 10,
  headerStyle: "classic",
  showLogo: true,
  showWatermark: false,
  showPageNumbers: true,
  showItemNumbers: true,
  showTaxColumn: false,
  tableHeaderBg: "#18181b",
  tableHeaderTextColor: "#ffffff",
  showTerms: false,
  termsText: null,
  showSignatureBlock: true,
  paperSize: "A4",
  orientation: "portrait",
  marginTop: 0.4,
  marginBottom: 0.4,
  marginLeft: 0.4,
  marginRight: 0.4,
  footerText: null,
  logoUrl: null,
  businessName: null,
  businessAddress: null,
  businessEmail: null,
  businessPhone: null,
};

export async function POST(request, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resend) {
    return NextResponse.json(
      { error: "Email sending is not configured. Add RESEND_API_KEY and try again." },
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
    return NextResponse.json(
      { error: "Email and subject are required." },
      { status: 400 }
    );
  }

  const proposal = await db.proposal.findFirst({
    where: { id, userId: session.user.id },
    include: { project: { select: { id: true, title: true } } },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  }

  const templateRecord = await db.pdfTemplate.findFirst({
    where: { userId: session.user.id, type: "proposal", isDefault: true },
  });
  const template = templateRecord || DEFAULT_TEMPLATE;

  const buffer = await renderToBuffer(
    React.createElement(ProposalPDF, { proposal, template })
  );

  const safeName = (proposal.title || proposal.id)
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase();
  const filename = `proposal-${safeName}.pdf`;
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
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#18181b">
          <p>Hi ${proposal.clientName || "there"},</p>
          <p>${message ? message.replace(/\n/g, "<br />") : "Please find the attached proposal for your review."}</p>
          <p style="color:#71717a;font-size:12px">Sent from Solopad</p>
        </div>
      `,
      attachments: [
        {
          filename,
          content: buffer.toString("base64"),
        },
      ],
    });

    const nextStatus =
      proposal.status === "accepted" || proposal.status === "declined"
        ? proposal.status
        : "sent";

    await db.proposal.update({
      where: { id: proposal.id },
      data: {
        clientEmail: email,
        status: nextStatus,
        sentAt: proposal.sentAt || new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Could not send proposal." },
      { status: 500 }
    );
  }
}
