
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import CalendarView from "./CalendarView";

export default async function CalendarPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [projects, invoices, bookings] = await Promise.all([
    db.project.findMany({
      where: { userId },
      select: { id: true, title: true, status: true, endDate: true },
    }),
    db.invoice.findMany({
      where: { project: { userId } },
      select: { id: true, total: true, status: true, dueDate: true },
    }),
    db.booking.findMany({
      where: { userId, status: { not: "cancelled" } },
      select: { id: true, title: true, clientName: true, startAt: true, endAt: true, status: true },
      orderBy: { startAt: "asc" },
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
        label: `Invoice · $${inv.total.toLocaleString()}`,
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

  return (
    <>
        <h1 className="text-lg font-bold text-zinc-900 p-4">Calendar</h1>
      <CalendarView events={events} />
    </>
  );
}
