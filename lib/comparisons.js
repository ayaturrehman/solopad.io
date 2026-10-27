import { getPlan, PLAN_ORDER } from "@/lib/plans";
import { absoluteUrl } from "@/lib/site";

export const COMPARISON_CHECKED_AT = "2026-10-27";

// Published vendor terms, not a hands-on product test. Keep billing basis
// alongside each price; USD and GBP are deliberately not converted.
export const COMPARISONS = {
  "honeybook-alternative": {
    name: "HoneyBook",
    title: "HoneyBook Alternative: SoloPad Pricing & Features",
    description: "Compare SoloPad and HoneyBook on pricing, proposals, contracts, payments and plan limits. Official sources and clear billing terms.",
    source: "https://www.honeybook.com/pricing",
    summary: "Compare the client document and payment journey, then check the plan required for scheduling and automation.",
    plans: [
      ["Starter", "$29/month, billed yearly", "Proposals, contracts, payments, client portal and HoneyBook AI."],
      ["Essentials", "$49/month, billed yearly", "Adds scheduling and automations."],
    ],
    considerations: ["The advertised monthly equivalent requires annual billing. Check regional checkout prices and payment processing costs.", "HoneyBook advertises a 30-day trial. Check which of its AI features fit your process during the trial."],
    fit: "Try HoneyBook if its client document flow suits your work. Include SoloPad in the trial if you want GBP subscription pricing and proposal drafting alongside invoicing.",
  },
  "dubsado-alternative": {
    name: "Dubsado",
    title: "Dubsado Alternative: SoloPad Pricing & Features",
    description: "Compare Dubsado and SoloPad with current plan pricing, workflow limits, trial terms and published sources. Check the features your business needs.",
    source: "https://www.dubsado.com/pricing",
    summary: "Dubsado separates core client administration from the scheduling and automation features on Premier.",
    plans: [
      ["Starter", "$335/year", "Invoicing, templates and client portals."],
      ["Premier", "$525/year", "Adds scheduling, automated workflows and public proposals."],
    ],
    considerations: ["Dubsado advertises a 21-day Premier trial. Check the subscription required after that trial.", "Its pricing page includes three additional users; larger user bands cost extra. Compare your actual team size."],
    fit: "Try Dubsado Premier when configuring multi-step workflows is central to your business. Compare that setup with the steps you need to complete the same project in SoloPad.",
  },
  "bonsai-alternative": {
    name: "Bonsai",
    title: "Bonsai Alternative: SoloPad Pricing & Features",
    description: "Compare Bonsai and SoloPad on per-user pricing, time tracking, invoicing and contracts. Understand Basic and Essentials before choosing.",
    source: "https://www.hellobonsai.com/pricing",
    summary: "Bonsai Basic and Essentials cover different workflows. Compare Essentials when your shortlist requires invoicing and contracts.",
    plans: [
      ["Basic", "$15/user/month; $9/user/month billed annually", "Time tracking, tasks and CRM."],
      ["Essentials", "$25/user/month; $19/user/month billed annually", "Adds invoices, payments, proposals, contracts and a client portal."],
    ],
    considerations: ["Bonsai prices these plans per user. Multiply by the seats you need and use the same billing interval when budgeting.", "Check the current feature matrix and checkout terms rather than assuming every feature is in Basic."],
    fit: "Include Bonsai if project time and billing belong in the same workflow for you. Compare its per-user total with the SoloPad plan that covers your required features.",
  },
  "moxie-alternative": {
    name: "Moxie",
    title: "Moxie Alternative: SoloPad Pricing & Features",
    description: "Compare Moxie and SoloPad on current pricing, AI, proposals, time tracking and client portals. Published sources and plan limits included.",
    source: "https://www.withmoxie.com/pricing",
    summary: "Compare Moxie Starter’s core tools with Pro’s client portal and workflow automation.",
    plans: [
      ["Starter", "$12/month; $10/month billed annually", "Proposals, contracts, time tracking, scheduling and the Moxie AI assistant."],
      ["Pro", "$25/month; $20/month billed annually", "Adds the white-label client portal, custom domain and workflow automations."],
    ],
    considerations: ["Moxie advertises a 14-day trial and lists paid Starter, Pro and Teams plans.", "Check Pro if you require a client portal. Do not budget for that feature using the Starter price."],
    fit: "Compare Moxie Starter if time tracking and scheduling matter from the start. Compare Pro and SoloPad Pro separately when custom branding is part of your brief.",
  },
  "plutio-alternative": {
    name: "Plutio",
    title: "Plutio Alternative: SoloPad Pricing & Features",
    description: "Compare Plutio and SoloPad on current plans, client limits, contributors, AI and branding. Check the full cost before switching.",
    source: "https://www.plutio.com/pricing",
    summary: "Plutio includes core business features across its plans, with client, contributor and usage allowances shaping the upgrade decision.",
    plans: [
      ["Core", "$19/month", "9 active clients, no additional contributors and 500 AI credits."],
      ["Pro", "$49/month", "Unlimited active clients and 30 contributors."],
      ["Max", "$199/month", "Unlimited contributors; white-label and single sign-on included."],
    ],
    considerations: ["Plutio advertises a seven-day trial with separate trial limits. White-label is an add-on on Core and Pro.", "Plutio includes AI. Check credit allowances and extra usage costs for the tasks you expect to run."],
    fit: "Include Plutio when contributor access and configurable workflows matter. Compare the plan allowances against the clients and people you will actually have in your workspace.",
  },
};

export function getSoloPadPlans() {
  return PLAN_ORDER.map((id) => {
    const plan = getPlan(id);
    return {
      id,
      name: plan.name,
      price: `${plan.price}/month or ${plan.annualPrice}/year`,
      fee: `${Math.round(plan.platformFee * 100)}% platform fee plus Stripe processing fees`,
      features: id === "starter"
        ? "Invoices, proposals, contracts, AI drafting and client portal."
        : id === "solo"
          ? "Starter features plus scheduling, time tracking and recurring invoices."
          : "Solo features plus custom branding, PDF template customisation and advanced reporting.",
    };
  });
}

export function comparisonMetadata(slug) {
  const comparison = COMPARISONS[slug];
  return {
    title: comparison.title,
    description: comparison.description,
    alternates: { canonical: absoluteUrl(`/compare/${slug}`) },
    openGraph: { title: comparison.title, description: comparison.description, url: absoluteUrl(`/compare/${slug}`), type: "website" },
    twitter: { card: "summary", title: comparison.title, description: comparison.description },
  };
}
