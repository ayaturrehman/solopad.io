import Link from "next/link";

export const metadata = {
  title: "Compare SoloPad vs HoneyBook, Dubsado & More",
  description:
    "See how SoloPad compares to HoneyBook, Dubsado, Bonsai, Moxie, and Plutio on price and features for freelancers.",
  alternates: { canonical: "https://www.solopad.io/compare" },
  openGraph: {
    title: "Compare SoloPad vs HoneyBook, Dubsado & More",
    description:
      "See how SoloPad compares to HoneyBook, Dubsado, Bonsai, Moxie, and Plutio on price and features for freelancers.",
    url: "https://www.solopad.io/compare",
    siteName: "SoloPad",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const comparisons = [
  {
    slug: "honeybook-alternative",
    name: "HoneyBook",
    blurb:
      "HoneyBook starts at $19/mo and adds fees as you grow. See why freelancers switch to SoloPad's flat £5/mo plan.",
  },
  {
    slug: "dubsado-alternative",
    name: "Dubsado",
    blurb:
      "Dubsado's workflow builder has a steep learning curve. Compare setup time, pricing, and core features side by side.",
  },
  {
    slug: "bonsai-alternative",
    name: "Bonsai",
    blurb:
      "Bonsai's Basic plan excludes invoicing and contracts. See what's actually included at each price tier.",
  },
  {
    slug: "moxie-alternative",
    name: "Moxie",
    blurb:
      "Moxie bundles community features most freelancers don't use. Compare the tools you'll actually open every day.",
  },
  {
    slug: "plutio-alternative",
    name: "Plutio",
    blurb:
      "Plutio is built for agencies with big teams. See how it stacks up for solo freelancers and small teams.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: "SoloPad Comparisons",
      description:
        "Compare SoloPad to HoneyBook, Dubsado, Bonsai, Moxie, and Plutio on price and features.",
      url: "https://www.solopad.io/compare",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.solopad.io" },
        { "@type": "ListItem", position: 2, name: "Compare", item: "https://www.solopad.io/compare" },
      ],
    },
  ],
};

