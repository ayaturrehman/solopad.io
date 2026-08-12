import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for using SoloPad — accounts, payments, cancellations, and acceptable use.",
  alternates: { canonical: "https://www.solopad.io/terms" },
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px" }}>
      <Link href="/" style={{ fontSize: 14, color: "#1D4ED8", textDecoration: "none", marginBottom: 32, display: "inline-block" }}>
        ← Back to SoloPad
      </Link>
      <h1 style={{ fontSize: 36, fontWeight: 700, color: "#111", letterSpacing: "-0.8px", marginBottom: 12 }}>Terms of Service</h1>
      <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 40 }}>Last updated: March 2026</p>
      <div style={{ fontSize: 16, color: "#475569", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 24 }}>
          By using SoloPad you agree to these Terms of Service. Please read them carefully.
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 12, marginTop: 40 }}>Use of Service</h2>
        <p style={{ marginBottom: 16 }}>You may use SoloPad only in compliance with these Terms and all applicable laws. You must be at least 18 years old to use our services.</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 12, marginTop: 40 }}>Your Account</h2>
        <p style={{ marginBottom: 16 }}>You are responsible for safeguarding your account credentials and for all activity that occurs under your account.</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 12, marginTop: 40 }}>Payments</h2>
        <p style={{ marginBottom: 16 }}>Subscription fees are billed in advance. You may cancel at any time. No refunds are provided for partial months.</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 12, marginTop: 40 }}>Termination</h2>
        <p style={{ marginBottom: 16 }}>We may suspend or terminate your access to SoloPad at any time for violation of these Terms.</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 12, marginTop: 40 }}>Contact</h2>
        <p>If you have any questions about these Terms, please contact us at <a href="mailto:ayaturrehman2050@gmail.com" style={{ color: "#1D4ED8" }}>ayaturrehman2050@gmail.com</a>.</p>
        <p style={{ marginTop: 40, padding: "16px 20px", background: "#FFF7ED", borderRadius: 12, fontSize: 14, color: "#92400E" }}>
          This is a placeholder terms of service. Full legal terms are coming soon.
        </p>
      </div>
    </div>
  );
}
