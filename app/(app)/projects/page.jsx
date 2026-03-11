export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const projects = await db.project.findMany({
    where: { userId: session.user.id, archived: false },
    include: {
      invoices: { select: { total: true, status: true } },
      contact: { select: { name: true } },
      _count: { select: { files: true, comments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return <ProjectsClient projects={projects} />;
}
