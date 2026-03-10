import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    projectId, lineItems, currency, dueDate, remindersEnabled,
    taxRate, discountType, discountValue, notes, invoiceNumber,
    paymentType, paymentPlan, status,
  } = body;

  if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });

  try {
    const project = await db.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Compute amounts
    const parsedLines = Array.isArray(lineItems) ? lineItems : [];
    const subtotal = parsedLines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
    const taxAmt = subtotal * ((parseFloat(taxRate) || 0) / 100);
    let discountAmt = 0;
    const dtype = discountType || "none";
    const dval = parseFloat(discountValue) || 0;
    if (dtype === "percent") discountAmt = subtotal * (dval / 100);
    else if (dtype === "fixed") discountAmt = Math.min(dval, subtotal);
    const total = Math.max(0, subtotal + taxAmt - discountAmt);

    const invoice = await db.invoice.create({
      data: {
        projectId,
        invoiceNumber: invoiceNumber?.trim() || null,
        lineItems: JSON.stringify(parsedLines),
        subtotal,
        taxRate: parseFloat(taxRate) || 0,
        taxAmount: taxAmt,
        discountType: dtype,
        discountValue: dval,
        discountAmount: discountAmt,
        total,
        currency: currency || "USD",
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes?.trim() || null,
        remindersEnabled: remindersEnabled ?? true,
        status: ["draft", "sent"].includes(status) ? status : "draft",
      },
    });

    // Save payment plan milestones if installments selected
    if (paymentType === "installments" && Array.isArray(paymentPlan) && paymentPlan.length > 0) {
      await db.paymentPlan.createMany({
        data: paymentPlan.map((m) => ({
          invoiceId: invoice.id,
          amount: parseFloat(m.amount) || 0,
          dueDate: m.dueDate ? new Date(m.dueDate) : null,
          label: m.label || null,
          status: "upcoming",
        })),
      });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error("[POST /api/invoices]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Verify ownership
  const invoice = await db.invoice.findFirst({
    where: { id },
    include: { project: { select: { userId: true } } },
  });
  if (!invoice || invoice.project.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.invoice.update({
    where: { id },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.paidAt !== undefined && { paidAt: data.paidAt ? new Date(data.paidAt) : null }),
      ...(data.sentAt !== undefined && { sentAt: data.sentAt ? new Date(data.sentAt) : null }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const invoice = await db.invoice.findFirst({
    where: { id },
    include: { project: { select: { userId: true } } },
  });
  if (!invoice || invoice.project.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.invoice.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
