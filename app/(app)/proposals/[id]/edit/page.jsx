
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import ProposalEditClient from "./ProposalEditClient";

export default async function ProposalEditPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [proposal, projects, defaultTemplate] = await Promise.all([
    db.proposal.findFirst({
      where: { id, userId: session.user.id },
      include: { project: { select: { id: true, title: true } } },
    }),
    db.project.findMany({
      where: { userId: session.user.id },
      select: { id: true, title: true, clientName: true, clientEmail: true },
      orderBy: { createdAt: "desc" },
    }),
    db.pdfTemplate.findFirst({
      where: { userId: session.user.id, type: "proposal", isDefault: true },
    }),
  ]);

  if (!proposal) redirect("/proposals");

  return <ProposalEditClient proposal={proposal} projects={projects} defaultTemplate={defaultTemplate} />;
}
