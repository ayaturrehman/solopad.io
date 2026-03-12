"use client";


import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  TEAM_PERMISSION_OPTIONS,
  TEAM_ROLE_PRESETS,
  canManageTeam,
  getDefaultPermissionsForRole,
} from "@/lib/team";
import { PLAN_ORDER, getPlan } from "@/lib/plans";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  CreditCard,
  Link2,
  Link2Off,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

const PAYMENT_OPTIONS = [
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, Amex - includes Apple Pay & Google Pay",
    required: true,
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Let clients pay via their PayPal account",
    required: false,
  },
  {
    id: "klarna",
    label: "Klarna",
    description: "Buy now, pay later - clients split into instalments",
    required: false,
  },
];

const emptyInviteForm = {
  name: "",
  email: "",
  role: "collaborator",
  permissions: getDefaultPermissionsForRole("collaborator"),
};

const PROFILE_TAB_SECTIONS = [
  { id: "profile-overview", label: "Profile" },
  { id: "profile-business", label: "Business Details" },
];

const SETTINGS_TAB_SECTIONS = [
  { id: "settings-roles", label: "Roles" },
  { id: "settings-team", label: "Team" },
  { id: "settings-stripe", label: "Stripe" },
  { id: "settings-payments", label: "Payments" },
  { id: "settings-plan", label: "Plan" },
  { id: "settings-danger", label: "Danger Zone" },
];

