"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, Clock, Calendar } from "lucide-react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function toLocalDateString(date) {
  return date.toLocaleDateString("en-CA");
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
    const overlaps = existingBookings.some((b) => slotStart < new Date(b.endAt) && slotEnd > new Date(b.startAt));
    slots.push({ start: slotStart, end: slotEnd, available: !overlaps && slotStart > new Date() });
    cursor += 30;
  }
  return slots;
}

export default function BookingForm({ userId, userName, rules, existingBookings }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [duration, setDuration] = useState(30);
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ clientName: "", clientEmail: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { year, month } = viewDate;
  const firstDayMon = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDayMon).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  function prevMonth() {
    setViewDate(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
    setSelectedDate(null); setSelectedSlot(null);
  }
  function nextMonth() {
    setViewDate(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });
    setSelectedDate(null); setSelectedSlot(null);
  }

  function isDayAvailable(date) {
    if (date < today) return false;
    return rules.some((r) => r.dayOfWeek === date.getDay());
  }

  const slots = selectedDate ? generateSlots(selectedDate, rules, existingBookings, duration) : [];
  const availableSlots = slots.filter((s) => s.available);

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-10 shadow-xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Check className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Booking confirmed!</h1>
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
            Your meeting with <span className="font-medium text-zinc-700">{userName}</span> has been booked. Check your email for details.
          </p>
        </div>
      </div>
    );
  }

  // Step tracker
  const step = !selectedDate ? 1 : !selectedSlot ? 2 : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-6xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700 mb-4">
            <Calendar className="h-3.5 w-3.5" />
            Schedule a meeting
          </div>
          <h1 className="text-3xl font-bold text-zinc-900">Book a meeting with <span className="text-blue-600">{userName}</span></h1>
          <p className="mt-2 text-sm text-zinc-500">Select a duration, pick a date, then choose a time that works for you</p>
        </div>

        {/* Main card — horizontal layout */}
        <div className="rounded-2xl bg-white shadow-xl border border-zinc-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[520px]">

            {/* LEFT PANEL — info + duration */}
            <div className="border-b border-zinc-100 lg:border-b-0 lg:border-r lg:border-zinc-100 bg-gradient-to-b from-blue-600 to-blue-700 p-8 flex flex-col gap-6 text-white">
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-200">Meeting with</div>
                <h2 className="text-2xl font-bold">{userName}</h2>
                <p className="mt-2 text-sm text-blue-200 leading-relaxed">
                  Select your preferred duration and a time on the calendar. Confirmation is instant.
                </p>
              </div>

              {/* Duration */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-200">Duration</p>
                <div className="flex gap-2">
                  {[30, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { setDuration(d); setSelectedSlot(null); }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                        duration === d
                          ? "border-white bg-white text-blue-700 shadow-md"
                          : "border-blue-400 text-white hover:bg-blue-500"
                      )}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Step indicator */}
              <div className="mt-auto space-y-3">
                {[
                  { n: 1, label: "Pick a date" },
                  { n: 2, label: "Choose a time" },
                  { n: 3, label: "Your details" },
                ].map(({ n, label }) => (
                  <div key={n} className={cn("flex items-center gap-3 text-sm", step >= n ? "text-white" : "text-blue-300")}>
                    <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold border",
                      step > n ? "bg-white text-blue-700 border-white"
                      : step === n ? "border-white text-white"
                      : "border-blue-400 text-blue-300"
                    )}>
                      {step > n ? <Check className="h-3.5 w-3.5" /> : n}
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* MIDDLE PANEL — calendar */}
            <div className="border-b border-zinc-100 lg:border-b-0 lg:border-r lg:border-zinc-100 p-8">
              {/* Month header */}
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900">{MONTH_NAMES[month]} {year}</h3>
                <div className="flex gap-1">
                  <button type="button" onClick={prevMonth} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={nextMonth} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Day labels */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {DAY_LABELS.map((d) => (
                  <div key={d} className="text-center text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} />;
                  const date = new Date(year, month, day);
                  const avail = isDayAvailable(date);
                  const dateStr = toLocalDateString(date);
                  const isToday = dateStr === toLocalDateString(today);
                  const isSelected = selectedDate && toLocalDateString(selectedDate) === dateStr;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={!avail}
                      onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                      className={cn(
                        "flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-all duration-150",
                        isSelected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : isToday && avail
                          ? "border-2 border-blue-400 text-blue-600 font-bold hover:bg-blue-50"
                          : avail
                          ? "text-zinc-700 hover:bg-blue-50 hover:text-blue-700"
                          : "text-zinc-300 cursor-not-allowed"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT PANEL — time slots + form */}
            <div className="p-8 flex flex-col gap-6 overflow-y-auto max-h-[700px]">
              {!selectedDate ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center py-12">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                    <Calendar className="h-7 w-7 text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-zinc-600">Select a date to see available times</p>
                  <p className="mt-1 text-xs text-zinc-400">Available days are highlighted on the calendar</p>
                </div>
              ) : (
                <>
                  {/* Selected date label */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                      {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </p>

                    {availableSlots.length === 0 ? (
                      <p className="text-sm text-zinc-400 py-4">No available slots for this day.</p>
                    ) : !selectedSlot ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((slot) => {
                          const label = slot.start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                          return (
                            <button
                              key={slot.start.toISOString()}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className="rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Booking form */
                      <div>
                        <div className="mb-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
                          <div>
                            <p className="text-xs text-blue-500 font-medium">Selected time</p>
                            <p className="text-sm font-bold text-blue-800">
                              {selectedSlot.start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                              {" – "}
                              {selectedSlot.end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <button type="button" onClick={() => setSelectedSlot(null)} className="text-xs text-blue-500 hover:text-blue-700 underline font-medium">Change</button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Your details</p>
                          {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>
                          )}
                          <input
                            type="text" required placeholder="Your name"
                            value={form.clientName}
                            onChange={(e) => setForm((d) => ({ ...d, clientName: e.target.value }))}
                            className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                          <input
                            type="email" required placeholder="Your email"
                            value={form.clientEmail}
                            onChange={(e) => setForm((d) => ({ ...d, clientEmail: e.target.value }))}
                            className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                          <textarea
                            placeholder="Notes (optional)"
                            value={form.notes}
                            onChange={(e) => setForm((d) => ({ ...d, notes: e.target.value }))}
                            rows={3}
                            className="resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                          <button
                            type="submit" disabled={submitting}
                            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md shadow-blue-200"
                          >
                            {submitting ? "Booking…" : "Confirm booking"}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">Powered by PortalKit</p>
      </div>
    </div>
  );
}
