"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import BrandLogo from "@/components/shared/BrandLogo";

export default function MarketingFooter() {
  const { data: session } = useSession();
  const authHref = session ? "/dashboard" : "/login";

  return (
    <footer className="mk-footer">
      <style>{`
        .mk-footer {
          border-top: 1px solid var(--mk-line, #E4DDD2);
          background: var(--mk-cream, #FAF6EF);
          padding: 56px 0 32px;
          font-size: 1rem;
        }
        .mk-footer-shell {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .mk-footer-grid {
          display: grid;
          grid-template-columns: 1.4fr repeat(3, minmax(0, 1fr));
          gap: 40px;
          margin-bottom: 48px;
        }
        .mk-footer-blurb {
          font-size: 0.9375rem;
          color: var(--mk-muted, #5C6570);
          margin-top: 12px;
          line-height: 1.65;
          max-width: 28ch;
        }
        .mk-footer-note {
          font-size: 0.8125rem;
          color: var(--mk-faint, #8A929C);
          margin-top: 10px;
          line-height: 1.65;
          font-style: italic;
          max-width: 32ch;
        }
        .mk-footer-social {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }
        .mk-footer-social a {
          color: var(--mk-muted, #5C6570);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--mk-line, #E4DDD2);
          background: var(--mk-white, #FFFcf7);
        }
        .mk-footer-social a:hover { color: var(--mk-ink, #141B24); }
        .mk-footer h2 {
          font-family: var(--font-body), "Source Sans 3", sans-serif !important;
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          letter-spacing: 0.12em !important;
          text-transform: uppercase;
          color: var(--mk-faint, #8A929C) !important;
          margin: 0 0 16px;
          line-height: 1.4 !important;
        }
        .mk-footer-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mk-footer-col a {
          font-size: 0.9375rem;
          color: var(--mk-muted, #5C6570);
          text-decoration: none;
        }
        .mk-footer-col a:hover { color: var(--mk-ink, #141B24); }
        .mk-footer-bottom {
          border-top: 1px solid var(--mk-line, #E4DDD2);
          padding-top: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 0.8125rem;
          color: var(--mk-faint, #8A929C);
        }
        .mk-footer-bottom a {
          color: var(--mk-faint, #8A929C);
          text-decoration: none;
        }
        .mk-footer-bottom a:hover { color: var(--mk-ink, #141B24); }
        .mk-footer-bottom-links { display: flex; gap: 20px; }
        @media (max-width: 800px) {
          .mk-footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 540px) {
          .mk-footer-grid { grid-template-columns: 1fr; gap: 28px; }
          .mk-footer-bottom { flex-direction: column; align-items: flex-start; }
        }
        html[data-theme="dark"] .mk-footer {
          background: #181C22;
        }
      `}</style>

      <div className="mk-footer-shell">
        <div className="mk-footer-grid">
          <div>
            <BrandLogo markClassName="h-7 w-7" textClassName="text-[15px] font-black text-[#111111]" />
            <p className="mk-footer-blurb">Built for freelancers who want to get paid.</p>
            <p className="mk-footer-note">Built by a freelancer who got tired of paying too much for tools he barely used.</p>
            <div className="mk-footer-social">
              <a href="https://x.com/solopad_io" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com/company/solopad" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h2>Product</h2>
            <div className="mk-footer-col">
              <Link href="/features">Features</Link>
              <Link href="/#pricing">Pricing</Link>
              <Link href="/#how-it-works">How it works</Link>
              <Link href="/compare">Compare</Link>
            </div>
          </div>
          <div>
            <h2>Resources</h2>
            <div className="mk-footer-col">
              <Link href="/blog">Blog</Link>
              <a href="mailto:ayaturrehman2050@gmail.com">Help &amp; Support</a>
              <a href="mailto:ayaturrehman2050@gmail.com">Contact</a>
            </div>
          </div>
          <div>
            <h2>Legal</h2>
            <div className="mk-footer-col">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="mk-footer-bottom">
          <span>© 2026 SoloPad. All rights reserved.</span>
          <div className="mk-footer-bottom-links">
            <Link href={authHref}>Log in</Link>
            <Link href="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
