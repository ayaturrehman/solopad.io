export const metadata = {
  title: "Features — Invoices, Contracts, Proposals, CRM & More",
  description:
    "SoloPad gives freelancers invoicing, contracts with e-signatures, AI-drafted proposals, CRM, scheduling, time tracking & a client portal — all in one app starting at £5/mo.",
  alternates: { canonical: "https://www.solopad.io/features" },
  openGraph: {
    title: "Features — Everything You Need to Run Your Freelance Business",
    description:
      "Invoicing, contracts with e-signatures, AI-drafted proposals, CRM, scheduling, time tracking & a client portal — starting at £5/mo.",
    url: "https://www.solopad.io/features",
    type: "website",
  },
};

const C = "#1D4ED8";
const CLt = "#EFF6FF";
const O = "#EA580C";
const OLt = "#FFF7ED";
const V = "#7C3AED";
const VLt = "#F5F3FF";
const G = "#059669";
const GLt = "#ECFDF5";
const CDk = "#111111";
const CMute = "#777777";

function Check() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 5.5L4 7.5L8 3" stroke={C} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckRow({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: CDk, lineHeight: 1.55 }}>
      <div
        style={{
          width: 20, height: 20, borderRadius: "50%", background: `${C}15`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
        }}
      >
        <Check />
      </div>
      <span>{children}</span>
    </div>
  );
}

