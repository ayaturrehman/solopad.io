"use client";

import { useState, useEffect } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { selectClassName } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Calendar, Loader2 } from "lucide-react";

function formatDurationShort(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDurationHours(seconds) {
  return (seconds / 3600).toFixed(2);
}

export default function TimeReports({ projects }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [dateRange, setDateRange] = useState("thisWeek");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [billableFilter, setBillableFilter] = useState("all");

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let from, to;

    switch (dateRange) {
      case "thisWeek": {
        from = new Date(today);
        from.setDate(today.getDate() - today.getDay());
        to = new Date(from);
        to.setDate(from.getDate() + 6);
        break;
      }
      case "lastWeek": {
        const lastSunday = new Date(today);
        lastSunday.setDate(today.getDate() - today.getDay() - 7);
        from = new Date(lastSunday);
        to = new Date(lastSunday);
        to.setDate(from.getDate() + 6);
        break;
      }
      case "thisMonth": {
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      }
      case "lastMonth": {
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      }
      case "custom":
        from = fromDate ? new Date(fromDate) : today;
        to = toDate ? new Date(toDate) : today;
        break;
      default:
        from = today;
        to = today;
    }

    setFromDate(from.toISOString().split("T")[0]);
    setToDate(to.toISOString().split("T")[0]);
  }, [dateRange]);

  async function fetchReports() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
      });
      if (projectFilter) params.append("projectId", projectFilter);
      if (billableFilter !== "all") {
        params.append("billable", billableFilter === "billable" ? "true" : "false");
      }

      const res = await fetch(`/api/time-entries/reports?${params}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        console.error("Failed to fetch reports");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (fromDate && toDate) {
      fetchReports();
    }
  }, [fromDate, toDate, projectFilter, billableFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="rounded border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {["thisWeek", "lastWeek", "thisMonth", "lastMonth", "custom"].map(
              (opt) => (
                <button
                  key={opt}
                  onClick={() => setDateRange(opt)}
                  className={cn(
                    "rounded border px-3 py-1.5 text-xs font-medium transition-colors",
                    dateRange === opt
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  )}
                >
                  {opt === "thisWeek" && "This Week"}
                  {opt === "lastWeek" && "Last Week"}
                  {opt === "thisMonth" && "This Month"}
                  {opt === "lastMonth" && "Last Month"}
                  {opt === "custom" && "Custom"}
                </button>
              )
            )}
          </div>

          {dateRange === "custom" && (
            <div className="flex gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded border border-zinc-200 px-3 py-1.5 text-xs"
              />
              <span className="flex items-center text-xs text-zinc-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded border border-zinc-200 px-3 py-1.5 text-xs"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className={selectClassName}
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            <select
              value={billableFilter}
              onChange={(e) => setBillableFilter(e.target.value)}
              className={selectClassName}
            >
              <option value="all">All entries</option>
              <option value="billable">Billable only</option>
              <option value="non-billable">Non-billable only</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded border border-zinc-200 bg-white p-12 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading reports...
        </div>
      ) : !data ? (
        <div className="rounded border border-zinc-200 bg-white p-12 text-center text-sm text-zinc-400">
          No data available
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <div className="rounded border border-zinc-200 bg-white p-4">
              <p className="text-xs text-zinc-500">Total Hours</p>
              <p className="text-lg font-semibold text-zinc-900">
                {formatDurationHours(data.summary.totalSeconds)}h
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4">
              <p className="text-xs text-zinc-500">Billable Hours</p>
              <p className="text-lg font-semibold text-green-600">
                {formatDurationHours(data.summary.billableSeconds)}h
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4">
              <p className="text-xs text-zinc-500">Non-billable</p>
              <p className="text-lg font-semibold text-zinc-600">
                {formatDurationHours(data.summary.nonBillableSeconds)}h
              </p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4">
              <p className="text-xs text-zinc-500">Billable Amount</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(data.summary.billableAmount)}
              </p>
            </div>
          </div>

          {/* By Project */}
          {data.byProject.length > 0 && (
            <div className="rounded border border-zinc-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900">By Project</h3>
              <div className="flex flex-col gap-3">
                {data.byProject.map((proj) => {
                  const barWidth =
                    data.summary.totalSeconds > 0
                      ? (proj.totalSeconds / data.summary.totalSeconds) * 100
                      : 0;
                  return (
                    <div key={proj.projectId || "unassigned"}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-zinc-700 truncate">
                          {proj.projectTitle}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <span>{formatDurationShort(proj.totalSeconds)}</span>
                          {proj.amount > 0 && (
                            <span className="text-blue-600 font-medium">
                              {formatCurrency(proj.amount)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded bg-zinc-100">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* By Day */}
          {data.byDay.length > 0 && (
            <div className="rounded border border-zinc-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900">By Day</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="px-2 py-2 text-left font-semibold text-zinc-600">
                        Date
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-zinc-600">
                        Total
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-zinc-600">
                        Billable
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-zinc-600">
                        Entries
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byDay.map((day) => (
                      <tr key={day.date} className="border-b border-zinc-50 hover:bg-zinc-50">
                        <td className="px-2 py-2 text-zinc-700">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-2 py-2 text-zinc-600">
                          {formatDurationShort(day.totalSeconds)}
                        </td>
                        <td className="px-2 py-2 text-green-600 font-medium">
                          {formatDurationShort(day.billableSeconds)}
                        </td>
                        <td className="px-2 py-2 text-zinc-500">{day.entryCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw Entries */}
          {data.entries.length > 0 && (
            <div className="rounded border border-zinc-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                All Entries ({data.entries.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="px-2 py-2 text-left font-semibold text-zinc-600">
                        Date
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-zinc-600">
                        Description
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-zinc-600">
                        Project
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-zinc-600">
                        Duration
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-zinc-600">
                        Billable
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                        <td className="px-2 py-2 text-zinc-700 whitespace-nowrap">
                          {new Date(entry.startedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-2 py-2 text-zinc-600 truncate max-w-xs">
                          {entry.description || "(no description)"}
                        </td>
                        <td className="px-2 py-2 text-zinc-600 truncate max-w-xs">
                          {entry.project?.title || "—"}
                        </td>
                        <td className="px-2 py-2 text-zinc-600 whitespace-nowrap">
                          {formatDurationShort(entry.duration)}
                        </td>
                        <td className="px-2 py-2">
                          <span
                            className={cn(
                              "inline-block h-2 w-2 rounded-full",
                              entry.billable ? "bg-green-500" : "bg-zinc-300"
                            )}
                            title={entry.billable ? "Billable" : "Non-billable"}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
