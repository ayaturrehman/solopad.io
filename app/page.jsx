import Link from "next/link";
import { Zap, FileText, MessageSquare, CreditCard, ArrowRight, Check } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Files & Deliverables",
    desc: "Upload files to your project. Clients download the latest version instantly.",
  },
  {
    icon: MessageSquare,
    title: "Comment Thread",
    desc: "Keep feedback in one place. No more hunting through emails for that note.",
  },
  {
    icon: CreditCard,
    title: "Invoice & Pay",
    desc: "Create an invoice. Client pays via card — right on the portal page.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    features: ["1 active project", "100MB storage", "Portal link", "Files & comments", "1 invoice"],
    cta: "Start free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Solo",
    price: "$9",
    period: "/mo",
    features: ["Unlimited projects", "5GB storage", "Everything in Free", "Payment reminders", "Email notifications"],
    cta: "Get started",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    features: ["Unlimited projects", "20GB storage", "Everything in Solo", "Custom branding", "Contract & e-sign"],
    cta: "Go Pro",
    href: "/signup",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-zinc-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">PortalKit</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
          The HoneyBook alternative at $9/mo
        </div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-zinc-900">
          One link. <br />
          <span className="text-zinc-400">Your client sees everything.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-lg text-lg text-zinc-500">
          Send clients one link. They see project status, files, feedback, and invoices — without logging in.
          Set up in 10 minutes. Stop chasing.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-700"
          >
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
            Already have an account?
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">
            Everything your client needs. Nothing they don&apos;t.
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                  <Icon className="h-5 w-5 text-zinc-700" />
                </div>
                <h3 className="mb-2 font-semibold text-zinc-900">{title}</h3>
                <p className="text-sm text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-zinc-900">Simple pricing</h2>
          <p className="mb-12 text-center text-zinc-500">No transaction fees. No surprises.</p>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 ${
                  plan.highlight
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <div className="mb-4">
                  <p className={`text-sm font-medium ${plan.highlight ? "text-zinc-400" : "text-zinc-500"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={`mb-1 text-sm ${plan.highlight ? "text-zinc-400" : "text-zinc-400"}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className={`h-4 w-4 shrink-0 ${plan.highlight ? "text-zinc-300" : "text-zinc-400"}`} />
                      <span className={plan.highlight ? "text-zinc-200" : "text-zinc-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${
                    plan.highlight
                      ? "bg-white text-zinc-900 hover:bg-zinc-100"
                      : "bg-zinc-900 text-white hover:bg-zinc-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
        © 2026 PortalKit. Built for freelancers who want to get paid.
      </footer>
    </div>
  );
}
