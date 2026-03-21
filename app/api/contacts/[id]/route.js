import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";
import { normalizeContactInput } from "@/lib/contacts";

export async function GET(req, { params }) { try {
    const { session, error, status: permStatus } = await requirePermission("view_contacts");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { id } = await params;
    const filter = await getTenantFilter(session);

    const contact = await db.contact.findFirst({
      where: { id, ...filter },
      include: {
        projects: {
          select: {
            id: true,
            title: true,
            status: true,
            stage: true,
            totalRevenue: true,
            updatedAt: true,
            invoices: {
              select: { id: true, total: true, status: true },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: 50,
        },
      },
    });

    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(contact);

  } catch (err) {
    console.error("[Contacts GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const { session, error, status: permStatus } = await requirePermission("manage_contacts");
  if (error) return NextResponse.json({ error }, { status: permStatus });

  try {
    const { id } = await params;
    const normalized = normalizeContactInput(await req.json(), { requireName: true });

    if (normalized.errors.length) {
      return NextResponse.json({ error: normalized.errors[0] }, { status: 400 });
    }

    const filter = await getTenantFilter(session);
    const contact = await db.contact.findFirst({ where: { id, ...filter } });
    if (!contact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await db.contact.update({
      where: { id },
      data: normalized.data,
    });

    revalidatePath("/contacts");
    revalidatePath("/dashboard");

    return NextResponse.json(updated);
  } catch (error) {
    const message =
      process.env.NODE_ENV === "production"
        ? "Failed to save contact."
        : error?.message || "Failed to save contact.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_contacts");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { id } = await params;

    const filter = await getTenantFilter(session);
    const contact = await db.contact.findFirst({ where: { id, ...filter } });
    if (!contact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.contact.delete({ where: { id } });

    revalidatePath("/contacts");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Contacts DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
