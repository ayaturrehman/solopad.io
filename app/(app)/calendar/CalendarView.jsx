"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_SHORT = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* ─── Event dot colors (left accent) ──────────────────────────── */
const EVENT_DOT = {
  project: "bg-blue-500",
  invoice: "bg-amber-500",
  paid:    "bg-emerald-500",
  overdue: "bg-red-500",
  meeting: "bg-violet-500",
  task:    "bg-orange-400",
};

const EVENT_TEXT = {
  project: "text-blue-700",
  invoice: "text-amber-700",
  paid:    "text-emerald-700",
  overdue: "text-red-700",
  meeting: "text-violet-700",
  task:    "text-orange-700",
};

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6);

function formatDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekDays(date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatHour(h) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

/* ─── Event pill (Apple style: dot + text) ────────────────────── */
function EventPill({ ev }) {
  return (
    <Link
      href={ev.href}
      className="group/pill flex items-center gap-1.5 rounded-md px-1.5 py-[3px] text-[11px] leading-tight transition-colors hover:bg-zinc-100"
      title={ev.label}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", EVENT_DOT[ev.type] || "bg-zinc-400")} />
      <span className={cn("truncate font-medium", EVENT_TEXT[ev.type] || "text-zinc-600")}>
        {ev.label}
      </span>
    </Link>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */
export default function CalendarView({ events }) {
  const today = new Date();
  const todayStr = formatDateStr(today);
  const [view, setView] = useState("month");
  const [viewDate, setViewDate] = useState(today);

  const eventMap = {};
  events.forEach((ev) => {
    if (!eventMap[ev.date]) eventMap[ev.date] = [];
    eventMap[ev.date].push(ev);
  });

  function navigate(dir) {
    const d = new Date(viewDate);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setViewDate(d);
  }

  function goToday() { setViewDate(new Date()); }

  function getHeaderLabel() {
    if (view === "month") return `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
    if (view === "week") {
      const days = getWeekDays(viewDate);
      const s = days[0], e = days[6];
      if (s.getMonth() === e.getMonth())
        return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
      return `${MONTH_NAMES[s.getMonth()].slice(0, 3)} ${s.getDate()} – ${MONTH_NAMES[e.getMonth()].slice(0, 3)} ${e.getDate()}`;
    }
    return `${DAY_NAMES_FULL[viewDate.getDay()]}, ${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getDate()}`;
  }

  return (
    <Card className="mx-4 mb-4 md:mx-6">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={goToday}
            className="rounded-full px-3 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            Today
          </button>
          <h2 className="text-base font-semibold tracking-tight text-zinc-900">{getHeaderLabel()}</h2>
        </div>

        {/* Segmented control */}
        <div className="flex items-center gap-0.5 rounded-full bg-zinc-100 p-0.5">
          {["month", "week", "day"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize transition-all",
                view === v
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Views ───────────────────────────────────────── */}
      <div className="border-t border-zinc-100">
        {view === "month" && <MonthView viewDate={viewDate} eventMap={eventMap} todayStr={todayStr} />}
        {view === "week" && <WeekView viewDate={viewDate} eventMap={eventMap} todayStr={todayStr} />}
        {view === "day" && <DayView viewDate={viewDate} eventMap={eventMap} todayStr={todayStr} />}
      </div>

      {/* ─── Legend ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 border-t border-zinc-100 px-5 py-3">
        {[
          { key: "project", label: "Deadline" },
          { key: "invoice", label: "Invoice" },
          { key: "paid",    label: "Paid" },
          { key: "overdue", label: "Overdue" },
          { key: "meeting", label: "Meeting" },
          { key: "task",    label: "Task" },
        ].map(({ key, label }) => (
          <span key={key} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span className={cn("h-2 w-2 rounded-full", EVENT_DOT[key])} />
            {label}
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ─── Month View ──────────────────────────────────────────────── */
function MonthView({ viewDate, eventMap, todayStr }) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  const prevPadding = Array.from({ length: firstDay }, (_, i) => ({
    day: prevMonthDays - firstDay + i + 1,
    outside: true,
  }));

  // Current month days
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    outside: false,
  }));

  // Next month padding
  const totalCells = prevPadding.length + currentDays.length;
  const nextPadding = Array.from({ length: (7 - (totalCells % 7)) % 7 }, (_, i) => ({
    day: i + 1,
    outside: true,
  }));

  const allCells = [...prevPadding, ...currentDays, ...nextPadding];

  return (
    <div className="px-1 pb-1">
      {/* Day headers */}
      <div className="grid grid-cols-7">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {allCells.map((cell, idx) => {
          const dateStr = cell.outside
            ? null
            : `${year}-${String(month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
          const dayEvents = dateStr ? (eventMap[dateStr] || []) : [];
          const isToday = dateStr === todayStr;

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[88px] border-t border-zinc-100 p-1.5",
                idx % 7 !== 0 && "border-l border-zinc-100",
                cell.outside && "bg-zinc-50/50",
              )}
            >
              {/* Date number */}
              <div className="flex justify-end">
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday
                      ? "bg-blue-600 font-semibold text-white"
                      : cell.outside
                        ? "text-zinc-300"
                        : "font-medium text-zinc-700"
                  )}
                >
                  {cell.day}
                </span>
              </div>

              {/* Events */}
              {dayEvents.length > 0 && (
                <div className="mt-1 space-y-px">
                  {dayEvents.slice(0, 3).map((ev, i) => (
                    <EventPill key={i} ev={ev} />
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="pl-1.5 text-[10px] font-medium text-zinc-400">
                      +{dayEvents.length - 3} more
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Week View ───────────────────────────────────────────────── */
function WeekView({ viewDate, eventMap, todayStr }) {
  const days = getWeekDays(viewDate);

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[700px] grid-cols-[56px_repeat(7,1fr)]">
        {/* Header row */}
        <div className="border-b border-zinc-100" />
        {days.map((d) => {
          const dateStr = formatDateStr(d);
          const isToday = dateStr === todayStr;
          return (
            <div
              key={dateStr}
              className={cn("border-b border-l border-zinc-100 px-2 py-3 text-center")}
            >
              <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                {DAY_NAMES[d.getDay()]}
              </div>
              <div
                className={cn(
                  "mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm",
                  isToday
                    ? "bg-blue-600 font-semibold text-white"
                    : "font-medium text-zinc-700"
                )}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}

        {/* All-day row */}
        <div className="flex items-center justify-end border-b border-zinc-100 pr-2 text-[10px] text-zinc-400">
          All day
        </div>
        {days.map((d) => {
          const dateStr = formatDateStr(d);
          const dayEvents = eventMap[dateStr] || [];
          const isToday = dateStr === todayStr;
          return (
            <div
              key={`allday-${dateStr}`}
              className={cn(
                "min-h-[44px] border-b border-l border-zinc-100 p-1",
                isToday && "bg-blue-50/40"
              )}
            >
              <div className="space-y-px">
                {dayEvents.slice(0, 3).map((ev, i) => (
                  <EventPill key={i} ev={ev} />
                ))}
                {dayEvents.length > 3 && (
                  <p className="pl-1.5 text-[10px] text-zinc-400">+{dayEvents.length - 3}</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Hour rows */}
        {HOURS.map((h) => (
          <>
            <div
              key={`label-${h}`}
              className="border-t border-zinc-50 pr-2 pt-1 text-right text-[10px] text-zinc-300"
            >
              {formatHour(h)}
            </div>
            {days.map((d) => {
              const dateStr = formatDateStr(d);
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={`${dateStr}-${h}`}
                  className={cn(
                    "min-h-[44px] border-l border-t border-zinc-50",
                    isToday && "bg-blue-50/20"
                  )}
                />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

/* ─── Day View ────────────────────────────────────────────────── */
function DayView({ viewDate, eventMap, todayStr }) {
  const dateStr = formatDateStr(viewDate);
  const dayEvents = eventMap[dateStr] || [];
  const isToday = dateStr === todayStr;

  return (
    <div className="p-4">
      {/* All-day events */}
      {dayEvents.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400">Events</p>
          <div className="space-y-1">
            {dayEvents.map((ev, i) => (
              <Link
                key={i}
                href={ev.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-zinc-50"
              >
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", EVENT_DOT[ev.type] || "bg-zinc-400")} />
                <span className={cn("font-medium", EVENT_TEXT[ev.type] || "text-zinc-600")}>
                  {ev.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hour grid */}
      <div>
        {HOURS.map((h) => (
          <div key={h} className="flex border-t border-zinc-50 last:border-b">
            <div className="w-14 shrink-0 pr-3 pt-1 text-right text-[10px] text-zinc-300">
              {formatHour(h)}
            </div>
            <div className="flex-1 min-h-[48px]" />
          </div>
        ))}
      </div>

      {dayEvents.length === 0 && (
        <p className="py-12 text-center text-sm text-zinc-400">No events on this day</p>
      )}
    </div>
  );
}
