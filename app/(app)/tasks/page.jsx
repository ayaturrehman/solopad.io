import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { normalizeTask } from "@/lib/tasks";
import TasksClient from "./TasksClient";

export const revalidate = 15;

export default async function TasksPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [tasks, projects, teamMembers] = await Promise.all([
    db.task.findMany({
      where: { userId },
      include: {
        project: { select: { id: true, title: true } },
        assigneeMember: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.project.findMany({
      where: { userId, archived: false },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    db.teamMember.findMany({
      where: { userId },
      select: { id: true, name: true, email: true, role: true, status: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <Suspense fallback={null}><TasksClient tasks={tasks.map(normalizeTask)} projects={projects} teamMembers={teamMembers} /></Suspense>;
}
