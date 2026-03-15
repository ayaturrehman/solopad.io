
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ProposalStartPicker from "./ProposalStartPicker";

export default async function NewProposalPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [projects, user, defaultTemplate, recentProposals] = await Promise.all([
    db.project.findMany({
      where: { userId: session.user.id, archived: false },
      select: { id: true, title: true, contact: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { currency: true },
    }),
    db.pdfTemplate.findFirst({
      where: { userId: session.user.id, type: "proposal", isDefault: true },
    }),
    db.proposal.findMany({
      where: { userId: session.user.id },
      select: { id: true, title: true, clientName: true, clientEmail: true, projectId: true, intro: true, sections: true, pricing: true, currency: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <ProposalStartPicker
      projects={projects}
      user={user}
      defaultTemplate={defaultTemplate}
      recentProposals={recentProposals}
    />
  );
}
