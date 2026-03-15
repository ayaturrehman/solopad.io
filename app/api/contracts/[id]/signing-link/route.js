/**
 * GET /api/contracts/[id]/signing-link
 * Returns the signing URL for a contract. Auto-generates a signingToken if missing.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
export async function GET(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let contract = await db.contract.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, signingToken: true, title: true, clientName: true },
  });

  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Auto-generate token if missing (old records)
  if (!contract.signingToken) {
    const token = crypto.randomUUID().replace(/-/g, "");
    contract = await db.contract.update({
      where: { id },
      data: { signingToken: token },
      select: { id: true, signingToken: true, title: true, clientName: true },
    });
  }

  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const signingUrl = `${base}/contracts/${contract.id}/sign/${contract.signingToken}`;

  return NextResponse.json({ signingUrl, token: contract.signingToken });
}
