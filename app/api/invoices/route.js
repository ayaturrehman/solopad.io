import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

export async function GET(req) { try {
    const { session, error, status: permStatus } = await requirePermission("view_invoices");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const filter = await getTenantFilter(session);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";

    const invoices = await db.invoice.findMany({
      where: {
        project: filter,
        ...(status && { status }),
      },
      include: {
        project: { select: { title: true, contact: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(invoices);

  } catch (err) {
    console.error("[Invoices GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  const { session, error, status: permStatus } = await requirePermission("manage_invoices");
  if (error) return NextResponse.json({ error }, { status: permStatus });

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

  const parsedTaxRate = parseFloat(taxRate) || 0;
  if (parsedTaxRate < 0 || parsedTaxRate > 100) {
    return NextResponse.json({ error: "taxRate must be between 0 and 100." }, { status: 400 });
  }
  const parsedDiscountValue = parseFloat(discountValue) || 0;
  if (parsedDiscountValue < 0) {
    return NextResponse.json({ error: "discountValue must be 0 or greater." }, { status: 400 });
  }

  try {
    const filter = await getTenantFilter(session);

    // Soft uniqueness check for invoice number
    const trimmedInvoiceNumber = invoiceNumber?.trim() || null;
    if (trimmedInvoiceNumber) {
      const existing = await db.invoice.findFirst({
        where: { invoiceNumber: trimmedInvoiceNumber, project: filter },
      });
      if (existing) {
        return NextResponse.json({ error: "Invoice number already exists" }, { status: 400 });
      }
    }

    const project = await db.project.findFirst({
      where: { id: projectId, ...filter },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Use freelancer's configured currency if not specified on invoice
    let defaultCurrency = "GBP";
    if (!currency && session.user?.businessId) {
      const biz = await db.business.findUnique({
        where: { id: session.user.businessId },
        select: { currency: true },
      });
      if (biz?.currency) defaultCurrency = biz.currency;
    }

    // Compute amounts
    const round2 = (v) => Math.round(v * 100) / 100;
    const parsedLines = Array.isArray(lineItems) ? lineItems : [];
    const subtotal = round2(parsedLines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0));
    const taxAmt = round2(subtotal * (parsedTaxRate / 100));
    let discountAmt = 0;
    const dtype = discountType || "none";
    const dval = parsedDiscountValue;
    if (dtype === "percent") discountAmt = round2(subtotal * (dval / 100));
    else if (dtype === "fixed") discountAmt = round2(Math.min(dval, subtotal));
    const total = round2(Math.max(0, subtotal + taxAmt - discountAmt));

    const invoice = await db.invoice.create({
      data: {
        projectId,
        invoiceNumber: trimmedInvoiceNumber,
        lineItems: JSON.stringify(parsedLines),
        subtotal,
        taxRate: parsedTaxRate,
        taxAmount: taxAmt,
        discountType: dtype,
        discountValue: dval,
        discountAmount: discountAmt,
        total,
        currency: currency || defaultCurrency,
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

    revalidatePath("/dashboard");
    revalidatePath("/finance");
    revalidatePath("/calendar");

    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error("[POST /api/invoices]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_invoices");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const filter = await getTenantFilter(session);

    // Verify ownership
    const invoice = await db.invoice.findFirst({
      where: { id, project: filter },
      include: { project: { select: { userId: true } } },
    });
    if (!invoice)
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

    revalidatePath("/dashboard");
    revalidatePath("/finance");
    revalidatePath("/calendar");

    return NextResponse.json(updated);

  } catch (err) {
    console.error("[Invoices PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_invoices");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const filter = await getTenantFilter(session);

    const invoice = await db.invoice.findFirst({
      where: { id, project: filter },
      include: { project: { select: { userId: true } } },
    });
    if (!invoice)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.invoice.delete({ where: { id } });

    revalidatePath("/dashboard");
    revalidatePath("/finance");
    revalidatePath("/calendar");

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[Invoices DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
