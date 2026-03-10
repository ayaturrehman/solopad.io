export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ProposalsClient from "./ProposalsClient";

export default async function ProposalsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const proposals = await db.proposal.findMany({
    where: { userId: session.user.id },
    include: { project: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <ProposalsClient proposals={proposals} />;
}
