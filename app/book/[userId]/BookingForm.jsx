"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toLocalDateString(date) {
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function generateSlots(date, rules, existingBookings, durationMinutes) {
  const dayOfWeek = date.getDay();
  const rule = rules.find((r) => r.dayOfWeek === dayOfWeek);
  if (!rule) return [];

  const [sh, sm] = rule.startTime.split(":").map(Number);
  const [eh, em] = rule.endTime.split(":").map(Number);

  const slots = [];
  const dateStr = toLocalDateString(date);

  let cursor = sh * 60 + sm;
  const end = eh * 60 + em;

  while (cursor + durationMinutes <= end) {
    const slotStart = new Date(`${dateStr}T${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}:00`);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

    // Check overlap
    const overlaps = existingBookings.some((b) => {
      const bs = new Date(b.startAt);
      const be = new Date(b.endAt);
      return slotStart < be && slotEnd > bs;
    });

    // Must be in future
    const inFuture = slotStart > new Date();

    slots.push({ start: slotStart, end: slotEnd, available: !overlaps && inFuture });
    cursor += 30;
  }

  return slots;
}

export default function BookingForm({ userId, userName, rules, existingBookings }) {
  const [duration, setDuration] = useState(30);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ clientName: "", clientEmail: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Week starting Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  function isDayAvailable(date) {
    if (date < today) return false;
    const dayOfWeek = date.getDay();
    return rules.some((r) => r.dayOfWeek === dayOfWeek);
  }

  const slots = selectedDate
    ? generateSlots(selectedDate, rules, existingBookings, duration)
    : [];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        startAt: selectedSlot.start.toISOString(),
        endAt: selectedSlot.end.toISOString(),
        title: `Meeting with ${form.clientName}`,
        notes: form.notes || null,
      }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to book. Please try again.");
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-sm rounded border border-zinc-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-lg font-semibold text-zinc-900">Booking confirmed!</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Your meeting with {userName} has been booked. Check your email for details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">Book a meeting with {userName}</h1>
          <p className="mt-1 text-sm text-zinc-500">Select a time that works for you</p>
        </div>

        <div className="rounded border border-zinc-200 bg-white shadow-sm p-6">
          {/* Duration selector */}
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Duration</p>
            <div className="flex gap-2">
              {[30, 60].map((d) => (
                <button
                  key={d}
                  onClick={() => { setDuration(d); setSelectedSlot(null); }}
                  className={cn(
                    "rounded border px-4 py-2 text-sm font-medium transition-colors",
                    duration === d
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                  )}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Week picker */}
          <div className="mb-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {monday.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => { setWeekOffset((v) => v - 1); setSelectedDate(null); setSelectedSlot(null); }}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setWeekOffset((v) => v + 1); setSelectedDate(null); setSelectedSlot(null); }}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => {
                const avail = isDayAvailable(day);
                const isSelected = selectedDate && toLocalDateString(day) === toLocalDateString(selectedDate);
                const isPast = day < today;
                return (
                  <button
                    key={day.toISOString()}
                    disabled={!avail}
                    onClick={() => { setSelectedDate(day); setSelectedSlot(null); }}
                    className={cn(
                      "flex flex-col items-center rounded py-2 text-xs transition-colors",
                      isSelected
                        ? "bg-zinc-900 text-white"
                        : avail
                        ? "hover:bg-zinc-100 text-zinc-800 cursor-pointer"
                        : "text-zinc-300 cursor-not-allowed"
                    )}
                  >
                    <span className="text-[10px] font-medium">{DAY_LABELS[day.getDay()]}</span>
                    <span className="mt-0.5 text-sm font-semibold">{day.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div className="mb-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Available times for{" "}
                {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </p>
              {slots.filter((s) => s.available).length === 0 ? (
                <p className="text-sm text-zinc-400">No available slots for this day.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => {
                    const label = slot.start.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const isSelected =
                      selectedSlot &&
                      selectedSlot.start.toISOString() === slot.start.toISOString();
                    if (!slot.available) return null;
                    return (
                      <button
                        key={slot.start.toISOString()}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "rounded border py-2 text-sm font-medium transition-colors",
                          isSelected
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Booking form */}
          {selectedSlot && (
            <form onSubmit={handleSubmit} className="border-t border-zinc-100 pt-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Your details
              </p>
              {error && (
                <div className="mb-3 rounded bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={form.clientName}
                  onChange={(e) => setForm((d) => ({ ...d, clientName: e.target.value }))}
                  className="rounded border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={form.clientEmail}
                  onChange={(e) => setForm((d) => ({ ...d, clientEmail: e.target.value }))}
                  className="rounded border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={form.notes}
                  onChange={(e) => setForm((d) => ({ ...d, notes: e.target.value }))}
                  rows={3}
                  className="rounded border border-zinc-200 px-3 py-2 text-sm resize-none focus:border-zinc-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
                >
                  {submitting ? "Booking…" : "Confirm booking"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
