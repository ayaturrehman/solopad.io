import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for using SoloPad — accounts, payments, cancellations, and acceptable use.",
  alternates: { canonical: "https://www.solopad.io/terms" },
};

export default function TermsPage() {
  return (
    <article className="mk-legal">
      <Link href="/" style={{ fontSize: 14, color: "#1D4ED8", textDecoration: "none", marginBottom: 32, display: "inline-block" }}>
        ← Back to SoloPad
      </Link>
      <h1>Terms of Service</h1>
      <p className="mk-meta">Last updated: March 2026</p>
      <div className="mk-prose">
        <p>
          By using SoloPad you agree to these Terms of Service. Please read them carefully.
        </p>
        <h2>Use of Service</h2>
        <p>You may use SoloPad only in compliance with these Terms and all applicable laws. You must be at least 18 years old to use our services.</p>
        <h2>Your Account</h2>
        <p>You are responsible for safeguarding your account credentials and for all activity that occurs under your account.</p>
        <h2>Payments</h2>
        <p>Subscription fees are billed in advance. You may cancel at any time. No refunds are provided for partial months.</p>
        <h2>Termination</h2>
        <p>We may suspend or terminate your access to SoloPad at any time for violation of these Terms.</p>
        <h2>Contact</h2>
        <p>If you have any questions about these Terms, please contact us at <a href="mailto:info@solopad.io">info@solopad.io</a>.</p>
        <p className="mk-note">
          This is a placeholder terms of service. Full legal terms are coming soon.
        </p>
      </div>
    </article>
  );
}
