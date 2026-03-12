
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ProposalBuilderClient from "./ProposalBuilderClient";

export default async function NewProposalPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [projects, user] = await Promise.all([
    db.project.findMany({
      where: { userId: session.user.id, archived: false },
      select: { id: true, title: true, clientName: true, clientEmail: true },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { currency: true },
    }),
  ]);

  return <ProposalBuilderClient projects={projects} user={user} />;
}
