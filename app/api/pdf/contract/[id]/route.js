import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ContractPDF } from "@/lib/pdf-templates/ContractPDF";
import { DEFAULT_PDF_TEMPLATE } from "@/lib/pdf-templates/defaultTemplate";

export async function GET(request, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contract = await db.contract.findFirst({
    where: { id, userId: session.user.id },
    include: {
      project: { select: { id: true, title: true } },
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const templateRecord = await db.pdfTemplate.findFirst({
    where: { userId: session.user.id, type: "contract", isDefault: true },
  });

  const template = templateRecord || DEFAULT_PDF_TEMPLATE;

  let buffer;
  try {
    buffer = await renderToBuffer(
      React.createElement(ContractPDF, { contract, template })
    );
  } catch (err) {
    console.error("[PDF] Contract render failed:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }

  const safeName = contract.title.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const filename = `contract-${safeName}.pdf`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.byteLength.toString(),
    },
  });
}
