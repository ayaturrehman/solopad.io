import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { getTenantData } from "@/lib/tenant";
import db from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(req) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, contactId, description, startDate, endDate, status, stage } = await req.json();

    if (!contactId) return NextResponse.json({ error: "A contact is required." }, { status: 400 });

    const contact = await db.contact.findFirst({
      where: { id: contactId, userId: session.user.id },
      select: { id: true },
    });
    if (!contact) return NextResponse.json({ error: "Contact not found." }, { status: 404 });

    const tenantData = await getTenantData(session);

    const project = await db.project.create({
      data: {
        ...tenantData,
        title,
        contactId,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || "in_progress",
        stage: stage || "new",
        portalToken: nanoid(12),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath("/calendar");

    return NextResponse.json(project);

  } catch (err) {
    console.error("[Projects POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
