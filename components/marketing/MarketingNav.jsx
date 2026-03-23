"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import BrandLogo from "@/components/shared/BrandLogo";
import { ArrowRight, Menu, X } from "lucide-react";

export default function MarketingNav() {
  const { data: session } = useSession();
  const authHref = session ? "/dashboard" : "/login";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        .mn-header {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #F1F5F9;
          position: sticky;
          top: 0;
          z-index: 50;
          transition: box-shadow 0.2s ease;
        }
        .mn-inner {
          max-width: 88%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 14px 0;
        }
        .mn-links {
          display: flex;
          gap: 32px;
        }
        .mn-link {
          color: #777;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: color 0.15s;
        }
        .mn-link:hover { color: #111; }
        .mn-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .mn-btn {
          background: #1D4ED8;
          color: #fff;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 10px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }
        .mn-btn:hover {
          background: #1E40AF;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(29,78,216,0.2);
        }
        .mn-mobile-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: 1px solid #E5E7EB;
          background: #fff;
          color: #111;
          cursor: pointer;
          border-radius: 10px;
          font-family: inherit;
        }
        .mn-mobile-panel {
          display: none;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          border-top: 1px solid #F1F5F9;
          padding: 14px 0 4px;
        }
        .mn-mobile-panel a {
          color: #111;
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
        }

        @media (max-width: 1100px) {
          .mn-inner { max-width: calc(100% - 40px); }
          .mn-links { gap: 20px; }
        }
        @media (max-width: 640px) {
          .mn-inner { max-width: calc(100% - 24px); justify-content: space-between; gap: 12px; }
          .mn-links { display: none; }
          .mn-actions .mn-link { display: none; }
          .mn-actions .mn-btn { width: auto; padding: 10px 16px; font-size: 14px; white-space: nowrap; }
          .mn-mobile-toggle { display: inline-flex; }
          .mn-mobile-panel.mn-open { display: flex; }
        }
      `}</style>

      <header className="mn-header">
        <div className="mn-inner">
          <Link href="/" style={{ textDecoration: "none" }}>
            <BrandLogo
              className="gap-0"
              markClassName="h-[34px] w-[34px] sm:h-[42px] sm:w-[42px]"
              textClassName="text-[20px] font-black text-[#111111] sm:text-[24px]"
            />
          </Link>
          <nav className="mn-links">
            <Link href="/#features" className="mn-link">Features</Link>
            <Link href="/#how-it-works" className="mn-link">How it works</Link>
            <Link href="/#pricing" className="mn-link">Pricing</Link>
            <Link href="/blog" className="mn-link">Blog</Link>
          </nav>
          <div className="mn-actions">
            <Link href={authHref} className="mn-link">Log in</Link>
            <Link href="/signup" className="mn-btn">
              Get started <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              className="mn-mobile-toggle"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
          <div className={`mn-mobile-panel ${mobileOpen ? "mn-open" : ""}`}>
            <Link href="/#features" onClick={() => setMobileOpen(false)}>Features</Link>
            <Link href="/#how-it-works" onClick={() => setMobileOpen(false)}>How it works</Link>
            <Link href="/#pricing" onClick={() => setMobileOpen(false)}>Pricing</Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)}>Blog</Link>
            <Link href={authHref} onClick={() => setMobileOpen(false)}>Log in</Link>
          </div>
        </div>
      </header>
    </>
  );
}
