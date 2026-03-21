import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { getTenantFilter, getTenantData } from "@/lib/tenant";
import db from "@/lib/db";
import { normalizeServiceInput } from "@/lib/services";

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filter = await getTenantFilter(session);

    const services = await db.service.findMany({
      where: filter,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(services);

  } catch (err) {
    console.error("[Services GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const normalized = normalizeServiceInput(await req.json());
    if (normalized.errors.length) {
      return NextResponse.json({ error: normalized.errors[0] }, { status: 400 });
    }

    const tenantData = await getTenantData(session);

    const service = await db.service.create({
      data: {
        ...tenantData,
        ...normalized.data,
      },
    });

    revalidatePath("/services");

    return NextResponse.json({ ...service, usageCount: 0 }, { status: 201 });

  } catch (err) {
    console.error("[Services POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
