import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { requirePermission } from "@/lib/permissions";
import db from "@/lib/db";
import { validateBankDetails } from "@/lib/bank-transfer";

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { paymentMethods: true, bankTransferEnabled: true, bankDetails: true },
    });

    return NextResponse.json({ paymentMethods: (user?.paymentMethods || "card").split(","), bankTransferEnabled: !!user?.bankTransferEnabled, bankDetails: user?.bankDetails || null });

  } catch (err) {
    console.error("[Settings Payments GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_settings");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { paymentMethods, bankTransferEnabled, bankDetails } = await req.json();
    if (!Array.isArray(paymentMethods)) {
      return NextResponse.json({ error: "paymentMethods must be an array" }, { status: 400 });
    }

    const allowed = ["card", "paypal", "klarna"];
    const filtered = paymentMethods.filter((m) => allowed.includes(m));
    if (!filtered.includes("card")) filtered.unshift("card"); // card is always required

    let bankData;
    try {
      if (typeof bankTransferEnabled !== "boolean") throw new Error("Choose whether to enable bank transfers.");
      bankData = bankTransferEnabled ? validateBankDetails(bankDetails) : undefined;
    } catch (err) { return NextResponse.json({ error: err.message }, { status: 400 }); }
    const updated = await db.user.update({
      where: { id: session.user.id },
      data: { paymentMethods: filtered.join(","), bankTransferEnabled, ...(bankData ? { bankDetails: bankData } : {}) },
    });

    return NextResponse.json({ paymentMethods: updated.paymentMethods.split(",") });

  } catch (err) {
    console.error("[Settings Payments PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
