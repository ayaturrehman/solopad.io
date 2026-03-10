export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import InvoiceEditClient from "./InvoiceEditClient";

export default async function EditInvoicePage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [invoice, projects, services] = await Promise.all([
    db.invoice.findFirst({
      where: { id },
      include: {
        project: { select: { id: true, title: true, clientName: true, clientEmail: true, userId: true } },
        paymentPlans: { orderBy: { createdAt: "asc" } },
      },
    }),
    db.project.findMany({
      where: { userId: session.user.id, archived: false },
      select: { id: true, title: true, clientName: true, clientEmail: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.service.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, defaultRate: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!invoice || invoice.project.userId !== session.user.id) redirect("/invoices");

  const lineItems = typeof invoice.lineItems === "string"
    ? JSON.parse(invoice.lineItems)
    : invoice.lineItems || [];

  return (
    <InvoiceEditClient
      invoice={{
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber || "",
        projectId: invoice.project.id,
        currency: invoice.currency,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : "",
        notes: invoice.notes || "",
        remindersEnabled: invoice.remindersEnabled,
        taxRate: invoice.taxRate,
        discountType: invoice.discountType,
        discountValue: invoice.discountValue,
        status: invoice.status,
        lineItems: lineItems.map((l) => ({
          description: l.description || "",
          quantity: l.quantity ?? 1,
          rate: l.rate ?? 0,
          amount: l.amount ?? 0,
        })),
        paymentPlans: invoice.paymentPlans,
      }}
      projects={projects}
      services={services}
    />
  );
}
