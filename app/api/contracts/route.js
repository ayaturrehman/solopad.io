import { getSession } from "@/lib/session";
import { getTenantFilter, getTenantData } from "@/lib/tenant";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filter = await getTenantFilter(session);

    const contracts = await db.contract.findMany({
      where: filter,
      include: { project: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ contracts });

  } catch (err) {
    console.error("[Contracts GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, projectId, clientName, clientEmail, clauses, status, signatureName } = body;

    const filter = await getTenantFilter(session);

    let project = null;
    if (projectId) {
      project = await db.project.findFirst({
        where: { id: projectId, ...filter },
        select: { id: true, contact: { select: { name: true, email: true } } },
      });
      if (!project) {
        return NextResponse.json({ error: "Invalid project." }, { status: 400 });
      }
    }

    const resolvedClientName = clientName?.trim() || project?.contact?.name || "";
    const resolvedClientEmail = clientEmail?.trim() || project?.contact?.email || null;

    if (!title?.trim() || !resolvedClientName) {
      return NextResponse.json({ error: "Title and client name are required" }, { status: 400 });
    }

    const tenantData = await getTenantData(session);

    const contract = await db.contract.create({
      data: {
        ...tenantData,
        projectId: project?.id || null,
        title: title.trim(),
        clientName: resolvedClientName,
        clientEmail: resolvedClientEmail,
        clauses: typeof clauses === "string" ? clauses : JSON.stringify(clauses || []),
        status: status || "draft",
        signatureName: signatureName?.trim() || null,
        sentAt: status === "sent" ? new Date() : null,
      },
      include: { project: { select: { id: true, title: true } } },
    });

    revalidatePath("/contracts");
    revalidatePath("/dashboard");

    return NextResponse.json({ contract }, { status: 201 });

  } catch (err) {
    console.error("[Contracts POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
