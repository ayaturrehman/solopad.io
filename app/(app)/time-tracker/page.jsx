export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import TimeTrackerClient from "./TimeTrackerClient";

export default async function TimeTrackerPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [entries, projects] = await Promise.all([
    db.timeEntry.findMany({
      where: { userId },
      include: { project: { select: { id: true, title: true } } },
      orderBy: { startedAt: "desc" },
      take: 100,
    }),
    db.project.findMany({
      where: { userId, archived: false },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return <TimeTrackerClient entries={entries} projects={projects} />;
}
