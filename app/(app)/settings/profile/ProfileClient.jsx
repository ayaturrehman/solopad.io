"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input, { selectClassName } from "@/components/ui/Input";
import { Check } from "lucide-react";

const CURRENCIES = [
  "USD", "EUR", "GBP", "CAD", "AUD", "NZD", "JPY", "CNY", "HKD", "TWD",
  "KRW", "SGD", "MYR", "THB", "IDR", "PHP", "VND", "INR", "PKR", "BDT",
  "LKR", "NPR", "AED", "SAR", "QAR", "KWD", "BHD", "OMR", "JOD", "EGP",
  "TRY", "ILS", "CHF", "NOK", "SEK", "DKK", "PLN", "CZK", "HUF", "RON",
  "BGN", "HRK", "RUB", "UAH", "ZAR", "NGN", "KES", "GHS", "TZS", "UGX",
  "ETB", "MAD", "BRL", "MXN", "ARS", "CLP", "COP", "PEN",
];

const CURRENCY_LABELS = {
  USD: "US Dollar", EUR: "Euro", GBP: "British Pound", CAD: "Canadian Dollar",
  AUD: "Australian Dollar", NZD: "New Zealand Dollar", JPY: "Japanese Yen",
  CNY: "Chinese Yuan", HKD: "Hong Kong Dollar", TWD: "Taiwan Dollar",
  KRW: "South Korean Won", SGD: "Singapore Dollar", MYR: "Malaysian Ringgit",
  THB: "Thai Baht", IDR: "Indonesian Rupiah", PHP: "Philippine Peso",
  VND: "Vietnamese Dong", INR: "Indian Rupee", PKR: "Pakistani Rupee",
  BDT: "Bangladeshi Taka", LKR: "Sri Lankan Rupee", NPR: "Nepalese Rupee",
  AED: "UAE Dirham", SAR: "Saudi Riyal", QAR: "Qatari Riyal",
  KWD: "Kuwaiti Dinar", BHD: "Bahraini Dinar", OMR: "Omani Rial",
  JOD: "Jordanian Dinar", EGP: "Egyptian Pound", TRY: "Turkish Lira",
  ILS: "Israeli Shekel", CHF: "Swiss Franc", NOK: "Norwegian Krone",
  SEK: "Swedish Krona", DKK: "Danish Krone", PLN: "Polish Zloty",
  CZK: "Czech Koruna", HUF: "Hungarian Forint", RON: "Romanian Leu",
  BGN: "Bulgarian Lev", HRK: "Croatian Kuna", RUB: "Russian Ruble",
  UAH: "Ukrainian Hryvnia", ZAR: "South African Rand", NGN: "Nigerian Naira",
  KES: "Kenyan Shilling", GHS: "Ghanaian Cedi", TZS: "Tanzanian Shilling",
  UGX: "Ugandan Shilling", ETB: "Ethiopian Birr", MAD: "Moroccan Dirham",
  BRL: "Brazilian Real", MXN: "Mexican Peso", ARS: "Argentine Peso",
  CLP: "Chilean Peso", COP: "Colombian Peso", PEN: "Peruvian Sol",
};

export default function ProfileClient({ profile, business }) {
  const { data: session, update } = useSession();

  const [name, setName] = useState(profile.name);
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [companyLogo, setCompanyLogo] = useState(profile.companyLogo);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [bizName, setBizName] = useState(business?.name ?? "");
  const [bizLogo, setBizLogo] = useState(business?.logoUrl ?? "");
  const [bizTimezone, setBizTimezone] = useState(business?.timezone ?? "UTC");
  const [currency, setCurrency] = useState(business?.currency ?? "USD");
  const [savingBiz, setSavingBiz] = useState(false);
  const [savedBiz, setSavedBiz] = useState(false);

  const currentName = name || session?.user?.name || "";
  const userRole = profile.role;

  async function saveProfile(e) {
    e.preventDefault();
    const trimmedName = currentName.trim();
    if (!trimmedName) return;

    setSaving(true);
    const response = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmedName, companyName, companyLogo, timezone }),
    });

    if (response.ok) {
      await update({
        ...session,
        user: { ...session?.user, name: trimmedName, companyName, companyLogo, timezone },
      });
      setName(trimmedName);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  async function saveBusiness(e) {
    e.preventDefault();
    setSavingBiz(true);
    const response = await fetch("/api/settings/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: bizName, logoUrl: bizLogo, timezone: bizTimezone, currency }),
    });
    setSavingBiz(false);
    if (response.ok) {
      setSavedBiz(true);
      setTimeout(() => setSavedBiz(false), 2000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-zinc-900">Profile</h2>
          <p className="mt-0.5 text-xs text-zinc-400">Your personal account details.</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Your name" value={currentName} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" />
              <Input label="Email" value={session?.user?.email ?? profile.email} disabled />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Role</p>
                <p className="mt-1 text-sm font-medium capitalize text-zinc-900">{userRole}</p>
              </div>
              <Input label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Europe/London" />
            </div>

            <Button type="submit" loading={saving} size="sm">
              {saved ? <><Check className="h-4 w-4" /> Saved</> : "Save profile"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-zinc-900">Business Details</h2>
          <p className="mt-0.5 text-xs text-zinc-400">Your business identity shown on invoices and proposals.</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={saveBusiness} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Business name" value={bizName} onChange={(e) => setBizName(e.target.value)} placeholder="Solopad Studio" />
              <Input label="Timezone" value={bizTimezone} onChange={(e) => setBizTimezone(e.target.value)} placeholder="Europe/London" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">Default currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClassName}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c} - {CURRENCY_LABELS[c] || c}</option>
                  ))}
                </select>
              </div>
              <Input label="Logo URL" value={bizLogo} onChange={(e) => setBizLogo(e.target.value)} placeholder="https://example.com/logo.png" />
            </div>

            <Button type="submit" loading={savingBiz} size="sm">
              {savedBiz ? <><Check className="h-4 w-4" /> Saved</> : "Save business details"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
