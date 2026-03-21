"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EVENT_COLORS = {
  project: "bg-blue-100 text-blue-700",
  invoice: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  meeting: "bg-purple-100 text-purple-700",
  task: "bg-orange-100 text-orange-700",
};

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6am to 8pm

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

export default function CalendarView({ events }) {
  const today = new Date();
  const todayStr = formatDateStr(today);
  const [view, setView] = useState("month");
  const [viewDate, setViewDate] = useState(today);

  // Build event map
  const eventMap = {};
  events.forEach((ev) => {
    if (!eventMap[ev.date]) eventMap[ev.date] = [];
    eventMap[ev.date].push(ev);
  });

  // Navigation
  function navigate(dir) {
    const d = new Date(viewDate);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setViewDate(d);
  }

  function goToday() {
    setViewDate(new Date());
  }

  // Header label
  function getHeaderLabel() {
    if (view === "month") return `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
    if (view === "week") {
      const days = getWeekDays(viewDate);
      const s = days[0];
      const e = days[6];
      if (s.getMonth() === e.getMonth())
        return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`;
      return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()} – ${MONTH_NAMES[e.getMonth()]} ${e.getDate()}, ${s.getFullYear()}`;
    }
    return `${DAY_NAMES_FULL[viewDate.getDay()]}, ${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getDate()}, ${viewDate.getFullYear()}`;
  }

  return (
    <div className="rounded border border-zinc-200 bg-white p-6">
      {/* Header with view toggle */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-200 hover:bg-zinc-50"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4 text-zinc-600" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-200 hover:bg-zinc-50"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4 text-zinc-600" />
          </button>
          <button
            onClick={goToday}
            className="rounded border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
          >
            Today
          </button>
          <h2 className="ml-2 text-base font-semibold text-zinc-900">{getHeaderLabel()}</h2>
        </div>
        <div className="flex rounded border border-zinc-200 overflow-hidden">
          {["month", "week", "day"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                view === v ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "month" && <MonthView viewDate={viewDate} eventMap={eventMap} todayStr={todayStr} />}
      {view === "week" && <WeekView viewDate={viewDate} eventMap={eventMap} todayStr={todayStr} />}
      {view === "day" && <DayView viewDate={viewDate} eventMap={eventMap} todayStr={todayStr} />}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-100 pt-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded bg-blue-200" />
          Project deadline
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded bg-amber-200" />
          Invoice due
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded bg-green-200" />
          Paid
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded bg-red-200" />
          Overdue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded bg-purple-200" />
          Meeting
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded bg-orange-200" />
          Task due
        </span>
      </div>
    </div>
  );
}

// ─── Month View ───
function MonthView({ viewDate, eventMap, todayStr }) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-zinc-400 sm:text-xs">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents = eventMap[dateStr] || [];
          const isToday = dateStr === todayStr;
          return (
            <div
              key={dateStr}
              className={cn(
                "min-h-[70px] rounded border p-1.5 text-xs",
                isToday ? "border-zinc-900 bg-zinc-50" : "border-zinc-100"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium sm:text-sm",
                  isToday ? "bg-zinc-900 text-white" : "text-zinc-600"
                )}
              >
                {day}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 2).map((ev, i) => (
                  <Link
                    key={i}
                    href={ev.href}
                    className={cn(
                      "block truncate rounded px-1 py-0.5 text-[10px] font-medium sm:text-xs",
                      EVENT_COLORS[ev.type] || "bg-zinc-100 text-zinc-600"
                    )}
                    title={ev.label}
                  >
                    {ev.label}
                  </Link>
                ))}
                {dayEvents.length > 2 && <p className="text-[10px] text-zinc-400">+{dayEvents.length - 2} more</p>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Week View ───
function WeekView({ viewDate, eventMap, todayStr }) {
  const days = getWeekDays(viewDate);

  // Build a flat array of all grid elements to avoid Fragment key issues
  const gridElements = [];

  // Header row (day names and dates)
  gridElements.push(
    <div key="header-spacer" className="border-b border-zinc-200" />
  );
  days.forEach((d) => {
    const dateStr = formatDateStr(d);
    const isToday = dateStr === todayStr;
    gridElements.push(
      <div
        key={`header-${dateStr}`}
        className={cn("border-b border-l border-zinc-200 px-2 py-2 text-center", isToday && "bg-blue-50")}
      >
        <div className="text-[10px] font-medium text-zinc-400">{DAY_NAMES[d.getDay()]}</div>
        <div className={cn("mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold", isToday ? "bg-zinc-900 text-white" : "text-zinc-700")}>
          {d.getDate()}
        </div>
      </div>
    );
  });

  // All-day events row
  gridElements.push(
    <div
      key="allday-label"
      className="border-b border-zinc-200 px-1 py-1 text-[10px] text-zinc-400 flex items-center justify-end pr-2"
    >
      All day
    </div>
  );
  days.forEach((d) => {
    const dateStr = formatDateStr(d);
    const dayEvents = eventMap[dateStr] || [];
    const isToday = dateStr === todayStr;
    gridElements.push(
      <div
        key={`allday-${dateStr}`}
        className={cn("border-b border-l border-zinc-200 px-1 py-1 min-h-[40px]", isToday && "bg-blue-50/50")}
      >
        <div className="space-y-0.5">
          {dayEvents.slice(0, 3).map((ev, i) => (
            <Link
              key={i}
              href={ev.href}
              className={cn(
                "block truncate rounded px-1 py-0.5 text-[10px] font-medium",
                EVENT_COLORS[ev.type] || "bg-zinc-100 text-zinc-600"
              )}
              title={ev.label}
            >
              {ev.label}
            </Link>
          ))}
          {dayEvents.length > 3 && (
            <p className="text-[10px] text-zinc-400 px-1">+{dayEvents.length - 3} more</p>
          )}
        </div>
      </div>
    );
  });

  // Hour rows
  HOURS.forEach((h) => {
    gridElements.push(
      <div
        key={`hour-${h}`}
        className="border-b border-zinc-100 px-1 py-2 text-right pr-2 text-[10px] text-zinc-400"
      >
        {formatHour(h)}
      </div>
    );
    days.forEach((d) => {
      const dateStr = formatDateStr(d);
      const isToday = dateStr === todayStr;
      gridElements.push(
        <div
          key={`${dateStr}-${h}`}
          className={cn("border-b border-l border-zinc-100 min-h-[40px]", isToday && "bg-blue-50/30")}
        />
      );
    });
  });

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[700px]">
        {gridElements}
      </div>
    </div>
  );
}

// ─── Day View ───
function DayView({ viewDate, eventMap, todayStr }) {
  const dateStr = formatDateStr(viewDate);
  const dayEvents = eventMap[dateStr] || [];
  const isToday = dateStr === todayStr;

  return (
    <div>
      {/* All-day events */}
      {dayEvents.length > 0 && (
        <div className={cn("mb-4 rounded border p-3", isToday ? "border-zinc-900 bg-zinc-50" : "border-zinc-200")}>
          <p className="mb-2 text-xs font-semibold text-zinc-500">Events</p>
          <div className="space-y-1.5">
            {dayEvents.map((ev, i) => (
              <Link
                key={i}
                href={ev.href}
                className={cn(
                  "flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors hover:opacity-80",
                  EVENT_COLORS[ev.type] || "bg-zinc-100 text-zinc-600"
                )}
              >
                {ev.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hour grid */}
      <div className="rounded border border-zinc-200">
        {HOURS.map((h) => (
          <div key={h} className="flex border-b border-zinc-100 last:border-0">
            <div className="w-16 shrink-0 border-r border-zinc-100 px-2 py-3 text-right text-[11px] text-zinc-400">
              {formatHour(h)}
            </div>
            <div className="flex-1 min-h-[48px]" />
          </div>
        ))}
      </div>

      {dayEvents.length === 0 && <p className="mt-4 text-center text-sm text-zinc-400">No events on this day.</p>}
    </div>
  );
}