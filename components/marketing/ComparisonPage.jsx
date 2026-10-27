import Link from "next/link";
import { COMPARISONS, COMPARISON_CHECKED_AT, getSoloPadPlans } from "@/lib/comparisons";
import { absoluteUrl } from "@/lib/site";

export default function ComparisonPage({ slug }) {
  const comparison = COMPARISONS[slug];
  const plans = getSoloPadPlans();
  const checkedLabel = new Date(`${COMPARISON_CHECKED_AT}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const faq = [
    { question: `Which ${comparison.name} plan should I compare?`, answer: "Start with the workflow you need. Use the published plan details above, including billing interval, seat charges and usage limits, then check the vendor's checkout before subscribing." },
    { question: "Does SoloPad include every feature at £5/month?", answer: `${plans[0].name} costs ${plans[0].price}. ${plans[0].features} Scheduling, time tracking and recurring invoices are on Solo or Pro. Custom branding is on Pro.` },
    { question: "Does SoloPad charge payment fees?", answer: plans.map((plan) => `${plan.name}: ${plan.fee}.`).join(" ") },
    { question: "How should I test before switching?", answer: "Run the same sample enquiry, proposal, contract and invoice through both tools. Check the client view, exports and total cost. Keep your existing service until your documents and records are safely transferred." },
  ];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", name: comparison.title, url: absoluteUrl(`/compare/${slug}`), description: comparison.description },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
        { "@type": "ListItem", position: 2, name: "Compare", item: absoluteUrl("/compare") },
        { "@type": "ListItem", position: 3, name: `${comparison.name} alternative`, item: absoluteUrl(`/compare/${slug}`) },
      ] },
      { "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    ],
  };
  return (
    <main className="comparison-refresh">
      <style>{`
        .comparison-refresh { --cr-link:var(--mk-blue); max-width:1080px; margin:auto; padding:64px 24px 100px; }
        html[data-theme="dark"] .comparison-refresh { --cr-link:#93c5fd; }
        .comparison-refresh p, .comparison-refresh li { color:var(--mk-muted); line-height:1.7; }
        .comparison-refresh a { color:var(--cr-link); text-decoration:underline; text-underline-offset:3px; }
        .comparison-refresh header { max-width:780px; margin-bottom:48px; }
        .comparison-refresh h1 { margin:24px 0; }
        .comparison-refresh h2 { margin:48px 0 20px; }
        .comparison-refresh h3 { font-size:1.3rem; margin:24px 0 12px; }
        .comparison-refresh .cr-date { font-size:.9rem; margin-top:24px; }
        .cr-table-wrap { overflow-x:auto; border:1px solid var(--mk-line); border-radius:12px; }
        .cr-table { width:100%; border-collapse:collapse; font-size:1rem; min-width:580px; background:var(--mk-white); }
        .cr-table th,.cr-table td { padding:18px; text-align:left; vertical-align:top; border-bottom:1px solid var(--mk-line); }
        .cr-table th { background:var(--mk-cream); }
        .cr-table tr:last-child td { border-bottom:0; }
        .cr-table caption { text-align:left; padding:16px 18px; font-weight:600; }
        .cr-faq { max-width:780px; }
        .cr-faq p { margin-bottom:24px; }
        .cr-cta { margin-top:48px; padding:28px; border:1px solid var(--mk-line); border-radius:12px; background:var(--mk-cream); }
        .comparison-refresh .cr-button { display:inline-block; padding:12px 22px; color:white; background:var(--mk-blue); border-radius:8px; text-decoration:none; font-weight:600; margin:12px 16px 12px 0; }
        .comparison-refresh a:focus-visible { outline:3px solid var(--mk-orange); outline-offset:4px; }
        @media(max-width:600px) { .comparison-refresh { padding:40px 20px 72px; } }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header>
        <nav aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/compare">Compare</Link> / {comparison.name}</nav>
        <h1>{comparison.name} alternative: compare SoloPad</h1>
        <p>{comparison.summary}</p>
        <p className="cr-date">Plan details checked <time dateTime={COMPARISON_CHECKED_AT}>{checkedLabel}</time>. Published by SoloPad, a competing product. This comparison uses published plan information.</p>
      </header>
      <section aria-labelledby="vendor-plans">
        <h2 id="vendor-plans">{comparison.name} pricing and plan limits</h2>
        <div className="cr-table-wrap" role="region" aria-label={`${comparison.name} plans`} tabIndex={0}>
          <table className="cr-table">
            <caption>{comparison.name} published plans (USD)</caption>
            <thead><tr><th scope="col">Plan</th><th scope="col">Listed price</th><th scope="col">Relevant inclusions and limits</th></tr></thead>
            <tbody>{comparison.plans.map(([name, price, details]) => <tr key={name}><th scope="row">{name}</th><td>{price}</td><td>{details}</td></tr>)}</tbody>
          </table>
        </div>
        <p>Source: <a href={comparison.source}>{comparison.name} official pricing and features</a>. Prices and availability can change. Check regional pricing, applicable taxes, processing fees and renewal terms.</p>
        <ul>{comparison.considerations.map((text) => <li key={text}>{text}</li>)}</ul>
      </section>
      <section aria-labelledby="solopad-plans">
        <h2 id="solopad-plans">SoloPad pricing and feature access</h2>
        <p>SoloPad subscriptions are in GBP. The USD prices above are not converted equivalents. Compare matching features and billing intervals.</p>
        <div className="cr-table-wrap" role="region" aria-label="SoloPad plans" tabIndex={0}>
          <table className="cr-table">
            <caption>SoloPad plans (GBP)</caption>
            <thead><tr><th scope="col">Plan</th><th scope="col">Subscription</th><th scope="col">Features</th><th scope="col">Client payment fees</th></tr></thead>
            <tbody>{plans.map((plan) => <tr key={plan.id}><th scope="row">{plan.name}</th><td>{plan.price}</td><td>{plan.features}</td><td>{plan.fee}</td></tr>)}</tbody>
          </table>
        </div>
        <p><Link href="/#pricing">See SoloPad pricing</Link>. A 30-day trial is available; a trial is different from an ongoing free plan.</p>
      </section>
      <section aria-labelledby="choose-tool">
        <h2 id="choose-tool">Which tool fits your work?</h2>
        <p>{comparison.fit}</p>
        <p>List your regular tasks before testing. Check proposal editing, signature collection, deposits, reminders and reporting with sample data. Confirm migration and export options before moving client records.</p>
        <p>For a practical starting point, use our <Link href="/blog/one-page-freelance-proposal-template-uk">proposal template</Link> and <Link href="/blog/freelance-invoice-template-examples">invoice examples</Link>.</p>
      </section>
      <section className="cr-faq" aria-labelledby="comparison-faq">
        <h2 id="comparison-faq">Frequently asked questions</h2>
        {faq.map((item) => <div key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}
      </section>
      <section className="cr-cta" aria-label="Try SoloPad">
        <h2 style={{ marginTop: 0 }}>Try your workflow in SoloPad</h2>
        <p>Use the 30-day trial to test the features you need. Plans start at £5/month; feature access and payment fees depend on the plan.</p>
        <Link className="cr-button" href="/signup">Start your free trial</Link>
        <Link href="/compare">Browse all comparisons</Link>
      </section>
    </main>
  );
}
