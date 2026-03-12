
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ProposalBuilderClient from "./ProposalBuilderClient";

export default async function NewProposalPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const projects = await db.project.findMany({
    where: { userId: session.user.id, archived: false },
    select: { id: true, title: true, clientName: true, clientEmail: true },
    orderBy: { createdAt: "desc" },
  });

  return <ProposalBuilderClient projects={projects} />;
}
