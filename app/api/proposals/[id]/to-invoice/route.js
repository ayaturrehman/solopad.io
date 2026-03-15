/**
 * POST /api/proposals/[id]/to-invoice
 * Creates a draft invoice pre-filled from an accepted proposal.
 * Requires the proposal to be linked to a project (invoices need projectId).
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function POST(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const proposal = await db.proposal.findFirst({ where: { id, userId: session.user.id } });
  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

  if (!proposal.projectId) {
    return NextResponse.json(
      { error: "This proposal is not linked to a project. Link it to a project first, then create the invoice." },
      { status: 400 }
    );
  }

  let pricing = [];
  try {
    pricing = typeof proposal.pricing === "string" ? JSON.parse(proposal.pricing) : (proposal.pricing || []);
  } catch { pricing = []; }

  const lineItems = pricing.map((item) => ({
    description: item.description || "Service",
    amount: parseFloat(item.amount) || 0,
  }));

  const round2 = (v) => Math.round(v * 100) / 100;
  const subtotal = round2(lineItems.reduce((s, l) => s + l.amount, 0));

  const invoice = await db.invoice.create({
    data: {
      projectId: proposal.projectId,
      lineItems: JSON.stringify(lineItems),
      subtotal,
      taxRate: 0,
      taxAmount: 0,
      discountType: "none",
      discountValue: 0,
      discountAmount: 0,
      total: subtotal,
      currency: proposal.currency || "USD",
      notes: `Invoice for services as per accepted proposal: ${proposal.title}`,
      remindersEnabled: true,
      status: "draft",
    },
  });

  return NextResponse.json({ invoice }, { status: 201 });
}
