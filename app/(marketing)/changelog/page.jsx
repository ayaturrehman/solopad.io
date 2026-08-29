import Link from "next/link";

export const metadata = {
  title: "Changelog",
  description:
    "Public record of what SoloPad has shipped — both the freelance management app and the public site.",
  alternates: { canonical: "https://www.solopad.io/changelog" },
};

export default function ChangelogPage() {
  return (
    <article className="mk-legal">
      <Link href="/" style={{ fontSize: 14, color: "#1D4ED8", textDecoration: "none", marginBottom: 32, display: "inline-block" }}>
        ← Back to SoloPad
      </Link>
      <h1>Changelog</h1>
      <p className="mk-meta">Last updated: August 2026</p>
      <div className="mk-prose">
        <p>
          This is a public record of what SoloPad has shipped. SoloPad is a young product built by Ayat Ur Rehman in Doncaster. There is no fake traction here.
        </p>
        <p>
          Recent dated entries are from git. The product section lists modules that are actually in the live app (they were already in the repo before the public marketing site shipped in March 2026, so they do not have a later marketing-commit date).
        </p>

        <h2>29 August 2026</h2>
        <p>Public site honesty pass, plus this changelog:</p>
        <ul>
          <li>Named Ayat Ur Rehman, Doncaster as founder on the homepage and footer.</li>
          <li>Replaced the placeholder privacy policy with a real one (operator, what is stored, info@solopad.io).</li>
          <li>Removed the placeholder line from Terms.</li>
          <li>Removed invented named testimonials from the homepage.</li>
          <li>Locked blog filters to Tips & Hacks, How-to, Templates, and Tools (replaced Guides / Comparisons).</li>
          <li>Published How to Chase a Late Invoice (UK freelancer how-to).</li>
          <li>Added this public changelog at /changelog (footer + sitemap) and listed the core app, not just marketing commits.</li>
        </ul>

        <h2>August 2026 (8–12 Aug)</h2>
        <p>Marketing and blog:</p>
        <ul>
          <li>Restyled the marketing site and blog with editorial typography (Newsreader + Source Sans 3).</li>
          <li>Redesigned the blog listing.</li>
          <li>Published the freelance time-tracking guide and a compare hub; fixed crawl/metadata gaps.</li>
          <li>Published the freelance invoice template guide.</li>
          <li>Pointed sitemap and canonicals at www.solopad.io.</li>
        </ul>

        <h2>May 2026</h2>
        <p>Billing reliability and access control:</p>
        <ul>
          <li>Tightened Stripe billing so checkout, subscription status, and plan access match what someone subscribed to.</li>
          <li>Stopped webhooks from being processed twice.</li>
        </ul>

        <h2>March 2026</h2>
        <p>Public site:</p>
        <ul>
          <li>Shipped the public marketing site, blog, features, and compare pages.</li>
          <li>Published the first freelance guides (proposals, contracts, tools).</li>
          <li>Added GET APIs for invoices, projects, and bookings, plus mobile auth.</li>
        </ul>

        <h2>The product (already in the app)</h2>
        <p>
          These modules were already live in SoloPad before the March 2026 marketing site. They are in the app today at https://www.solopad.io — not just described on a landing page.
        </p>
        <ul>
          <li>Invoices: create and send invoices; clients pay online (card / Apple Pay / Google Pay via Stripe).</li>
          <li>Contracts and e-signature: send a contract, client signs in the browser.</li>
          <li>Proposals: draft and send a live proposal link; accepted proposals can become a contract.</li>
          <li>Services: reusable service catalogue for quoting and billing.</li>
          <li>Projects: track work against a client.</li>
          <li>Time tracker: start a timer or log hours, linked to a project.</li>
          <li>Scheduler and public booking page (/book): clients pick a slot.</li>
          <li>Contacts (CRM) and pipeline: clients, notes, deal stages.</li>
          <li>Client portal: one link for the client to view, sign, and pay.</li>
          <li>Tasks: to-dos on projects.</li>
          <li>Finance and expenses: income, expenses, profit per project.</li>
          <li>Calendar.</li>
          <li>AI drafting for proposals and contracts (as described on the live /features page).</li>
          <li>Dashboard, settings, signup/login, and Stripe subscription plans (Starter £5, Solo £12, Pro £29).</li>
        </ul>
      </div>
    </article>
  );
}
