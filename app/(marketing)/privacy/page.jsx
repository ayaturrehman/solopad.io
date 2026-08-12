import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How SoloPad collects, uses, and protects your data when you use our freelance management platform.",
  alternates: { canonical: "https://www.solopad.io/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="mk-legal">
      <Link href="/" style={{ fontSize: 14, color: "#1D4ED8", textDecoration: "none", marginBottom: 32, display: "inline-block" }}>
        ← Back to SoloPad
      </Link>
      <h1>Privacy Policy</h1>
      <p className="mk-meta">Last updated: March 2026</p>
      <div className="mk-prose">
        <p>
          This Privacy Policy describes how SoloPad (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares information about you when you use our services.
        </p>
        <h2>Information We Collect</h2>
        <p>We collect information you provide directly to us, such as your name, email address, and payment information when you register for an account or use our services.</p>
        <h2>How We Use Your Information</h2>
        <p>We use your information to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.</p>
        <h2>Data Security</h2>
        <p>Your data is encrypted in transit and at rest. We use PostgreSQL on secure infrastructure with daily backups.</p>
        <h2>Contact</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:ayaturrehman2050@gmail.com">ayaturrehman2050@gmail.com</a>.</p>
        <p className="mk-note">
          This is a placeholder privacy policy. A full legal privacy policy is coming soon.
        </p>
      </div>
    </article>
  );
}
