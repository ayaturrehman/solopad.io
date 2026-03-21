import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import {
  buildContactsCsvBuffer,
  buildContactsXlsxBuffer,
  createPasswordProtectedZipBuffer,
} from "@/lib/contact-export";

export const runtime = "nodejs";

const VALID_STATUS = new Set(["lead", "active", "archived"]);
const VALID_FORMATS = new Set(["csv", "xlsx"]);
const VALID_SCOPES = new Set(["filtered", "all"]);

function makeWhere(filter, { query, status, scope }) {
  if (scope === "all") {
    return filter;
  }

  return {
    ...filter,
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { company: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
      ],
    }),
    ...(status !== "all" ? { status } : {}),
  };
}

function makeBaseName() {
  const date = new Date().toISOString().slice(0, 10);
  return `contacts-export-${date}`;
}

export async function POST(req) { try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const format = VALID_FORMATS.has(body?.format) ? body.format : "csv";
    const scope = VALID_SCOPES.has(body?.scope) ? body.scope : "filtered";
    const password = typeof body?.password === "string" ? body.password.trim() : "";
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    const status = typeof body?.status === "string" && VALID_STATUS.has(body.status) ? body.status : "all";

    if (password && password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters." }, { status: 400 });
    }

    const filter = await getTenantFilter(session);
    const where = makeWhere(filter, { query, status, scope });
    const contacts = await db.contact.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { projects: true } } },
    });

    const baseName = makeBaseName();
    const fileName = `${baseName}.${format}`;
    const fileBuffer = format === "xlsx"
      ? buildContactsXlsxBuffer(contacts)
      : buildContactsCsvBuffer(contacts);

    if (password) {
      const zipName = `${baseName}.zip`;
      const zipBuffer = createPasswordProtectedZipBuffer({
        fileName,
        data: fileBuffer,
        password,
      });

      return new NextResponse(zipBuffer, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${zipName}"`,
          "Content-Length": String(zipBuffer.length),
        },
      });
    }

    const contentType = format === "xlsx"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "text/csv; charset=utf-8";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(fileBuffer.length),
      },
    });

  } catch (err) {
    console.error("[Contacts Export POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
