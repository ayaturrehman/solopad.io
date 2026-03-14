"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { selectClassName } from "@/components/ui/Input";
import CollectionPageHeader, {
  collectionPageHeaderSegmentedGroupClassName,
  getCollectionPageHeaderSegmentedButtonClassName,
} from "@/components/shared/CollectionPageHeader";
import { Copy, Check, X, ChevronDown, ChevronUp, Plus } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Input from "@/components/ui/Input";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function generateTimeOptions() {
  const times = [];
  for (let h = 6; h <= 22; h++) {
    times.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 22) times.push(`${String(h).padStart(2, "0")}:30`);
  }
  return times;
}

const TIME_OPTIONS = generateTimeOptions();

const DEFAULT_RULES = [1, 2, 3, 4, 5].map((d) => ({
  dayOfWeek: d,
  startTime: "09:00",
  endTime: "17:00",
  enabled: true,
}));

function buildDayRules(savedRules) {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const saved = savedRules.find((r) => r.dayOfWeek === day);
    if (saved) {
      return { dayOfWeek: day, startTime: saved.startTime, endTime: saved.endTime, enabled: true };
    }
    // Mon-Fri default on if no rules saved at all
    if (savedRules.length === 0 && day >= 1 && day <= 5) {
      return { dayOfWeek: day, startTime: "09:00", endTime: "17:00", enabled: true };
    }
    return { dayOfWeek: day, startTime: "09:00", endTime: "17:00", enabled: false };
  });
}

const EMPTY_MEETING = { title: "", clientName: "", clientEmail: "", date: "", startTime: "09:00", endTime: "10:00", notes: "" };

