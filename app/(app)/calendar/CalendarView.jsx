"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const EVENT_COLORS = {
  project: "bg-blue-100 text-blue-700",
  invoice: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  meeting: "bg-purple-100 text-purple-700",
};

export default function CalendarView({ events }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const { year, month } = viewDate;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build event map keyed by YYYY-MM-DD
  const eventMap = {};
  events.forEach((ev) => {
    if (!eventMap[ev.date]) eventMap[ev.date] = [];
    eventMap[ev.date].push(ev);
  });

  function prevMonth() {
    setViewDate(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
  }
  function nextMonth() {
    setViewDate(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = today.toISOString().split("T")[0];

  return (
    <div className="rounded border border-zinc-200 bg-white p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <button onClick={prevMonth} className="inline-flex h-9 w-9 items-center justify-center rounded border border-zinc-200 hover:bg-zinc-50">
          <ChevronLeft className="h-4 w-4 text-zinc-600" />
        </button>
        <h2 className="text-base font-semibold sm:text-lg text-zinc-900">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button onClick={nextMonth} className="inline-flex h-9 w-9 items-center justify-center rounded border border-zinc-200 hover:bg-zinc-50">
          <ChevronRight className="h-4 w-4 text-zinc-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-zinc-400 sm:text-xs">{d}</div>
        ))}
      </div>

      {/* Cells */}
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
              <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium sm:text-sm",
                isToday ? "bg-zinc-900 text-white" : "text-zinc-600"
              )}>
                {day}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 2).map((ev, i) => (
                  <Link
                    key={i}
                    href={ev.href}
                    className={cn("block truncate rounded px-1 py-0.5 text-[10px] font-medium sm:text-xs", EVENT_COLORS[ev.type] || "bg-zinc-100 text-zinc-600")}
                    title={ev.label}
                  >
                    {ev.label}
                  </Link>
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-[10px] text-zinc-400">+{dayEvents.length - 2} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-100 pt-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-blue-200" />Project deadline</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-amber-200" />Invoice due</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-green-200" />Paid</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-red-200" />Overdue</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-purple-200" />Meeting</span>
      </div>
    </div>
  );
}
