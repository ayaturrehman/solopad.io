"use client";

import { useState, useEffect, useRef } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Play, Square, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDurationShort(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getDateLabel(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

function groupByDate(entries) {
  const groups = {};
  for (const e of entries) {
    const label = getDateLabel(e.startedAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(e);
  }
  return groups;
}

export default function TimeTrackerClient({ entries: initialEntries, projects }) {
  const [entries, setEntries] = useState(initialEntries);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [timerDesc, setTimerDesc] = useState("");
  const [timerProject, setTimerProject] = useState("");
  const [timerBillable, setTimerBillable] = useState(true);
  const intervalRef = useRef(null);

  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    description: "",
    projectId: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "10:00",
    billable: true,
    hourlyRate: 0,
  });

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  async function startTimer() {
    const res = await fetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: timerDesc || null,
        projectId: timerProject || null,
        startedAt: new Date().toISOString(),
        billable: timerBillable,
      }),
    });
    if (res.ok) {
      const { entry } = await res.json();
      setActiveEntryId(entry.id);
      setElapsed(0);
      setRunning(true);
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
  }

  async function stopTimer() {
    clearInterval(intervalRef.current);
    setRunning(false);
    const endedAt = new Date().toISOString();
    const res = await fetch(`/api/time-entries/${activeEntryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endedAt, duration: elapsed }),
    });
    if (res.ok) {
      const { entry } = await res.json();
      setEntries((prev) => [entry, ...prev.filter((e) => e.id !== entry.id)]);
    }
    setActiveEntryId(null);
    setElapsed(0);
    setTimerDesc("");
    setTimerProject("");
  }

  async function deleteEntry(id) {
    const res = await fetch(`/api/time-entries/${id}`, { method: "DELETE" });
    if (res.ok) setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  async function submitManual(e) {
    e.preventDefault();
    const startedAt = new Date(`${manualForm.date}T${manualForm.startTime}:00`).toISOString();
    const endedAt = new Date(`${manualForm.date}T${manualForm.endTime}:00`).toISOString();
    const res = await fetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: manualForm.description || null,
        projectId: manualForm.projectId || null,
        startedAt,
        endedAt,
        billable: manualForm.billable,
        hourlyRate: parseFloat(manualForm.hourlyRate) || 0,
      }),
    });
    if (res.ok) {
      const { entry } = await res.json();
      setEntries((prev) => [entry, ...prev]);
      setShowManual(false);
      setManualForm({
        description: "",
        projectId: "",
        date: new Date().toISOString().slice(0, 10),
        startTime: "09:00",
        endTime: "10:00",
        billable: true,
        hourlyRate: 0,
      });
    }
  }

  // Summary stats
  const now = new Date();
  const todayStr = now.toDateString();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());

  const completedEntries = entries.filter((e) => e.endedAt);
  const todaySeconds = completedEntries
    .filter((e) => new Date(e.startedAt).toDateString() === todayStr)
    .reduce((acc, e) => acc + e.duration, 0);
  const weekSeconds = completedEntries
    .filter((e) => new Date(e.startedAt) >= weekStart)
    .reduce((acc, e) => acc + e.duration, 0);
  const billableAmount = completedEntries
    .filter((e) => e.billable)
    .reduce((acc, e) => acc + (e.duration / 3600) * e.hourlyRate, 0);

  const groups = groupByDate(completedEntries);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="w-full py-2">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900">Time Tracker</h1>

        {/* Active Timer Card */}
        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="What are you working on?"
                value={timerDesc}
                onChange={(e) => setTimerDesc(e.target.value)}
                disabled={running}
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none disabled:bg-zinc-50"
              />
              <select
                value={timerProject}
                onChange={(e) => setTimerProject(e.target.value)}
                disabled={running}
                className="rounded-lg border border-zinc-200 px-2 py-2 text-sm text-zinc-600 focus:outline-none disabled:bg-zinc-50"
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <button
                onClick={() => setTimerBillable((v) => !v)}
                disabled={running}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  timerBillable
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-zinc-200 text-zinc-400"
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", timerBillable ? "bg-green-500" : "bg-zinc-300")} />
                Billable
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="font-mono text-4xl font-light tracking-widest text-zinc-900">
                {formatDuration(elapsed)}
              </div>
              {running ? (
                <button
                  onClick={stopTimer}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              ) : (
                <button
                  onClick={startTimer}
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
                >
                  <Play className="h-4 w-4" />
                  Start Timer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary row */}
        <div className="mb-5 flex gap-3">
          {[
            { label: "Today", value: formatDurationShort(todaySeconds) },
            { label: "This week", value: formatDurationShort(weekSeconds) },
            { label: "Billable", value: formatCurrency(billableAmount) },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600"
            >
              <span className="font-semibold text-zinc-900">{s.value}</span>
              {s.label}
            </div>
          ))}
        </div>

        {/* Manual entry toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowManual((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Log time manually
            {showManual ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Manual form */}
        {showManual && (
          <div className="mb-5 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <form onSubmit={submitManual} className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={manualForm.description}
                  onChange={(e) => setManualForm((d) => ({ ...d, description: e.target.value }))}
                  className="flex-1 min-w-40 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm focus:outline-none focus:border-zinc-400"
                />
                <select
                  value={manualForm.projectId}
                  onChange={(e) => setManualForm((d) => ({ ...d, projectId: e.target.value }))}
                  className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs focus:outline-none"
                >
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="date"
                  value={manualForm.date}
                  onChange={(e) => setManualForm((d) => ({ ...d, date: e.target.value }))}
                  className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs focus:outline-none"
                />
                <input
                  type="time"
                  value={manualForm.startTime}
                  onChange={(e) => setManualForm((d) => ({ ...d, startTime: e.target.value }))}
                  className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs focus:outline-none"
                />
                <span className="flex items-center text-xs text-zinc-400">to</span>
                <input
                  type="time"
                  value={manualForm.endTime}
                  onChange={(e) => setManualForm((d) => ({ ...d, endTime: e.target.value }))}
                  className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Rate/hr"
                  value={manualForm.hourlyRate}
                  onChange={(e) => setManualForm((d) => ({ ...d, hourlyRate: e.target.value }))}
                  className="w-24 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setManualForm((d) => ({ ...d, billable: !d.billable }))}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium",
                    manualForm.billable
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-zinc-200 text-zinc-400"
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", manualForm.billable ? "bg-green-500" : "bg-zinc-300")} />
                  Billable
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManual(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
                >
                  Log time
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Entries table */}
        {Object.keys(groups).length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center text-sm text-zinc-400 shadow-sm">
            No time entries yet. Start a timer or log time manually.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(groups).map(([dateLabel, dayEntries]) => (
              <div key={dateLabel} className="rounded-xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
                  <span className="text-xs font-semibold text-zinc-700">{dateLabel}</span>
                  <span className="text-xs text-zinc-400">
                    {formatDurationShort(dayEntries.reduce((a, e) => a + e.duration, 0))}
                  </span>
                </div>
                <div className="divide-y divide-zinc-50">
                  {dayEntries.map((entry) => {
                    const amount = (entry.duration / 3600) * entry.hourlyRate;
                    return (
                      <div key={entry.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-zinc-50">
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm text-zinc-800">
                            {entry.description || <span className="text-zinc-400">(no description)</span>}
                          </p>
                        </div>
                        {entry.project && (
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">
                            {entry.project.title}
                          </span>
                        )}
                        <span className="text-xs text-zinc-500 tabular-nums">
                          {formatDurationShort(entry.duration)}
                        </span>
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            entry.billable ? "bg-green-400" : "bg-zinc-300"
                          )}
                          title={entry.billable ? "Billable" : "Non-billable"}
                        />
                        {entry.hourlyRate > 0 && (
                          <span className="text-xs text-zinc-500">{formatCurrency(amount)}</span>
                        )}
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 rounded p-1 text-zinc-300 hover:bg-zinc-100 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
