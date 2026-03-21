import { requirePermission } from "@/lib/permissions";
import { getTenantFilter, getTenantData } from "@/lib/tenant";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() { try {
    const { session, error, status: permStatus } = await requirePermission("view_proposals");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const filter = await getTenantFilter(session);

    const proposals = await db.proposal.findMany({
      where: filter,
      include: { project: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ proposals });

  } catch (err) {
    console.error("[Proposals GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_proposals");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const body = await req.json();
    const {
      title, projectId, clientName, clientEmail, intro,
      sections, pricing, total, currency, validUntil, status,
    } = body;

    if (!title || !clientName) {
      return NextResponse.json({ error: "Title and client name are required" }, { status: 400 });
    }

    const tenantData = await getTenantData(session);

    const proposal = await db.proposal.create({
      data: {
        ...tenantData,
        projectId: projectId || null,
        title,
        clientName,
        clientEmail: clientEmail || null,
        intro: intro || null,
        sections: typeof sections === "string" ? sections : JSON.stringify(sections || []),
        pricing: typeof pricing === "string" ? pricing : JSON.stringify(pricing || []),
        total: parseFloat(total) || 0,
        currency: currency || "USD",
        validUntil: validUntil ? new Date(validUntil) : null,
        status: status || "draft",
        sentAt: status === "sent" ? new Date() : null,
      },
    });

    revalidatePath("/proposals");
    revalidatePath("/dashboard");

    return NextResponse.json({ proposal }, { status: 201 });

  } catch (err) {
    console.error("[Proposals POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
