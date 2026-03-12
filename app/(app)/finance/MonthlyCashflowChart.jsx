"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function MonthlyCashflowChart({
  months,
  monthlyRevenue,
  monthlyExpenses,
  maxBar,
}) {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  return (
    <div>
      <div className="relative flex items-end gap-2" style={{ height: 160 }}>
        {hoveredMonth !== null ? (
          <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 shadow-sm">
            <p className="font-medium text-zinc-900">{months[hoveredMonth]}</p>
            <p>Revenue: {formatCurrency(monthlyRevenue[hoveredMonth])}</p>
            <p>Expenses: {formatCurrency(monthlyExpenses[hoveredMonth])}</p>
          </div>
        ) : null}

        {months.map((month, index) => (
          <button
            key={month}
            type="button"
            onMouseEnter={() => setHoveredMonth(index)}
            onMouseLeave={() => setHoveredMonth(null)}
            onFocus={() => setHoveredMonth(index)}
            onBlur={() => setHoveredMonth(null)}
            className="flex flex-1 flex-col items-center gap-1 rounded px-1 text-left outline-none transition-colors hover:bg-zinc-50 focus:bg-zinc-50"
          >
            <div className="flex w-full flex-col gap-0.5" style={{ height: 130 }}>
              <div className="flex-1" />
              <div
                className="w-full rounded-t bg-green-400 opacity-80 transition-opacity"
                style={{ height: `${(monthlyRevenue[index] / maxBar) * 110}px` }}
              />
              <div
                className="w-full rounded-t bg-red-300 opacity-80 transition-opacity"
                style={{ height: `${(monthlyExpenses[index] / maxBar) * 110}px` }}
              />
            </div>
            <span className="text-[10px] text-zinc-400">{month}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded bg-green-400" />
          Revenue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded bg-red-300" />
          Expenses
        </span>
      </div>
    </div>
  );
}
