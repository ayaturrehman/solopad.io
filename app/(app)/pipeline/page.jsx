export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import PipelineBoard from "./PipelineBoard";

const STAGES = [
  { key: "new", label: "New" },
  { key: "discovery", label: "Discovery" },
  { key: "proposal", label: "Proposal" },
  { key: "contract_signed", label: "Contract Signed" },
  { key: "kickoff", label: "Kickoff" },
  { key: "onboarding", label: "Onboarding" },
  { key: "planning", label: "Planning" },
  { key: "delivery", label: "Delivery" },
  { key: "complete", label: "Complete" },
];

export default async function PipelinePage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const projects = await db.project.findMany({
    where: { userId: session.user.id },
    include: {
      invoices: { select: { total: true, status: true } },
      contact: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Pipeline</h1>
        <p className="text-sm text-zinc-500">Drag projects through stages to track your sales pipeline</p>
      </div>
      <PipelineBoard projects={projects} stages={STAGES} />
    </div>
  );
}
