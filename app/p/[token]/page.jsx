export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import db from "@/lib/db";
import ClientPortal from "./ClientPortal";

export default async function PortalPage({ params }) {
  const { token } = await params;

  const project = await db.project.findUnique({
    where: { portalToken: token },
  });

  if (!project) notFound();

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
        type: "portal_viewed",
        title: "Client viewed your portal",
        body: `${project.clientName} viewed the portal for "${project.title}"`,
        link: `/projects/${project.id}`,
      },
    });
  }

  const [files, comments, invoices] = await Promise.all([
    db.file.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "desc" } }),
    db.comment.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "asc" } }),
    db.invoice.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const parsedInvoices = invoices.map((inv) => ({
    ...inv,
    lineItems: typeof inv.lineItems === "string" ? JSON.parse(inv.lineItems) : inv.lineItems,
  }));

  return (
    <ClientPortal
      project={project}
      files={files}
      comments={comments}
      invoices={parsedInvoices}
    />
  );
}
