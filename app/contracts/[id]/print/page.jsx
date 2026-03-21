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

function fmt(date) {
  if (!date) return "";
  try { return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
  catch { return String(date); }
}

export default async function ContractPrintPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [contract, template] = await Promise.all([
    db.contract.findFirst({ where: { id, userId: session.user.id } }),
    db.pdfTemplate.findFirst({ where: { userId: session.user.id, type: "contract", isDefault: true } }),
  ]);

  if (!contract) redirect("/contracts");

  const tpl = template || {};
  const paper = PAPER_SIZES[tpl.paperSize] || PAPER_SIZES.A4;
  const accent = tpl.accentColor || "#18181b";
  const headerStyle = tpl.headerStyle || "classic";
  const base = tpl.fontSize || 10;
  const fsPx = pt(base);

  const mH   = 80;
  const mTop = 72;
  const mBot = 72;

  const fontMap = { times: "Georgia, serif", courier: "'Courier New', monospace", helvetica: "Arial, sans-serif" };
  const ff = fontMap[tpl.fontFamily] || "Arial, sans-serif";

  const clauses = (() => {
    try { return typeof contract.clauses === "string" ? JSON.parse(contract.clauses) : (contract.clauses || []); }
    catch { return []; }
  })();

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
        .pp {
          width: ${paper.width}px;
          background: #fff;
          margin: 24px auto;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
        }
        .pp-body { padding-left: ${mH}px; padding-right: ${mH}px; padding-bottom: ${mBot}px; }
        @page {
          size: ${paper.css};
          margin: 0 0 28px 0;
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
          .pb {
            padding-top: ${mTop}px;
            margin-top: -${mTop}px;
          }
          .pp-body > .pb:first-child {
            padding-top: 0;
            margin-top: 0;
          }
        }
        .pb { break-inside: avoid; }
      `}</style>

      <AutoPrint />

      <div className="pp">

        {/* Bold header */}
        {headerStyle === "bold" && (
          <div style={{ backgroundColor: accent, display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: mTop, paddingLeft: mH, paddingRight: mH, paddingBottom: pt(30), marginBottom: pt(32) }}>
            <div style={{ flex: 1 }}>
              {tpl.businessName && <div style={{ fontSize: pt(base + 6), fontWeight: 700, color: "#fff" }}>{tpl.businessName}</div>}
              {tpl.businessAddress && <div style={{ fontSize: pt(base - 1.5), color: "rgba(255,255,255,0.55)", marginTop: pt(2) }}>{tpl.businessAddress}</div>}
              <div style={{ marginTop: pt(12), fontSize: pt(base + 8), fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{contract.title}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: pt(base - 2), color: "rgba(255,255,255,0.5)", letterSpacing: "0.16em", textTransform: "uppercase" }}>Service Agreement</div>
            </div>
          </div>
        )}

        {/* Minimal header */}
        {headerStyle === "minimal" && (
          <div style={{ marginBottom: pt(28) }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: mTop, paddingLeft: mH, paddingRight: mH, paddingBottom: pt(16) }}>
              {tpl.businessName && <div style={{ fontSize: pt(base + 6), fontWeight: 700, color: "#111827", textAlign: "center" }}>{tpl.businessName}</div>}
            </div>
            <div style={{ height: 1, backgroundColor: "#e5e7eb", marginBottom: pt(20) }} />
            <div style={{ paddingLeft: mH, paddingRight: mH }}>
              <div style={lbl}>Service Agreement</div>
              <div style={{ fontSize: pt(base + 8), fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{contract.title}</div>
            </div>
          </div>
        )}

        {/* Classic header */}
        {(headerStyle === "classic" || !headerStyle) && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: mTop, paddingLeft: mH, paddingRight: mH, paddingBottom: pt(28), borderBottom: "1px solid #e5e7eb", marginBottom: pt(32) }}>
            <div>
              {tpl.businessName && <div style={{ fontSize: pt(base + 6), fontWeight: 700, color: "#111827" }}>{tpl.businessName}</div>}
              {tpl.businessAddress && <div style={{ fontSize: pt(base - 1.5), color: "#9ca3af", marginTop: pt(2) }}>{tpl.businessAddress}</div>}
              {tpl.businessEmail && <div style={{ fontSize: pt(base - 1.5), color: "#9ca3af", marginTop: pt(1) }}>{tpl.businessEmail}</div>}
              {tpl.businessPhone && <div style={{ fontSize: pt(base - 1.5), color: "#9ca3af", marginTop: pt(1) }}>{tpl.businessPhone}</div>}
              <div style={{ marginTop: pt(12) }}>
                <div style={{ fontSize: pt(base + 8), fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{contract.title}</div>
                {contract.signedAt && <div style={{ fontSize: pt(base - 1.5), color: "#16a34a", marginTop: pt(3) }}>Signed {fmt(contract.signedAt)}</div>}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ ...lbl, color: accent, letterSpacing: "0.16em" }}>Service Agreement</div>
              <div style={{ fontSize: pt(base - 1.5), color: "#9ca3af", marginTop: pt(6) }}>Prepared {fmt(contract.createdAt)}</div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="pp-body">

          <div className="pb" style={{ marginBottom: pt(24) }}>
            <div style={lbl}>Prepared For</div>
            <div style={{ fontSize: pt(base + 3), fontWeight: 700, color: "#111827" }}>{contract.clientName}</div>
            {contract.clientEmail && <div style={{ fontSize: pt(base - 1.5), color: "#6b7280", marginTop: pt(2) }}>{contract.clientEmail}</div>}
          </div>

          {clauses.length > 0 && (
            <div style={{ marginBottom: pt(24) }}>
              <div style={{ ...lbl, marginBottom: pt(12) }}>Terms &amp; Conditions</div>
              {clauses.map((clause, i) => (
                <div key={i} className="pb" style={{ marginBottom: pt(20), paddingBottom: pt(20), borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: pt(6), marginBottom: pt(6) }}>
                    <span style={{ flexShrink: 0, fontSize: pt(base - 2), fontWeight: 700, color: "#d1d5db", minWidth: pt(16) }}>{i + 1}.</span>
                    <span style={{ fontSize: pt(base + 1), fontWeight: 700, color: "#111827" }}>{clause.heading || `Section ${i + 1}`}</span>
                  </div>
                  {clause.body && (
                    <div
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(clause.body) }}
                      style={{ paddingLeft: pt(16), fontSize: pt(base - 1), color: "#6b7280", lineHeight: 1.7, marginTop: pt(4) }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {tpl.showTerms && tpl.termsText && (
            <div className="pb" style={{ marginBottom: pt(20), paddingTop: pt(12), borderTop: "1px solid #e5e7eb" }}>
              <div style={lbl}>Additional Terms</div>
              <div style={{ fontSize: pt(base - 1.5), color: "#6b7280", lineHeight: 1.6 }}>{tpl.termsText}</div>
            </div>
          )}

          {tpl.showSignatureBlock !== false && (
            <div className="pb" style={{ display: "flex", gap: pt(32), marginTop: pt(32), paddingTop: pt(20), borderTop: "1px solid #e5e7eb" }}>
              <div style={{ flex: 1 }}>
                <div style={{ ...lbl, marginBottom: pt(24) }}>Service Provider</div>
                <div style={{ height: 1, backgroundColor: "#374151", marginBottom: pt(4) }} />
                {tpl.businessName && <div style={{ fontSize: pt(base - 1), color: "#374151" }}>{tpl.businessName}</div>}
                {contract.signatureName && !tpl.businessName && <div style={{ fontSize: pt(base - 1), color: "#374151" }}>{contract.signatureName}</div>}
                <div style={{ fontSize: pt(base - 2), color: "#9ca3af", marginTop: pt(2) }}>Date: _______________</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...lbl, marginBottom: pt(24) }}>Client Signature</div>
                <div style={{ height: 1, backgroundColor: "#374151", marginBottom: pt(4) }} />
                <div style={{ fontSize: pt(base - 1), color: "#374151" }}>{contract.clientName}</div>
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
