"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {
  Zap, ArrowRight, Check, FileText,
  CreditCard, Clock, Users,
} from "lucide-react";
import { PLAN_ORDER, getPlan } from "@/lib/plans";

const plans = PLAN_ORDER.map((planId) => ({
  ...getPlan(planId),
  href: `/signup?plan=${planId}`,
  highlight: planId === "solo",
}));

const C     = "#E8533A";
const CLt   = "#FFF3F0";
const CDk   = "#111111";
const CMute = "#777777";


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

export default function LandingPage() {
  const { data: session } = useSession();
  const authHref = session ? "/dashboard" : "/login";
  useFadeIn();

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .pk { font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif; color: ${CDk}; background: #fff; }

        .btn-primary {
          background: ${C}; color: #fff; border: none; cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          border-radius: 10px; padding: 13px 26px; font-size: 15px; font-weight: 700;
          text-decoration: none; transition: background .15s, transform .15s, box-shadow .15s;
        }
        .btn-primary:hover { background: #CF4530; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(232,83,58,.38); }

        .btn-outline {
          background: #fff; color: ${CDk}; border: 1.5px solid #DEDEDE; cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          border-radius: 10px; padding: 12px 24px; font-size: 15px; font-weight: 600;
          text-decoration: none; transition: border-color .15s, box-shadow .15s;
        }
        .btn-outline:hover { border-color: ${C}; box-shadow: 0 2px 14px rgba(232,83,58,.12); }

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
      `}</style>

      <div className="pk">

        {/* ── Nav ─────────────────────────────────────── */}
        <header style={{ background:"#fff", borderBottom:"1px solid #EBEBEB", position:"sticky", top:0, zIndex:50 }}>
          <div style={{ maxWidth:"88%", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <div style={{ background:C, borderRadius:9, width:33, height:33, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Zap size={16} color="#fff" />
              </div>
              <span style={{ fontWeight:900, fontSize:18, color:CDk, letterSpacing:"-0.3px" }}>PortalKit</span>
            </div>
            <nav style={{ display:"flex", gap:32 }}>
              <a href="#features"      className="nav-link">Features</a>
              <a href="#how-it-works"  className="nav-link">How it works</a>
              <a href="#pricing"       className="nav-link">Pricing</a>
            </nav>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Link href={authHref} className="nav-link">Log in</Link>
              <Link href="/signup" className="btn-primary" style={{ fontSize:14, padding:"10px 20px" }}>
                Get started free <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </header>

        {/* ── Hero ────────────────────────────────────── */}
        <section style={{ background:"#FAFAF8", overflow:"hidden", padding:"88px 0 0" }}>
          <div style={{ maxWidth:"88%", margin:"0 auto", textAlign:"center" }}>

            {/* Badge */}
            <div className="pk-reveal" style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fff", border:`1.5px solid ${C}30`, borderRadius:100, padding:"6px 16px" }}>
                <span style={{ position:"relative", display:"inline-flex", width:8, height:8 }}>
                  <span className="pk-ping" style={{ position:"absolute", inset:0, borderRadius:"50%", background:C }} />
                  <span style={{ width:8, height:8, borderRadius:"50%", background:C, display:"block", position:"relative" }} />
                </span>
                <span style={{ fontSize:13, fontWeight:600, color:C }}>Client portals for freelancers — from $0/mo</span>
              </div>
            </div>

            {/* Headline */}
            <div className="pk-reveal pk-d1">
              <h1 style={{ fontSize:"clamp(44px, 6vw, 80px)", fontWeight:900, lineHeight:1.04, letterSpacing:"-2px", color:CDk, marginBottom:22 }}>
                One link.<br />Your client sees everything.
              </h1>
              <p style={{ fontSize:18, color:CMute, lineHeight:1.72, maxWidth:520, margin:"0 auto 36px" }}>
                Send one link. Your client sees files, feedback, and invoices — without logging in. No chasing. No confusion. Set up in 10 minutes.
              </p>
            </div>

            {/* CTAs */}
            <div className="pk-reveal pk-d2" style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:14 }}>
              <Link href="/signup" className="btn-primary">Start for free <ArrowRight size={15} /></Link>
              <Link href={authHref} className="btn-outline">Already have an account?</Link>
            </div>
            <p className="pk-reveal pk-d2" style={{ fontSize:12, color:"#AAAAAA", marginBottom:32 }}>Free on 1 project · No credit card · Cancel anytime</p>

            {/* Trust pills */}
            <div className="pk-reveal pk-d3" style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:56 }}>
              {[{ e:"⚡", l:"10 min setup" }, { e:"🔒", l:"No client login" }, { e:"💳", l:"Stripe built in" }].map(({ e, l }) => (
                <div key={l} style={{ display:"flex", alignItems:"center", gap:7, background:"#fff", border:"1px solid #EBEBEB", borderRadius:100, padding:"7px 16px", fontSize:13, fontWeight:600, color:CDk, boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
                  {e} {l}
                </div>
              ))}
            </div>

            {/* Browser mockup — full width below headline */}
            <div className="pk-reveal pk-d3" style={{ position:"relative", maxWidth:860, margin:"0 auto" }}>
              <div style={{ borderRadius:20, overflow:"hidden", border:"1px solid #E0E0E0", boxShadow:"0 40px 100px rgba(0,0,0,.14)", background:"#fff" }}>
                {/* Browser bar */}
                <div style={{ background:"#F5F5F5", borderBottom:"1px solid #E8E8E8", padding:"11px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ display:"flex", gap:6 }}>
                    {["#FF6058","#FFC130","#27C840"].map(bg => <div key={bg} style={{ width:11, height:11, borderRadius:"50%", background:bg }} />)}
                  </div>
                  <div style={{ flex:1, background:"#fff", border:"1px solid #E2E2E2", borderRadius:7, padding:"5px 12px", display:"flex", alignItems:"center", gap:6, maxWidth:320, margin:"0 auto", fontSize:12, color:"#AAAAAA" }}>
                    🔒 portalkit.app/p/acme-co
                  </div>
                </div>
                {/* Portal content */}
                <div style={{ padding:"28px 32px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:C, marginBottom:4 }}>Brand Refresh</div>
                      <div style={{ fontSize:20, fontWeight:800, color:CDk }}>Website Redesign — Acme Co.</div>
                      <div style={{ fontSize:13, color:CMute, marginTop:5 }}>Due March 28 · In progress</div>
                    </div>
                    <span style={{ background:CLt, color:C, borderRadius:8, padding:"5px 14px", fontSize:12, fontWeight:700 }}>Active</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
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
              {/* Floating paid badge */}
              <div className="pk-float" style={{ position:"absolute", bottom:-20, right:20, background:"#fff", borderRadius:14, padding:"12px 18px", boxShadow:"0 8px 32px rgba(0,0,0,.16)", display:"flex", alignItems:"center", gap:10, border:"1px solid #F0F0F0" }}>
                <div style={{ width:34, height:34, borderRadius:"50%", background:"#ECFDF5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>✓</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:"#059669" }}>Invoice paid!</div>
                  <div style={{ fontSize:11, color:CMute }}>$2,400 received</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem ──────────────────────────────────── */}
        <section style={{ background:"#fff", padding:"88px 0" }}>
          <div style={{ maxWidth:"88%", margin:"0 auto" }}>
            <div className="pk-reveal" style={{ textAlign:"center", marginBottom:52 }}>
              <p style={{ fontSize:12, fontWeight:800, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>The problem</p>
              <h2 style={{ fontSize:"clamp(28px, 3.5vw, 46px)", fontWeight:900, color:CDk, letterSpacing:"-0.8px", lineHeight:1.1 }}>
                Freelancing is great.<br /><span style={{ color:"#CCCCCC" }}>Client management isn&apos;t.</span>
              </h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:18 }}>
              {[
                { icon:Clock,       p:"Chasing feedback via email",    f:"One portal link — clients comment directly. No hunting inboxes." },
                { icon:FileText,    p:"Files scattered everywhere",     f:"Upload once. Latest version always there. Zero version confusion." },
                { icon:CreditCard,  p:"Awkward invoice follow-ups",     f:"Client pays on the portal. Stripe handles it. You get notified." },
              ].map(({ icon:Icon, p, f }, i) => (
                <div key={p} className={`pk-card pk-reveal pk-d${i+1}`} style={{ padding:28 }}>
                  <div style={{ width:42, height:42, borderRadius:11, background:"#F5F5F5", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
                    <Icon size={19} color="#BBBBBB" />
                  </div>
                  <p style={{ fontSize:14, fontWeight:600, color:"#CCCCCC", textDecoration:"line-through", marginBottom:14 }}>{p}</p>
                  <div style={{ borderTop:"1px solid #F2F2F2", paddingTop:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                      <div style={{ width:17, height:17, borderRadius:"50%", background:C, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Check size={10} color="#fff" strokeWidth={3} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color:C }}>PortalKit solves this</span>
                    </div>
                    <p style={{ fontSize:14, color:CMute, lineHeight:1.65 }}>{f}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature 1 — Proposals ────────────────────── */}
        <section id="features" style={{ background:"#FAFAF8", padding:"96px 0" }}>
          <div className="feat-grid">
            <div className="pk-reveal-left">
              <p style={{ fontSize:12, fontWeight:800, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14 }}>Proposals</p>
              <h2 style={{ fontSize:"clamp(26px, 3vw, 44px)", fontWeight:900, color:CDk, lineHeight:1.1, letterSpacing:"-0.8px", marginBottom:18 }}>
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
                <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>Brand Identity Package</div>
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
        <section style={{ background:"#fff", padding:"96px 0" }}>
          <div className="feat-grid">
            {/* Contract mockup */}
            <div className="pk-reveal-left" style={{ background:"#fff", borderRadius:20, border:"1px solid #EDEDED", overflow:"hidden", boxShadow:"0 20px 56px rgba(0,0,0,.08)" }}>
              <div style={{ padding:"20px 24px", borderBottom:"1px solid #F0F0F0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:CMute, textTransform:"uppercase", letterSpacing:1 }}>Service Agreement</div>
                  <div style={{ fontSize:16, fontWeight:800, color:CDk, marginTop:2 }}>Website Redesign Contract</div>
                </div>
                <div style={{ background:"#FEF3C7", color:"#D97706", fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:100 }}>Awaiting signature</div>
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
              <p style={{ fontSize:12, fontWeight:800, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14 }}>Contracts & E-sign</p>
              <h2 style={{ fontSize:"clamp(26px, 3vw, 44px)", fontWeight:900, color:CDk, lineHeight:1.1, letterSpacing:"-0.8px", marginBottom:18 }}>
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
        <section style={{ background:"#FAFAF8", padding:"96px 0" }}>
          <div className="feat-grid">
            <div className="pk-reveal-left">
              <p style={{ fontSize:12, fontWeight:800, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14 }}>Projects & Tasks</p>
              <h2 style={{ fontSize:"clamp(26px, 3vw, 44px)", fontWeight:900, color:CDk, lineHeight:1.1, letterSpacing:"-0.8px", marginBottom:18 }}>
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
                <span style={{ fontSize:15, fontWeight:800, color:CDk }}>Website Redesign</span>
                <span style={{ background:"#EEF2FF", color:"#4F46E5", fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:100 }}>In Progress</span>
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
                      <span style={{ fontSize:13, fontWeight:800, color:done?CMute:CDk, textDecoration:done?"line-through":"none" }}>{milestone}</span>
                      <span style={{ fontSize:11, color:CMute, marginLeft:"auto" }}>{done?"Complete":"Active"}</span>
                    </div>
                    {tasks.map((t, i) => (
                      <div key={t} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px 6px 26px", borderRadius:8, background: i===1 && !done ? CLt : "transparent" }}>
                        <div style={{ width:14, height:14, borderRadius:4, border:`1.5px solid ${done||i===0?C:"#D1D5DB"}`, background:done||i===0?C:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {(done||i===0) && <Check size={8} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize:13, color:done||i===0?CMute:CDk, textDecoration:done||i===0?"line-through":"none" }}>{t}</span>
                        {i===1&&!done && <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700, color:C, background:CLt, padding:"2px 8px", borderRadius:100 }}>Now</span>}
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
        <section style={{ background:"#111111", padding:"96px 0", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 65% 50%, ${C}20 0%, transparent 65%)` }} />
          <div className="feat-grid" style={{ position:"relative" }}>
            {/* AI chat mockup */}
            <div className="pk-reveal-left" style={{ background:"rgba(255,255,255,.06)", borderRadius:20, border:"1px solid rgba(255,255,255,.1)", overflow:"hidden", boxShadow:"0 20px 56px rgba(0,0,0,.3)" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#7C3AED,#E8533A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>✦</div>
                <span style={{ fontSize:14, fontWeight:700, color:"#fff" }}>AI Draft Assistant</span>
                <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700, color:"#A78BFA", background:"rgba(167,139,250,.15)", padding:"3px 9px", borderRadius:100 }}>Beta</span>
              </div>
              <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:12 }}>
                {/* User message */}
                <div style={{ background:"rgba(255,255,255,.08)", borderRadius:10, padding:"12px 14px", fontSize:13, color:"rgba(255,255,255,.7)", lineHeight:1.5 }}>
                  <span style={{ fontWeight:700, color:"#fff" }}>You:</span> Draft a proposal for a logo redesign, $2,500 budget, 3 week timeline.
                </div>
                {/* AI response */}
                <div style={{ background:`${C}18`, border:`1px solid ${C}30`, borderRadius:10, padding:"14px", fontSize:13, color:"rgba(255,255,255,.9)", lineHeight:1.65 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                    <span style={{ fontSize:12 }}>✦</span>
                    <span style={{ fontSize:11, fontWeight:700, color:C }}>AI generated · Review before sending</span>
                  </div>
                  <strong style={{ color:"#fff" }}>Logo Redesign Proposal</strong><br /><br />
                  I&apos;d love to help refresh your brand. Here&apos;s what I&apos;ll deliver in 3 weeks:<br /><br />
                  • 3 initial logo concepts<br />
                  • 2 revision rounds included<br />
                  • Final files in all formats<br /><br />
                  <strong style={{ color:C }}>Investment: $2,500</strong>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <div style={{ flex:1, background:C, borderRadius:8, padding:"10px", textAlign:"center", fontSize:12, fontWeight:700, color:"#fff" }}>Use this draft</div>
                  <div style={{ flex:1, background:"rgba(255,255,255,.08)", borderRadius:8, padding:"10px", textAlign:"center", fontSize:12, fontWeight:600, color:"rgba(255,255,255,.55)" }}>Regenerate</div>
                </div>
              </div>
            </div>

            <div className="pk-reveal-right">
              <p style={{ fontSize:12, fontWeight:800, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14 }}>AI Writing Assistant</p>
              <h2 style={{ fontSize:"clamp(26px, 3vw, 44px)", fontWeight:900, color:"#fff", lineHeight:1.1, letterSpacing:"-0.8px", marginBottom:18 }}>
                Writer&apos;s block?<br />AI drafts it.<br /><span style={{ color:C }}>You just send it.</span>
              </h2>
              <p style={{ fontSize:16, color:"rgba(255,255,255,.55)", lineHeight:1.72, marginBottom:28 }}>
                Stop staring at a blank page. Tell PortalKit AI what you need — a proposal, a contract clause, a project update — and get a polished draft in seconds. Edit, send, done.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:32 }}>
                {["Proposals, contracts & updates — all AI-drafted", "Trained on freelance best practices, not generic fluff", "Edit freely — it's your voice, AI just starts it"].map(b => (
                  <div key={b} className="check-row" style={{ color:"rgba(255,255,255,.8)" }}>
                    <div className="check-icon" style={{ background:`${C}25` }}><Check size={10} color={C} strokeWidth={3} /></div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="btn-primary">Try AI drafting free <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────── */}
        <section id="how-it-works" style={{ background:"#fff", padding:"96px 0" }}>
          <div style={{ maxWidth:"88%", margin:"0 auto" }}>
            <div className="pk-reveal" style={{ textAlign:"center", marginBottom:60 }}>
              <p style={{ fontSize:12, fontWeight:800, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>How it works</p>
              <h2 style={{ fontSize:"clamp(28px, 3.5vw, 46px)", fontWeight:900, color:CDk, letterSpacing:"-0.8px" }}>
                Set up in 10 minutes. <span style={{ color:C }}>Seriously.</span>
              </h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:20 }}>
              {[
                { n:"01", t:"Create a project",   d:"Add your project details and deadline. Done in under a minute.", bg:"#FAFAF8" },
                { n:"02", t:"Upload your work",   d:"Drop in files, attach an invoice, write project notes.",          bg:CLt },
                { n:"03", t:"Share one link",     d:"Send the portal URL. Client sees everything — no login needed.",  bg:"#FAFAF8" },
                { n:"04", t:"Get paid, move on",  d:"Client approves, pays via Stripe, project closes. Clean.",        bg:CLt },
              ].map(({ n, t, d, bg }, i) => (
                <div key={n} className={`pk-reveal pk-d${i+1}`} style={{ background:bg, borderRadius:18, border:"1px solid #EBEBEB", padding:"32px 24px", textAlign:"center" }}>
                  <div style={{ width:46, height:46, borderRadius:13, background:C, color:"#fff", fontSize:16, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
                    {n}
                  </div>
                  <h3 style={{ fontSize:16, fontWeight:800, color:CDk, marginBottom:8 }}>{t}</h3>
                  <p style={{ fontSize:14, color:CMute, lineHeight:1.65 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────── */}
        <section id="pricing" style={{ background:"#FAFAF8", padding:"96px 0" }}>
          <div style={{ maxWidth:"88%", margin:"0 auto" }}>
            <div className="pk-reveal" style={{ textAlign:"center", marginBottom:52 }}>
              <p style={{ fontSize:12, fontWeight:800, color:C, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>Pricing</p>
              <h2 style={{ fontSize:"clamp(28px, 3.5vw, 46px)", fontWeight:900, color:CDk, letterSpacing:"-0.8px" }}>Simple, honest pricing.</h2>
              <p style={{ fontSize:16, color:CMute, marginTop:12 }}>No transaction fees. No hidden costs. No surprises.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:20, alignItems:"center" }}>
              {plans.map((plan, i) => (
                <div key={plan.name} className={`pk-reveal pk-d${i+1}`} style={{ borderRadius:22, padding:32, border:plan.highlight?`2px solid ${C}`:"1px solid #EBEBEB", background:plan.highlight?CLt:"#fff", transform:plan.highlight?"scale(1.04)":"none", boxShadow:plan.highlight?`0 24px 64px ${C}22`:"0 2px 12px rgba(0,0,0,.04)", position:"relative" }}>
                  {plan.highlight && (
                    <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:C, color:"#fff", borderRadius:100, padding:"5px 16px", fontSize:12, fontWeight:800, whiteSpace:"nowrap" }}>
                      Most popular
                    </div>
                  )}
                  <p style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:1.2, color:CMute, marginBottom:8 }}>{plan.name}</p>
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

        {/* ── Final CTA ────────────────────────────────── */}
        <section style={{ background:"#fff", padding:"80px 0" }}>
          <div style={{ maxWidth:"88%", margin:"0 auto" }}>
            <div className="pk-reveal" style={{ background:C, borderRadius:28, padding:"72px 48px", textAlign:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-70, right:-70, width:240, height:240, borderRadius:"50%", background:"rgba(255,255,255,.08)" }} />
              <div style={{ position:"absolute", bottom:-60, left:-60, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,.05)" }} />
              <div style={{ position:"relative" }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,.15)", borderRadius:100, padding:"6px 16px", marginBottom:24 }}>
                  <Users size={13} color="#fff" />
                  <span style={{ fontSize:13, fontWeight:600, color:"#fff" }}>Join freelancers who work smarter</span>
                </div>
                <h2 style={{ fontSize:"clamp(28px, 4vw, 52px)", fontWeight:900, color:"#fff", letterSpacing:"-1px", marginBottom:16, lineHeight:1.1 }}>
                  Ready to stop chasing?
                </h2>
                <p style={{ fontSize:17, color:"rgba(255,255,255,.8)", maxWidth:460, margin:"0 auto 36px", lineHeight:1.65 }}>
                  Set up your first client portal in 10 minutes. Free forever on one project.
                </p>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, flexWrap:"wrap" }}>
                  <Link href="/signup" style={{ background:"#fff", color:C, borderRadius:12, padding:"14px 30px", fontSize:16, fontWeight:800, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8, boxShadow:"0 8px 28px rgba(0,0,0,.18)", transition:"transform .15s" }}>
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
        <footer style={{ borderTop:"1px solid #EBEBEB", background:"#fff", padding:"32px 0" }}>
          <div style={{ maxWidth:"88%", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <div style={{ background:C, borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Zap size={13} color="#fff" />
              </div>
              <span style={{ fontWeight:900, color:CDk, fontSize:15 }}>PortalKit</span>
              <span style={{ fontSize:13, color:"#CCCCCC" }}>— Built for freelancers who want to get paid.</span>
            </div>
            <div style={{ display:"flex", gap:24, fontSize:13, color:"#AAAAAA" }}>
              <Link href={authHref} style={{ color:"#AAAAAA", textDecoration:"none" }}>Log in</Link>
              <Link href="/signup" style={{ color:"#AAAAAA", textDecoration:"none" }}>Sign up</Link>
              <span>© 2026 PortalKit</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
