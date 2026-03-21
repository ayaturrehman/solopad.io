import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import db from "@/lib/db";
import { DEFAULT_TEMPLATES } from "@/lib/email";

// GET — return all templates (custom + defaults merged)
export async function GET() {
  try {
    const { session, error, status: permStatus } = await requirePermission("manage_settings");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true },
    });

    if (!user?.businessId) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    // Get all custom templates for this business
    const custom = await db.emailTemplate.findMany({
      where: { businessId: user.businessId },
    });

    const customMap = Object.fromEntries(custom.map((t) => [t.type, t]));

    // Merge with defaults
    const templates = Object.entries(DEFAULT_TEMPLATES).map(([type, def]) => ({
      type,
      subject: customMap[type]?.subject || def.subject,
      body: customMap[type]?.body || def.body,
      isCustom: !!customMap[type],
      variables: def.variables,
      description: def.description,
    }));

    return NextResponse.json(templates);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — save a custom template for a specific type
export async function PATCH(req) {
  try {
    const { session, error, status: permStatus } = await requirePermission("manage_settings");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true },
    });

    if (!user?.businessId) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    const body = await req.json();
    const { type, subject, body: emailBody } = body;

    if (!type || !DEFAULT_TEMPLATES[type]) {
      return NextResponse.json({ error: "Invalid template type" }, { status: 400 });
    }

    if (!subject?.trim() || !emailBody?.trim()) {
      return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
    }

    const template = await db.emailTemplate.upsert({
      where: { businessId_type: { businessId: user.businessId, type } },
      create: {
        businessId: user.businessId,
        type,
        subject: subject.trim(),
        body: emailBody.trim(),
      },
      update: {
        subject: subject.trim(),
        body: emailBody.trim(),
      },
    });

    return NextResponse.json(template);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — reset a template to default
export async function DELETE(req) {
  try {
    const { session, error, status: permStatus } = await requirePermission("manage_settings");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true },
    });

    if (!user?.businessId) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    if (!type || !DEFAULT_TEMPLATES[type]) {
      return NextResponse.json({ error: "Invalid template type" }, { status: 400 });
    }

    await db.emailTemplate.deleteMany({
      where: { businessId: user.businessId, type },
    });

    return NextResponse.json({ ok: true, reset: type });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
