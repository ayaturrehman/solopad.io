export const PLAN_CONFIG = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "1 active project, 100MB storage",
    features: ["1 active project", "100MB storage", "Portal link", "Files & comments", "1 invoice"],
    cta: "Start free",
  },
  solo: {
    id: "solo",
    name: "Solo",
    price: "$9",
    period: "/mo",
    description: "Unlimited projects, 5GB storage, teammate invites, and task assignment",
    features: ["Unlimited projects", "5GB storage", "Everything in Free", "Payment reminders", "Email notifications"],
    cta: "Get started",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "Unlimited projects, 20GB storage, custom branding, and advanced collaboration",
    features: ["Unlimited projects", "20GB storage", "Everything in Solo", "Custom branding", "Contract & e-sign"],
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
