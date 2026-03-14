import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ProposalPDF } from "@/lib/pdf-templates/ProposalPDF";

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

export async function GET(request, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const proposal = await db.proposal.findFirst({
    where: { id, userId: session.user.id },
    include: {
      project: { select: { id: true, title: true } },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const templateRecord = await db.pdfTemplate.findFirst({
    where: { userId: session.user.id, type: "proposal", isDefault: true },
  });

  const template = templateRecord || DEFAULT_TEMPLATE;

  const buffer = await renderToBuffer(
    React.createElement(ProposalPDF, { proposal, template })
  );

  const safeName = proposal.title.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const filename = `proposal-${safeName}.pdf`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.byteLength.toString(),
    },
  });
}
