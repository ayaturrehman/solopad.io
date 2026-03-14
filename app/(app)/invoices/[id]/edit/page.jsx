
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import InvoiceEditClient from "./InvoiceEditClient";
import { getTenantFilter } from "@/lib/tenant";

export default async function EditInvoicePage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const filter = await getTenantFilter(session);

  const [invoice, projects, services] = await Promise.all([
    db.invoice.findFirst({
      where: { id, project: filter },
      include: {
        project: { select: { id: true, title: true, userId: true, businessId: true, contact: { select: { name: true, email: true } } } },
        paymentPlans: { orderBy: { createdAt: "asc" } },
      },
    }),
    db.project.findMany({
      where: { ...filter, archived: false },
      select: { id: true, title: true, contact: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    db.service.findMany({
      where: { ...filter, status: "active" },
      select: { id: true, name: true, defaultRate: true, status: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!invoice) redirect("/finance?tab=invoices");

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
          serviceId: l.serviceId || null,
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