function SectionLabel({ color, children }) {
  return (
    <p style={{ fontSize: 12, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>
      {children}
    </p>
  );
}

function SectionHeading({ children }) {
  return (
    <h2 style={{ fontSize: "clamp(28px, 3.6vw, 44px)", fontWeight: 700, color: CDk, lineHeight: 1.1, letterSpacing: "-0.8px", marginBottom: 18 }}>
      {children}
    </h2>
  );
}

function SectionBody({ children }) {
  return <p style={{ fontSize: 16, color: CMute, lineHeight: 1.72, marginBottom: 28 }}>{children}</p>;
}

export default function FeaturesPage() {
  const features = [
    {
      id: "proposals",
      label: "Proposals",
      color: C,
      bg: "#fff",
      title: "Win the job before your competitor replies.",
      body: "Send a stunning branded proposal in minutes — not hours. AI drafts it from a one-line brief. Your client gets a live link, reviews the scope and pricing, and accepts with one click. No Word docs, no attachments, no back-and-forth.",
      bullets: [
        "AI drafts your proposal from a one-line brief",
        "Client accepts with one click — zero back-and-forth",
        "Auto-converts to a contract once approved",
        "Add line items, milestones, and payment schedules",
      ],
    },
    {
      id: "contracts",
      label: "Contracts & E-Signature",
      color: O,
      bg: OLt,
      title: "Protect yourself. Get signed in seconds.",
      body: "A handshake deal is not a contract. Send legally binding agreements with built-in e-signature. Clients sign in seconds on any device — no printers, no PDFs, no third-party tools. Every contract links back to your proposal for a seamless workflow.",
      bullets: [
        "Pre-built templates — just fill in the blanks",
        "Legally binding e-signature, no third-party tools",
        "Linked to your proposal — one seamless workflow",
        "AI drafts contracts from your project details",
      ],
    },
    {
      id: "invoices",
      label: "Invoicing & Payments",
      color: C,
      bg: "#fff",
      title: "Send invoices. Get paid. No chasing.",
      body: "Create professional line-item invoices in under a minute. Clients pay online with card, Apple Pay, or Google Pay. Money goes directly to your bank account within 2-3 business days. Set up recurring invoices for retainer clients and never chase a payment again.",
      bullets: [
        "Professional invoices with your branding",
        "Clients pay online — card, Apple Pay, Google Pay",
        "Recurring invoices for retainer clients",
        "Automatic payment reminders and receipts",
      ],
    },
    {
      id: "client-portal",
      label: "Client Portal",
      color: V,
      bg: VLt,
      title: "One link. Everything your client needs.",
      body: "Every client gets a private portal where they can view proposals, sign contracts, pay invoices, upload files, and check project progress. No more digging through email threads — everything is in one place, always up to date.",
      bullets: [
        "Branded portal with your logo and colours",
        "Clients view, sign, and pay — all in one place",
        "File sharing with unlimited uploads",
        "Real-time project status and updates",
      ],
    },
    {
      id: "ai-drafting",
      label: "AI Drafting",
      color: C,
      bg: CLt,
      title: "Describe the job. AI writes the rest.",
      body: "Tell SoloPad what the project is in a sentence. AI drafts your proposal, contract, or invoice with the right scope, terms, and pricing. Review it, tweak anything you want, and send. What used to take an hour takes two minutes.",
      bullets: [
        "AI-generated proposals from a one-line brief",
        "AI-generated contracts with sensible default terms",
        "Understands freelance project scoping and pricing",
        "You stay in control — edit everything before sending",
      ],
    },
    {
      id: "crm",
      label: "CRM & Contacts",
      color: G,
      bg: GLt,
      title: "Know every client. Never drop the ball.",
      body: "Track every client, every project, every interaction in one place. See at a glance who owes you money, who needs a follow-up, and which projects are active. No more spreadsheets pretending to be a CRM.",
      bullets: [
        "Client profiles with full project history",
        "Pipeline view — see every deal at a glance",
        "Contact notes, tags, and custom fields",
        "Quick filters to find anyone instantly",
      ],
    },
    {
      id: "scheduling",
      label: "Scheduler & Booking",
      color: O,
      bg: OLt,
      title: "Let clients book you. Stop the email tennis.",
      body: "Share your booking page link. Clients pick a time that works for both of you. No more 'are you free Tuesday?' emails. Automatic confirmations, reminders, and timezone handling built in.",
      bullets: [
        "Personal booking page with your availability",
        "Automatic confirmations and reminders",
        "Timezone-aware — works for international clients",
        "Embed on your website or share a direct link",
      ],
    },
    {
      id: "time-tracking",
      label: "Time Tracking",
      color: V,
      bg: "#fff",
      title: "Track every hour. Bill every minute.",
      body: "Start a timer or log hours manually — linked to the project so nothing gets lost. When it's time to invoice, your tracked hours are ready to attach. See exactly where your time goes with detailed reports.",
      bullets: [
        "One-click timer or manual time entry",
        "Linked to projects — auto-attaches to invoices",
        "Detailed reports by client, project, or date range",
        "See your effective hourly rate across projects",
      ],
    },
    {
      id: "tasks",
      label: "Tasks & To-Do",
      color: C,
      bg: CLt,
      title: "Stay on top of every project.",
      body: "Create tasks, set deadlines, and track what needs doing across all your projects. Simple, focused project management built for solo freelancers — not bloated enterprise software with features you'll never use.",
      bullets: [
        "Task lists linked to each project",
        "Due dates and priority levels",
        "Quick-add from anywhere in the app",
        "See all tasks across projects in one view",
      ],
    },
    {
      id: "finance",
      label: "Finance & Expenses",
      color: G,
      bg: GLt,
      title: "Know your numbers. Own your money.",
      body: "Track income and expenses in one place. See profit by project, spot your best clients, and stop guessing what you actually earned this month. Upload receipts and categorise expenses for clean bookkeeping.",
      bullets: [
        "Income and expense tracking in one dashboard",
        "Profit-per-project breakdown",
        "Receipt uploads and expense categories",
        "Export-ready reports for your accountant",
      ],
    },
  ];

  const faqItems = [
    {
      q: "What features are included on the Starter plan?",
      a: "The Starter plan at £5/mo includes unlimited projects, unlimited invoices, basic proposals, basic contracts, finance and expense tracking, tasks and to-do, AI drafting for proposals and contracts, e-signature workflows, a client portal, and unlimited file uploads.",
    },
    {
      q: "Do I need separate tools for contracts or invoicing?",
      a: "No. SoloPad replaces your proposal tool, contract tool, invoicing tool, and client portal with one integrated app. Everything flows together — proposal to contract to invoice — without switching between different subscriptions.",
    },
    {
      q: "How does AI drafting work?",
      a: "Describe your project in a sentence or two. SoloPad's AI generates a complete proposal or contract with appropriate scope, terms, timeline, and pricing. You review everything, make any edits you want, and send. The AI handles the first draft so you can focus on the details that matter.",
    },
    {
      q: "How do I get paid through SoloPad?",
      a: "Connect your bank account in Settings — it takes 2 minutes. When clients pay your invoices online (card, Apple Pay, Google Pay), money is deposited directly to your bank within 2-3 business days. No separate accounts needed.",
    },
    {
      q: "Can I try SoloPad before paying?",
      a: "Yes. Every plan starts with a 30-day free trial, and you can cancel anytime. No credit card required to start.",
    },
    {
      q: "What if I need features from a higher plan later?",
      a: "You can upgrade anytime from your account settings. Your data carries over — nothing gets lost. Plans start at £5/mo for Starter, £12/mo for Solo (adds scheduling, CRM, time tracking, and recurring invoices), and £29/mo for Pro (adds team collaboration, custom branding, and advanced reporting).",
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s ease-out forwards; }
        .fade-up-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .fade-up-delay-2 { animation-delay: 0.2s; opacity: 0; }
        .fade-up-delay-3 { animation-delay: 0.3s; opacity: 0; }

        .feat-section { padding: 100px 0; position: relative; }
        .feat-inner { max-width: 88%; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .feat-inner-reverse { direction: rtl; }
        .feat-inner-reverse > * { direction: ltr; }
        @media (max-width: 860px) {
          .feat-inner { grid-template-columns: 1fr; gap: 40px; }
          .feat-inner-reverse { direction: ltr; }
        }

        .feat-card {
          background: #fff;
          border: 1px solid #EBEBEB;
          border-radius: 16px;
          padding: 32px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .feat-card:hover {
          box-shadow: 0 12px 40px rgba(0,0,0,.08);
          transform: translateY(-3px);
        }

        .features-grid-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          max-width: 88%;
          margin: 0 auto;
        }

        .overview-card {
          background: #fff;
          border: 1px solid #EBEBEB;
          border-radius: 16px;
          padding: 28px;
          transition: box-shadow 0.2s, transform 0.2s;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .overview-card:hover {
          box-shadow: 0 12px 40px rgba(0,0,0,.08);
          transform: translateY(-3px);
        }
      `}} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                name: "SoloPad Features",
                description: "All features included in SoloPad — the all-in-one freelance management platform.",
                url: "https://www.solopad.io/features",
                publisher: {
                  "@type": "Organization",
                  name: "SoloPad",
                  url: "https://www.solopad.io",
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: "https://www.solopad.io" },
                  { "@type": "ListItem", position: 2, name: "Features", item: "https://www.solopad.io/features" },
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: faqItems.map((item) => ({
                  "@type": "Question",
                  name: item.q,
                  acceptedAnswer: { "@type": "Answer", text: item.a },
                })),
              },
            ],
          }),
        }}
      />

      {/* ── Hero ──────────────────────────────────── */}
      <section style={{ background: "#F8FAFC", padding: "100px 0 80px", textAlign: "center" }}>
        <div style={{ maxWidth: "88%", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: 32 }}>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", justifyContent: "center", gap: 8, fontSize: 13, color: CMute }}>
              <li><a href="/" style={{ color: CMute, textDecoration: "none" }}>Home</a></li>
              <li>/</li>
              <li style={{ color: CDk, fontWeight: 600 }}>Features</li>
            </ol>
          </nav>

          <h1
            className="fade-up"
            style={{
              fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 700, color: CDk,
              lineHeight: 1.06, letterSpacing: "-2px", marginBottom: 20, maxWidth: 800, margin: "0 auto 20px",
            }}
          >
            Everything you need to run your freelance business
          </h1>
          <p
            className="fade-up fade-up-delay-1"
            style={{ fontSize: 18, color: CMute, lineHeight: 1.7, maxWidth: 640, margin: "0 auto 36px" }}
          >
            Proposals, contracts, invoices, scheduling, time tracking, CRM, and a client portal — all connected, all in one app. Starting at £5/mo.
          </p>
          <div className="fade-up fade-up-delay-2" style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a href="/signup" style={{
              background: C, color: "#fff", border: "none", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 8,
              borderRadius: 10, padding: "13px 26px", fontSize: 15, fontWeight: 700,
              textDecoration: "none",
            }}>
              Start your free trial
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="/#pricing" style={{
              background: "#fff", color: CDk, border: "1.5px solid #DEDEDE", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 8,
              borderRadius: 10, padding: "12px 24px", fontSize: 15, fontWeight: 600,
              textDecoration: "none",
            }}>
              View pricing
            </a>
          </div>
        </div>
      </section>

      {/* ── Quick Overview Grid ───────────────────── */}
      <section style={{ padding: "80px 0 40px" }}>
        <div style={{ maxWidth: "88%", margin: "0 auto", textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
            All-in-one platform
          </p>
          <h2 style={{ fontSize: "clamp(26px, 3.2vw, 40px)", fontWeight: 700, color: CDk, lineHeight: 1.1, letterSpacing: "-0.6px" }}>
            Replace 6+ tools with one
          </h2>
        </div>
        <div className="features-grid-overview">
          {[
            { icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", label: "Proposals", desc: "AI-drafted proposals that convert. Send a live link, get accepted in one click.", color: C, bg: CLt },
            { icon: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11", label: "Contracts & E-Sign", desc: "Legally binding contracts with built-in e-signature. No third-party tools.", color: O, bg: OLt },
            { icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6", label: "Invoicing", desc: "Professional invoices. Clients pay online. Money in your bank in 2-3 days.", color: C, bg: CLt },
            { icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75", label: "CRM & Contacts", desc: "Track clients, projects, and pipeline. Stop using spreadsheets as a CRM.", color: G, bg: GLt },
            { icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2", label: "Time Tracking", desc: "Track hours, link to projects, auto-attach to invoices. See where your time goes.", color: V, bg: VLt },
            { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Scheduling", desc: "Booking page for clients. No more email tennis to find a time.", color: O, bg: OLt },
            { icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", label: "Client Portal", desc: "One link where clients view, sign, pay, and upload files.", color: V, bg: VLt },
            { icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", label: "AI Drafting", desc: "Describe the job in one sentence. AI writes the proposal or contract.", color: C, bg: CLt },
            { icon: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", label: "Finance & Expenses", desc: "Track income, expenses, and profit per project. Export for your accountant.", color: G, bg: GLt },
          ].map((item) => (
            <a key={item.label} href={`#${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="overview-card">
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: item.bg,
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: CDk, marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 14, color: CMute, lineHeight: 1.6 }}>{item.desc}</div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Feature Detail Sections ───────────────── */}
      {features.map((feat, i) => {
        const isReversed = i % 2 === 1;
        return (
          <section
            key={feat.id}
            id={feat.id}
            className="feat-section"
            style={{ background: feat.bg }}
          >
            <div className={`feat-inner${isReversed ? " feat-inner-reverse" : ""}`}>
              {/* Copy side */}
              <div>
                <SectionLabel color={feat.color}>{feat.label}</SectionLabel>
                <SectionHeading>{feat.title}</SectionHeading>
                <SectionBody>{feat.body}</SectionBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  {feat.bullets.map((b) => (
                    <CheckRow key={b}>{b}</CheckRow>
                  ))}
                </div>
              </div>

              {/* Visual side — minimal mockup card */}
              <div className="feat-card" style={{ borderColor: `${feat.color}20` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: feat.color === C ? CLt : feat.color === O ? OLt : feat.color === V ? VLt : GLt,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: feat.color, opacity: 0.6 }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: CDk }}>{feat.label}</div>
                </div>
                {feat.bullets.map((b, j) => (
                  <div key={j} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 0",
                    borderBottom: j < feat.bullets.length - 1 ? "1px solid #F1F5F9" : "none",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill={`${feat.color}15`} />
                      <path d="M5 8.5L7 10.5L11 6" stroke={feat.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 14, color: CDk }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ── Pricing CTA ───────────────────────────── */}
      <section style={{ padding: "100px 0", textAlign: "center" }}>
        <div style={{ maxWidth: "88%", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 3.6vw, 44px)", fontWeight: 700, color: CDk, lineHeight: 1.1, letterSpacing: "-0.8px", marginBottom: 16 }}>
            All of this. Starting at £5/mo.
          </h2>
          <p style={{ fontSize: 16, color: CMute, lineHeight: 1.72, maxWidth: 560, margin: "0 auto 36px" }}>
            Every plan includes a 30-day free trial. No credit card required. Cancel anytime.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 48 }}>
            {[
              { name: "Starter", price: "£5", desc: "Everything you need to start" },
              { name: "Solo", price: "£12", desc: "Automate and grow faster" },
              { name: "Pro", price: "£29", desc: "Scale with your team" },
            ].map((plan) => (
              <div key={plan.name} style={{
                background: "#fff", border: plan.name === "Solo" ? `2px solid ${C}` : "1px solid #EBEBEB",
                borderRadius: 16, padding: "28px 32px", minWidth: 200, textAlign: "center",
                boxShadow: plan.name === "Solo" ? `0 8px 32px ${C}18` : "none",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.name === "Solo" ? C : CMute, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: CDk, marginBottom: 4 }}>
                  {plan.price}<span style={{ fontSize: 16, fontWeight: 500, color: CMute }}>/mo</span>
                </div>
                <div style={{ fontSize: 13, color: CMute }}>{plan.desc}</div>
              </div>
            ))}
          </div>
          <a href="/signup" style={{
            background: C, color: "#fff", border: "none", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 8,
            borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 700,
            textDecoration: "none",
          }}>
            Start your 30-day free trial
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────── */}
      <section style={{ background: "#F8FAFC", padding: "80px 0 100px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 700, color: CDk, lineHeight: 1.1, marginBottom: 40, textAlign: "center" }}>
            Frequently asked questions
          </h2>
          {faqItems.map((item, i) => (
            <details
              key={i}
              style={{
                borderBottom: "1px solid #E2E8F0",
                padding: "20px 0",
              }}
            >
              <summary style={{
                fontSize: 16, fontWeight: 600, color: CDk, cursor: "pointer",
                listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                {item.q}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginLeft: 12 }}>
                  <path d="M4 6l4 4 4-4" stroke={CMute} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <p style={{ fontSize: 15, color: CMute, lineHeight: 1.7, marginTop: 12, paddingRight: 24 }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────── */}
      <section style={{ padding: "80px 0 100px" }}>
        <div style={{
          maxWidth: "88%", margin: "0 auto",
          background: "#1E3A8A", borderRadius: 28, padding: "72px 48px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-50%", left: "-25%", width: "150%", height: "200%",
            background: "radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <h2 style={{
            fontSize: "clamp(28px, 3.6vw, 44px)", fontWeight: 700, color: "#fff",
            lineHeight: 1.1, letterSpacing: "-0.8px", marginBottom: 16, position: "relative",
          }}>
            Stop juggling tools. Start running your business.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.72, maxWidth: 520, margin: "0 auto 32px", position: "relative" }}>
            Join freelancers who replaced 6+ subscriptions with one app that actually works together.
          </p>
          <a href="/signup" style={{
            background: "#fff", color: "#1E3A8A", border: "none", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 8,
            borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 700,
            textDecoration: "none", position: "relative",
          }}>
            Start your free trial
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </section>
    </>
  );
}