export default function SchedulerClient({ bookings: initialBookings, availabilityRules, bookingPageUrl }) {
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState(initialBookings);
  const [dayRules, setDayRules] = useState(() => buildDayRules(availabilityRules));
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [meetingModal, setMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState(EMPTY_MEETING);
  const [meetingErrors, setMeetingErrors] = useState({});
  const [meetingSubmitting, setMeetingSubmitting] = useState(false);
  const [meetingError, setMeetingError] = useState("");

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => new Date(b.startAt) >= now && b.status !== "cancelled"
  );
  const past = bookings.filter(
    (b) => new Date(b.startAt) < now || b.status === "cancelled"
  );

  async function copyLink() {
    await navigator.clipboard.writeText(bookingPageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function cancelBooking(id) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (res.ok) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
    }
  }

  function setMeetingField(key, value) {
    setMeetingForm((f) => ({ ...f, [key]: value }));
    setMeetingErrors((e) => ({ ...e, [key]: "" }));
    setMeetingError("");
  }

  async function submitMeeting(e) {
    e.preventDefault();
    const errs = {};
    if (!meetingForm.title.trim()) errs.title = "Title is required.";
    if (!meetingForm.clientName.trim()) errs.clientName = "Client name is required.";
    if (!meetingForm.date) errs.date = "Date is required.";
    if (!meetingForm.startTime) errs.startTime = "Required.";
    if (!meetingForm.endTime) errs.endTime = "Required.";
    if (Object.keys(errs).length) { setMeetingErrors(errs); return; }

    const startAt = new Date(`${meetingForm.date}T${meetingForm.startTime}`);
    const endAt   = new Date(`${meetingForm.date}T${meetingForm.endTime}`);
    if (endAt <= startAt) {
      setMeetingErrors((e) => ({ ...e, endTime: "End time must be after start time." }));
      return;
    }

    setMeetingSubmitting(true);
    setMeetingError("");
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meetingForm.title.trim(),
          clientName: meetingForm.clientName.trim(),
          clientEmail: meetingForm.clientEmail.trim(),
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          notes: meetingForm.notes.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to create meeting.");
      setBookings((prev) => [...prev, data.booking]);
      setMeetingModal(false);
      setMeetingForm(EMPTY_MEETING);
    } catch (err) {
      setMeetingError(err.message);
    } finally {
      setMeetingSubmitting(false);
    }
  }

  async function saveAvailability() {
    setSaving(true);
    const rules = dayRules
      .filter((r) => r.enabled)
      .map((r) => ({ dayOfWeek: r.dayOfWeek, startTime: r.startTime, endTime: r.endTime }));

    await fetch("/api/scheduler/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules }),
    });
    setSaving(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2000);
  }

  function updateDay(dayOfWeek, field, value) {
    setDayRules((prev) =>
      prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, [field]: value } : r))
    );
  }

  function formatBookingTime(startAt, endAt) {
    const s = new Date(startAt);
    const e = new Date(endAt);
    const date = s.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const start = s.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const end = e.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${date} · ${start} – ${end}`;
  }

  return (
    <div className="px-4 py-4 md:px-6">
      <div className="w-full">
        <CollectionPageHeader
          title="Scheduler"
          showFilter={false}
          className="px-0 pb-6 pt-0"
          actions={(
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => { setMeetingModal(true); setMeetingForm(EMPTY_MEETING); setMeetingErrors({}); setMeetingError(""); }}>
                <Plus className="h-3.5 w-3.5" /> Add meeting
              </Button>
              <div className={collectionPageHeaderSegmentedGroupClassName}>
                {[{ id: "bookings", label: "Bookings" }, { id: "availability", label: "Availability" }].map((item, index, items) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={getCollectionPageHeaderSegmentedButtonClassName(
                      tab === item.id,
                      index === 0 ? "left" : index === items.length - 1 ? "right" : "middle"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        />

        {tab === "bookings" && (
          <div className="flex flex-col gap-5">
            {/* Booking link card */}
            <div className="rounded border border-zinc-200 bg-white p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Your booking link
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="flex-1 truncate rounded bg-zinc-50 px-3 py-1.5 text-xs text-zinc-700 border border-zinc-200">
                  {bookingPageUrl}
                </code>
                <Button
                  onClick={copyLink}
                  size="sm"
                  className={copied ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Upcoming bookings */}
            <div className="rounded border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-4 py-3">
                <p className="text-sm font-semibold text-zinc-900">
                  Upcoming ({upcoming.length})
                </p>
              </div>
              {upcoming.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-zinc-400">
                  No upcoming bookings. Share your booking link to get started.
                </p>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {upcoming.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900">{b.title}</p>
                        <p className="text-xs text-zinc-500">
                          {b.clientName} · {b.clientEmail}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {formatBookingTime(b.startAt, b.endAt)}
                        </p>
                      </div>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                        Confirmed
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => cancelBooking(b.id)}
                        className="hover:border-red-200 hover:text-red-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past bookings */}
            {past.length > 0 && (
              <div className="rounded border border-zinc-200 bg-white">
                <button
                  onClick={() => setShowPast((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-500 hover:text-zinc-800"
                >
                  Past bookings ({past.length})
                  {showPast ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {showPast && (
                  <div className="divide-y divide-zinc-100 border-t border-zinc-100">
                    {past.map((b) => (
                      <div key={b.id} className="flex items-center gap-3 px-4 py-3 opacity-60">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-700">{b.title}</p>
                          <p className="text-xs text-zinc-400">
                            {b.clientName} · {formatBookingTime(b.startAt, b.endAt)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                            b.status === "cancelled"
                              ? "bg-zinc-100 text-zinc-500"
                              : "bg-zinc-100 text-zinc-600"
                          )}
                        >
                          {b.status === "cancelled" ? "Cancelled" : "Past"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "availability" && (
          <div className="flex flex-col gap-5">
            <div className="rounded border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-4 py-3">
                <p className="text-sm font-semibold text-zinc-900">Weekly availability</p>
                <p className="text-xs text-zinc-400 mt-0.5">Set when clients can book time with you</p>
              </div>
              <div className="divide-y divide-zinc-100">
                {dayRules.map((rule) => (
                  <div key={rule.dayOfWeek} className="flex items-center gap-4 px-4 py-3">
                    <div className="w-8">
                      <button
                        onClick={() => updateDay(rule.dayOfWeek, "enabled", !rule.enabled)}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          rule.enabled ? "bg-zinc-900" : "bg-zinc-200"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
                            rule.enabled ? "translate-x-4" : "translate-x-1"
                          )}
                        />
                      </button>
                    </div>
                    <span
                      className={cn(
                        "w-10 text-sm font-medium",
                        rule.enabled ? "text-zinc-800" : "text-zinc-400"
                      )}
                    >
                      {FULL_DAY_NAMES[rule.dayOfWeek].slice(0, 3)}
                    </span>
                    {rule.enabled ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={rule.startTime}
                          onChange={(e) => updateDay(rule.dayOfWeek, "startTime", e.target.value)}
                          className={selectClassName}
                        >
                          {TIME_OPTIONS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <span className="text-xs text-zinc-400">to</span>
                        <select
                          value={rule.endTime}
                          onChange={(e) => updateDay(rule.dayOfWeek, "endTime", e.target.value)}
                          className={selectClassName}
                        >
                          {TIME_OPTIONS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400">Unavailable</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-100 px-4 py-3 flex justify-end">
                <Button
                  onClick={saveAvailability}
                  disabled={saving}
                  size="sm"
                  className={savedOk ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {saving ? "Saving…" : savedOk ? "Saved!" : "Save availability"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add meeting modal */}
      <Modal open={meetingModal} onClose={() => setMeetingModal(false)} title="Add meeting" className="max-w-md">
        <form onSubmit={submitMeeting} className="space-y-4">
          <Input
            label="Title"
            required
            value={meetingForm.title}
            onChange={(e) => setMeetingField("title", e.target.value)}
            placeholder="e.g. Discovery call"
            error={meetingErrors.title}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Client name"
              required
              value={meetingForm.clientName}
              onChange={(e) => setMeetingField("clientName", e.target.value)}
              placeholder="Jane Smith"
              error={meetingErrors.clientName}
            />
            <Input
              label="Client email"
              type="email"
              value={meetingForm.clientEmail}
              onChange={(e) => setMeetingField("clientEmail", e.target.value)}
              placeholder="jane@example.com"
            />
          </div>
          <Input
            label="Date"
            type="date"
            required
            value={meetingForm.date}
            onChange={(e) => setMeetingField("date", e.target.value)}
            error={meetingErrors.date}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-700">Start time <span className="text-red-500">*</span></label>
              <select
                value={meetingForm.startTime}
                onChange={(e) => setMeetingField("startTime", e.target.value)}
                className={cn("w-full h-9 rounded border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 transition-colors", meetingErrors.startTime && "border-red-400")}
              >
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {meetingErrors.startTime && <p className="text-xs text-red-600">{meetingErrors.startTime}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-700">End time <span className="text-red-500">*</span></label>
              <select
                value={meetingForm.endTime}
                onChange={(e) => setMeetingField("endTime", e.target.value)}
                className={cn("w-full h-9 rounded border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 transition-colors", meetingErrors.endTime && "border-red-400")}
              >
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {meetingErrors.endTime && <p className="text-xs text-red-600">{meetingErrors.endTime}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-700">Notes</label>
            <textarea
              rows={3}
              value={meetingForm.notes}
              onChange={(e) => setMeetingField("notes", e.target.value)}
              placeholder="Optional notes about this meeting…"
              className="w-full rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 transition-colors resize-none"
            />
          </div>
          {meetingError && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{meetingError}</p>}
          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setMeetingModal(false)}>Cancel</Button>
            <Button type="submit" size="sm" loading={meetingSubmitting}>Save meeting</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
