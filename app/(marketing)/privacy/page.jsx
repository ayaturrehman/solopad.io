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
      <p className="mk-meta">Last updated: August 2026</p>
      <div className="mk-prose">
        <p>
          SoloPad is operated by Ayat Ur Rehman, based in Doncaster, United Kingdom. This Privacy Policy explains how we collect, use, and protect your information when you use our freelance management platform.
        </p>
        
        <h2>Operator and Contact</h2>
        <p>
          <strong>Operator:</strong> Ayat Ur Rehman, Doncaster, UK<br />
          <strong>Contact:</strong> <a href="mailto:info@solopad.io">info@solopad.io</a>
        </p>

        <h2>Information We Collect</h2>
        <p>
          When you use SoloPad, we collect and store:
        </p>
        <ul>
          <li><strong>Account details:</strong> Your name, email address, password (encrypted), and business information</li>
          <li><strong>Invoices:</strong> Invoice data you create, including client information, amounts, and payment records</li>
          <li><strong>Client records:</strong> Contact information and project details for clients you manage through SoloPad</li>
          <li><strong>Usage data:</strong> Basic analytics about how you use the platform to help us improve the service</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and maintain SoloPad's core features</li>
          <li>Process payments and send invoices on your behalf</li>
          <li>Communicate with you about your account and provide customer support</li>
          <li>Improve and develop new features for the platform</li>
        </ul>

        <h2>Data Storage and Security</h2>
        <p>
          Your data is stored securely using PostgreSQL databases with encryption in transit and at rest. We use industry-standard security practices and perform regular backups.
        </p>

        <h2>Data Sharing</h2>
        <p>
          We do not sell your data. We share information only when necessary to operate the service (for example, with payment processors like Stripe) or when required by law.
        </p>

        <h2>Your Rights</h2>
        <p>
          You can access, update, or delete your account data at any time through your account settings. For assistance or to request account deletion, contact us at <a href="mailto:info@solopad.io">info@solopad.io</a>.
        </p>

        <h2>About SoloPad</h2>
        <p>
          SoloPad is a young product built to help freelancers manage their business without the complexity of expensive alternatives. We're continuously improving and welcome your feedback.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If we make significant changes, we'll notify you via email or through the platform.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or how we handle your data, please reach out to us at <a href="mailto:info@solopad.io">info@solopad.io</a>.
        </p>
      </div>
    </article>
  );
}
