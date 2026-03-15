/**
 * POST /api/contracts/[id]/sign
 * Public endpoint — signs a contract using a valid signingToken.
 */
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req, { params }) {
  const { id } = await params;

  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { token, signatureName } = body;
  if (!token || !signatureName?.trim()) {
    return NextResponse.json({ error: "Token and signature name are required." }, { status: 400 });
  }

  const contract = await db.contract.findFirst({ where: { id, signingToken: token } });
  if (!contract) {
    return NextResponse.json({ error: "Invalid or expired signing link." }, { status: 404 });
  }

  if (contract.status === "signed") {
    return NextResponse.json({ error: "This contract has already been signed." }, { status: 400 });
  }

  // Capture IP for audit trail
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const signedAt = new Date();

  await db.contract.update({
    where: { id },
    data: {
      status: "signed",
      signatureName: signatureName.trim(),
      signedAt,
      signatureIp: ip,
      signatureDate: signedAt,
    },
  });

  return NextResponse.json({ ok: true, signedAt: signedAt.toISOString() });
}
