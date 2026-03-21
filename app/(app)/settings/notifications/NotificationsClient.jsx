"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { selectClassName, inputClassName } from "@/components/ui/Input";
import { Bell, Check, Clock, Mail, AlertCircle, Send, FileText, RotateCcw, ChevronDown, ChevronUp, Eye } from "lucide-react";

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

// ─── Template Editor ────────────────────────────────────────────────────────

function TemplateEditor({ template, onSave, onReset, saving }) {
  const [expanded, setExpanded] = useState(false);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [previewing, setPreviewing] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setSubject(template.subject);
    setBody(template.body);
    setDirty(false);
  }, [template.subject, template.body]);

  function handleSubjectChange(val) {
    setSubject(val);
    setDirty(val !== template.subject || body !== template.body);
  }

  function handleBodyChange(val) {
    setBody(val);
    setDirty(subject !== template.subject || val !== template.body);
  }

  // Preview with sample variables filled in
  function getPreviewText() {
    const sampleVars = {
      clientName: "John Smith",
      amount: "$1,500.00",
      invoiceNumber: "INV-001",
      projectTitle: "Website Redesign",
      dueDate: "March 15, 2026",
      daysOverdue: "3",
      payLink: "#",
      senderName: "Your Name",
      portalLink: "#",
      signingLink: "#",
    };
    return body.replace(/\{\{(\w+)\}\}/g, (_, key) => sampleVars[key] ?? `{{${key}}}`);
  }

  return (
    <div className="rounded border border-zinc-200">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">
            {template.description}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Type: <code className="text-xs bg-zinc-100 px-1 rounded">{template.type}</code>
            {template.isCustom && (
              <span className="ml-2 text-emerald-600 font-medium">Customized</span>
            )}
          </p>
        </div>
        <div className="ml-2 text-zinc-400">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 px-4 py-4 space-y-4">
          {/* Available variables */}
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-1.5">Available variables</p>
            <div className="flex flex-wrap gap-1.5">
              {template.variables.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`{{${v}}}`);
                  }}
                  title={`Click to copy {{${v}}}`}
                  className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-mono text-zinc-600 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700">Subject line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className={inputClassName}
              placeholder="Email subject..."
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-zinc-700">Email body (HTML)</label>
              <button
                type="button"
                onClick={() => setPreviewing(!previewing)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                <Eye className="h-3 w-3" />
                {previewing ? "Edit" : "Preview"}
              </button>
            </div>
            {previewing ? (
              <div className="rounded border border-zinc-200 bg-white p-4 text-sm min-h-[120px]">
                <iframe
                  srcDoc={`<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#18181b">${getPreviewText()}</div>`}
                  className="w-full min-h-[120px] border-0"
                  sandbox=""
                  title="Email preview"
                />
              </div>
            ) : (
              <textarea
                value={body}
                onChange={(e) => handleBodyChange(e.target.value)}
                rows={6}
                className={inputClassName + " font-mono text-xs"}
                placeholder="<p>Hi {{clientName}},</p>..."
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={() => onSave(template.type, subject, body)}
              loading={saving === template.type}
              disabled={!dirty}
            >
              Save template
            </Button>
            {template.isCustom && (
              <button
                type="button"
                onClick={() => onReset(template.type)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset to default
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function NotificationsClient({ settings: initialSettings, hasBusiness, userEmail, initialTemplates = [] }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preDueDays, setPreDueDays] = useState(
    (initialSettings.preDueReminderDays || "3,7").split(",").map((d) => d.trim())
  );

  // Test email state
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Email templates state (loaded server-side, refreshed client-side after edits)
  const [templates, setTemplates] = useState(initialTemplates);
  const [savingTemplate, setSavingTemplate] = useState(null);

  async function loadTemplates() {
    try {
      const res = await fetch("/api/settings/email-templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch {}
  }

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function togglePreDueDay(day) {
    setPreDueDays((prev) => {
      const next = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day];
      return next.length > 0 ? next : prev;
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

  async function handleSendTestEmail() {
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/notifications/test-email", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ ok: true, email: data.email });
      } else {
        setTestResult({ ok: false, error: data.error });
      }
    } catch (err) {
      setTestResult({ ok: false, error: "Network error" });
    }
    setSendingTest(false);
  }

  async function saveTemplate(type, subject, body) {
    setSavingTemplate(type);
    try {
      const res = await fetch("/api/settings/email-templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, subject, body }),
      });
      if (res.ok) {
        await loadTemplates();
      }
    } catch {}
    setSavingTemplate(null);
  }

  async function resetTemplate(type) {
    try {
      const res = await fetch(`/api/settings/email-templates?type=${type}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadTemplates();
      }
    } catch {}
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
      {/* Test Email */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">Test Email Delivery</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            Send a test email to verify your email notifications are working.
          </p>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-3">
            <Button onClick={handleSendTestEmail} loading={sendingTest} size="sm" variant="secondary">
              <Send className="h-3.5 w-3.5" />
              Send test email to {userEmail}
            </Button>
          </div>
          {testResult && (
            <div className={`mt-3 rounded-lg border px-4 py-3 text-sm ${
              testResult.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}>
              {testResult.ok
                ? `Test email sent to ${testResult.email}. Check your inbox (and spam folder).`
                : `Failed to send: ${testResult.error}`}
            </div>
          )}
        </CardBody>
      </Card>

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

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">Email Templates</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            Customize the email messages sent to you and your clients. Use {"{{variables}}"} for dynamic content.
          </p>
        </CardHeader>
        <CardBody>
          {templates.length === 0 ? (
            <p className="text-sm text-zinc-400 py-4 text-center">No templates available.</p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <TemplateEditor
                  key={t.type}
                  template={t}
                  onSave={saveTemplate}
                  onReset={resetTemplate}
                  saving={savingTemplate}
                />
              ))}
            </div>
          )}
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
