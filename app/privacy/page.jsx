import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — SoloPad",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px" }}>
      <Link href="/" style={{ fontSize: 14, color: "#1D4ED8", textDecoration: "none", marginBottom: 32, display: "inline-block" }}>
        ← Back to SoloPad
      </Link>
      <h1 style={{ fontSize: 36, fontWeight: 700, color: "#111", letterSpacing: "-0.8px", marginBottom: 12 }}>Privacy Policy</h1>
      <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 40 }}>Last updated: March 2026</p>
      <div style={{ fontSize: 16, color: "#475569", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 24 }}>
          This Privacy Policy describes how SoloPad (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares information about you when you use our services.
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 12, marginTop: 40 }}>Information We Collect</h2>
        <p style={{ marginBottom: 16 }}>We collect information you provide directly to us, such as your name, email address, and payment information when you register for an account or use our services.</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 12, marginTop: 40 }}>How We Use Your Information</h2>
        <p style={{ marginBottom: 16 }}>We use your information to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 12, marginTop: 40 }}>Data Security</h2>
        <p style={{ marginBottom: 16 }}>Your data is encrypted in transit and at rest. We use PostgreSQL on secure infrastructure with daily backups.</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 12, marginTop: 40 }}>Contact</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:ayaturrehman2050@gmail.com" style={{ color: "#1D4ED8" }}>ayaturrehman2050@gmail.com</a>.</p>
        <p style={{ marginTop: 40, padding: "16px 20px", background: "#FFF7ED", borderRadius: 12, fontSize: 14, color: "#92400E" }}>
          This is a placeholder privacy policy. A full legal privacy policy is coming soon.
        </p>
      </div>
    </div>
  );
}
