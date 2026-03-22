"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { sanitizeHtml } from "@/lib/sanitize";

// Paper dimensions in px at 96dpi
const PAPER_SIZES = {
  A4:     { width: 794,  height: 1123 },
  A5:     { width: 559,  height: 794  },
  Letter: { width: 816,  height: 1056 },
};

function fmtMoney(n, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 2 }).format(n || 0);
  } catch {
    return `£${(n || 0).toFixed(2)}`;
  }
}

function fmt(date) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch { return String(date); }
}

// Convert PDF pts to preview px (1pt ≈ 1.333px at 96dpi)
function pt(n) { return Math.round(n * 1.333); }

export default function ProposalPreview({ proposal, template, noScale = false }) {
  const tpl = template || {};
  const containerRef = useRef(null);
  const pageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  const paperSize = PAPER_SIZES[tpl.paperSize] || PAPER_SIZES.A4;
  const accent = tpl.accentColor || "#18181b";
  const tableHeaderBg = tpl.tableHeaderBg || "#18181b";
  const tableHeaderTextColor = tpl.tableHeaderTextColor || "#ffffff";
  const headerStyle = tpl.headerStyle || "classic";
  const baseFontSize = tpl.fontSize || 10;           // in pts
  const fontSizePx = pt(baseFontSize);               // in px
  const marginPx = pt((tpl.marginLeft || 0.55) * 72);   // horizontal margin pts → px
  const marginTopPx = pt((tpl.marginTop || 0.55) * 72); // top margin pts → px
  const marginBotPx = pt((tpl.marginBottom || 0.55) * 72); // bottom margin pts → px

  const fontMap = { times: "Georgia, serif", courier: "'Courier New', monospace", helvetica: "Arial, sans-serif" };
  const fontFamily = fontMap[tpl.fontFamily] || fontMap.helvetica;

  const sections = (() => {
    try { return typeof proposal.sections === "string" ? JSON.parse(proposal.sections) : (proposal.sections || []); }
    catch { return []; }
  })();
  const pricing = (() => {
    try { return typeof proposal.pricing === "string" ? JSON.parse(proposal.pricing) : (proposal.pricing || []); }
    catch { return []; }
  })();

  // Scale page to fit container width (skipped when noScale=true)
  useEffect(() => {
    if (noScale) return;
    function measure() {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      setScale(containerWidth / paperSize.width);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [paperSize.width, noScale]);

  // Track page count based on rendered content height
  useEffect(() => {
    if (!pageRef.current) return;
    function measureHeight() {
      if (!pageRef.current) return;
      const h = pageRef.current.scrollHeight;
      setPageCount(Math.max(1, Math.ceil(h / paperSize.height)));
    }
    measureHeight();
    const ro = new ResizeObserver(measureHeight);
    ro.observe(pageRef.current);
    return () => ro.disconnect();
  }, [paperSize.height, proposal, template]);

  // Shared styles
  const s = {
    sectionLabel: {
      fontSize: pt(baseFontSize - 2.5),
      fontWeight: 600,
      color: "#9ca3af",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      marginBottom: pt(4),
    },
    thCell: {
      color: tableHeaderTextColor,
      fontSize: pt(baseFontSize - 2.5),
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
  };

  function renderHeader() {
    const biz = tpl.businessName;
    const showLogo = tpl.showLogo && tpl.logoUrl;

    if (headerStyle === "bold") {
      return (
        <div style={{ backgroundColor: accent, display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: `${marginTopPx}px ${marginPx}px ${pt(30)}px`, marginBottom: pt(32) }}>
          <div style={{ flex: 1 }}>
            {showLogo && <Image src={tpl.logoUrl} alt="" width={0} height={0} sizes="100vw" style={{ width: pt(40), height: "auto", marginBottom: pt(6) }} />}
            {biz && <div style={{ fontSize: pt(baseFontSize + 6), fontWeight: 700, color: "#fff" }}>{biz}</div>}
            {tpl.businessAddress && <div style={{ fontSize: pt(baseFontSize - 1.5), color: "rgba(255,255,255,0.55)", marginTop: pt(2) }}>{tpl.businessAddress}</div>}
            <div style={{ marginTop: pt(12), fontSize: pt(baseFontSize + 8), fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{proposal.title}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: pt(baseFontSize - 2), color: "rgba(255,255,255,0.5)", letterSpacing: "0.16em", textTransform: "uppercase" }}>Proposal</div>
          </div>
        </div>
      );
    }

    if (headerStyle === "minimal") {
      return (
        <div style={{ marginBottom: pt(28) }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: `${marginTopPx}px ${marginPx}px ${pt(16)}px` }}>
            {showLogo && <Image src={tpl.logoUrl} alt="" width={0} height={0} sizes="100vw" style={{ width: pt(40), height: "auto", marginBottom: pt(6) }} />}
            {biz && <div style={{ fontSize: pt(baseFontSize + 6), fontWeight: 700, color: "#111827", textAlign: "center" }}>{biz}</div>}
          </div>
          <div style={{ height: 1, backgroundColor: "#e5e7eb", marginBottom: pt(20) }} />
          <div style={{ paddingLeft: marginPx, paddingRight: marginPx }}>
            <div style={s.sectionLabel}>Proposal</div>
            <div style={{ fontSize: pt(baseFontSize + 8), fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{proposal.title}</div>
          </div>
        </div>
      );
    }

    // Classic
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: `${marginTopPx}px ${marginPx}px ${pt(28)}px`, borderBottom: "1px solid #e5e7eb", marginBottom: pt(32) }}>
        <div>
          {showLogo && <Image src={tpl.logoUrl} alt="" width={0} height={0} sizes="100vw" style={{ width: pt(40), height: "auto", marginBottom: pt(6) }} />}
          {biz && <div style={{ fontSize: pt(baseFontSize + 6), fontWeight: 700, color: "#111827" }}>{biz}</div>}
          {tpl.businessAddress && <div style={{ fontSize: pt(baseFontSize - 1.5), color: "#9ca3af", marginTop: pt(2) }}>{tpl.businessAddress}</div>}
          {tpl.businessEmail && <div style={{ fontSize: pt(baseFontSize - 1.5), color: "#9ca3af", marginTop: pt(1) }}>{tpl.businessEmail}</div>}
          {tpl.businessPhone && <div style={{ fontSize: pt(baseFontSize - 1.5), color: "#9ca3af", marginTop: pt(1) }}>{tpl.businessPhone}</div>}
          <div style={{ marginTop: pt(12) }}>
            <div style={{ fontSize: pt(baseFontSize + 8), fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{proposal.title}</div>
            {proposal.validUntil && <div style={{ fontSize: pt(baseFontSize - 1.5), color: "#9ca3af", marginTop: pt(3) }}>Valid until {fmt(proposal.validUntil)}</div>}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ ...s.sectionLabel, color: accent, letterSpacing: "0.16em" }}>Proposal</div>
          <div style={{ fontSize: pt(baseFontSize - 1.5), color: "#9ca3af", marginTop: pt(6) }}>Prepared {fmt(proposal.createdAt)}</div>
        </div>
      </div>
    );
  }

  // Page break lines (one per page boundary after page 1)
  const pageBreaks = Array.from({ length: pageCount - 1 }, (_, i) => (
    <div key={i} style={{
      position: "absolute",
      top: paperSize.height * (i + 1),
      left: 0,
      right: 0,
      height: 0,
      borderTop: "2px dashed #cbd5e1",
      zIndex: 10,
      pointerEvents: "none",
    }}>
      <span style={{
        position: "absolute",
        right: 8,
        top: 4,
        fontSize: 10,
        color: "#94a3b8",
        fontFamily: "Arial, sans-serif",
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        userSelect: "none",
      }}>Page {i + 2}</span>
    </div>
  ));

  const page = (
    <div ref={pageRef} style={{
      width: paperSize.width,
      minHeight: paperSize.height,
      backgroundColor: "#fff",
      fontFamily,
      fontSize: fontSizePx,
      color: "#374151",
      position: "relative",
      boxSizing: "border-box",
    }}>
      {/* Watermark */}
      {tpl.showWatermark && (
        <div style={{ position: "absolute", top: "35%", left: "8%", fontSize: pt(80), fontWeight: 700, color: "rgba(0,0,0,0.04)", transform: "rotate(-30deg)", pointerEvents: "none", userSelect: "none", zIndex: 0 }}>
          DRAFT
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        {renderHeader()}

        {/* Body */}
        <div style={{ paddingLeft: marginPx, paddingRight: marginPx }}>

          {/* Meta row */}
          <div style={{ marginBottom: pt(24) }}>
            <div style={s.sectionLabel}>Prepared For</div>
            <div style={{ fontSize: pt(baseFontSize + 3), fontWeight: 700, color: "#111827" }}>{proposal.clientName}</div>
            {proposal.clientEmail && <div style={{ fontSize: pt(baseFontSize - 1.5), color: "#6b7280", marginTop: pt(2) }}>{proposal.clientEmail}</div>}
          </div>

          {/* Introduction */}
          {proposal.intro ? (
            <div style={{ marginBottom: pt(24) }}>
              <div style={s.sectionLabel}>Introduction</div>
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(proposal.intro) }} style={{ fontSize: pt(baseFontSize - 0.5), color: "#6b7280", lineHeight: 1.7 }} />
            </div>
          ) : null}

          {/* Scope */}
          {sections.length > 0 ? (
            <div style={{ marginBottom: pt(24) }}>
              <div style={{ ...s.sectionLabel, marginBottom: pt(12) }}>Scope of Work</div>
              {sections.map((sec, i) => (
                <div key={i} style={{ marginBottom: pt(14), paddingBottom: pt(14) }}>
                  <div style={{ marginBottom: pt(4) }}>
                    <span style={{ fontSize: pt(baseFontSize + 1), fontWeight: 700, color: "#111827" }}>{sec.heading || `Section ${i + 1}`}</span>
                  </div>
                  {sec.body ? <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(sec.body) }} style={{ fontSize: pt(baseFontSize - 1), color: "#6b7280", lineHeight: 1.6, marginTop: pt(4) }} /> : null}
                </div>
              ))}
            </div>
          ) : null}

          {/* Pricing */}
          <div style={{ marginBottom: pt(28) }}>
            <div style={{ ...s.sectionLabel, marginBottom: pt(8) }}>Pricing</div>
            <div style={{ overflow: "hidden" }}>
              {/* Header */}
              <div style={{ display: "flex", backgroundColor: tableHeaderBg, padding: `${pt(7)}px ${pt(10)}px` }}>
                {tpl.showItemNumbers && <div style={{ ...s.thCell, width: pt(20) }}>#</div>}
                <div style={{ ...s.thCell, flex: 1 }}>Description</div>
                <div style={{ ...s.thCell, width: pt(80), textAlign: "right" }}>Amount</div>
              </div>
              {/* Rows */}
              {pricing.length === 0 ? (
                <div style={{ padding: `${pt(12)}px ${pt(10)}px`, fontSize: pt(baseFontSize - 1), color: "#9ca3af" }}>No pricing items added.</div>
              ) : pricing.map((item, i) => (
                <div key={i} style={{ display: "flex", padding: `${pt(9)}px ${pt(10)}px`, borderBottom: "1px solid #f3f4f6", backgroundColor: i % 2 === 1 ? "#fafafa" : "#fff" }}>
                  {tpl.showItemNumbers && <div style={{ width: pt(20), fontSize: pt(baseFontSize - 1), color: "#d1d5db" }}>{i + 1}</div>}
                  <div style={{ flex: 1, fontSize: pt(baseFontSize - 1), color: "#374151" }}>{item.description || `Item ${i + 1}`}</div>
                  <div style={{ width: pt(80), textAlign: "right", fontWeight: 600, fontSize: pt(baseFontSize - 1), color: "#374151" }}>{fmtMoney(item.amount || 0, proposal.currency)}</div>
                </div>
              ))}
              {/* Total row */}
              <div style={{ display: "flex", padding: `${pt(10)}px ${pt(10)}px`, backgroundColor: "#f9fafb", borderTop: "1.5px solid #e5e7eb" }}>
                <div style={{ flex: 1, fontSize: pt(baseFontSize), fontWeight: 700, color: "#111827" }}>Total</div>
                <div style={{ width: pt(80), textAlign: "right", fontSize: pt(baseFontSize + 2), fontWeight: 700, color: accent }}>{fmtMoney(proposal.total, proposal.currency)}</div>
              </div>
            </div>
          </div>

          {/* Terms */}
          {tpl.showTerms && tpl.termsText ? (
            <div style={{ marginBottom: pt(20), paddingTop: pt(12), borderTop: "1px solid #e5e7eb" }}>
              <div style={s.sectionLabel}>Terms & Conditions</div>
              <div style={{ fontSize: pt(baseFontSize - 1.5), color: "#6b7280", lineHeight: 1.6 }}>{tpl.termsText}</div>
            </div>
          ) : null}


          {/* Footer space */}
          <div style={{ height: marginBotPx }} />
        </div>
      </div>

      {/* Page break overlays */}
      {pageBreaks}

      {/* Footer */}
      <div style={{ position: "absolute", bottom: Math.round(marginBotPx / 2), left: marginPx, right: marginPx, borderTop: "1px solid #e5e7eb", paddingTop: pt(8), display: "flex", justifyContent: "space-between", fontSize: pt(baseFontSize - 2.5), color: "#9ca3af" }}>
        <span>{tpl.footerText || ""}</span>
        {tpl.showPageNumbers !== false && <span>Page {pageCount} of {pageCount}</span>}
      </div>
    </div>
  );

  if (noScale) {
    return (
      <div style={{ width: paperSize.width }}>
        {page}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: "100%", overflowX: "hidden" }}>
      <div style={{ zoom: scale, width: paperSize.width, transformOrigin: "top left" }}>
        {page}
      </div>
    </div>
  );
}
