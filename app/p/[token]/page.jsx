export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import db from "@/lib/db";
import ClientPortal from "./ClientPortal";

export default async function PortalPage({ params, searchParams }) {
  const { token } = await params;

  const project = await db.project.findUnique({
    where: { portalToken: token },
    include: { contact: { select: { name: true, email: true } } },
  });

  if (!project) notFound();

  const owner = await db.user.findUnique({ where: { id: project.userId }, select: { stripePaymentsEnabled: true, stripeAccountId: true, stripeOnboarded: true, bankTransferEnabled: true, bankDetails: true } });
  const paymentOptions = { online: !!(owner?.stripePaymentsEnabled && owner?.stripeAccountId && owner?.stripeOnboarded), bankDetails: owner?.bankTransferEnabled ? owner.bankDetails : null };

  const isFirstView = project.viewCount === 0;

  await db.project.update({
    where: { id: project.id },
    data: {
      viewCount: { increment: 1 },
      lastViewedAt: new Date(),
    },
  });

  // Notify on first view and then every 5 views
  if (isFirstView || project.viewCount % 5 === 0) {
    await db.notification.create({
      data: {
        userId: project.userId,
        businessId: project.businessId,
        type: "portal_viewed",
        title: "Client viewed your portal",
        body: `${project.contact?.name || "Client"} viewed the portal for "${project.title}"`,
        link: `/projects/${project.id}`,
      },
    });
  }

  const [files, comments, invoices, notes, contracts, proposals] = await Promise.all([
    db.file.findMany({ where: { projectId: project.id, visibleToClient: true }, orderBy: { createdAt: "desc" } }),
    db.comment.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "asc" } }),
    db.invoice.findMany({ where: { projectId: project.id, status: { not: "draft" } }, orderBy: { createdAt: "desc" }, include: { paymentPlans: { orderBy: { createdAt: "asc" } }, payments: { where: { status: "paid" }, select: { id: true, amount: true, method: true, receivedAt: true, reference: true } } } }),
    db.note.findMany({ where: { projectId: project.id, visibleToClient: true }, orderBy: { createdAt: "desc" } }),
    db.contract.findMany({
      where: { projectId: project.id, status: { in: ["sent", "signed"] } },
      select: { id: true, title: true, status: true, sentAt: true, signedAt: true, signingToken: true, clientName: true },
      orderBy: { createdAt: "desc" },
    }),
    db.proposal.findMany({
      where: { projectId: project.id, status: { in: ["sent", "accepted", "declined"] } },
      select: { id: true, title: true, status: true, total: true, currency: true, validUntil: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const parsedInvoices = invoices.map((inv) => ({
    ...inv,
    lineItems: typeof inv.lineItems === "string" ? JSON.parse(inv.lineItems) : inv.lineItems,
  }));

  return (
    <ClientPortal
      initialTab={(await searchParams)?.tab === "invoices" ? "invoices" : "overview"}
      project={project}
      paymentOptions={paymentOptions}
      files={files}
      comments={comments}
      invoices={parsedInvoices}
      notes={notes}
      contracts={contracts}
      proposals={proposals}
    />
  );
}
