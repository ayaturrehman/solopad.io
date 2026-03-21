import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import AutoPrint from "@/components/AutoPrint";
import { sanitizeHtmlServer as sanitizeHtml } from "@/lib/sanitize-server";

const PAPER_SIZES = {
  A4:     { width: 794,  height: 1123, css: "210mm 297mm" },
  A5:     { width: 559,  height: 794,  css: "148mm 210mm" },
  Letter: { width: 816,  height: 1056, css: "letter" },
};

function pt(n) { return Math.round(n * 1.333); }

function fmtMoney(n, currency = "USD") {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(n || 0); }
  catch { return `$${(n || 0).toFixed(2)}`; }
}

function fmt(date) {
  if (!date) return "";
  try { return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
  catch { return String(date); }
}

export default async function ProposalPrintPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [proposal, template] = await Promise.all([
    db.proposal.findFirst({ where: { id, userId: session.user.id } }),
    db.pdfTemplate.findFirst({ where: { userId: session.user.id, type: "proposal", isDefault: true } }),
  ]);

  if (!proposal) redirect("/proposals");

  const tpl = template || {};
  const paper = PAPER_SIZES[tpl.paperSize] || PAPER_SIZES.A4;
  const accent = tpl.accentColor || "#18181b";
  const headerStyle = tpl.headerStyle || "classic";
  const base = tpl.fontSize || 10;
  const fsPx = pt(base);

  // Fixed standard margins — not from template (same as editor PAGE_PAD values)
  const mH   = 80;   // px  (~21mm, ~0.83in)
  const mTop = 72;   // px  (~19mm, ~0.75in)
  const mBot = 72;   // px
  const mHmm   = 21; // mm for @page
  const mTopmm = 19;
  const mBotmm = 19;

  const fontMap = { times: "Georgia, serif", courier: "'Courier New', monospace", helvetica: "Arial, sans-serif" };
  const ff = fontMap[tpl.fontFamily] || "Arial, sans-serif";
  const thBg = tpl.tableHeaderBg || "#18181b";
  const thColor = tpl.tableHeaderTextColor || "#ffffff";

  const sections = (() => { try { return typeof proposal.sections === "string" ? JSON.parse(proposal.sections) : (proposal.sections || []); } catch { return []; } })();
  const pricing  = (() => { try { return typeof proposal.pricing  === "string" ? JSON.parse(proposal.pricing)  : (proposal.pricing  || []); } catch { return []; } })();

  const subtotal = pricing.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  const lbl = { fontSize: pt(base - 2.5), fontWeight: 600, color: "#9ca3af", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: pt(4) };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        body {
          margin: 0;
          padding: 0;
          background: #e5e7eb;
          font-family: ${ff};
          font-size: ${fsPx}px;
          color: #374151;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Screen: paper card */
        .pp {
          width: ${paper.width}px;
          background: #fff;
          margin: 24px auto;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
        }
        .pp-body { padding-left: ${mH}px; padding-right: ${mH}px; padding-bottom: ${mBot}px; }

        @page {
          size: ${paper.css};
          margin: 0 0 28px 0; /* bottom margin reserved for page number */
          @bottom-right {
            content: "Page " counter(page) " of " counter(pages);
            font-family: ${ff};
            font-size: 9px;
            color: #9ca3af;
            padding-right: ${mH}px;
            padding-bottom: 8px;
          }
        }
        @media print {
          html, body { background: #fff; padding: 0; }
          .pp { width: 100%; margin: 0; box-shadow: none; }
          /*
           * Page-break top margin trick:
           * padding-top carries across page breaks; margin-top does NOT (collapses at boundary).
           * So on page 1 the -margin cancels the padding = no extra gap between sections.
           * On page 2+ the margin collapses to 0 but padding still applies = proper top margin.
           */
          .pb {
            padding-top: ${mTop}px;
            margin-top: -${mTop}px;
          }
          /* First body child already has the header above it — no compensation needed */
          .pp-body > .pb:first-child {
            padding-top: 0;
            margin-top: 0;
          }
        }

        /* Section break control */
        .pb { break-inside: avoid; }
      `}</style>

      <AutoPrint />

      <div className="pp">

        {/* ── Bold header ── */}
        {headerStyle === "bold" && (
          <div style={{ backgroundColor: accent, display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: mTop, paddingLeft: mH, paddingRight: mH, paddingBottom: pt(30), marginBottom: pt(32) }}>
            <div style={{ flex: 1 }}>
              {tpl.businessName && <div style={{ fontSize: pt(base + 6), fontWeight: 700, color: "#fff" }}>{tpl.businessName}</div>}
              {tpl.businessAddress && <div style={{ fontSize: pt(base - 1.5), color: "rgba(255,255,255,0.55)", marginTop: pt(2) }}>{tpl.businessAddress}</div>}
              <div style={{ marginTop: pt(12), fontSize: pt(base + 8), fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{proposal.title}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: pt(base - 2), color: "rgba(255,255,255,0.5)", letterSpacing: "0.16em", textTransform: "uppercase" }}>Proposal</div>
            </div>
          </div>
        )}

        {/* ── Minimal header ── */}
        {headerStyle === "minimal" && (
          <div style={{ marginBottom: pt(28) }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: mTop, paddingLeft: mH, paddingRight: mH, paddingBottom: pt(16) }}>
              {tpl.businessName && <div style={{ fontSize: pt(base + 6), fontWeight: 700, color: "#111827", textAlign: "center" }}>{tpl.businessName}</div>}
            </div>
            <div style={{ height: 1, backgroundColor: "#e5e7eb", marginBottom: pt(20) }} />
            <div style={{ paddingLeft: mH, paddingRight: mH }}>
              <div style={lbl}>Proposal</div>
              <div style={{ fontSize: pt(base + 8), fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{proposal.title}</div>
            </div>
          </div>
        )}

        {/* ── Classic header (default) ── */}
        {(headerStyle === "classic" || !headerStyle) && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: mTop, paddingLeft: mH, paddingRight: mH, paddingBottom: pt(28), borderBottom: "1px solid #e5e7eb", marginBottom: pt(32) }}>
            <div>
              {tpl.businessName && <div style={{ fontSize: pt(base + 6), fontWeight: 700, color: "#111827" }}>{tpl.businessName}</div>}
              {tpl.businessAddress && <div style={{ fontSize: pt(base - 1.5), color: "#9ca3af", marginTop: pt(2) }}>{tpl.businessAddress}</div>}
              {tpl.businessEmail && <div style={{ fontSize: pt(base - 1.5), color: "#9ca3af", marginTop: pt(1) }}>{tpl.businessEmail}</div>}
              <div style={{ marginTop: pt(12) }}>
                <div style={{ fontSize: pt(base + 8), fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{proposal.title}</div>
                {proposal.validUntil && <div style={{ fontSize: pt(base - 1.5), color: "#9ca3af", marginTop: pt(3) }}>Valid until {fmt(proposal.validUntil)}</div>}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ ...lbl, color: accent, letterSpacing: "0.16em" }}>Proposal</div>
              <div style={{ fontSize: pt(base - 1.5), color: "#9ca3af", marginTop: pt(6) }}>Prepared {fmt(proposal.createdAt)}</div>
            </div>
          </div>
        )}

        {/* ── Body ── */}
        <div className="pp-body">

          <div className="pb" style={{ marginBottom: pt(24) }}>
            <div style={lbl}>Prepared For</div>
            <div style={{ fontSize: pt(base + 3), fontWeight: 700, color: "#111827" }}>{proposal.clientName}</div>
            {proposal.clientEmail && <div style={{ fontSize: pt(base - 1.5), color: "#6b7280", marginTop: pt(2) }}>{proposal.clientEmail}</div>}
          </div>

          {proposal.intro && (
            <div className="pb" style={{ marginBottom: pt(24) }}>
              <div style={lbl}>Introduction</div>
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(proposal.intro) }} style={{ fontSize: pt(base - 0.5), color: "#6b7280", lineHeight: 1.7 }} />
            </div>
          )}

          {sections.length > 0 && (
            <div style={{ marginBottom: pt(24) }}>
              <div style={{ ...lbl, marginBottom: pt(12) }}>Scope of Work</div>
              {sections.map((sec, i) => (
                <div key={i} className="pb" style={{ marginBottom: pt(14), paddingBottom: pt(14) }}>
                  <div style={{ marginBottom: pt(4) }}>
                    <span style={{ fontSize: pt(base + 1), fontWeight: 700, color: "#111827" }}>{sec.heading || `Section ${i + 1}`}</span>
                  </div>
                  {sec.body && <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(sec.body) }} style={{ fontSize: pt(base - 1), color: "#6b7280", lineHeight: 1.6 }} />}
                </div>
              ))}
            </div>
          )}

          <div className="pb" style={{ marginBottom: pt(28) }}>
            <div style={{ ...lbl, marginBottom: pt(8) }}>Pricing</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", backgroundColor: thBg, padding: `${pt(7)}px ${pt(10)}px` }}>
                {tpl.showItemNumbers && <div style={{ width: pt(20), color: thColor, fontSize: pt(base - 2.5), fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>#</div>}
                <div style={{ flex: 1, color: thColor, fontSize: pt(base - 2.5), fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Description</div>
                <div style={{ width: pt(80), textAlign: "right", color: thColor, fontSize: pt(base - 2.5), fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Amount</div>
              </div>
              {pricing.map((item, i) => (
                <div key={i} style={{ display: "flex", padding: `${pt(9)}px ${pt(10)}px`, borderBottom: "1px solid #f3f4f6", backgroundColor: i % 2 === 1 ? "#fafafa" : "#fff" }}>
                  {tpl.showItemNumbers && <div style={{ width: pt(20), fontSize: pt(base - 1), color: "#d1d5db" }}>{i + 1}</div>}
                  <div style={{ flex: 1, fontSize: pt(base - 1), color: "#374151" }}>{item.description || `Item ${i + 1}`}</div>
                  <div style={{ width: pt(80), textAlign: "right", fontWeight: 600, fontSize: pt(base - 1), color: "#374151" }}>{fmtMoney(item.amount || 0, proposal.currency)}</div>
                </div>
              ))}
              <div style={{ display: "flex", padding: `${pt(10)}px ${pt(10)}px`, backgroundColor: "#f9fafb", borderTop: "1.5px solid #e5e7eb" }}>
                <div style={{ flex: 1, fontSize: pt(base), fontWeight: 700, color: "#111827" }}>Total</div>
                <div style={{ width: pt(80), textAlign: "right", fontSize: pt(base + 2), fontWeight: 700, color: accent }}>{fmtMoney(subtotal, proposal.currency)}</div>
              </div>
            </div>
          </div>

          {tpl.showTerms && tpl.termsText && (
            <div className="pb" style={{ marginBottom: pt(20), paddingTop: pt(12), borderTop: "1px solid #e5e7eb" }}>
              <div style={lbl}>Terms & Conditions</div>
              <div style={{ fontSize: pt(base - 1.5), color: "#6b7280", lineHeight: 1.6 }}>{tpl.termsText}</div>
            </div>
          )}

          {tpl.showSignatureBlock !== false && (
            <div className="pb" style={{ display: "flex", gap: pt(32), marginTop: pt(32), paddingTop: pt(20), borderTop: "1px solid #e5e7eb" }}>
              <div style={{ flex: 1 }}>
                <div style={{ ...lbl, marginBottom: pt(24) }}>Service Provider</div>
                <div style={{ height: 1, backgroundColor: "#374151", marginBottom: pt(4) }} />
                {tpl.businessName && <div style={{ fontSize: pt(base - 1), color: "#374151" }}>{tpl.businessName}</div>}
                <div style={{ fontSize: pt(base - 2), color: "#9ca3af", marginTop: pt(2) }}>Date: _______________</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...lbl, marginBottom: pt(24) }}>Client Signature</div>
                <div style={{ height: 1, backgroundColor: "#374151", marginBottom: pt(4) }} />
                <div style={{ fontSize: pt(base - 1), color: "#374151" }}>{proposal.clientName}</div>
                <div style={{ fontSize: pt(base - 2), color: "#9ca3af", marginTop: pt(2) }}>Date: _______________</div>
              </div>
            </div>
          )}

          <div style={{ height: pt(20) }} />
        </div>
      </div>
    </>
  );
}
