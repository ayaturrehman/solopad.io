import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import CalendarView from "./CalendarView";

export const revalidate = 60;

export default async function CalendarPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [projects, invoices, bookings, tasks] = await Promise.all([
    db.project.findMany({
      where: { userId },
      select: { id: true, title: true, status: true, endDate: true },
      take: 100,
    }),
    db.invoice.findMany({
      where: { project: { userId } },
      select: { id: true, total: true, status: true, dueDate: true },
      take: 200,
    }),
    db.booking.findMany({
      where: { userId, status: { not: "cancelled" } },
      select: { id: true, title: true, clientName: true, startAt: true, endAt: true, status: true },
      orderBy: { startAt: "asc" },
      take: 200,
    }),
    db.task.findMany({
      where: { userId, dueDate: { not: null }, status: { not: "done" } },
      select: { id: true, title: true, status: true, priority: true, dueDate: true },
      orderBy: { dueDate: "asc" },
      take: 200,
    }),
  ]);

  const events = [];

  projects.forEach((p) => {
    const date = p.endDate;
    if (date) {
      events.push({
        date: new Date(date).toISOString().split("T")[0],
        type: "project",
        label: p.title,
        status: p.status,
        href: `/projects/${p.id}`,
      });
    }
  });

  invoices.forEach((inv) => {
    if (inv.dueDate) {
      events.push({
        date: new Date(inv.dueDate).toISOString().split("T")[0],
        type: inv.status === "paid" ? "paid" : inv.status === "overdue" ? "overdue" : "invoice",
        label: `Invoice · £${inv.total.toLocaleString()}`,
        status: inv.status,
        href: "#",
      });
    }
  });

  bookings.forEach((b) => {
    events.push({
      date: new Date(b.startAt).toISOString().split("T")[0],
      type: "meeting",
      label: `${b.title} · ${b.clientName}`,
      status: b.status,
      href: "/scheduler",
    });
  });

  tasks.forEach((t) => {
    events.push({
      date: new Date(t.dueDate).toISOString().split("T")[0],
      type: "task",
      label: t.title,
      status: t.status,
      href: "/tasks",
    });
  });

  return (
    <div className="py-4">
      <h1 className="mb-4 px-4 text-lg font-semibold tracking-tight text-zinc-900 md:px-6">Calendar</h1>
      <CalendarView events={events} />
    </div>
  );
}
