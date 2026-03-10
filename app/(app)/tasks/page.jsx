export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import TasksClient from "./TasksClient";

export default async function TasksPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [tasks, projects] = await Promise.all([
    db.task.findMany({
      where: { userId },
      include: { project: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.project.findMany({
      where: { userId, archived: false },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return <TasksClient tasks={tasks} projects={projects} />;
}