function QuickSectionMenu({ title, sections }) {
  function jumpTo(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <aside className="rounded border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">{title}</p>
      <div className="mt-3 space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => jumpTo(section.id)}
            className="flex w-full items-center justify-between rounded px-3 py-1.5 text-left text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <span>{section.label}</span>
            <span className="text-zinc-300">#</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function SettingsContent() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [methods, setMethods] = useState(["card"]);
  const [savingPayments, setSavingPayments] = useState(false);
  const [savedPayments, setSavedPayments] = useState(false);

  const [stripe, setStripe] = useState({ connected: false, onboarded: false, accountId: null });
  const [disconnecting, setDisconnecting] = useState(false);

  const [members, setMembers] = useState([]);
  const [inviteForm, setInviteForm] = useState(emptyInviteForm);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [currentPlan, setCurrentPlan] = useState("free");
  const [savingPlan, setSavingPlan] = useState(false);

  const stripeParam = searchParams?.get("stripe");
  const plan = currentPlan || session?.user?.plan || "free";
  const userRole = session?.user?.role ?? "owner";
  const teamEnabled = canManageTeam(plan);

  useEffect(() => {
    fetch("/api/settings/profile")
      .then((response) => response.json())
      .then((data) => {
        if (!data.user) return;
        setName(data.user.name ?? "");
        setCompanyName(data.user.companyName ?? "");
        setCompanyLogo(data.user.companyLogo ?? "");
        setTimezone(data.user.timezone ?? "UTC");
      });

    fetch("/api/settings/payments")
      .then((response) => response.json())
      .then((data) => {
        if (data.paymentMethods) setMethods(data.paymentMethods);
      });

    fetch("/api/settings/stripe/status")
      .then((response) => response.json())
      .then((data) => setStripe(data));

    fetch("/api/settings/team")
      .then((response) => response.json())
      .then((data) => setMembers(data.members ?? []));

    fetch("/api/settings/plan")
      .then((response) => response.json())
      .then((data) => {
        if (data.plan) setCurrentPlan(data.plan);
      });
  }, []);

  const planColors = {
    free: "bg-zinc-100 text-zinc-600",
    solo: "bg-blue-100 text-blue-700",
    pro: "bg-violet-100 text-violet-700",
  };
  const currentName = name || session?.user?.name || "";

  async function saveProfile(e) {
    e.preventDefault();
    const trimmedName = currentName.trim();
    if (!trimmedName) return;

    setSaving(true);

    const response = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmedName,
        companyName,
        companyLogo,
        timezone,
      }),
    });

    if (!response.ok) {
      setSaving(false);
      return;
    }

    await update({
      ...session,
      user: {
        ...session?.user,
        name: trimmedName,
        companyName,
        companyLogo,
        timezone,
      },
    });

    setName(trimmedName);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleMethod(id) {
    if (id === "card") return;
    setMethods((prev) => (prev.includes(id) ? prev.filter((method) => method !== id) : [...prev, id]));
  }

  async function savePayments() {
    setSavingPayments(true);
    await fetch("/api/settings/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethods: methods }),
    });
    setSavedPayments(true);
    setSavingPayments(false);
    setTimeout(() => setSavedPayments(false), 2000);
  }

  async function disconnectStripe() {
    if (!confirm("Disconnect your Stripe account? Clients will no longer be able to pay invoices until you reconnect.")) {
      return;
    }

    setDisconnecting(true);
    await fetch("/api/settings/stripe/disconnect", { method: "POST" });
    setStripe({ connected: false, onboarded: false, accountId: null });
    setDisconnecting(false);
  }

  function toggleInvitePermission(permissionId) {
    setInviteForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((permission) => permission !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  }

  function updateInviteRole(role) {
    setInviteForm((prev) => ({
      ...prev,
      role,
      permissions: getDefaultPermissionsForRole(role),
    }));
  }

  async function inviteMember(e) {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError("");

    const response = await fetch("/api/settings/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteForm),
    });

    const data = await response.json();
    if (!response.ok) {
      setInviteError(data.error || "Could not send invite.");
      setInviteLoading(false);
      return;
    }

    setMembers((prev) => [data.member, ...prev]);
    setInviteForm(emptyInviteForm);
    setInviteLoading(false);
  }

  async function changePlan(nextPlan) {
    if (nextPlan === plan) return;

    setSavingPlan(true);
    const response = await fetch("/api/settings/plan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: nextPlan }),
    });

    const data = await response.json();
    if (response.ok) {
      setCurrentPlan(data.plan);
    }
    setSavingPlan(false);
  }

  const ownerPermissions = TEAM_ROLE_PRESETS[userRole] ?? TEAM_ROLE_PRESETS.owner;
  const sections = activeTab === "profile" ? PROFILE_TAB_SECTIONS : SETTINGS_TAB_SECTIONS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your account, permissions, payments, and team access.</p>
      </div>

      <div className="border-b border-zinc-200">
        {[
          { id: "profile", label: "Profile", description: "Personal info, role, and access overview." },
          { id: "settings", label: "Settings", description: "Team, payments, billing, and workspace controls." },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative mr-8 inline-flex h-12 items-center text-sm font-medium transition-colors ${
              activeTab === tab.id ? "text-blue-600" : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full transition-opacity ${
                activeTab === tab.id ? "bg-blue-600 opacity-100" : "bg-transparent opacity-0"
              }`}
            />
          </button>
        ))}
      </div>

      {stripeParam === "connected" && (
        <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Stripe account connected successfully. Clients can now pay invoices directly.
        </div>
      )}
      {stripeParam === "error" && (
        <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Stripe connection failed. Please try again.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <QuickSectionMenu title={activeTab === "profile" ? "Profile Sections" : "Settings Sections"} sections={sections} />
        </div>

        <div className="space-y-6">
          {activeTab === "profile" && (
            <>
              <section id="profile-overview">
                <Card>
                  <CardHeader>
                    <h2 className="font-semibold text-zinc-900">Profile</h2>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={saveProfile} className="space-y-4">
                      <Input label="Your name" value={currentName} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" />
                      <Input label="Email" value={session?.user?.email ?? ""} disabled />
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded border border-zinc-200 bg-zinc-50 px-4 py-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Role</p>
                          <p className="mt-1 text-sm font-medium capitalize text-zinc-900">{userRole}</p>
                        </div>
                        <div className="rounded border border-zinc-200 bg-zinc-50 px-4 py-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Permissions</p>
                          <p className="mt-1 text-sm text-zinc-600">{ownerPermissions.join(", ").replaceAll("_", " ")}</p>
                        </div>
                      </div>
                      <Button type="submit" loading={saving} size="sm">
                        {saved ? <><Check className="h-4 w-4" /> Saved</> : "Save changes"}
                      </Button>
                    </form>
                  </CardBody>
                </Card>
              </section>

              <section id="profile-business">
                <Card>
                  <CardHeader>
                    <h2 className="font-semibold text-zinc-900">Business Details</h2>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={saveProfile} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Business name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Solopad Studio"
                        />
                        <Input
                          label="Timezone"
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          placeholder="Europe/London"
                        />
                      </div>
                      <Input
                        label="Logo URL"
                        value={companyLogo}
                        onChange={(e) => setCompanyLogo(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                      <Button type="submit" loading={saving} size="sm">
                        {saved ? <><Check className="h-4 w-4" /> Saved</> : "Save business details"}
                      </Button>
                    </form>
                  </CardBody>
                </Card>
              </section>

            </>
          )}

          {activeTab === "settings" && (
            <>
              <section id="settings-roles">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-zinc-500" />
                      <h2 className="font-semibold text-zinc-900">Roles & Permissions</h2>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      Solo and Pro plans can invite teammates and assign work from the tasks area.
                    </p>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded border border-zinc-200 p-4">
                        <p className="text-sm font-medium text-zinc-900">Owner</p>
                        <p className="mt-1 text-xs text-zinc-500">Full workspace control, invites teammates, and assigns tasks.</p>
                      </div>
                      <div className="rounded border border-zinc-200 p-4">
                        <p className="text-sm font-medium text-zinc-900">Collaborator</p>
                        <p className="mt-1 text-xs text-zinc-500">Works on delivery and can receive assigned tasks.</p>
                      </div>
                      <div className="rounded border border-zinc-200 p-4">
                        <p className="text-sm font-medium text-zinc-900">Contractor</p>
                        <p className="mt-1 text-xs text-zinc-500">Limited access for external helpers and short engagements.</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </section>

              <section id="settings-team">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-zinc-500" />
                      <h2 className="font-semibold text-zinc-900">Team Access</h2>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      Invite teammates, control their role, and decide who can receive assigned work.
                    </p>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    {!teamEnabled && (
                      <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        Upgrade to the Solo plan to invite teammates and assign tasks.
                      </div>
                    )}

                    <div className="rounded border border-zinc-200">
                      <div className="border-b border-zinc-200 px-4 py-3">
                        <p className="text-sm font-medium text-zinc-900">Team members</p>
                      </div>
                      <div className="divide-y divide-zinc-100">
                        {members.length === 0 && (
                          <p className="px-4 py-6 text-sm text-zinc-500">No teammates invited yet.</p>
                        )}
                        {members.map((member) => (
                          <div key={member.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-medium text-zinc-900">{member.name}</p>
                              <p className="text-xs text-zinc-500">{member.email}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs capitalize text-zinc-600">{member.role}</span>
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs capitalize text-blue-700">{member.status}</span>
                              <span className="text-xs text-zinc-500">
                                {(member.permissions ?? []).join(", ").replaceAll("_", " ")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={inviteMember} className="space-y-4 rounded border border-zinc-200 bg-zinc-50 p-4">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-zinc-500" />
                        <p className="text-sm font-medium text-zinc-900">Invite teammate</p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Full name"
                          value={inviteForm.name}
                          disabled={!teamEnabled}
                          onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Jamie Brooks"
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={inviteForm.email}
                          disabled={!teamEnabled}
                          onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="jamie@example.com"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">Role</label>
                        <select
                          value={inviteForm.role}
                          disabled={!teamEnabled}
                          onChange={(e) => updateInviteRole(e.target.value)}
                          className="h-10 w-full rounded border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-100"
                        >
                          <option value="collaborator">Collaborator</option>
                          <option value="admin">Admin</option>
                          <option value="contractor">Contractor</option>
                        </select>
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-medium text-zinc-700">Permissions</p>
                        <div className="grid gap-2 md:grid-cols-3">
                          {TEAM_PERMISSION_OPTIONS.map((permission) => (
                            <label key={permission.id} className="flex items-center gap-2 rounded border border-zinc-200 bg-white px-3 py-1.5">
                              <input
                                type="checkbox"
                                checked={inviteForm.permissions.includes(permission.id)}
                                disabled={!teamEnabled}
                                onChange={() => toggleInvitePermission(permission.id)}
                                className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
                              />
                              <span className="text-sm text-zinc-700">{permission.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}
                      <Button type="submit" size="sm" loading={inviteLoading} disabled={!teamEnabled}>
                        Send invite
                      </Button>
                    </form>
                  </CardBody>
                </Card>
              </section>

              <section id="settings-stripe">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 32 32" fill="none">
                        <path d="M13.3 11.5c0-.8.7-1.1 1.8-1.1 1.6 0 3.6.5 5.2 1.4V7.4A13.8 13.8 0 0015.1 7c-4.6 0-7.7 2.4-7.7 6.4 0 6.2 8.6 5.2 8.6 7.9 0 .9-.8 1.2-2 1.2-1.7 0-3.9-.7-5.6-1.7v4.5c1.9.8 3.8 1.2 5.6 1.2 4.7 0 8-2.3 8-6.4-.1-6.8-8.7-5.5-8.7-8.6z" fill="#635BFF" />
                      </svg>
                      <h2 className="font-semibold text-zinc-900">Stripe Account</h2>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">Connect your Stripe account so clients pay directly to you.</p>
                  </CardHeader>
                  <CardBody>
                    {stripe.connected ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-1.5.5">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-sm font-medium text-green-700">
                            {stripe.onboarded ? "Connected and active" : "Connected - finish onboarding in Stripe"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">Account: <span className="font-mono">{stripe.accountId}</span></p>
                        <Button variant="secondary" size="sm" onClick={disconnectStripe} loading={disconnecting}>
                          <Link2Off className="mr-1.5 h-3.5 w-3.5" /> Disconnect Stripe
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-zinc-500">
                          No Stripe account connected. Connect now to accept card, Apple Pay, Google Pay, and more.
                        </p>
                        <a
                          href="/api/settings/stripe/connect"
                          className="inline-flex items-center gap-2 rounded bg-[#635BFF] px-3 py-1.5.5 text-sm font-semibold text-white hover:bg-[#4F46E5]"
                        >
                          <Link2 className="h-4 w-4" /> Connect with Stripe
                        </a>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </section>

              <section id="settings-payments">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-zinc-500" />
                      <h2 className="font-semibold text-zinc-900">Client Payment Methods</h2>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">Choose how clients can pay their invoices.</p>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    {!stripe.connected && (
                      <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-1.5.5 text-xs text-amber-700">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        Connect your Stripe account above before enabling payment methods.
                      </div>
                    )}
                    {PAYMENT_OPTIONS.map((option) => {
                      const enabled = methods.includes(option.id);
                      return (
                        <label
                          key={option.id}
                          className={`flex cursor-pointer items-start gap-3 rounded border p-3.5 transition-colors ${
                            enabled ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white"
                          } ${option.required ? "cursor-default" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={enabled}
                            disabled={option.required}
                            onChange={() => toggleMethod(option.id)}
                            className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-zinc-900"
                          />
                          <div>
                            <p className="text-sm font-medium text-zinc-900">
                              {option.label}
                              {option.required && <span className="ml-2 text-xs text-zinc-400">(required)</span>}
                            </p>
                            <p className="text-xs text-zinc-500">{option.description}</p>
                          </div>
                        </label>
                      );
                    })}
                    <Button size="sm" onClick={savePayments} loading={savingPayments}>
                      {savedPayments ? <><Check className="h-4 w-4" /> Saved</> : "Save payment methods"}
                    </Button>
                  </CardBody>
                </Card>
              </section>

              <section id="settings-plan">
                <Card>
                  <CardHeader>
                    <h2 className="font-semibold text-zinc-900">Plan</h2>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize text-zinc-900">{plan} plan</p>
                        <p className="text-sm text-zinc-500">{getPlan(plan).description}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${planColors[plan]}`}>
                        {plan}
                      </span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      {PLAN_ORDER.map((planId) => {
                        const item = getPlan(planId);
                        const active = plan === planId;

                        return (
                          <div key={planId} className={`rounded border p-4 ${active ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white"}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                                <p className="mt-1 text-xs text-zinc-500">{item.description}</p>
                              </div>
                              <span className="text-sm font-semibold text-zinc-900">{item.price}{item.period}</span>
                            </div>
                            <ul className="mt-3 space-y-1.5">
                              {item.features.slice(0, 3).map((feature) => (
                                <li key={feature} className="text-xs text-zinc-500">
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            <Button
                              size="sm"
                              variant={active ? "secondary" : "primary"}
                              className="mt-4 w-full"
                              disabled={active || savingPlan}
                              loading={savingPlan && !active}
                              onClick={() => changePlan(planId)}
                            >
                              {active ? "Current plan" : `Switch to ${item.name}`}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardBody>
                </Card>
              </section>

              <section id="settings-danger">
                <Card>
                  <CardHeader>
                    <h2 className="font-semibold text-red-600">Danger zone</h2>
                  </CardHeader>
                  <CardBody>
                    <p className="mb-4 text-sm text-zinc-500">Permanently delete your account and all data.</p>
                    <Button variant="danger" size="sm">Delete account</Button>
                  </CardBody>
                </Card>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
