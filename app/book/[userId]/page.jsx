export const dynamic = "force-dynamic";

import db from "@/lib/db";
import { notFound } from "next/navigation";
import BookingForm from "./BookingForm";

export default async function PublicBookingPage({ params }) {
  const { userId } = await params;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });

  if (!user) notFound();

  const [rules, bookings] = await Promise.all([
    db.availabilityRule.findMany({
      where: { userId },
      orderBy: { dayOfWeek: "asc" },
    }),
    db.booking.findMany({
      where: {
        userId,
        status: "confirmed",
        startAt: { gte: new Date() },
      },
      orderBy: { startAt: "asc" },
    }),
  ]);

  return (
    <BookingForm
      userId={userId}
      userName={user.name}
      rules={rules}
      existingBookings={bookings}
    />
  );
}
