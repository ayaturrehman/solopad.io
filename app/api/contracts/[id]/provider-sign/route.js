/**
 * POST /api/contracts/[id]/provider-sign
 * Authenticated — lets the freelancer (service provider) sign their own contract.
 */
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import db from "@/lib/db";

export async function POST(req, { params }) { try {
    const { id } = await params;
    const { session, error, status: permStatus } = await requirePermission("manage_contracts");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const body = await req.json().catch(() => ({}));
    const { signatureName } = body;
    if (!signatureName?.trim()) {
      return NextResponse.json({ error: "Signature name is required." }, { status: 400 });
    }

    const contract = await db.contract.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!contract) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const now = new Date();
    const updated = await db.contract.update({
      where: { id },
      data: {
        providerSignatureName: signatureName.trim(),
        providerSignedAt: now,
      },
    });

    return NextResponse.json({ ok: true, providerSignedAt: now.toISOString(), contract: updated });

  } catch (err) {
    console.error("[Contracts Provider Sign POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
