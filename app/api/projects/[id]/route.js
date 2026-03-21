import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

export async function PATCH(req, { params }) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_projects");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { id } = await params;
    const body = await req.json();

    const data = { ...body };
    if (data.endDate !== undefined) data.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.startDate !== undefined) data.startDate = data.startDate ? new Date(data.startDate) : null;

    const filter = await getTenantFilter(session);

    const project = await db.project.updateMany({
      where: { id, ...filter },
      data,
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath("/calendar");

    return NextResponse.json(project);

  } catch (err) {
    console.error("[Projects PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_projects");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { id } = await params;

    const filter = await getTenantFilter(session);

    await db.project.deleteMany({
      where: { id, ...filter },
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath("/calendar");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Projects DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
