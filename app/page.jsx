"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/shared/BrandLogo";
import {
  Zap, ArrowRight, Check, FileText,
  CreditCard, Clock, Users, Menu, X,
  Link2, PenTool, CheckSquare, Calendar,
  DollarSign, UserPlus, Printer, TrendingUp,
} from "lucide-react";
import { PLAN_ORDER, getPlan } from "@/lib/plans";

const plans = PLAN_ORDER.map((planId) => ({
  ...getPlan(planId),
  href: `/signup?plan=${planId}`,
  highlight: planId === "solo",
}));

const C     = "#1D4ED8";
const CLt   = "#EFF6FF";
const O     = "#EA580C";
const OLt   = "#FFF7ED";
const PLt   = "#EDE9FE";
const YLt   = "#FEF3C7";
const BLt   = "#EAF2FF";
const BrLt  = "#F3E8D8";
const CDk   = "#111111";
const CMute = "#777777";
const PRT = "#fcffbf8c";



function useFadeIn() {
  useEffect(() => {
    const els = document.querySelectorAll(".pk-reveal, .pk-reveal-left, .pk-reveal-right");
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("pk-visible"); }),
      { threshold: 0.1 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useParallaxCards() {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll("[data-pk-parallax]"));
    if (cards.length === 0) return undefined;

    let frame = 0;

    const update = () => {
      frame = 0;
      const viewportMiddle = window.innerHeight / 2;

      cards.forEach((card) => {
        const speed = Number(card.getAttribute("data-pk-speed") || 0.12);
        const rotate = card.getAttribute("data-pk-rotate") || "0deg";
        const rect = card.getBoundingClientRect();
        const cardMiddle = rect.top + rect.height / 2;
        const delta = (cardMiddle - viewportMiddle) * speed * -1;
        card.style.transform = `translate3d(0, ${delta.toFixed(1)}px, 0) rotate(${rotate})`;
      });
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);
}

function useSectionDrift() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const sections = Array.from(document.querySelectorAll("[data-pk-section-drift]"));
    if (sections.length === 0) return undefined;

    let frame = 0;

    const update = () => {
      frame = 0;
      const viewportMiddle = window.innerHeight / 2;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionMiddle = rect.top + rect.height / 2;
        const offset = (viewportMiddle - sectionMiddle) / window.innerHeight;
        const driftY = Math.max(-20, Math.min(20, offset * 20));
        section.style.transform = `translate3d(0, ${driftY.toFixed(1)}px, 0)`;
      });
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);
}

