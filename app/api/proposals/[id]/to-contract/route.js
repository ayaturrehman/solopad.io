/**
 * POST /api/proposals/[id]/to-contract
 * Creates a draft contract pre-filled from an accepted proposal.
 */
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { getTenantData } from "@/lib/tenant";
import db from "@/lib/db";

export async function POST(req, { params }) {
  const { session, error, status: permStatus } = await requirePermission("manage_proposals");
  if (error) return NextResponse.json({ error }, { status: permStatus });

  const { id } = await params;
  const proposal = await db.proposal.findFirst({ where: { id, userId: session.user.id } });
  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

  // Parse proposal sections → contract clauses
  let sections = [];
  try {
    sections = typeof proposal.sections === "string" ? JSON.parse(proposal.sections) : (proposal.sections || []);
  } catch { sections = []; }

  let pricing = [];
  try {
    pricing = typeof proposal.pricing === "string" ? JSON.parse(proposal.pricing) : (proposal.pricing || []);
  } catch { pricing = []; }

  const totalAmount = proposal.total || 0;
  const currency = proposal.currency || "USD";

  // Build clauses from proposal content
  const clauses = [];

  // Scope from proposal sections
  const scopeSection = sections.find((s) => /scope|deliverable|overview/i.test(s.heading));
  clauses.push({
    heading: "Scope of Work",
    body: scopeSection
      ? (scopeSection.body || "").replace(/<[^>]*>/g, "").trim() || "Services as outlined in the accepted proposal."
      : "Services as outlined in the accepted proposal.",
  });

  // Payment terms from pricing total
  const pricingLines = pricing
    .map((item) => `• ${item.description}: ${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(item.amount || 0)}`)
    .join("\n");
  clauses.push({
    heading: "Payment Terms",
    body: `Total project fee: ${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(totalAmount)}.\n\nPayment schedule: 50% deposit due before work begins; 50% due upon final delivery.\n\nInvoices are due within 14 days of issue.${pricingLines ? `\n\nBreakdown:\n${pricingLines}` : ""}`,
  });

  // Add remaining proposal sections as clauses
  for (const sec of sections) {
    if (sec === scopeSection) continue;
    clauses.push({
      heading: sec.heading || "Additional Terms",
      body: (sec.body || "").replace(/<[^>]*>/g, "").trim(),
    });
  }

  // Standard clauses
  clauses.push(
    {
      heading: "Revisions",
      body: "Revisions beyond those specified in the accepted proposal will be billed at the Service Provider's standard hourly rate. Major scope changes require a written change order.",
    },
    {
      heading: "Intellectual Property",
      body: "Upon receipt of full payment, all intellectual property rights for the final deliverables transfer to the Client. The Service Provider retains the right to display the work in their portfolio.",
    },
    {
      heading: "Termination",
      body: "Either party may terminate this agreement with 14 days written notice. The Client will pay for all work completed up to the termination date. Any deposit paid is non-refundable after work has commenced.",
    },
    {
      heading: "Confidentiality",
      body: "Both parties agree to keep confidential any proprietary information shared during this engagement. This obligation survives termination of the agreement.",
    }
  );

  const tenantData = await getTenantData(session);

  const contract = await db.contract.create({
    data: {
      ...tenantData,
      projectId: proposal.projectId || null,
      title: `Service Agreement — ${proposal.title}`,
      clientName: proposal.clientName,
      clientEmail: proposal.clientEmail || null,
      clauses: JSON.stringify(clauses),
      status: "draft",
    },
  });

  return NextResponse.json({ contract }, { status: 201 });
}
