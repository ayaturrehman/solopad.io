"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/shared/BrandLogo";
import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";

function readTheme() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export default function MarketingNav() {
  const { data: session } = useSession();
  const authHref = session ? "/dashboard" : "/login";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const sync = () => setTheme(readTheme());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("solopad-theme", next);
    setTheme(next);
  }

  return (
    <>
      <style>{`
        .mn-header {
          background: rgba(244, 239, 230, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid #E4DDD2;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .mn-inner {
          max-width: 1120px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 14px 24px;
        }
        .mn-links {
          display: flex;
          gap: 28px;
        }
        .mn-link {
          color: #5C6570;
          text-decoration: none;
          font-size: 0.9375rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          transition: color 0.15s;
        }
        .mn-link:hover { color: #141B24; }
        .mn-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .mn-btn {
          background: #141B24;
          color: #fff;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 8px;
          padding: 9px 16px;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s, transform 0.15s;
          font-family: inherit;
        }
        .mn-btn:hover {
          background: #1D4ED8;
        }
        .mn-theme-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid #E4DDD2;
          background: #FAF6EF;
          color: #374151;
          cursor: pointer;
          font-family: inherit;
        }
        .mn-theme-btn:hover {
          background: #fff;
          border-color: #D6CFC3;
        }
        .mn-mobile-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: 1px solid #E4DDD2;
          background: #FAF6EF;
          color: #141B24;
          cursor: pointer;
          border-radius: 8px;
          font-family: inherit;
        }
        .mn-mobile-panel {
          display: none;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          border-top: 1px solid #E4DDD2;
          padding: 14px 24px 16px;
        }
        .mn-mobile-panel a {
          color: #141B24;
          text-decoration: none;
          font-size: 1.0625rem;
          font-weight: 600;
        }

        html[data-theme="dark"] .mn-header {
          background: rgba(18, 21, 26, 0.9);
          border-bottom-color: #2A313A;
        }
        html[data-theme="dark"] .mn-link { color: #a1a1aa; }
        html[data-theme="dark"] .mn-link:hover { color: #fafafa; }
        html[data-theme="dark"] .mn-btn { background: #F3EEE6; color: #141B24; }
        html[data-theme="dark"] .mn-btn:hover { background: #fff; }
        html[data-theme="dark"] .mn-theme-btn,
        html[data-theme="dark"] .mn-mobile-toggle {
          background: #181C22;
          border-color: #3f3f46;
          color: #e4e4e7;
        }
        html[data-theme="dark"] .mn-theme-btn:hover {
          background: #27272a;
        }
        html[data-theme="dark"] .mn-mobile-panel {
          border-top-color: #2A313A;
        }
        html[data-theme="dark"] .mn-mobile-panel a {
          color: #f4f4f5;
        }

        @media (max-width: 1100px) {
          .mn-links { gap: 18px; }
        }
        @media (max-width: 640px) {
          .mn-inner { padding: 12px 16px; }
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
              dark={theme === "dark"}
              className="gap-0"
              markClassName="h-[34px] w-[34px] sm:h-[42px] sm:w-[42px]"
              textClassName="text-[20px] font-black text-[#111111] sm:text-[24px]"
            />
          </Link>
          <nav className="mn-links" aria-label="Main">
            <Link href="/features" className="mn-link">Features</Link>
            <Link href="/#how-it-works" className="mn-link">How it works</Link>
            <Link href="/#pricing" className="mn-link">Pricing</Link>
            <Link href="/blog" className="mn-link">Blog</Link>
          </nav>
          <div className="mn-actions">
            <button
              type="button"
              className="mn-theme-btn"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
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
        </div>
        <nav className={`mn-mobile-panel ${mobileOpen ? "mn-open" : ""}`} aria-label="Mobile">
          <Link href="/features" onClick={() => setMobileOpen(false)}>Features</Link>
          <Link href="/#how-it-works" onClick={() => setMobileOpen(false)}>How it works</Link>
          <Link href="/#pricing" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link href="/blog" onClick={() => setMobileOpen(false)}>Blog</Link>
          <Link href={authHref} onClick={() => setMobileOpen(false)}>Log in</Link>
        </nav>
      </header>
    </>
  );
}
