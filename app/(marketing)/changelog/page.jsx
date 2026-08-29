import Link from "next/link";

export const metadata = {
  title: "Changelog",
  description:
    "A public record of what SoloPad has shipped — features, fixes, and improvements to the freelance management platform.",
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
          This is a public record of what SoloPad has shipped. SoloPad is a young product. There is no fake traction here.
        </p>

        <h2>29 August 2026</h2>
        <p>
          Honesty pass on the public site:
        </p>
        <ul>
          <li>Named Ayat Ur Rehman, Doncaster as founder on the homepage and footer.</li>
          <li>Replaced the placeholder privacy policy with a real one (operator, what is stored, info@solopad.io).</li>
          <li>Removed the placeholder line from Terms.</li>
          <li>Removed invented named testimonials from the homepage.</li>
          <li>Locked blog filters to Tips &amp; Hacks, How-to, Templates, and Tools (replaced Guides / Comparisons).</li>
        </ul>

        <h2>August 2026 (11–12 Aug)</h2>
        <p>
          Marketing and blog:
        </p>
        <ul>
          <li>Restyled the marketing site and blog with editorial typography (Newsreader + Source Sans 3).</li>
          <li>Redesigned the blog listing.</li>
          <li>Published the freelance time-tracking guide and a compare hub; fixed crawl/metadata gaps.</li>
        </ul>

        <h2>8 August 2026</h2>
        <ul>
          <li>Published the freelance invoice template guide.</li>
          <li>Pointed sitemap and canonicals at www.solopad.io.</li>
        </ul>

        <h2>May 2026</h2>
        <p>
          Billing reliability and access control:
        </p>
        <ul>
          <li>Tightened Stripe billing so checkout, subscription status, and plan access match what someone subscribed to.</li>
          <li>Stopped webhooks from being processed twice.</li>
        </ul>

        <h2>March 2026</h2>
        <ul>
          <li>Shipped the public marketing site, blog, features, and compare pages.</li>
          <li>Published the first freelance guides (proposals, contracts, tools).</li>
        </ul>
      </div>
    </article>
  );
}
