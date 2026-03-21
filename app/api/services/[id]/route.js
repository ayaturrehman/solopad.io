import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";
import { buildServiceUsageMap, normalizeServiceInput } from "@/lib/services";

async function getOwnedService(id, session) {
  const filter = await getTenantFilter(session);
  return db.service.findFirst({ where: { id, ...filter } });
}

export async function PATCH(req, { params }) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_projects");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { id } = await params;
    const body = await req.json();

    const service = await getOwnedService(id, session);
    if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const normalized = normalizeServiceInput({
      name: body.name ?? service.name,
      description: body.description ?? service.description,
      defaultRate: body.defaultRate ?? service.defaultRate,
      unit: body.unit ?? service.unit,
      status: body.status ?? service.status,
    });
    if (normalized.errors.length) {
      return NextResponse.json({ error: normalized.errors[0] }, { status: 400 });
    }

    const updated = await db.service.update({
      where: { id },
      data: normalized.data,
    });

    const filter = await getTenantFilter(session);
    const invoices = await db.invoice.findMany({
      where: { project: filter },
      select: { id: true, lineItems: true },
    });
    const usageMap = buildServiceUsageMap([updated], invoices);

    revalidatePath("/services");

    return NextResponse.json({ ...updated, usageCount: usageMap[updated.id] || 0 });

  } catch (err) {
    console.error("[Services PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_projects");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { id } = await params;

    const service = await getOwnedService(id, session);
    if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const filter = await getTenantFilter(session);
    const invoices = await db.invoice.findMany({
      where: { project: filter },
      select: { id: true, lineItems: true },
    });
    const usageMap = buildServiceUsageMap([service], invoices);
    const usageCount = usageMap[service.id] || 0;

    if (usageCount > 0) {
      return NextResponse.json(
        { error: "This service is already used in invoices and cannot be deleted.", usageCount },
        { status: 409 }
      );
    }

    await db.service.delete({ where: { id } });

    revalidatePath("/services");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Services DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
