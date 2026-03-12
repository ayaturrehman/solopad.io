import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { getTenantData, getTenantFilter, resolveTenantUser } from "@/lib/tenant";
import { getContactEmailKey, normalizeContactInput } from "@/lib/contacts";

const MAX_IMPORT_ROWS = 500;

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const contacts = Array.isArray(body?.contacts) ? body.contacts : [];

    if (!contacts.length) {
      return NextResponse.json({ error: "At least one contact is required" }, { status: 400 });
    }

    if (contacts.length > MAX_IMPORT_ROWS) {
      return NextResponse.json(
        { error: `You can import up to ${MAX_IMPORT_ROWS} contacts at a time` },
        { status: 400 }
      );
    }

    const invalidRows = [];
    const normalizedRows = contacts.flatMap((contact, index) => {
      const normalized = normalizeContactInput(contact, { requireName: true });
      if (normalized.errors.length) {
        invalidRows.push({ rowNumber: index + 1, errors: normalized.errors });
        return [];
      }
      return [normalized.data];
    });

    if (invalidRows.length) {
      return NextResponse.json(
        { error: "Some rows are invalid", invalidRows },
        { status: 400 }
      );
    }

    const tenantData = await getTenantData(session);
    const filter = await getTenantFilter(session);
    const ownerUser = await resolveTenantUser(session);

    if (!ownerUser) {
      return NextResponse.json(
        { error: "Could not resolve a valid account for this import." },
        { status: 400 }
      );
    }

    const incomingEmails = Array.from(
      new Set(normalizedRows.map(getContactEmailKey).filter(Boolean))
    );

    const existingContacts = incomingEmails.length
      ? await db.contact.findMany({
          where: {
            ...filter,
            email: { in: incomingEmails },
          },
          select: { email: true },
        })
      : [];

    const existingEmailKeys = new Set(existingContacts.map(getContactEmailKey).filter(Boolean));
    const fileEmailKeys = new Set();
    const createData = [];
    let skippedExisting = 0;
    let skippedDuplicateInFile = 0;

    normalizedRows.forEach((contact) => {
      const emailKey = getContactEmailKey(contact);

      if (emailKey && existingEmailKeys.has(emailKey)) {
        skippedExisting += 1;
        return;
      }

      if (emailKey && fileEmailKeys.has(emailKey)) {
        skippedDuplicateInFile += 1;
        return;
      }

      if (emailKey) {
        fileEmailKeys.add(emailKey);
      }

      createData.push({
        ...tenantData,
        userId: ownerUser.id,
        ...contact,
      });
    });

    if (createData.length) {
      await db.contact.createMany({ data: createData });
    }

    return NextResponse.json({
      imported: createData.length,
      skippedExisting,
      skippedDuplicateInFile,
      totalReceived: contacts.length,
    });
  } catch (error) {
    console.error("Contact import failed", error);
    return NextResponse.json({ error: "Import failed. Please try again." }, { status: 500 });
  }
}
