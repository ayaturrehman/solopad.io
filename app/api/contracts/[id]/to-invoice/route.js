/**
 * POST /api/contracts/[id]/to-invoice
 * Creates a draft invoice pre-filled from a signed contract.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function POST(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const contract = await db.contract.findFirst({ where: { id, userId: session.user.id } });
  if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

  if (!contract.projectId) {
    return NextResponse.json(
      { error: "This contract is not linked to a project. Link it to a project first, then create the invoice." },
      { status: 400 }
    );
  }

  // Try to extract payment amount from clauses
  let clauses = [];
  try {
    clauses = typeof contract.clauses === "string" ? JSON.parse(contract.clauses) : (contract.clauses || []);
  } catch { clauses = []; }

  // Look for a payment clause to extract amount
  const paymentClause = clauses.find((c) => /payment/i.test(c.heading));

  const lineItems = [
    {
      description: `Professional services — ${contract.title}`,
      amount: 0, // User will fill in amount — we can't parse it reliably from clause text
    },
  ];

  const invoice = await db.invoice.create({
    data: {
      projectId: contract.projectId,
      lineItems: JSON.stringify(lineItems),
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      discountType: "none",
      discountValue: 0,
      discountAmount: 0,
      total: 0,
      currency: "USD",
      notes: paymentClause
        ? `Per signed contract: ${contract.title}.\n\n${(paymentClause.body || "").substring(0, 300)}`
        : `Invoice for services per signed contract: ${contract.title}`,
      remindersEnabled: true,
      status: "draft",
    },
  });

  return NextResponse.json({ invoice }, { status: 201 });
}
