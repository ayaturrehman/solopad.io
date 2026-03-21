import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(req, { params }) { try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filter = await getTenantFilter(session);

    const contract = await db.contract.findFirst({
      where: { id, ...filter },
      include: { project: { select: { id: true, title: true } } },
    });

    if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ contract });

  } catch (err) {
    console.error("[Contracts GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) { try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filter = await getTenantFilter(session);
    const contract = await db.contract.findFirst({ where: { id, ...filter } });
    if (!contract) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, projectId, clientName, clientEmail, clauses, status, signatureName } = body;

    const updateData = {};
    if (projectId !== undefined) {
      if (projectId) {
        const project = await db.project.findFirst({
          where: { id: projectId, ...filter },
          select: { id: true },
        });
        if (!project) {
          return NextResponse.json({ error: "Invalid project." }, { status: 400 });
        }
        updateData.projectId = project.id;
      } else {
        updateData.projectId = null;
      }
    }
    if (title !== undefined) updateData.title = title;
    if (clientName !== undefined) updateData.clientName = clientName;
    if (clientEmail !== undefined) updateData.clientEmail = clientEmail || null;
    if (clauses !== undefined) updateData.clauses = typeof clauses === "string" ? clauses : JSON.stringify(clauses);
    if (signatureName !== undefined) updateData.signatureName = signatureName || null;
    if (status !== undefined) {
      updateData.status = status;
      if (status === "sent" && !contract.sentAt) updateData.sentAt = new Date();
      if (status === "signed" && !contract.signedAt) updateData.signedAt = new Date();
    }

    const updated = await db.contract.update({ where: { id }, data: updateData });

    revalidatePath("/contracts");
    revalidatePath("/dashboard");

    return NextResponse.json({ contract: updated });

  } catch (err) {
    console.error("[Contracts PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) { try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filter = await getTenantFilter(session);
    const contract = await db.contract.findFirst({ where: { id, ...filter } });
    if (!contract) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.contract.delete({ where: { id } });

    revalidatePath("/contracts");
    revalidatePath("/dashboard");

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[Contracts DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
