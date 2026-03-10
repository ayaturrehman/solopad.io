import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

// PATCH /api/invoices/[id]
export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const invoice = await db.invoice.findFirst({
    where: { id },
    include: { project: true },
  });

  if (!invoice || invoice.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    // Status-only update (mark sent / cancel)
    if (body.statusOnly) {
      const updated = await db.invoice.update({
        where: { id },
        data: {
          status: body.status ?? invoice.status,
        },
      });
      return NextResponse.json(updated);
    }

    // Full edit update
    const {
      invoiceNumber, lineItems, currency, dueDate, notes,
      remindersEnabled, taxRate, discountType, discountValue,
      paymentType, paymentPlan, status,
    } = body;

    const parsedLines = Array.isArray(lineItems) ? lineItems : JSON.parse(invoice.lineItems || "[]");
    const subtotal = parsedLines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
    const taxAmt = subtotal * ((parseFloat(taxRate ?? invoice.taxRate) || 0) / 100);
    let discountAmt = 0;
    const dtype = discountType ?? invoice.discountType ?? "none";
    const dval = parseFloat(discountValue ?? invoice.discountValue) || 0;
    if (dtype === "percent") discountAmt = subtotal * (dval / 100);
    else if (dtype === "fixed") discountAmt = Math.min(dval, subtotal);
    const total = Math.max(0, subtotal + taxAmt - discountAmt);

    const updated = await db.invoice.update({
      where: { id },
      data: {
        invoiceNumber: invoiceNumber?.trim() ?? invoice.invoiceNumber,
        lineItems: JSON.stringify(parsedLines),
        subtotal,
        taxRate: parseFloat(taxRate ?? invoice.taxRate) || 0,
        taxAmount: taxAmt,
        discountType: dtype,
        discountValue: dval,
        discountAmount: discountAmt,
        total,
        currency: currency ?? invoice.currency,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : invoice.dueDate,
        notes: notes !== undefined ? (notes?.trim() || null) : invoice.notes,
        remindersEnabled: remindersEnabled ?? invoice.remindersEnabled,
        ...(status && ["draft", "sent"].includes(status) ? { status } : {}),
      },
    });

    // Replace payment plan milestones if provided
    if (paymentType === "installments" && Array.isArray(paymentPlan)) {
      await db.paymentPlan.deleteMany({ where: { invoiceId: id } });
      if (paymentPlan.length > 0) {
        await db.paymentPlan.createMany({
          data: paymentPlan.map((m) => ({
            invoiceId: id,
            label: m.label || null,
            amount: parseFloat(m.amount) || 0,
            dueDate: m.dueDate ? new Date(m.dueDate) : null,
            status: "upcoming",
          })),
        });
      }
    } else if (paymentType === "lump_sum") {
      // Clear any existing milestones if switching to lump sum
      await db.paymentPlan.deleteMany({ where: { invoiceId: id } });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/invoices/[id]]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/invoices/[id]
export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const invoice = await db.invoice.findFirst({
    where: { id },
    include: { project: true },
  });

  if (!invoice || invoice.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