function ParallaxImageCard({
  src,
  alt,
  label,
  top,
  right,
  bottom,
  left,
  width = 220,
  height = 280,
  speed = 0.12,
  rotate = "-4deg",
  labelBg = "#FFFFFF",
  labelColor = "#111111",
}) {
  return (
    <div
      className="pk-parallax-card pk-reveal"
      data-pk-parallax
      data-pk-speed={speed}
      data-pk-rotate={rotate}
      style={{ top, right, bottom, left }}
      aria-hidden="true"
    >
      <div
        style={{
          position: "relative",
          borderRadius: 20,
          padding: 7,
          background: "rgba(255,255,255,.64)",
          border: "1px solid rgba(255,255,255,.52)",
          boxShadow: "0 18px 42px rgba(15,23,42,.10)",
          backdropFilter: "blur(7px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 999,
            padding: "5px 10px",
            background: labelBg,
            color: labelColor,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            boxShadow: "0 8px 18px rgba(15,23,42,.06)",
          }}
        >
          {label}
        </div>
        <img
          src={src}
          alt={alt}
          style={{
            width,
            height,
            display: "block",
            objectFit: "cover",
            borderRadius: 14,
          }}
        />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { data: session } = useSession();
  const authHref = session ? "/dashboard" : "/login";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useFadeIn();
  useParallaxCards();
  useSectionDrift();

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .pk { font-family: 'Kumbh Sans', 'Inter', -apple-system, sans-serif; color: ${CDk}; background: #fff; }

        .btn-primary {
          background: ${C}; color: #fff; border: none; cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          border-radius: 10px; padding: 13px 26px; font-size: 15px; font-weight: 700;
          text-decoration: none; transition: background .15s, transform .15s, box-shadow .15s;
        }
        .btn-primary:hover { background: #1E40AF; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(29,78,216,.28); }

        .btn-outline {
          background: #fff; color: ${CDk}; border: 1.5px solid #DEDEDE; cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          border-radius: 10px; padding: 12px 24px; font-size: 15px; font-weight: 600;
          text-decoration: none; transition: border-color .15s, box-shadow .15s;
        }
        .btn-outline:hover { border-color: ${C}; box-shadow: 0 2px 14px rgba(29,78,216,.12); }

        /* Animations */
        .pk-reveal       { opacity:0; transform:translateY(30px); transition:opacity .7s ease, transform .7s ease; }
        .pk-reveal-left  { opacity:0; transform:translateX(-36px); transition:opacity .75s ease, transform .75s ease; }
        .pk-reveal-right { opacity:0; transform:translateX(36px); transition:opacity .75s ease, transform .75s ease; }
        .pk-reveal.pk-visible, .pk-reveal-left.pk-visible, .pk-reveal-right.pk-visible { opacity:1; transform:none; }
        .pk-d1 { transition-delay:.1s; } .pk-d2 { transition-delay:.2s; } .pk-d3 { transition-delay:.3s; }

        @keyframes pk-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .pk-float { animation: pk-float 4.5s ease-in-out infinite; }

        @keyframes pk-ping { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.5);opacity:0} }
        .pk-ping { animation: pk-ping 1.5s ease-out infinite; }

        /* Nav */
        .nav-link { color:${CMute}; text-decoration:none; font-size:15px; font-weight:500; transition:color .15s; }
        .nav-link:hover { color:${CDk}; }

        /* Cards */
        .pk-card { background:#fff; border:1px solid #EBEBEB; border-radius:16px; transition:box-shadow .2s, transform .2s; }
        .pk-card:hover { box-shadow:0 12px 40px rgba(0,0,0,.08); transform:translateY(-3px); }

        /* Feature grid */
        .feat-grid { display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:center; max-width:88%; margin:0 auto; }
        @media(max-width:860px){ .feat-grid{grid-template-columns:1fr;gap:40px;} }


        .check-row { display:flex; align-items:flex-start; gap:10px; font-size:15px; color:${CDk}; line-height:1.55; }
        .check-icon { width:20px;height:20px;border-radius:50%;background:${C}15;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px; }

        .pk-shell { max-width: 88%; margin: 0 auto; }
        .pk-nav-inner { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:16px 0; }
        .pk-nav-links { display:flex; gap:32px; }
        .pk-nav-actions { display:flex; align-items:center; gap:12px; }
        .pk-mobile-toggle { display:none; align-items:center; justify-content:center; width:42px; height:42px; border:1px solid #E5E7EB; background:#fff; color:${CDk}; cursor:pointer; border-radius:10px; }
        .pk-mobile-panel { display:none; }
        .pk-hero-shell { max-width:88%; margin:0 auto; }
        .pk-hero-grid { display:grid; grid-template-columns:minmax(0, 1fr) minmax(520px, .98fr); gap:52px; align-items:center; position:relative; }
        .pk-hero-copy { position:relative; z-index:1; }
        .pk-hero-actions { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:16px; }
        .pk-hero-actions .btn-primary {
          background:#111111;
          box-shadow:0 14px 32px rgba(17,17,17,.16);
          width:fit-content;
          max-width:100%;
        }
        .pk-hero-actions .btn-primary:hover {
          background:#27272A;
          box-shadow:0 16px 36px rgba(17,17,17,.22);
        }
        .pk-hero-proof { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:24px; }
        .pk-hero-panel { position:relative; z-index:1; }
        .pk-browser-shell { position:relative; max-width:860px; margin:0 auto; }
        .pk-browser-body { padding:28px 32px; }
        .pk-browser-stats { display:grid; grid-template-columns:repeat(3, 1fr); gap:14px; }
        .pk-photo-strip { display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:16px; border-radius:24px; overflow:hidden; }
        .pk-price-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px; align-items:center; }
        .pk-price-card-highlight { transform:scale(1.04); }
        .pk-final-cta { background:#1E3A8A; border-radius:28px; padding:72px 48px; text-align:center; position:relative; overflow:hidden; }
        .pk-split-intro { display:grid; gap:28px; align-items:end; }
        .pk-split-intro-problem { grid-template-columns:minmax(0, 1.1fr) minmax(280px, .9fr); }
        .pk-split-intro-setup { grid-template-columns:minmax(0, 1.15fr) minmax(280px, .85fr); }
        .pk-split-summary {
          justify-self:end;
          width:100%;
        }
        .pk-flow-shell {
          position:relative;
          background:rgba(255,255,255,.34);
          border:1px solid rgba(17,24,39,.08);
          border-radius:30px;
          padding:26px;
          box-shadow:0 24px 58px rgba(15,23,42,.06);
          backdrop-filter:blur(10px);
        }
        .pk-flow-line {
          position:absolute;
          left:42px;
          right:42px;
          top:96px;
          height:1px;
          background:linear-gradient(90deg, rgba(29,78,216,.16) 0%, rgba(29,78,216,.08) 50%, rgba(29,78,216,.16) 100%);
        }
        .pk-parallax-card {
          position:absolute;
          z-index:3;
          pointer-events:none;
          will-change:transform;
          opacity:.68;
          filter:saturate(.9);
        }
        .pk-section-stage {
          position:relative;
          z-index:1;
          will-change:transform;
        }
        .pk-footer-inner { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
        .pk-footer-links { display:flex; gap:24px; font-size:13px; color:#AAAAAA; }

        @media (max-width: 1100px) {
          .pk-shell, .pk-hero-shell { max-width: calc(100% - 40px); }
          .pk-nav-links { gap:20px; }
          .pk-price-card-highlight { transform:none; }
          .pk-hero-grid { grid-template-columns:1fr; gap:36px; }
        }

        @media (max-width: 860px) {
          .pk-nav-inner { flex-wrap:wrap; justify-content:center; padding:14px 0; }
          .pk-nav-links { order:3; width:100%; justify-content:center; gap:18px; flex-wrap:wrap; }
          .pk-nav-actions { width:100%; justify-content:center; }
          .pk-hero-shell { max-width: calc(100% - 28px); }
          .pk-hero-grid { gap:28px; }
          .pk-hero-actions { justify-content:center; }
          .pk-hero-actions .btn-primary { width:auto; min-width:220px; }
          .pk-hero-proof { justify-content:flex-start; }
          .pk-browser-body { padding:20px 18px; }
          .pk-browser-stats { grid-template-columns:1fr; }
          .pk-browser-shell .pk-float { position:static !important; margin:14px auto 0; width:max-content; max-width:100%; }
          .pk-photo-strip { grid-template-columns:1fr; }
          .pk-photo-strip img { height:220px !important; }
          .pk-final-cta { padding:48px 24px; border-radius:18px; }
          .pk-split-intro,
          .pk-split-intro-problem,
          .pk-split-intro-setup { grid-template-columns:1fr; }
          .pk-split-summary { justify-self:stretch; max-width:none !important; }
          .pk-flow-shell { padding:20px; border-radius:24px; }
          .pk-flow-line { display:none; }
          .pk-parallax-card { display:none; }
          .pk-footer-inner { flex-direction:column; align-items:flex-start; }
          .pk-footer-links { flex-wrap:wrap; gap:14px; }
        }

        @media (max-width: 640px) {
          .btn-primary, .btn-outline { width:100%; justify-content:center; padding:12px 18px; }
          .pk-shell, .pk-hero-shell { max-width: calc(100% - 24px); }
          .pk-nav-inner { justify-content:space-between; gap:12px; }
          .pk-nav-links { display:none; }
          .pk-nav-actions { width:auto; margin-left:auto; gap:10px; }
          .pk-nav-actions .nav-link { display:none; }
          .pk-nav-actions .btn-primary { width:auto; padding:10px 16px; font-size:14px !important; white-space:nowrap; }
          .pk-mobile-toggle { display:inline-flex; }
          .pk-mobile-panel { display:flex; flex-direction:column; gap:10px; width:100%; border-top:1px solid #EBEBEB; padding:14px 0 4px; }
          .pk-mobile-panel a { color:${CDk}; text-decoration:none; font-size:15px; font-weight:600; }
          .pk-browser-body { padding:16px 14px; }
          .pk-browser-shell [style*="display:\"flex\""][style*="justifyContent:\"space-between\""] { gap:12px; }
          .pk-browser-shell [style*="maxWidth:320"] { max-width:none !important; }
          .pk-price-grid { grid-template-columns:1fr; }
          .pk-final-cta { padding:40px 18px; }
          .pk-footer-links { flex-direction:column; align-items:flex-start; gap:8px; }
          .pk-hero-actions { justify-content:center; }
          .pk-hero-actions .btn-primary { width:auto; min-width:220px; max-width:100%; }
          .pk-flow-shell { padding:16px; }
        }
      `}</style>

      <div className="pk">

        {/* ── Nav ─────────────────────────────────────── */}
        <header style={{ background:"#fff", borderBottom:"1px solid #EBEBEB", position:"sticky", top:0, zIndex:50 }}>
          <div className="pk-shell pk-nav-inner">
            <BrandLogo
              className="gap-0"
              markClassName="h-[34px] w-[34px] sm:h-[42px] sm:w-[42px]"
              textClassName="text-[20px] font-black text-[#111111] sm:text-[24px]"
            />
            <nav className="pk-nav-links">
              <a href="#features"      className="nav-link">Features</a>
              <a href="#how-it-works"  className="nav-link">How it works</a>
              <a href="#pricing"       className="nav-link">Pricing</a>
            </nav>
            <div className="pk-nav-actions">
              <Link href={authHref} className="nav-link">Log in</Link>
              <Link href="/signup" className="btn-primary" style={{ fontSize:13, padding:"8px 16px" }}>
                Get started free <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                className="pk-mobile-toggle"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
            {mobileMenuOpen && (
              <div className="pk-mobile-panel">
                <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <Link href={authHref} onClick={() => setMobileMenuOpen(false)}>Log in</Link>
              </div>
            )}
          </div>
        </header>

        {/* ── Hero ────────────────────────────────────── */}
        <section style={{ background:BLt, overflow:"hidden", padding:"96px 0 28px", position:"relative" }}>
          <div className="pk-hero-shell pk-section-stage" data-pk-section-drift>
            <div className="pk-hero-grid">
              <div className="pk-hero-copy">
                <div className="pk-reveal" style={{ display:"flex", marginBottom:24 }}>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fff", border:`1.5px solid ${C}28`, borderRadius:100, padding:"7px 16px", boxShadow:"0 10px 28px rgba(29,78,216,.08)" }}>
                    <span style={{ position:"relative", display:"inline-flex", width:8, height:8 }}>
                      <span className="pk-ping" style={{ position:"absolute", inset:0, borderRadius:"50%", background:C }} />
                      <span style={{ width:8, height:8, borderRadius:"50%", background:C, display:"block", position:"relative" }} />
                    </span>
                    <span style={{ fontSize:13, fontWeight:600, color:C }}>The all-in-one freelance workspace</span>
                  </div>
                </div>

                <div className="pk-reveal pk-d1">
                  <h1 style={{ fontSize:"clamp(48px, 6.4vw, 88px)", fontWeight:700, lineHeight:0.98, letterSpacing:"-2.8px", color:CDk, marginBottom:22, maxWidth:760 }}>
                    Run your freelance
                    <br />
                    business from
                    <br />
                    <span style={{ color:C }}>one place.</span>
                  </h1>
                  <p style={{ fontSize:19, color:"#52525B", lineHeight:1.74, maxWidth:560, marginBottom:32 }}>
                    Proposals, contracts, invoices, time tracking, scheduling, and a client portal — everything you need to manage clients and get paid. Starting at $9/mo.
                  </p>
                </div>

                <div className="pk-reveal pk-d2 pk-hero-actions">
                  <Link href="/signup" className="btn-primary">Start for free <ArrowRight size={15} /></Link>
                </div>


              </div>

              <div className="pk-hero-panel pk-reveal pk-d3 pk-browser-shell">
                <div style={{ position:"absolute", inset:"10% -8% auto auto", width:180, height:180, background:"#FFFFFFA8", filter:"blur(24px)", borderRadius:"50%" }} />
                <div style={{ borderRadius:24, overflow:"hidden", border:"1px solid #DCE7FF", boxShadow:"0 36px 100px rgba(15,23,42,.15)", background:"#fff", position:"relative" }}>
                {/* Browser bar */}
                  <div style={{ background:"#F8FAFC", borderBottom:"1px solid #E8EEF9", padding:"11px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ display:"flex", gap:6 }}>
                    {["#FF6058","#FFC130","#27C840"].map(bg => <div key={bg} style={{ width:11, height:11, borderRadius:"50%", background:bg }} />)}
                  </div>
                    <div style={{ flex:1, background:"#fff", border:"1px solid #E2E8F0", borderRadius:8, padding:"5px 12px", display:"flex", alignItems:"center", gap:6, maxWidth:320, margin:"0 auto", fontSize:12, color:"#94A3B8" }}>
                    🔒 solopad.app/p/acme-co
                  </div>
                </div>
                {/* Portal content */}
                  <div className="pk-browser-body">
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:C, marginBottom:4 }}>Brand Refresh</div>
                      <div style={{ fontSize:20, fontWeight:700, color:CDk }}>Website Redesign — Acme Co.</div>
                      <div style={{ fontSize:13, color:CMute, marginTop:5 }}>Due March 28 · In progress</div>
                    </div>
                    <span style={{ background:CLt, color:C, borderRadius:8, padding:"5px 14px", fontSize:12, fontWeight:700 }}>Active</span>
                  </div>
                  <div className="pk-browser-stats">
                    {[
                      { e:"📁", label:"Files",    value:"3 deliverables" },
                      { e:"💬", label:"Feedback", value:"2 threads" },
                      { e:"💳", label:"Invoice",  value:"$2,400 due" },
                    ].map(({ e, label, value }) => (
                      <div key={label} style={{ background:"#F9F9F9", border:"1px solid #EDEDED", borderRadius:14, padding:"16px 18px" }}>
                        <div style={{ fontSize:20, marginBottom:6 }}>{e}</div>
                        <div style={{ fontSize:11, color:CMute }}>{label}</div>
                        <div style={{ fontSize:14, fontWeight:700, color:CDk }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginTop:20, background:"#F5F5F5", borderRadius:100, height:7, overflow:"hidden" }}>
                    <div style={{ width:"60%", height:"100%", background:C, borderRadius:100 }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:CMute, marginTop:6 }}>
                    <span>60% complete</span><span>Due in 12 days</span>
                  </div>
                  </div>
                </div>
                <div className="pk-float" style={{ position:"absolute", top:34, right:-24, background:"#fff", borderRadius:16, padding:"14px 16px", boxShadow:"0 18px 44px rgba(15,23,42,.14)", display:"flex", alignItems:"center", gap:12, border:"1px solid #EEF2F7" }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"#ECFDF5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>✓</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#059669" }}>Invoice paid</div>
                    <div style={{ fontSize:11, color:CMute }}>$2,400 received today</div>
                  </div>
                </div>
                <div className="pk-float" style={{ position:"absolute", bottom:26, left:-24, background:"#fff", borderRadius:16, padding:"14px 16px", boxShadow:"0 18px 44px rgba(15,23,42,.14)", border:"1px solid #EEF2F7", minWidth:190 }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"#94A3B8", marginBottom:8 }}>Client timeline</div>
                  <div style={{ display:"grid", gap:8 }}>
                    {[
                      { label:"Proposal sent", done:true },
                      { label:"Contract signed", done:true },
                      { label:"Final delivery", done:false },
                    ].map((item) => (
                      <div key={item.label} style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:16, height:16, borderRadius:"50%", background:item.done ? C : "#E2E8F0", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700 }}>
                          {item.done ? "✓" : ""}
                        </div>
                        <span style={{ fontSize:12, color:item.done ? "#475569" : CDk, fontWeight:600 }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Competitor Comparison ────────────────────── */}
        <section style={{ background:"#fff", padding:"56px 0", borderBottom:`1px solid #F0F0F0` }}>
          <div className="pk-shell pk-section-stage" data-pk-section-drift>
            <div className="pk-reveal" style={{ textAlign:"center", marginBottom:36 }}>
              <p style={{ fontSize:12, fontWeight:700, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:10 }}>Why freelancers switch to SoloPad</p>
              <p style={{ fontSize:18, fontWeight:600, color:CDk }}>Same features. Lower price. Zero bloat.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:18 }}>
              {[
                { competitor:"HoneyBook", pain:"charges $36/mo", fix:"SoloPad starts at $9/mo", accent:O },
                { competitor:"Dubsado",   pain:"takes hours to set up", fix:"SoloPad is ready in 10 minutes", accent:C },
                { competitor:"Bonsai",    pain:"is US-only for tax features", fix:"SoloPad works globally", accent:"#7C3AED" },
              ].map(({ competitor, pain, fix, accent }) => (
                <div key={competitor} className="pk-reveal" style={{ background:"#FAFAFA", border:"1px solid #EBEBEB", borderRadius:18, padding:"24px 26px", boxShadow:"0 4px 16px rgba(0,0,0,.04)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:accent, flexShrink:0 }} />
                    <span style={{ fontSize:13, fontWeight:700, color:"#94A3B8", textDecoration:"line-through" }}>{competitor} {pain}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", background:C, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Check size={10} color="#fff" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize:15, fontWeight:700, color:CDk }}>{fix}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Problem ──────────────────────────────────── */}
        <section style={{ background:"#F8FAFC", padding:"96px 0" }}>
          <div className="pk-shell pk-section-stage" data-pk-section-drift>
            <div className="pk-reveal pk-split-intro pk-split-intro-problem" style={{ marginBottom:44 }}>
              <div>
                <p style={{ fontSize:12, fontWeight:700, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14 }}>The problem</p>
                <h2 style={{ fontSize:"clamp(34px, 4.6vw, 64px)", fontWeight:700, color:CDk, letterSpacing:"-1.6px", lineHeight:1.02, marginBottom:14 }}>
                  Freelancing is great.
                  <br />
                  <span style={{ color:"#94A3B8" }}>Client management isn&apos;t.</span>
                </h2>
              </div>
              <div
                className="pk-split-summary"
                style={{
                  maxWidth:360,
                  background:"#FFFFFF",
                  border:"1px solid #E5E7EB",
                  borderRadius:20,
                  padding:"22px 22px 18px",
                  boxShadow:"0 18px 40px rgba(15,23,42,.06)",
                }}
              >
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"#94A3B8", marginBottom:10 }}>What breaks first</div>
                <div style={{ display:"grid", gap:10 }}>
                  {[
                    { n:"01", t:"Feedback gets buried in email threads" },
                    { n:"02", t:"Files drift across tools and versions" },
                    { n:"03", t:"Payments depend on awkward follow-ups" },
                  ].map((item) => (
                    <div key={item.n} style={{ display:"grid", gridTemplateColumns:"36px 1fr", gap:12, alignItems:"start" }}>
                      <div style={{ width:36, height:36, borderRadius:12, background:CLt, color:C, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 }}>
                        {item.n}
                      </div>
                      <div style={{ fontSize:14, lineHeight:1.5, color:"#475569", paddingTop:6 }}>{item.t}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:22 }}>
              {[
                { icon:Clock,       p:"Chasing feedback via email",    f:"One portal link — clients comment directly. No hunting inboxes." },
                { icon:FileText,    p:"Files scattered everywhere",     f:"Upload once. Latest version always there. Zero version confusion." },
                { icon:CreditCard,  p:"Awkward invoice follow-ups",     f:"Client pays on the portal. Stripe handles it. You get notified." },
                { icon:Users,       p:"No CRM — leads tracked on sticky notes", f:"SoloPad's built-in CRM tracks every lead, client, and deal. CSV import included." },
              ].map(({ icon:Icon, p, f }, i) => (
                <div
                  key={p}
                  className={`pk-reveal pk-d${i+1}`}
                  style={{
                    padding:30,
                    background:"#FFFFFF",
                    border:"1px solid #E5E7EB",
                    borderRadius:22,
                    boxShadow:"0 18px 48px rgba(15,23,42,.06)",
                  }}
                >
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                    <div style={{ width:46, height:46, borderRadius:14, background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon size={19} color="#94A3B8" />
                    </div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#CBD5E1", letterSpacing:1, textTransform:"uppercase" }}>
                      Before
                    </div>
                  </div>
                  <p style={{ fontSize:18, fontWeight:600, color:"#94A3B8", lineHeight:1.45, textDecoration:"line-through", textDecorationThickness:"1.5px", marginBottom:18 }}>
                    {p}
                  </p>
                  <div style={{ borderTop:"1px solid #E2E8F0", paddingTop:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <div style={{ width:20, height:20, borderRadius:"50%", background:C, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Check size={10} color="#fff" strokeWidth={3} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:C, letterSpacing:0.2 }}>Solopad fixes it</span>
                    </div>
                    <p style={{ fontSize:16, color:"#475569", lineHeight:1.65 }}>{f}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature 1 — Proposals ────────────────────── */}
        <section id="features" style={{ background:PLt, padding:"96px 0", position:"relative", overflow:"hidden" }}>
          <ParallaxImageCard
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=720&h=960&q=80&auto=format&fit=crop"
            alt="Creative team reviewing proposal work"
            label="Proposal flow"
            top={48}
            right={36}
            width={220}
            height={270}
            speed={0.1}
            rotate="-5deg"
            labelBg="#FFFFFF"
            labelColor={C}
          />
          <div className="feat-grid pk-section-stage" data-pk-section-drift>
            <div className="pk-reveal-left">
              <p style={{ fontSize:12, fontWeight:700, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14 }}>Proposals</p>
              <h2 style={{ fontSize:"clamp(32px, 4vw, 52px)", fontWeight:700, color:CDk, lineHeight:1.08, letterSpacing:"-1px", marginBottom:18 }}>
                Win the job before<br />your competitor replies.
              </h2>
              <p style={{ fontSize:16, color:CMute, lineHeight:1.72, marginBottom:28 }}>
                First impressions close deals. Send a stunning branded proposal in minutes — not hours. No Word docs. No attachments. A live link that wows and converts.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:32 }}>
                {["AI drafts your proposal from a one-line brief", "Client accepts with one click — zero back-and-forth", "Auto-converts to a contract once approved"].map(b => (
                  <div key={b} className="check-row">
                    <div className="check-icon"><Check size={10} color={C} strokeWidth={3} /></div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="btn-primary">Send your first proposal <ArrowRight size={14} /></Link>
            </div>

            {/* Proposal mockup */}
            <div className="pk-reveal-right" style={{ background:"#FAFAFA", borderRadius:20, border:"1px solid #EDEDED", overflow:"hidden", boxShadow:"0 20px 56px rgba(0,0,0,.08)" }}>
              <div style={{ background:C, padding:"22px 24px" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.7)", fontWeight:600, marginBottom:4 }}>PROPOSAL · March 2026</div>
                <div style={{ fontSize:18, fontWeight:700, color:"#fff" }}>Brand Identity Package</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,.75)", marginTop:4 }}>Prepared for Acme Co.</div>
              </div>
              <div style={{ padding:"20px 24px" }}>
                <div style={{ fontSize:11, fontWeight:700, color:CMute, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Scope of Work</div>
                {["Logo design (3 concepts)", "Brand guidelines document", "Social media kit", "2 rounds of revisions"].map((item, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom: i < 3 ? "1px solid #F0F0F0" : "none" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:C, flexShrink:0 }} />
                    <span style={{ fontSize:14, color:CDk }}>{item}</span>
                  </div>
                ))}
                <div style={{ marginTop:16, display:"flex", justifyContent:"space-between", alignItems:"center", background:CLt, borderRadius:10, padding:"14px 16px" }}>
                  <span style={{ fontSize:14, fontWeight:700, color:CDk }}>Total Investment</span>
                  <span style={{ fontSize:20, fontWeight:900, color:C }}>$3,200</span>
                </div>
                <div style={{ marginTop:12, background:C, borderRadius:10, padding:"12px", textAlign:"center", fontSize:14, fontWeight:700, color:"#fff" }}>
                  Accept Proposal →
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature 2 — Contracts ────────────────────── */}
        <section style={{ background:"#FFF7ED", padding:"96px 0", position:"relative", overflow:"hidden" }}>
          <ParallaxImageCard
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=720&h=960&q=80&auto=format&fit=crop"
            alt="Client meeting and agreement discussion"
            label="Signed docs"
            top={56}
            left={42}
            width={210}
            height={250}
            speed={0.08}
            rotate="4deg"
            labelBg={OLt}
            labelColor={O}
          />
          <div className="feat-grid pk-section-stage" data-pk-section-drift>
            {/* Contract mockup */}
            <div className="pk-reveal-left" style={{ background:"#fff", borderRadius:20, border:"1px solid #EDEDED", overflow:"hidden", boxShadow:"0 20px 56px rgba(0,0,0,.08)" }}>
              <div style={{ padding:"20px 24px", borderBottom:"1px solid #F0F0F0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:CMute, textTransform:"uppercase", letterSpacing:1 }}>Service Agreement</div>
                  <div style={{ fontSize:16, fontWeight:700, color:CDk, marginTop:2 }}>Website Redesign Contract</div>
                </div>
                <div style={{ background:OLt, color:O, fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:100 }}>Awaiting signature</div>
              </div>
              <div style={{ padding:"16px 24px" }}>
                {[
                  { label:"Parties",         value:"Sarah K. & Acme Co." },
                  { label:"Start date",      value:"April 1, 2026" },
                  { label:"Payment",         value:"$5,000 · 50% upfront" },
                  { label:"Revision rounds", value:"2 included" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #F9F9F9", fontSize:13 }}>
                    <span style={{ color:CMute, fontWeight:500 }}>{label}</span>
                    <span style={{ color:CDk, fontWeight:700 }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding:"16px 24px", borderTop:"1px solid #F0F0F0" }}>
                <div style={{ fontSize:11, color:CMute, marginBottom:8 }}>Client signature</div>
                <div style={{ background:CLt, border:`1.5px dashed ${C}`, borderRadius:10, padding:"14px", textAlign:"center", fontSize:13, fontWeight:600, color:C }}>
                  ✍️ Click to sign
                </div>
              </div>
            </div>
            <div className="pk-reveal-right">
              <p style={{ fontSize:12, fontWeight:700, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14 }}>Contracts & E-sign</p>
              <h2 style={{ fontSize:"clamp(32px, 4vw, 52px)", fontWeight:700, color:CDk, lineHeight:1.08, letterSpacing:"-1px", marginBottom:18 }}>
                Protect yourself.<br />Look professional.<br />Get paid faster.
              </h2>
              <p style={{ fontSize:16, color:CMute, lineHeight:1.72, marginBottom:28 }}>
                A handshake deal is not a contract. Send legally binding agreements with built-in e-signature. Clients sign in seconds on any device. No printers. No PDFs. No excuses.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:32 }}>
                {["Pre-built templates — just fill in the blanks", "Legally binding e-signature, no third-party tools", "Linked to your proposal — one seamless workflow"].map(b => (
                  <div key={b} className="check-row">
                    <div className="check-icon"><Check size={10} color={C} strokeWidth={3} /></div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="btn-primary">Try contracts free <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>

        {/* ── Feature 3 — Tasks ────────────────────────── */}
        <section style={{ background:BLt, padding:"96px 0", position:"relative", overflow:"hidden" }}>
          <ParallaxImageCard
            src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=720&h=960&q=80&auto=format&fit=crop"
            alt="Project planning notes and laptop"
            label="Live progress"
            bottom={36}
            right={34}
            width={220}
            height={265}
            speed={0.11}
            rotate="5deg"
            labelBg={CLt}
            labelColor={C}
          />
          <div className="feat-grid pk-section-stage" data-pk-section-drift>
            <div className="pk-reveal-left">
              <p style={{ fontSize:12, fontWeight:700, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14 }}>Projects & Tasks</p>
              <h2 style={{ fontSize:"clamp(32px, 4vw, 52px)", fontWeight:700, color:CDk, lineHeight:1.08, letterSpacing:"-1px", marginBottom:18 }}>
                Big milestones.<br />Tiny tasks.<br />Total control.
              </h2>
              <p style={{ fontSize:16, color:CMute, lineHeight:1.72, marginBottom:28 }}>
                Break any project into milestones, then into tasks. Clients see live progress — you look on top of everything. Even when chaos is happening behind the scenes.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:32 }}>
                {["Milestone → sub-task breakdown in seconds", "Clients see progress without you sending updates", "Mark complete — portal updates in real time"].map(b => (
                  <div key={b} className="check-row">
                    <div className="check-icon"><Check size={10} color={C} strokeWidth={3} /></div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="btn-primary">Start your first project <ArrowRight size={14} /></Link>
            </div>

            {/* Tasks mockup */}
            <div className="pk-reveal-right" style={{ background:"#fff", borderRadius:20, border:"1px solid #EDEDED", overflow:"hidden", boxShadow:"0 20px 56px rgba(0,0,0,.08)" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid #F0F0F0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:15, fontWeight:700, color:CDk }}>Website Redesign</span>
                <span style={{ background:CLt, color:C, fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:100 }}>In Progress</span>
              </div>
              <div style={{ padding:"12px 20px" }}>
                {[
                  { milestone:"Discovery", done:true,  tasks:["Kickoff call", "Brand questionnaire", "Moodboard"] },
                  { milestone:"Design",    done:false,  tasks:["Homepage wireframe", "Mobile layouts", "Client review"] },
                ].map(({ milestone, done, tasks }) => (
                  <div key={milestone} style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", background:done?C:"#E5E7EB", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {done && <Check size={9} color="#fff" strokeWidth={3} />}
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:done?CMute:CDk, textDecoration:done?"line-through":"none" }}>{milestone}</span>
                      <span style={{ fontSize:11, color:CMute, marginLeft:"auto" }}>{done?"Complete":"Active"}</span>
                    </div>
                    {tasks.map((t, i) => (
                      <div key={t} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px 6px 26px", borderRadius:8, background: i===1 && !done ? CLt : "transparent" }}>
                        <div style={{ width:14, height:14, borderRadius:4, border:`1.5px solid ${done||i===0?C:"#D1D5DB"}`, background:done||i===0?C:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {(done||i===0) && <Check size={8} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize:13, color:done||i===0?CMute:CDk, textDecoration:done||i===0?"line-through":"none" }}>{t}</span>
                        {i===1&&!done && <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700, color:O, background:OLt, padding:"2px 8px", borderRadius:100 }}>Now</span>}
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{ background:"#F9F9F9", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:8, border:"1px dashed #E0E0E0" }}>
                  <span style={{ fontSize:18, color:"#D1D5DB" }}>+</span>
                  <span style={{ fontSize:13, color:"#BBBBBB" }}>Add milestone...</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature 4 — AI ───────────────────────────── */}
        <section style={{ background:"#F5F0E8", padding:"104px 0", position:"relative", overflow:"hidden" }}>
          <ParallaxImageCard
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=720&h=960&q=80&auto=format&fit=crop"
            alt="Creative brief workspace with laptop, notebook, and coffee"
            label="From brief"
            top={36}
            left={36}
            width={200}
            height={245}
            speed={0.1}
            rotate="4deg"
            labelBg="#FFFFFF"
            labelColor={CDk}
          />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg, rgba(255,255,255,.54) 0%, rgba(255,250,245,.48) 34%, rgba(245,240,232,.92) 100%)" }} />
          <div style={{ position:"absolute", top:-90, right:"10%", width:360, height:360, borderRadius:"50%", background:"rgba(251,191,36,.10)", filter:"blur(92px)" }} />
          <div style={{ position:"absolute", bottom:-120, left:"6%", width:320, height:320, borderRadius:"50%", background:"rgba(59,130,246,.08)", filter:"blur(96px)" }} />
          <div className="feat-grid pk-section-stage" data-pk-section-drift>
            {/* AI chat mockup */}
            <div className="pk-reveal-left" style={{ position:"relative" }}>
              <div style={{ position:"absolute", top:-12, left:-14, width:144, height:144, borderRadius:34, background:"rgba(255,255,255,.48)", filter:"blur(18px)" }} />
              <div style={{ position:"absolute", right:-16, bottom:42, width:164, height:164, borderRadius:40, background:"rgba(251,191,36,.12)", filter:"blur(28px)" }} />
              <div style={{ background:"rgba(255,255,255,.78)", borderRadius:30, border:"1px solid rgba(226,232,240,.9)", overflow:"hidden", boxShadow:"0 28px 72px rgba(15,23,42,.08)", backdropFilter:"blur(10px)", position:"relative" }}>
                <div style={{ padding:"18px 22px", borderBottom:"1px solid rgba(226,232,240,.9)", display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,.76)" }}>
                  <div style={{ width:36, height:36, borderRadius:14, background:"linear-gradient(135deg,#2563EB,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:"#fff", boxShadow:"0 12px 24px rgba(37,99,235,.22)" }}>✦</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                    <span style={{ fontSize:15, fontWeight:700, color:CDk }}>AI Draft Assistant</span>
                    <span style={{ fontSize:11, color:"#64748B" }}>Proposal draft in seconds</span>
                  </div>
                  <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700, color:C, background:"#E0EAFF", padding:"5px 10px", borderRadius:100 }}>Live beta</span>
                </div>

                <div style={{ padding:"22px", display:"grid", gap:16, background:"linear-gradient(180deg, rgba(255,255,255,.86) 0%, rgba(248,250,252,.96) 100%)" }}>
                  <div style={{ background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:20, padding:"16px 18px", boxShadow:"0 12px 30px rgba(15,23,42,.05)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:"#2563EB" }} />
                      <span style={{ fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:1.2 }}>Prompt</span>
                    </div>
                    <p style={{ margin:0, fontSize:14, color:"#334155", lineHeight:1.65 }}>
                      Draft a logo redesign proposal. Budget is $2,500. Make it polished and easy to approve.
                    </p>
                  </div>

                  <div style={{ background:"linear-gradient(180deg, #1E3A8A 0%, #1D4ED8 100%)", borderRadius:22, padding:"18px 18px 16px", color:"#fff", boxShadow:"0 20px 42px rgba(37,99,235,.22)" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                      <span style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", color:"#DBEAFE" }}>Generated draft</span>
                      <span style={{ fontSize:11, fontWeight:700, color:"#DBEAFE" }}>12 sec</span>
                    </div>
                    <h3 style={{ margin:"0 0 10px", fontSize:21, fontWeight:700, color:"#fff" }}>Logo Redesign Proposal</h3>
                    <p style={{ margin:"0 0 14px", fontSize:13, lineHeight:1.65, color:"rgba(255,255,255,.88)" }}>
                      Clean scope, clear price, ready to review.
                    </p>
                    <div style={{ display:"grid", gap:8, marginBottom:16 }}>
                      {["3 logo concepts", "2 revision rounds"].map((item) => (
                        <div key={item} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"rgba(255,255,255,.92)" }}>
                          <span style={{ width:5, height:5, borderRadius:"50%", background:"#BFDBFE", flexShrink:0 }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:10, alignItems:"center", paddingTop:14, borderTop:"1px solid rgba(191,219,254,.2)" }}>
                      <span style={{ fontSize:12, color:"#DBEAFE" }}>Investment $2,500</span>
                      <div style={{ background:"#FFFFFF", borderRadius:12, padding:"10px 14px", fontSize:12, fontWeight:700, color:C }}>Use draft</div>
                      <div style={{ background:"rgba(255,255,255,.18)", border:"1px solid rgba(255,255,255,.18)", borderRadius:12, padding:"10px 14px", fontSize:12, fontWeight:600, color:"#DBEAFE" }}>Edit</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pk-reveal-right">
              <p style={{ fontSize:12, fontWeight:700, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14 }}>AI Writing Assistant</p>
              <h2 style={{ fontSize:"clamp(32px, 4vw, 52px)", fontWeight:700, color:CDk, lineHeight:1.08, letterSpacing:"-1px", marginBottom:18 }}>
                Stuck on the first draft?<br />AI writes the start.<br /><span style={{ color:C }}>You finish with confidence.</span>
              </h2>
              <p style={{ fontSize:17, color:"#52525B", lineHeight:1.74, marginBottom:28 }}>
                Give Solopad a short brief and get a clean draft back in seconds. Edit it, approve it, send it.
              </p>
              
              <div style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:32 }}>
                {["Starts from your brief", "Built for freelance workflows", "You stay in control of the final version"].map((b) => (
                  <div key={b} className="check-row" style={{ color:"#334155" }}>
                    <div className="check-icon" style={{ background:"#DBEAFE" }}><Check size={10} color={C} strokeWidth={3} /></div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="btn-primary">Try AI drafting free <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>

        {/* ── Everything You Need ──────────────────────── */}
        <section style={{ background:"#F8FAFC", padding:"96px 0" }}>
          <div className="pk-shell pk-section-stage" data-pk-section-drift>
            <div className="pk-reveal" style={{ textAlign:"center", marginBottom:52 }}>
              <p style={{ fontSize:12, fontWeight:700, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>Everything you need</p>
              <h2 style={{ fontSize:"clamp(28px, 3.8vw, 52px)", fontWeight:700, color:CDk, letterSpacing:"-1px", lineHeight:1.08, marginBottom:14 }}>One tool. Not ten.</h2>
              <p style={{ fontSize:16, color:CMute, maxWidth:480, margin:"0 auto", lineHeight:1.72 }}>Stop juggling apps. SoloPad handles your entire client workflow.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:18 }}>
              {[
                { Icon:Link2,        title:"Client Portal",          desc:"Share one link. Clients see files, progress, and invoices." },
                { Icon:FileText,     title:"Proposals",              desc:"AI-drafted proposals that clients accept with one click." },
                { Icon:PenTool,      title:"Contracts & E-sign",     desc:"Legally binding contracts with built-in e-signature." },
                { Icon:CreditCard,   title:"Invoices & Payments",    desc:"Line-item invoices with Stripe. Clients pay online." },
                { Icon:Users,        title:"CRM & Contacts",         desc:"Track leads, active clients, and archived contacts." },
                { Icon:CheckSquare,  title:"Projects & Tasks",       desc:"Milestones, subtasks, and AI-generated task lists." },
                { Icon:Clock,        title:"Time Tracking",          desc:"Log billable hours per project. Know your true hourly rate." },
                { Icon:Calendar,     title:"Scheduler & Bookings",   desc:"Share a booking page. Clients book meetings themselves." },
                { Icon:TrendingUp,   title:"Finance & Expenses",     desc:"Revenue, expenses, and profit at a glance." },
                { Icon:UserPlus,     title:"Team Collaboration",     desc:"Invite teammates with role-based permissions." },
                { Icon:Printer,      title:"PDF Templates",          desc:"Customizable PDFs for invoices, proposals, and contracts." },
                { Icon:Zap,          title:"AI Assistant",           desc:"AI drafts proposals, contracts, and task lists from a brief." },
              ].map(({ Icon, title, desc }, i) => (
                <div
                  key={title}
                  className={`pk-reveal pk-d${(i % 4) + 1}`}
                  style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:18, padding:"24px 22px", boxShadow:"0 4px 18px rgba(15,23,42,.05)" }}
                >
                  <div style={{ width:42, height:42, borderRadius:12, background:CLt, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                    <Icon size={18} color={C} />
                  </div>
                  <p style={{ fontSize:15, fontWeight:700, color:CDk, marginBottom:6 }}>{title}</p>
                  <p style={{ fontSize:13, color:CMute, lineHeight:1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────── */}
        <section id="how-it-works" style={{ background:PRT, padding:"96px 0", position:"relative", overflow:"hidden" }}>
          <ParallaxImageCard
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=720&h=960&q=80&auto=format&fit=crop"
            alt="Freelancer setting up a digital workflow"
            label="Set up fast"
            top={38}
            right={40}
            width={210}
            height={250}
            speed={0.09}
            rotate="-4deg"
            labelBg="#FFFFFF"
            labelColor={CDk}
          />
          <div className="pk-shell pk-section-stage" data-pk-section-drift>
            <div className="pk-reveal pk-split-intro pk-split-intro-setup" style={{ marginBottom:54 }}>
              <div>
                <p style={{ fontSize:12, fontWeight:700, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>How it works</p>
                <h2 style={{ fontSize:"clamp(30px, 4vw, 52px)", fontWeight:700, color:CDk, letterSpacing:"-1px", lineHeight:1.06, marginBottom:14 }}>
                  Set up once.<br />
                  <span style={{ color:C }}>Run every client project from one place.</span>
                </h2>
                <p style={{ fontSize:16, color:"#5B6475", lineHeight:1.75, maxWidth:620 }}>
                  Solopad keeps the setup simple: open the project, upload the work, share the portal, get approved and paid.
                </p>
              </div>
              <div className="pk-split-summary" style={{ maxWidth:320, background:"rgba(255,255,255,.62)", border:"1px solid rgba(17,24,39,.08)", borderRadius:24, padding:"20px 22px", boxShadow:"0 18px 42px rgba(15,23,42,.06)", backdropFilter:"blur(8px)" }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", color:"#64748B", marginBottom:10 }}>What the client sees</div>
                <div style={{ display:"grid", gap:10 }}>
                  {["One clean link", "Live files and notes", "Easy payment flow"].map((item) => (
                    <div key={item} style={{ display:"flex", alignItems:"center", gap:10, fontSize:14, color:"#334155" }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", background:CLt, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <Check size={10} color={C} strokeWidth={3} />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pk-flow-shell">
              <div className="pk-flow-line" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:18, position:"relative" }}>
                {[
                  { n:"01", t:"Create the project", d:"Add the title, deadline, and client. You are live in under a minute.", bg:"#FFFFFF", tag:"Start" },
                  { n:"02", t:"Upload the work", d:"Drop in files, notes, and invoices so nothing gets scattered.", bg:CLt, tag:"Organize" },
                  { n:"03", t:"Share the portal", d:"Send one link. Clients see progress without chasing you for updates.", bg:"#FFFFFF", tag:"Share" },
                  { n:"04", t:"Get approved", d:"Client reviews, pays with Stripe, and the project moves forward cleanly.", bg:OLt, tag:"Finish" },
                ].map(({ n, t, d, bg, tag }, i) => (
                  <div key={n} className={`pk-reveal pk-d${i+1}`} style={{ background:bg, borderRadius:24, border:"1px solid rgba(17,24,39,.08)", padding:"26px 22px 24px", minHeight:228, boxShadow:"0 12px 28px rgba(15,23,42,.04)" }}>
                    <div style={{ width:50, height:50, borderRadius:16, background:C, color:"#fff", fontSize:17, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22, boxShadow:"0 14px 28px rgba(29,78,216,.18)" }}>
                      {n}
                    </div>
                    <h3 style={{ fontSize:20, fontWeight:700, color:CDk, marginBottom:10, lineHeight:1.25 }}>{t}</h3>
                    <p style={{ fontSize:14, color:"#5B6475", lineHeight:1.72, marginBottom:20 }}>{d}</p>
                    <div style={{ fontSize:12, fontWeight:700, color:C, letterSpacing:.2 }}>{tag}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Photo strip ──────────────────────────────── */}
        <section style={{ background:"#F3F4F6", padding:"64px 0" }}>
          <div className="pk-shell pk-section-stage" data-pk-section-drift>
            <div className="pk-reveal pk-photo-strip">
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=700&h=500&q=80&auto=format&fit=crop"
                alt="Freelancer working"
                style={{ width:"100%", height:280, objectFit:"cover", borderRadius:0, display:"block" }}
              />
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=500&q=80&auto=format&fit=crop"
                alt="Client collaboration"
                style={{ width:"100%", height:280, objectFit:"cover", borderRadius:0, display:"block" }}
              />
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=500&h=500&q=80&auto=format&fit=crop"
                alt="Remote team"
                style={{ width:"100%", height:280, objectFit:"cover", borderRadius:0, display:"block" }}
              />
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────── */}
        {/* TODO: Replace with real testimonials */}
        <section style={{ background:"#fff", padding:"96px 0" }}>
          <div className="pk-shell pk-section-stage" data-pk-section-drift>
            <div className="pk-reveal" style={{ textAlign:"center", marginBottom:52 }}>
              <p style={{ fontSize:12, fontWeight:700, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>What freelancers say</p>
              <h2 style={{ fontSize:"clamp(26px, 3.4vw, 44px)", fontWeight:700, color:CDk, letterSpacing:"-0.8px" }}>Built by a freelancer. Loved by freelancers.</h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:22 }}>
              {[
                {
                  quote:"I was paying $36/mo for HoneyBook and using maybe 20% of it. SoloPad gives me everything I need for $9.",
                  name:"Alex R.",
                  role:"Freelance Designer",
                  avatar:"photo-1573496359142-b8d87734a5a2",
                },
                {
                  quote:"I set it up in 10 minutes and sent my first client portal the same day. My clients love it.",
                  name:"James K.",
                  role:"Web Developer",
                  avatar:"photo-1552058544-f2b08422138a",
                },
                {
                  quote:"My clients pay faster now because the invoice is right there in the portal. No more chasing.",
                  name:"Sarah M.",
                  role:"Marketing Consultant",
                  avatar:"photo-1580489944761-15a19d654956",
                },
              ].map(({ quote, name, role, avatar }, i) => (
                <div
                  key={name}
                  className={`pk-reveal pk-d${i + 1}`}
                  style={{ background:"#FAFAFA", border:"1px solid #EBEBEB", borderRadius:20, padding:"28px 26px", boxShadow:"0 4px 18px rgba(15,23,42,.05)" }}
                >
                  <div style={{ display:"flex", gap:4, marginBottom:16 }}>
                    {[1,2,3,4,5].map(s => <span key={s} style={{ color:"#F59E0B", fontSize:14 }}>★</span>)}
                  </div>
                  <p style={{ fontSize:15, color:"#334155", lineHeight:1.72, marginBottom:22 }}>&ldquo;{quote}&rdquo;</p>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <img
                      src={`https://images.unsplash.com/${avatar}?w=64&h=64&q=80&auto=format&fit=crop&crop=face`}
                      alt={name}
                      style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover", border:"2px solid #E2E8F0" }}
                    />
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:CDk, marginBottom:2 }}>{name}</p>
                      <p style={{ fontSize:12, color:CMute }}>{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────── */}
        <section id="pricing" style={{ background:"#FFF7ED", padding:"96px 0", position:"relative", overflow:"hidden" }}>
          <div className="pk-shell pk-section-stage" data-pk-section-drift>
            <div className="pk-reveal" style={{ textAlign:"center", marginBottom:52 }}>
              <p style={{ fontSize:12, fontWeight:700, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>Pricing</p>
              <h2 style={{ fontSize:"clamp(28px, 3.5vw, 46px)", fontWeight:900, color:CDk, letterSpacing:"-0.8px" }}>Simple, honest pricing.</h2>
              <p style={{ fontSize:16, color:CMute, marginTop:12 }}>No transaction fees. No hidden costs. No surprises.</p>
            </div>
            <div className="pk-price-grid">
              {plans.map((plan, i) => (
                <div key={plan.name} className={`pk-reveal pk-d${i+1} ${plan.highlight ? "pk-price-card-highlight" : ""}`} style={{ borderRadius:22, padding:32, border:plan.highlight?`2px solid ${C}`:"1px solid #EBEBEB", background:plan.highlight?CLt:"#fff", boxShadow:plan.highlight?`0 24px 64px ${C}22`:"0 2px 12px rgba(0,0,0,.04)", position:"relative" }}>
                  {plan.highlight && (
                    <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:O, color:"#fff", borderRadius:100, padding:"5px 16px", fontSize:12, fontWeight:700, whiteSpace:"nowrap" }}>
                      Most popular
                    </div>
                  )}
                  <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, color:CMute, marginBottom:8 }}>{plan.name}</p>
                  <div style={{ display:"flex", alignItems:"flex-end", gap:4, marginBottom:8 }}>
                    <span style={{ fontSize:52, fontWeight:900, color:plan.highlight?C:CDk, lineHeight:1, letterSpacing:"-1px" }}>{plan.price}</span>
                    <span style={{ fontSize:14, color:CMute, marginBottom:8 }}>{plan.period}</span>
                  </div>
                  <p style={{ fontSize:14, color:CMute, lineHeight:1.6, marginBottom:24 }}>{plan.description}</p>
                  <ul style={{ marginBottom:28, display:"flex", flexDirection:"column", gap:10 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display:"flex", alignItems:"center", gap:9, fontSize:14 }}>
                        <div style={{ width:19, height:19, borderRadius:"50%", background:`${C}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <Check size={10} color={C} strokeWidth={3} />
                        </div>
                        <span style={{ color:"#444" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className={plan.highlight?"btn-primary":"btn-outline"} style={{ display:"block", textAlign:"center", justifyContent:"center" }}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
            <p style={{ textAlign:"center", fontSize:13, color:"#AAAAAA", marginTop:28 }}>
              All plans include a 14-day free trial of the next tier · Cancel anytime
            </p>
          </div>
        </section>

        {/* ── Email Capture ────────────────────────────── */}
        {/* TODO: Connect to ConvertKit/Mailchimp */}
        <section style={{ background:"#F8FAFC", padding:"64px 0", borderTop:"1px solid #EBEBEB", borderBottom:"1px solid #EBEBEB" }}>
          <div className="pk-shell">
            <div className="pk-reveal" style={{ maxWidth:520, margin:"0 auto", textAlign:"center" }}>
              <p style={{ fontSize:20, fontWeight:700, color:CDk, marginBottom:8 }}>Get freelancer tips &amp; product updates</p>
              <p style={{ fontSize:14, color:CMute, marginBottom:28 }}>No spam. Unsubscribe anytime.</p>
              <form
                onSubmit={(e) => { e.preventDefault(); const email = e.target.email.value; if (email) { fetch("/api/newsletter/subscribe", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email }) }).catch(() => {}); e.target.reset(); } }}
                style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="your@email.com"
                  style={{ flex:"1 1 240px", minWidth:0, border:"1.5px solid #D1D5DB", borderRadius:10, padding:"12px 16px", fontSize:15, outline:"none", color:CDk, background:"#fff" }}
                />
                <button type="submit" className="btn-primary" style={{ flexShrink:0 }}>
                  Subscribe <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────── */}
        <section style={{ background:"#fff", padding:"80px 0" }}>
          <div className="pk-shell">
            <div className="pk-reveal pk-final-cta pk-section-stage" data-pk-section-drift>
              <div style={{ position:"absolute", top:-70, right:-70, width:240, height:240, borderRadius:"50%", background:"rgba(255,255,255,.08)" }} />
              <div style={{ position:"absolute", bottom:-60, left:-60, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,.05)" }} />
              <div style={{ position:"relative" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:24 }}>
                  <div style={{ display:"flex" }}>
                    {[
                      "photo-1573496359142-b8d87734a5a2",
                      "photo-1552058544-f2b08422138a",
                      "photo-1580489944761-15a19d654956",
                      "photo-1542909168-82c3e7fdca5c",
                    ].map((id, i) => (
                      <img
                        key={id}
                        src={`https://images.unsplash.com/${id}?w=64&h=64&q=80&auto=format&fit=crop&crop=face`}
                        alt="user"
                        style={{ width:32, height:32, borderRadius:"50%", border:"2px solid rgba(255,255,255,.5)", objectFit:"cover", marginLeft: i === 0 ? 0 : -8 }}
                      />
                    ))}
                  </div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,.15)", borderRadius:100, padding:"6px 16px" }}>
                    <Users size={13} color="#fff" />
                    <span style={{ fontSize:13, fontWeight:600, color:"#fff" }}>Join freelancers who work smarter</span>
                  </div>
                </div>
                <h2 style={{ fontSize:"clamp(28px, 4vw, 52px)", fontWeight:900, color:"#fff", letterSpacing:"-1px", marginBottom:16, lineHeight:1.1 }}>
                  Ready to stop chasing?
                </h2>
                <p style={{ fontSize:17, color:"rgba(255,255,255,.8)", maxWidth:460, margin:"0 auto 36px", lineHeight:1.65 }}>
                  Set up your freelance workspace in 10 minutes. Proposals, contracts, invoicing, CRM, and a client portal — free forever on one project.
                </p>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, flexWrap:"wrap" }}>
                  <Link href="/signup" style={{ background:"#fff", color:C, borderRadius:12, padding:"14px 30px", fontSize:16, fontWeight:700, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8, boxShadow:"0 8px 28px rgba(0,0,0,.18)", transition:"transform .15s" }}>
                    Create your free portal <ArrowRight size={16} />
                  </Link>
                  <Link href={authHref} style={{ color:"rgba(255,255,255,.75)", fontSize:14, fontWeight:600, textDecoration:"none" }}>
                    Already have an account? Log in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────── */}
        <footer style={{ borderTop:"1px solid #EBEBEB", background:"#fff", padding:"56px 0 32px" }}>
          <div className="pk-shell">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:40, marginBottom:48 }}>
              {/* Col 1 — Brand */}
              <div>
                <BrandLogo markClassName="h-7 w-7" textClassName="text-[15px] font-black text-[#111111]" />
                <p style={{ fontSize:13, color:"#AAAAAA", marginTop:12, lineHeight:1.65 }}>Built for freelancers who want to get paid.</p>
              </div>
              {/* Col 2 — Product */}
              <div>
                <p style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, color:"#94A3B8", marginBottom:16 }}>Product</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    { label:"Features",      href:"#features" },
                    { label:"Pricing",       href:"#pricing" },
                    { label:"How it works",  href:"#how-it-works" },
                  ].map(({ label, href }) => (
                    <Link key={label} href={href} style={{ fontSize:14, color:"#555", textDecoration:"none" }}>{label}</Link>
                  ))}
                </div>
              </div>
              {/* Col 3 — Resources */}
              <div>
                <p style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, color:"#94A3B8", marginBottom:16 }}>Resources</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    { label:"Blog",         href:"/blog" },
                    { label:"Help Center",  href:"#" },
                    { label:"Contact",      href:"mailto:ayaturrehman2050@gmail.com" },
                  ].map(({ label, href }) => (
                    <Link key={label} href={href} style={{ fontSize:14, color:"#555", textDecoration:"none" }}>{label}</Link>
                  ))}
                </div>
              </div>
              {/* Col 4 — Legal */}
              <div>
                <p style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, color:"#94A3B8", marginBottom:16 }}>Legal</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    { label:"Privacy Policy",    href:"#" },
                    { label:"Terms of Service",  href:"#" },
                  ].map(({ label, href }) => (
                    <Link key={label} href={href} style={{ fontSize:14, color:"#555", textDecoration:"none" }}>{label}</Link>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop:"1px solid #F0F0F0", paddingTop:24, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
              <span style={{ fontSize:13, color:"#AAAAAA" }}>© 2026 SoloPad. All rights reserved.</span>
              <div style={{ display:"flex", gap:20 }}>
                <Link href={authHref} style={{ fontSize:13, color:"#AAAAAA", textDecoration:"none" }}>Log in</Link>
                <Link href="/signup" style={{ fontSize:13, color:"#AAAAAA", textDecoration:"none" }}>Sign up</Link>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
