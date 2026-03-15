"use client";

import { useEffect, useRef, useState } from "react";

// Paper dimensions in px at 96dpi
const PAPER_SIZES = {
  A4:     { width: 794,  height: 1123 },
  A5:     { width: 559,  height: 794  },
  Letter: { width: 816,  height: 1056 },
};

function fmt(date) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch { return String(date); }
}

// Convert PDF pts to preview px (1pt ≈ 1.333px at 96dpi)
function pt(n) { return Math.round(n * 1.333); }

export default function ContractPreview({ contract, template, noScale = false }) {
  const tpl = template || {};
  const containerRef = useRef(null);
  const pageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  const paperSize = PAPER_SIZES[tpl.paperSize] || PAPER_SIZES.A4;
  const accent = tpl.accentColor || "#18181b";
  const headerStyle = tpl.headerStyle || "classic";
  const baseFontSize = tpl.fontSize || 10;
  const fontSizePx = pt(baseFontSize);
  const marginPx = pt((tpl.marginLeft || 0.55) * 72);
  const marginTopPx = pt((tpl.marginTop || 0.55) * 72);
  const marginBotPx = pt((tpl.marginBottom || 0.55) * 72);

  const fontMap = { times: "Georgia, serif", courier: "'Courier New', monospace", helvetica: "Arial, sans-serif" };
  const fontFamily = fontMap[tpl.fontFamily] || fontMap.helvetica;

  const clauses = (() => {
    try {
      const raw = contract.clauses;
      return typeof raw === "string" ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
    } catch { return []; }
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
  }, [paperSize.height, contract, template]);

  const s = {
    sectionLabel: {
      fontSize: pt(baseFontSize - 2.5),
      fontWeight: 600,
      color: "#9ca3af",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      marginBottom: pt(4),
    },
  };

  function renderHeader() {
    const biz = tpl.businessName;
    const showLogo = tpl.showLogo && tpl.logoUrl;

    if (headerStyle === "bold") {
      return (
        <div style={{ backgroundColor: accent, display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: `${marginTopPx}px ${marginPx}px ${pt(30)}px`, marginBottom: pt(32) }}>
          <div style={{ flex: 1 }}>
            {showLogo && <img src={tpl.logoUrl} alt="" style={{ width: pt(40), height: pt(40), objectFit: "contain", marginBottom: pt(6) }} />}
            {biz && <div style={{ fontSize: pt(baseFontSize + 6), fontWeight: 700, color: "#fff" }}>{biz}</div>}
            {tpl.businessAddress && <div style={{ fontSize: pt(baseFontSize - 1.5), color: "rgba(255,255,255,0.55)", marginTop: pt(2) }}>{tpl.businessAddress}</div>}
            <div style={{ marginTop: pt(12), fontSize: pt(baseFontSize + 8), fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{contract.title}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: pt(baseFontSize - 2), color: "rgba(255,255,255,0.5)", letterSpacing: "0.16em", textTransform: "uppercase" }}>Service Agreement</div>
          </div>
        </div>
      );
    }

    if (headerStyle === "minimal") {
      return (
        <div style={{ marginBottom: pt(28) }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: `${marginTopPx}px ${marginPx}px ${pt(16)}px` }}>
            {showLogo && <img src={tpl.logoUrl} alt="" style={{ width: pt(40), height: pt(40), objectFit: "contain", marginBottom: pt(6) }} />}
            {biz && <div style={{ fontSize: pt(baseFontSize + 6), fontWeight: 700, color: "#111827", textAlign: "center" }}>{biz}</div>}
          </div>
          <div style={{ height: 1, backgroundColor: "#e5e7eb", marginBottom: pt(20) }} />
          <div style={{ paddingLeft: marginPx, paddingRight: marginPx }}>
            <div style={s.sectionLabel}>Service Agreement</div>
            <div style={{ fontSize: pt(baseFontSize + 8), fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{contract.title}</div>
          </div>
        </div>
      );
    }

    // Classic
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: `${marginTopPx}px ${marginPx}px ${pt(28)}px`, borderBottom: "1px solid #e5e7eb", marginBottom: pt(32) }}>
        <div>
          {showLogo && <img src={tpl.logoUrl} alt="" style={{ width: pt(40), height: pt(40), objectFit: "contain", marginBottom: pt(6) }} />}
          {biz && <div style={{ fontSize: pt(baseFontSize + 6), fontWeight: 700, color: "#111827" }}>{biz}</div>}
          {tpl.businessAddress && <div style={{ fontSize: pt(baseFontSize - 1.5), color: "#9ca3af", marginTop: pt(2) }}>{tpl.businessAddress}</div>}
          {tpl.businessEmail && <div style={{ fontSize: pt(baseFontSize - 1.5), color: "#9ca3af", marginTop: pt(1) }}>{tpl.businessEmail}</div>}
          {tpl.businessPhone && <div style={{ fontSize: pt(baseFontSize - 1.5), color: "#9ca3af", marginTop: pt(1) }}>{tpl.businessPhone}</div>}
          <div style={{ marginTop: pt(12) }}>
            <div style={{ fontSize: pt(baseFontSize + 8), fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{contract.title}</div>
            {contract.signedAt && (
              <div style={{ fontSize: pt(baseFontSize - 1.5), color: "#16a34a", marginTop: pt(3) }}>Signed {fmt(contract.signedAt)}</div>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ ...s.sectionLabel, color: accent, letterSpacing: "0.16em" }}>Service Agreement</div>
          <div style={{ fontSize: pt(baseFontSize - 1.5), color: "#9ca3af", marginTop: pt(6) }}>Prepared {fmt(contract.createdAt)}</div>
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
      <div style={{ position: "relative", zIndex: 1 }}>
        {renderHeader()}

        {/* Body */}
        <div style={{ paddingLeft: marginPx, paddingRight: marginPx }}>

          {/* Prepared For meta row */}
          <div style={{ marginBottom: pt(24) }}>
            <div style={s.sectionLabel}>Prepared For</div>
            <div style={{ fontSize: pt(baseFontSize + 3), fontWeight: 700, color: "#111827" }}>{contract.clientName}</div>
            {contract.clientEmail && (
              <div style={{ fontSize: pt(baseFontSize - 1.5), color: "#6b7280", marginTop: pt(2) }}>{contract.clientEmail}</div>
            )}
          </div>

          {/* Terms & Conditions */}
          <div style={{ marginBottom: pt(24) }}>
            <div style={{ ...s.sectionLabel, marginBottom: pt(12) }}>Terms &amp; Conditions</div>
            {clauses.length === 0 ? (
              <div style={{ fontSize: pt(baseFontSize - 1), color: "#9ca3af", fontStyle: "italic" }}>No clauses added.</div>
            ) : (
              clauses.map((clause, i) => (
                <div key={i} style={{ marginBottom: pt(20), paddingBottom: pt(20), borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: pt(6), marginBottom: pt(6) }}>
                    <span style={{ flexShrink: 0, fontSize: pt(baseFontSize - 2), fontWeight: 700, color: "#d1d5db", minWidth: pt(16) }}>{i + 1}.</span>
                    <span style={{ fontSize: pt(baseFontSize + 1), fontWeight: 700, color: "#111827" }}>
                      {clause.heading || `Section ${i + 1}`}
                    </span>
                  </div>
                  {clause.body ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: clause.body }}
                      style={{ paddingLeft: pt(16), fontSize: pt(baseFontSize - 1), color: "#6b7280", lineHeight: 1.7, marginTop: pt(4) }}
                    />
                  ) : null}
                </div>
              ))
            )}
          </div>

          {/* Signature block */}
          <div style={{ display: "flex", gap: pt(32), marginTop: pt(32), paddingTop: pt(20), borderTop: "1px solid #e5e7eb" }}>
            {/* Service provider side */}
            <div style={{ flex: 1 }}>
              <div style={{ ...s.sectionLabel, marginBottom: pt(24) }}>Service Provider</div>
              {contract.providerSignedAt ? (
                <div style={{ fontFamily: "Georgia, serif", fontSize: pt(baseFontSize + 4), color: "#111827", marginBottom: pt(4) }}>
                  {tpl.businessName || contract.providerSignatureName || "—"}
                </div>
              ) : (
                <div style={{ height: 1, backgroundColor: "#374151", marginBottom: pt(4) }} />
              )}
              <div style={{ fontSize: pt(baseFontSize - 1), color: "#374151" }}>
                {tpl.businessName || contract.providerSignatureName || ""}
              </div>
              <div style={{ fontSize: pt(baseFontSize - 2), color: "#9ca3af", marginTop: pt(2) }}>
                {contract.providerSignedAt ? `Signed: ${fmt(contract.providerSignedAt)}` : "Date: _______________"}
              </div>
            </div>
            {/* Client side */}
            <div style={{ flex: 1 }}>
              <div style={{ ...s.sectionLabel, marginBottom: pt(24) }}>Client Signature</div>
              {contract.signedAt ? (
                <div style={{ fontFamily: "Georgia, serif", fontSize: pt(baseFontSize + 4), color: "#111827", marginBottom: pt(4) }}>
                  {contract.signatureName || contract.clientName || "—"}
                </div>
              ) : (
                <div style={{ height: 1, backgroundColor: "#374151", marginBottom: pt(4) }} />
              )}
              <div style={{ fontSize: pt(baseFontSize - 1), color: "#374151" }}>{contract.clientName}</div>
              <div style={{ fontSize: pt(baseFontSize - 2), color: "#9ca3af", marginTop: pt(2) }}>
                {contract.signedAt ? `Signed: ${fmt(contract.signedAt)}` : "Date: _______________"}
              </div>
              {contract.signedAt && contract.signatureIp && (
                <div style={{ fontSize: pt(baseFontSize - 3), color: "#d1d5db", marginTop: pt(3) }}>
                  IP: {contract.signatureIp}
                </div>
              )}
            </div>
          </div>

          {/* Footer space */}
          <div style={{ height: marginBotPx }} />
        </div>
      </div>

      {/* Page break overlays */}
      {pageBreaks}

      {/* Footer */}
      <div style={{ position: "absolute", bottom: Math.round(marginBotPx / 2), left: marginPx, right: marginPx, borderTop: "1px solid #e5e7eb", paddingTop: pt(8), display: "flex", justifyContent: "space-between", fontSize: pt(baseFontSize - 2.5), color: "#9ca3af" }}>
        <span>{tpl.footerText || contract.title}</span>
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
