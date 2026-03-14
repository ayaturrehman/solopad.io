import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { InvoicePDF } from "@/lib/pdf-templates/InvoicePDF";
import { DEFAULT_PDF_TEMPLATE } from "@/lib/pdf-templates/defaultTemplate";

export async function GET(request, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoice = await db.invoice.findFirst({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          clientName: true,
          clientEmail: true,
          userId: true,
          contact: { select: { name: true, email: true } },
        },
      },
    },
  });

  // Guard: null project or wrong user
  if (!invoice || !invoice.project || invoice.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const templateRecord = await db.pdfTemplate.findFirst({
    where: { userId: session.user.id, type: "invoice", isDefault: true },
  });

  const template = templateRecord || DEFAULT_PDF_TEMPLATE;

  let buffer;
  try {
    buffer = await renderToBuffer(
      React.createElement(InvoicePDF, { invoice, template })
    );
  } catch (err) {
    console.error("[PDF] Invoice render failed:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }

  const invoiceNum = invoice.invoiceNumber ? `-${invoice.invoiceNumber}` : "";
  const filename = `invoice${invoiceNum}.pdf`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.byteLength.toString(),
    },
  });
}
