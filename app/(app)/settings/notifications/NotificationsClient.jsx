"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { selectClassName } from "@/components/ui/Input";
import { Bell, Check, Clock, Mail, AlertCircle } from "lucide-react";

const PRE_DUE_OPTIONS = [
  { value: "1", label: "1 day before" },
  { value: "3", label: "3 days before" },
  { value: "5", label: "5 days before" },
  { value: "7", label: "7 days before" },
  { value: "14", label: "14 days before" },
];

const NOTIFICATION_TYPES = [
  { key: "notifyPaymentReceived", label: "Payment received", description: "When a client pays an invoice" },
  { key: "notifyInvoiceViewed", label: "Invoice viewed", description: "When a client opens an invoice link" },
  { key: "notifyProposalAccepted", label: "Proposal accepted", description: "When a client accepts a proposal" },
  { key: "notifyContractSigned", label: "Contract signed", description: "When a client signs a contract" },
  { key: "notifyTaskOverdue", label: "Task overdue", description: "When a task passes its due date" },
];

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:opacity-50 ${
        checked ? "bg-zinc-900" : "bg-zinc-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

export default function NotificationsClient({ settings: initialSettings, hasBusiness }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preDueDays, setPreDueDays] = useState(
    (initialSettings.preDueReminderDays || "3,7").split(",").map((d) => d.trim())
  );

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function togglePreDueDay(day) {
    setPreDueDays((prev) => {
      const next = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day];
      return next.length > 0 ? next : prev; // keep at least one
    });
  }

  async function save() {
    setSaving(true);
    const body = {
      ...settings,
      preDueReminderDays: preDueDays.sort((a, b) => Number(b) - Number(a)).join(","),
    };

    const res = await fetch("/api/settings/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const updated = await res.json();
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  if (!hasBusiness) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center gap-2 text-amber-700">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Create a business in your profile settings first to configure notifications.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invoice Reminders */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">Invoice Reminders</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            Automatically send email reminders for invoices. Per-invoice reminders can be toggled when creating invoices.
          </p>
        </CardHeader>
        <CardBody className="space-y-5">
          {/* Overdue Reminders */}
          <div className="rounded border border-zinc-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900">Overdue invoice reminders</p>
                <p className="text-xs text-zinc-500">Send emails to clients when invoices are past due</p>
              </div>
              <Toggle
                checked={settings.overdueRemindersEnabled}
                onChange={(v) => updateSetting("overdueRemindersEnabled", v)}
              />
            </div>

            {settings.overdueRemindersEnabled && (
              <div className="border-t border-zinc-100 pt-4">
                <label className="mb-1 block text-xs font-medium text-zinc-700">
                  Re-send reminder every
                </label>
                <select
                  value={settings.overdueReminderDays}
                  onChange={(e) => updateSetting("overdueReminderDays", parseInt(e.target.value, 10))}
                  className={selectClassName + " max-w-[200px]"}
                >
                  <option value={1}>Every day</option>
                  <option value={2}>Every 2 days</option>
                  <option value={3}>Every 3 days</option>
                  <option value={5}>Every 5 days</option>
                  <option value={7}>Every 7 days</option>
                  <option value={14}>Every 14 days</option>
                </select>
              </div>
            )}
          </div>

          {/* Pre-Due Reminders */}
          <div className="rounded border border-zinc-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900">Pre-due payment reminders</p>
                <p className="text-xs text-zinc-500">Send gentle reminders before the invoice due date</p>
              </div>
              <Toggle
                checked={settings.preDueRemindersEnabled}
                onChange={(v) => updateSetting("preDueRemindersEnabled", v)}
              />
            </div>

            {settings.preDueRemindersEnabled && (
              <div className="border-t border-zinc-100 pt-4">
                <p className="mb-2 text-xs font-medium text-zinc-700">Send reminders</p>
                <div className="flex flex-wrap gap-2">
                  {PRE_DUE_OPTIONS.map((opt) => {
                    const active = preDueDays.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => togglePreDueDay(opt.value)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">Email Notifications</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">Control which events send you an email notification.</p>
        </CardHeader>
        <CardBody className="space-y-1">
          {/* Master toggle */}
          <div className="flex items-center justify-between rounded border border-zinc-200 bg-zinc-50 px-4 py-3 mb-3">
            <div>
              <p className="text-sm font-medium text-zinc-900">Enable email notifications</p>
              <p className="text-xs text-zinc-500">Turn off to only receive in-app notifications</p>
            </div>
            <Toggle
              checked={settings.emailNotifications}
              onChange={(v) => updateSetting("emailNotifications", v)}
            />
          </div>

          {/* Per-type toggles */}
          <div className="divide-y divide-zinc-100 rounded border border-zinc-200">
            {NOTIFICATION_TYPES.map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{label}</p>
                  <p className="text-xs text-zinc-500">{description}</p>
                </div>
                <Toggle
                  checked={settings[key]}
                  onChange={(v) => updateSetting(key, v)}
                  disabled={!settings.emailNotifications}
                />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">In-App Notifications</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">Notifications shown in the bell icon at the top of your dashboard.</p>
        </CardHeader>
        <CardBody>
          <div className="rounded border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-sm text-zinc-600">
              In-app notifications are always enabled for all activity types. You'll see them in the notification bell when payments are received, invoices are viewed, and more.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={save} loading={saving} size="sm">
          {saved ? <><Check className="h-4 w-4" /> Saved</> : "Save notification settings"}
        </Button>
      </div>
    </div>
  );
}
