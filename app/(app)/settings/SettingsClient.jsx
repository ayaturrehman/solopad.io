"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input, { selectClassName } from "@/components/ui/Input";
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
  FileText,
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
  { id: "settings-billing", label: "Billing" },
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

function SettingsContent({ initialData }) {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();

  const [name, setName] = useState(initialData?.profile?.name ?? "");
  const [companyName, setCompanyName] = useState(initialData?.profile?.companyName ?? "");
  const [companyLogo, setCompanyLogo] = useState(initialData?.profile?.companyLogo ?? "");
  const [timezone, setTimezone] = useState(initialData?.profile?.timezone ?? "UTC");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [bizName, setBizName] = useState(initialData?.business?.name ?? "");
  const [bizLogo, setBizLogo] = useState(initialData?.business?.logoUrl ?? "");
  const [bizTimezone, setBizTimezone] = useState(initialData?.business?.timezone ?? "UTC");
  const [currency, setCurrency] = useState(initialData?.business?.currency ?? "USD");
  const [savingBiz, setSavingBiz] = useState(false);
  const [savedBiz, setSavedBiz] = useState(false);

  const [methods, setMethods] = useState(initialData?.paymentMethods ?? ["card"]);
  const [savingPayments, setSavingPayments] = useState(false);
  const [savedPayments, setSavedPayments] = useState(false);

  const [stripe, setStripe] = useState(initialData?.stripe ?? { connected: false, onboarded: false, accountId: null });
  const [disconnecting, setDisconnecting] = useState(false);

  const [members, setMembers] = useState(initialData?.members ?? []);
  const [inviteForm, setInviteForm] = useState(emptyInviteForm);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [currentPlan, setCurrentPlan] = useState(initialData?.plan ?? "free");
  const [savingPlan, setSavingPlan] = useState(false);
  const [billingData, setBillingData] = useState({ invoices: [], upcoming: null, paymentMethod: null });
  const [billingStatus, setBillingStatus] = useState(initialData?.billingStatus ?? { plan: "free", status: "active", subscription: null });
  const [billingLoading, setBillingLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);


  const stripeParam = searchParams?.get("stripe");
  const billingParam = searchParams?.get("billing");
  const plan = currentPlan || session?.user?.plan || "free";
  const userRole = session?.user?.role ?? "owner";
  const teamEnabled = canManageTeam(plan);

  // Only fetch billing data client-side (requires external Stripe API calls)
  useEffect(() => {
    Promise.all([
      fetch("/api/billing/status").then((r) => r.json()).catch(() => ({ plan: "free", status: "active", subscription: null })),
      fetch("/api/billing/invoices").then((r) => r.json()).catch(() => ({ invoices: [], upcoming: null, paymentMethod: null })),
    ]).then(([billingStatusData, billingInvoiceData]) => {
      if (billingStatusData) setBillingStatus(billingStatusData);
      if (billingInvoiceData) setBillingData(billingInvoiceData);
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

  async function saveBusiness(e) {
    e.preventDefault();
    setSavingBiz(true);

    const response = await fetch("/api/settings/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: bizName,
        logoUrl: bizLogo,
        timezone: bizTimezone,
        currency,
      }),
    });

    setSavingBiz(false);
    if (!response.ok) return;
    setSavedBiz(true);
    setTimeout(() => setSavedBiz(false), 2000);
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

    // Downgrading to free — use billing portal if they have a subscription
    if (nextPlan === "free") {
      setSavingPlan(true);
      try {
        const res = await fetch("/api/billing/portal", { method: "POST" });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      } catch {
        // fallback: just update locally
      }
      setSavingPlan(false);
      return;
    }

    // Upgrading — redirect to Stripe Checkout
    setSavingPlan(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: nextPlan, interval: "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error) {
        alert(data.error);
      }
    } catch {
      alert("Could not start checkout. Please try again.");
    }
    setSavingPlan(false);
  }

  async function openBillingPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data.error || "Could not open billing portal.");
    } catch {
      alert("Could not open billing portal. Please try again.");
    }
    setPortalLoading(false);
  }

  const ownerPermissions = TEAM_ROLE_PRESETS[userRole] ?? TEAM_ROLE_PRESETS.owner;
  const sections = activeTab === "profile" ? PROFILE_TAB_SECTIONS : SETTINGS_TAB_SECTIONS;

  return (
    <div className="space-y-6 px-4 py-4 md:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Settings</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your account, permissions, payments, and team access.</p>
        </div>
        <a
          href="/settings/pdf-templates"
          className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF Templates
        </a>
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

      {billingParam === "success" && (
        <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Subscription activated! Your plan has been upgraded.
        </div>
      )}
      {billingParam === "cancelled" && (
        <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Checkout was cancelled. No changes were made to your plan.
        </div>
      )}
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
                    <form onSubmit={saveBusiness} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Business name"
                          value={bizName}
                          onChange={(e) => setBizName(e.target.value)}
                          placeholder="Solopad Studio"
                        />
                        <Input
                          label="Timezone"
                          value={bizTimezone}
                          onChange={(e) => setBizTimezone(e.target.value)}
                          placeholder="Europe/London"
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Default currency</label>
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className={selectClassName}
                          >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                            <option value="NZD">NZD - New Zealand Dollar</option>
                            <option value="JPY">JPY - Japanese Yen</option>
                            <option value="CNY">CNY - Chinese Yuan</option>
                            <option value="HKD">HKD - Hong Kong Dollar</option>
                            <option value="TWD">TWD - Taiwan Dollar</option>
                            <option value="KRW">KRW - South Korean Won</option>
                            <option value="SGD">SGD - Singapore Dollar</option>
                            <option value="MYR">MYR - Malaysian Ringgit</option>
                            <option value="THB">THB - Thai Baht</option>
                            <option value="IDR">IDR - Indonesian Rupiah</option>
                            <option value="PHP">PHP - Philippine Peso</option>
                            <option value="VND">VND - Vietnamese Dong</option>
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="PKR">PKR - Pakistani Rupee</option>
                            <option value="BDT">BDT - Bangladeshi Taka</option>
                            <option value="LKR">LKR - Sri Lankan Rupee</option>
                            <option value="NPR">NPR - Nepalese Rupee</option>
                            <option value="AED">AED - UAE Dirham</option>
                            <option value="SAR">SAR - Saudi Riyal</option>
                            <option value="QAR">QAR - Qatari Riyal</option>
                            <option value="KWD">KWD - Kuwaiti Dinar</option>
                            <option value="BHD">BHD - Bahraini Dinar</option>
                            <option value="OMR">OMR - Omani Rial</option>
                            <option value="JOD">JOD - Jordanian Dinar</option>
                            <option value="EGP">EGP - Egyptian Pound</option>
                            <option value="TRY">TRY - Turkish Lira</option>
                            <option value="ILS">ILS - Israeli Shekel</option>
                            <option value="CHF">CHF - Swiss Franc</option>
                            <option value="NOK">NOK - Norwegian Krone</option>
                            <option value="SEK">SEK - Swedish Krona</option>
                            <option value="DKK">DKK - Danish Krone</option>
                            <option value="PLN">PLN - Polish Zloty</option>
                            <option value="CZK">CZK - Czech Koruna</option>
                            <option value="HUF">HUF - Hungarian Forint</option>
                            <option value="RON">RON - Romanian Leu</option>
                            <option value="BGN">BGN - Bulgarian Lev</option>
                            <option value="HRK">HRK - Croatian Kuna</option>
                            <option value="RUB">RUB - Russian Ruble</option>
                            <option value="UAH">UAH - Ukrainian Hryvnia</option>
                            <option value="ZAR">ZAR - South African Rand</option>
                            <option value="NGN">NGN - Nigerian Naira</option>
                            <option value="KES">KES - Kenyan Shilling</option>
                            <option value="GHS">GHS - Ghanaian Cedi</option>
                            <option value="TZS">TZS - Tanzanian Shilling</option>
                            <option value="UGX">UGX - Ugandan Shilling</option>
                            <option value="ETB">ETB - Ethiopian Birr</option>
                            <option value="MAD">MAD - Moroccan Dirham</option>
                            <option value="BRL">BRL - Brazilian Real</option>
                            <option value="MXN">MXN - Mexican Peso</option>
                            <option value="ARS">ARS - Argentine Peso</option>
                            <option value="CLP">CLP - Chilean Peso</option>
                            <option value="COP">COP - Colombian Peso</option>
                            <option value="PEN">PEN - Peruvian Sol</option>
                          </select>
                        </div>
                      </div>
                      <Input
                        label="Logo URL"
                        value={bizLogo}
                        onChange={(e) => setBizLogo(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                      <Button type="submit" loading={savingBiz} size="sm">
                        {savedBiz ? <><Check className="h-4 w-4" /> Saved</> : "Save business details"}
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
                          className={selectClassName}
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
                        <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2">
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
                          className="inline-flex items-center gap-2 rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
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
                      <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
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

              <section id="settings-billing">
                <Card>
                  <CardHeader>
                    <h2 className="font-semibold text-zinc-900">Billing</h2>
                  </CardHeader>
                  <CardBody className="space-y-5">
                    {billingStatus.plan === "free" && !billingData.invoices?.length ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-zinc-500 mb-3">No billing history. Upgrade to a paid plan to get started.</p>
                        <Button size="sm" variant="primary" onClick={() => {
                          document.getElementById("settings-plan")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}>
                          View plans
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Plan summary */}
                        <div className="flex items-center justify-between rounded border border-zinc-200 p-4">
                          <div>
                            <p className="text-sm font-medium text-zinc-900 capitalize">{billingStatus.plan} Plan</p>
                            <p className="text-xs text-zinc-500">
                              Status: <span className={`font-medium ${billingStatus.status === "active" ? "text-green-600" : billingStatus.status === "past_due" ? "text-red-600" : "text-zinc-500"}`}>
                                {billingStatus.status === "active" ? "Active" : billingStatus.status === "past_due" ? "Past due" : billingStatus.status === "canceled" ? "Canceled" : billingStatus.status}
                              </span>
                            </p>
                            {billingStatus.subscription?.currentPeriodEnd && (
                              <p className="text-xs text-zinc-400 mt-1">
                                {billingStatus.subscription.cancelAtPeriodEnd
                                  ? `Cancels on ${new Date(billingStatus.subscription.currentPeriodEnd).toLocaleDateString()}`
                                  : `Renews ${new Date(billingStatus.subscription.currentPeriodEnd).toLocaleDateString()}`
                                }
                              </p>
                            )}
                          </div>
                          <Button size="sm" variant="secondary" loading={portalLoading} onClick={openBillingPortal}>
                            Manage
                          </Button>
                        </div>

                        {/* Payment method */}
                        {billingData.paymentMethod && (
                          <div className="flex items-center justify-between rounded border border-zinc-200 p-4">
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-5 w-5 text-zinc-400" />
                              <div>
                                <p className="text-sm font-medium text-zinc-900 capitalize">{billingData.paymentMethod.brand} •••• {billingData.paymentMethod.last4}</p>
                                <p className="text-xs text-zinc-400">Expires {billingData.paymentMethod.expMonth}/{billingData.paymentMethod.expYear}</p>
                              </div>
                            </div>
                            <button onClick={openBillingPortal} className="text-xs text-blue-600 hover:underline">Update</button>
                          </div>
                        )}

                        {/* Upcoming charge */}
                        {billingData.upcoming && (
                          <div className="rounded border border-zinc-200 p-4">
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Next charge</p>
                            <p className="text-sm font-medium text-zinc-900">
                              ${billingData.upcoming.amount?.toFixed(2)} {billingData.upcoming.currency}
                              {billingData.upcoming.date && <span className="text-zinc-400 font-normal"> on {new Date(billingData.upcoming.date).toLocaleDateString()}</span>}
                            </p>
                            {billingData.upcoming.discount && (
                              <p className="text-xs text-green-600 mt-1">
                                Discount: {billingData.upcoming.discount.code}
                                {billingData.upcoming.discount.percentOff ? ` (${billingData.upcoming.discount.percentOff}% off)` : ""}
                                {billingData.upcoming.discount.amountOff ? ` ($${billingData.upcoming.discount.amountOff} off)` : ""}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Invoice history */}
                        {billingData.invoices?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Invoice History</p>
                            <div className="divide-y divide-zinc-100 rounded border border-zinc-200">
                              {billingData.invoices.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                                  <div>
                                    <p className="text-sm text-zinc-900">{inv.description}</p>
                                    <p className="text-xs text-zinc-400">{inv.date ? new Date(inv.date).toLocaleDateString() : ""} · {inv.number}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`text-sm font-medium ${inv.status === "paid" ? "text-green-600" : inv.status === "open" ? "text-amber-600" : "text-red-600"}`}>
                                      ${inv.amount?.toFixed(2)}
                                    </span>
                                    {inv.receiptUrl && (
                                      <a href={inv.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                        PDF
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
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

export default function SettingsClient({ initialData }) {
  return (
    <Suspense>
      <SettingsContent initialData={initialData} />
    </Suspense>
  );
}