export default function ComparePage() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .compare-page {
              --cp-fg: #111;
              --cp-muted: #666;
              --cp-faint: #999;
              --cp-card: #F8FAFC;
              --cp-card-border: #F1F5F9;
              --cp-surface: #FFFFFF;
              --cp-hero-bg: linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%);
              --cp-hero-border: #DBEAFE;
              --cp-cta-bg: #EFF6FF;
              --cp-accent: #2563EB;
            }
            html[data-theme="dark"] .compare-page {
              --cp-fg: #f4f4f5;
              --cp-muted: #a1a1aa;
              --cp-faint: #71717a;
              --cp-card: #18181b;
              --cp-card-border: #27272a;
              --cp-surface: #111113;
              --cp-hero-bg: linear-gradient(135deg, #111827 0%, #18181b 100%);
              --cp-hero-border: #1e3a5f;
              --cp-cta-bg: rgba(37,99,235,0.18);
              --cp-accent: #60a5fa;
            }
            .compare-card {
              transition: transform 0.2s ease, border-color 0.2s ease;
            }
            .compare-card:hover {
              transform: translateY(-4px);
              border-color: var(--cp-hero-border) !important;
            }
          `,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="compare-page">
        <section
          style={{
            background: "var(--cp-hero-bg)",
            borderBottom: "1px solid var(--cp-hero-border)",
            padding: "60px 20px",
          }}
        >
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <nav style={{ marginBottom: 40 }}>
              <Link href="/" style={{ color: "var(--cp-accent)", textDecoration: "none", fontSize: 14 }}>
                Home
              </Link>
              <span style={{ color: "var(--cp-faint)", margin: "0 8px" }}>/</span>
              <span style={{ color: "var(--cp-muted)", fontSize: 14 }}>Compare</span>
            </nav>

            <h1 style={{ fontSize: 48, fontWeight: 700, color: "var(--cp-fg)", margin: "0 0 16px 0", lineHeight: 1.2 }}>
              SoloPad Comparisons
            </h1>
            <p style={{ fontSize: 20, color: "var(--cp-muted)", margin: "0 0 20px 0", lineHeight: 1.6, maxWidth: 720 }}>
              Freelance management tools all promise the same thing. Here&apos;s an honest,
              side-by-side breakdown of price and features so you can pick the one that
              actually fits how you work.
            </p>
            <p style={{ fontSize: 16, color: "var(--cp-muted)", margin: 0, lineHeight: 1.7, maxWidth: 720 }}>
              Most freelancers end up juggling HoneyBook, Dubsado, Bonsai, Moxie, or Plutio —
              then discovering invoicing is locked behind a higher tier, contracts need a
              separate tool, or the monthly bill quietly climbs past £20–£50. SoloPad is built
              as a flat-rate alternative: invoices, contracts, proposals, CRM, time tracking,
              scheduling, and a client portal in one place, starting at £5/mo. Use the
              comparisons below to see what you actually get for the money, and which tool
              fits solo freelancers versus agencies.
            </p>
          </div>
        </section>

        <section style={{ padding: "80px 20px", backgroundColor: "var(--cp-surface)" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              {comparisons.map((c) => (
                <Link
                  key={c.slug}
                  href={`/compare/${c.slug}`}
                  className="compare-card"
                  style={{
                    display: "block",
                    padding: 32,
                    backgroundColor: "var(--cp-card)",
                    borderRadius: 12,
                    border: "1px solid var(--cp-card-border)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cp-fg)", margin: "0 0 12px 0" }}>
                    SoloPad vs {c.name}
                  </h2>
                  <p style={{ fontSize: 15, color: "var(--cp-muted)", margin: "0 0 16px 0", lineHeight: 1.6 }}>
                    {c.blurb}
                  </p>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--cp-accent)" }}>
                    Compare →
                  </span>
                </Link>
              ))}
            </div>

            <div style={{ marginTop: 64, maxWidth: 760 }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--cp-fg)", margin: "0 0 16px 0" }}>
                How to choose a freelance management tool
              </h2>
              <p style={{ fontSize: 16, color: "var(--cp-muted)", lineHeight: 1.7, margin: "0 0 16px 0" }}>
                Start with the workflows you open every week: sending proposals, getting
                contracts signed, tracking hours, and issuing invoices. If those live in
                four different apps, you are paying for complexity you do not need. Next,
                check what is included on the cheapest paid plan — many competitors hide
                contracts or invoicing behind mid-tier pricing. Finally, look at learning
                curve: agency-grade workflow builders are powerful, but solo freelancers
                usually need something they can set up in an afternoon.
              </p>
              <p style={{ fontSize: 16, color: "var(--cp-muted)", lineHeight: 1.7, margin: 0 }}>
                Each comparison page covers pricing, core features, who the tool is built
                for, and where SoloPad is the better fit. Prefer a feature walkthrough first?
                Visit{" "}
                <Link href="/features" style={{ color: "var(--cp-accent)", textDecoration: "none", fontWeight: 600 }}>
                  SoloPad features
                </Link>
                {" "}or read practical guides on the{" "}
                <Link href="/blog" style={{ color: "var(--cp-accent)", textDecoration: "none", fontWeight: 600 }}>
                  blog
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section
          style={{
            padding: "80px 20px",
            backgroundColor: "var(--cp-cta-bg)",
            borderTop: "1px solid var(--cp-hero-border)",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--cp-fg)", margin: "0 0 16px 0" }}>
              Try SoloPad Free
            </h2>
            <p style={{ fontSize: 16, color: "var(--cp-muted)", margin: "0 0 28px 0", lineHeight: 1.6 }}>
              30-day free trial. No credit card required. All features included at £5/mo.
            </p>
            <Link
              href="/signup"
              style={{
                display: "inline-block",
                padding: "14px 32px",
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                textDecoration: "none",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
