
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import SchedulerClient from "./SchedulerClient";

export default async function SchedulerPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [bookings, availabilityRules] = await Promise.all([
    db.booking.findMany({
      where: { userId },
      orderBy: { startAt: "asc" },
    }),
    db.availabilityRule.findMany({
      where: { userId },
      orderBy: { dayOfWeek: "asc" },
    }),
  ]);

  const bookingPageUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/book/${userId}`;

  return (
    <SchedulerClient
      bookings={bookings}
      availabilityRules={availabilityRules}
      bookingPageUrl={bookingPageUrl}
    />
  );
}
