export const PLAN_CONFIG = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "1 active project, 100MB storage",
    features: ["1 active project", "100MB storage", "Client portal link", "Files & comments", "1 invoice with Stripe"],
    cta: "Start free",
  },
  solo: {
    id: "solo",
    name: "Solo",
    price: "$12",
    period: "/mo",
    annualPrice: "$10",
    annualPeriod: "/mo billed annually",
    description: "Unlimited projects, 5GB storage, teammate invites, and task assignment",
    features: ["Unlimited projects", "5GB storage", "Everything in Free", "CRM & contact management", "Proposals with AI drafting", "Payment reminders", "Time tracking", "Email notifications"],
    cta: "Get started",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/mo",
    annualPrice: "$24",
    annualPeriod: "/mo billed annually",
    description: "Unlimited projects, 20GB storage, custom branding, and advanced collaboration",
    features: ["Unlimited projects", "20GB storage", "Everything in Solo", "Contracts & e-signature", "Custom branding", "Scheduler & booking page", "Team collaboration", "PDF templates", "Finance & expense tracking"],
    cta: "Go Pro",
  },
};

export const PLAN_ORDER = ["free", "solo", "pro"];

export function isValidPlan(plan) {
  return PLAN_ORDER.includes(plan);
}

export function getPlan(plan) {
  return PLAN_CONFIG[plan] ?? PLAN_CONFIG.free;
}
