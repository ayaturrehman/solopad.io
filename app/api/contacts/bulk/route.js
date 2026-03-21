import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

const VALID_ACTIONS = new Set(["updateStatus", "delete"]);
const VALID_STATUS = new Set(["lead", "active", "archived"]);
const MAX_SELECTION = 25;

export async function POST(req) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_contacts");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const body = await req.json();
    const action = typeof body?.action === "string" ? body.action : "";
    const ids = Array.isArray(body?.ids)
      ? Array.from(new Set(body.ids.filter((value) => typeof value === "string" && value.trim())))
      : [];

    if (!VALID_ACTIONS.has(action)) {
      return NextResponse.json({ error: "Invalid bulk action." }, { status: 400 });
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: "Select at least one contact." }, { status: 400 });
    }

    if (ids.length > MAX_SELECTION) {
      return NextResponse.json({ error: `You can only bulk select up to ${MAX_SELECTION} contacts.` }, { status: 400 });
    }

    const filter = await getTenantFilter(session);
    const scopedIds = await db.contact.findMany({
      where: {
        ...filter,
        id: { in: ids },
      },
      select: { id: true },
    });

    const allowedIds = scopedIds.map((contact) => contact.id);
    if (allowedIds.length === 0) {
      return NextResponse.json({ error: "No valid contacts found for this action." }, { status: 404 });
    }

    if (action === "updateStatus") {
      const status = typeof body?.status === "string" ? body.status : "";
      if (!VALID_STATUS.has(status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }

      const result = await db.contact.updateMany({
        where: {
          ...filter,
          id: { in: allowedIds },
        },
        data: { status },
      });

      revalidatePath("/contacts");
      revalidatePath("/dashboard");

      return NextResponse.json({
        success: true,
        updatedCount: result.count,
        action,
        status,
      });
    }

    const result = await db.contact.deleteMany({
      where: {
        ...filter,
        id: { in: allowedIds },
      },
    });

    revalidatePath("/contacts");
    revalidatePath("/dashboard");

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      action,
    });

  } catch (err) {
    console.error("[Contacts Bulk POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
