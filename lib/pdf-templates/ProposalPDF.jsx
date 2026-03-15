import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

function formatMoney(amount, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `${currency} ${(amount || 0).toFixed(2)}`;
  }
}

function formatDateStr(date) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return String(date);
  }
}

function htmlToText(html) {
  if (!html) return "";
  if (typeof html !== "string") return String(html);
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getFont(fontFamily) {
  if (fontFamily === "times") return "Times-Roman";
  if (fontFamily === "courier") return "Courier";
  return "Helvetica";
}

function getBoldFont(fontFamily) {
  if (fontFamily === "times") return "Times-Bold";
  if (fontFamily === "courier") return "Courier-Bold";
  return "Helvetica-Bold";
}

function inchesToPts(inches) {
  return Math.round(inches * 72);
}

function buildStyles(template) {
  const accent = template?.accentColor || "#2563eb";
  const tableHeaderBg = template?.tableHeaderBg || "#18181b";
  const tableHeaderTextColor = template?.tableHeaderTextColor || "#ffffff";
  const font = getFont(template?.fontFamily);
  const bold = getBoldFont(template?.fontFamily);
  const fontSize = template?.fontSize || 10;
  const marginH = inchesToPts(template?.marginLeft || 0.55);
  const marginTop = inchesToPts(template?.marginTop || 0.55);
  const marginBottom = inchesToPts(template?.marginBottom || 0.55);

  return StyleSheet.create({
    page: {
      fontFamily: font,
      fontSize,
      color: "#374151",
      backgroundColor: "#ffffff",
      paddingBottom: marginBottom,
    },

    // ── Classic header ──────────────────────────────────────────────
    classicHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingHorizontal: marginH,
      paddingTop: marginTop,
      paddingBottom: 28,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      marginBottom: 32,
    },
    classicHeaderLeft: { flexDirection: "column", gap: 2 },
    classicHeaderRight: { alignItems: "flex-end" },

    // ── Bold (dark) header ──────────────────────────────────────────
    boldHeader: {
      backgroundColor: "#18181b",
      paddingHorizontal: marginH,
      paddingTop: marginTop,
      paddingBottom: 32,
      marginBottom: 32,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },

    // ── Minimal header ──────────────────────────────────────────────
    minimalHeader: {
      paddingHorizontal: marginH,
      paddingTop: marginTop,
      paddingBottom: 16,
      alignItems: "center",
    },
    minimalDivider: {
      height: 1,
      backgroundColor: "#e5e7eb",
      marginHorizontal: marginH,
      marginBottom: 28,
    },

    // ── Typography ──────────────────────────────────────────────────
    businessName: { fontSize: fontSize + 6, fontFamily: bold, color: "#111827" },
    businessNameBold: { fontSize: fontSize + 6, fontFamily: bold, color: "#ffffff" },
    businessMeta: { fontSize: fontSize - 1.5, color: "#9ca3af", marginTop: 1 },
    businessMetaBold: { fontSize: fontSize - 1.5, color: "rgba(255,255,255,0.55)", marginTop: 1 },

    // "PROPOSAL" label + proposal title
    proposalLabel: {
      fontSize: fontSize - 2,
      fontFamily: bold,
      color: accent,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 3,
    },
    proposalLabelBold: {
      fontSize: fontSize - 2,
      fontFamily: bold,
      color: "rgba(255,255,255,0.5)",
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 3,
    },
    proposalTitle: {
      fontSize: fontSize + 8,
      fontFamily: bold,
      color: "#111827",
      lineHeight: 1.2,
      maxWidth: 280,
      textAlign: "right",
    },
    proposalTitleBold: {
      fontSize: fontSize + 8,
      fontFamily: bold,
      color: "#ffffff",
      lineHeight: 1.2,
      maxWidth: 280,
      textAlign: "right",
    },

    // ── Body layout ─────────────────────────────────────────────────
    body: { paddingHorizontal: marginH },

    // ── Meta row (client + total) ────────────────────────────────────
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 28,
      gap: 24,
    },
    metaLeft: { flex: 1 },
    metaRight: {
      backgroundColor: "#f9fafb",
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderRadius: 4,
      padding: 14,
      alignItems: "flex-end",
      minWidth: 160,
    },

    sectionLabel: {
      fontSize: fontSize - 2.5,
      fontFamily: bold,
      color: "#9ca3af",
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    clientName: { fontSize: fontSize + 2, fontFamily: bold, color: "#111827" },
    clientDetail: { fontSize: fontSize - 1.5, color: "#6b7280", marginTop: 2 },

    totalLabel: { fontSize: fontSize - 2.5, fontFamily: bold, color: "#9ca3af", letterSpacing: 1 },
    totalValue: { fontSize: fontSize + 9, fontFamily: bold, color: "#111827", marginTop: 3 },
    totalAccent: { width: 28, height: 3, backgroundColor: accent, marginTop: 6 },
    validUntil: { fontSize: fontSize - 2, color: "#9ca3af", marginTop: 6 },

    // ── Intro ────────────────────────────────────────────────────────
    introText: {
      fontSize: fontSize - 0.5,
      color: "#6b7280",
      lineHeight: 1.7,
      marginBottom: 28,
    },

    // ── Scope sections (single column, clean) ────────────────────────
    scopeList: { marginBottom: 28 },
    scopeItem: { marginBottom: 14, paddingBottom: 14 },
    scopeItemLast: { marginBottom: 14 },
    scopeNumber: {
      fontSize: fontSize - 2,
      fontFamily: bold,
      color: accent,
      letterSpacing: 0.5,
      marginBottom: 3,
    },
    scopeHeading: { fontSize: fontSize + 1, fontFamily: bold, color: "#111827", marginBottom: 4 },
    scopeBody: { fontSize: fontSize - 1, color: "#6b7280", lineHeight: 1.6 },

    // ── Pricing table ────────────────────────────────────────────────
    tableWrapper: {
      overflow: "hidden",
      marginBottom: 28,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: tableHeaderBg,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    tableHeaderText: {
      fontSize: fontSize - 2.5,
      fontFamily: bold,
      color: tableHeaderTextColor,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#f3f4f6",
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    tableRowAlt: { backgroundColor: "#fafafa" },
    tableDesc: { flex: 1, fontSize: fontSize - 0.5, color: "#374151" },
    tableAmt: {
      width: 90,
      fontSize: fontSize - 0.5,
      color: "#111827",
      textAlign: "right",
      fontFamily: bold,
    },
    tableTotalRow: {
      flexDirection: "row",
      backgroundColor: "#f9fafb",
      paddingHorizontal: 12,
      paddingVertical: 11,
    },
    tableTotalLabel: { flex: 1, fontSize: fontSize, fontFamily: bold, color: "#374151" },
    tableTotalValue: { fontSize: fontSize + 1, fontFamily: bold, color: accent, width: 90, textAlign: "right" },

    // ── Signature block ──────────────────────────────────────────────
    signatureBlock: {
      marginTop: 32,
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
      paddingTop: 22,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 32,
    },
    signatureSide: { flex: 1 },
    signatureLabel: {
      fontSize: fontSize - 2.5,
      fontFamily: bold,
      color: "#9ca3af",
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 24,
    },
    signatureLine: { height: 1, backgroundColor: "#d1d5db", marginBottom: 6 },
    signatureName: { fontSize: fontSize - 1, color: "#374151" },
    signatureDate: { fontSize: fontSize - 2, color: "#9ca3af", marginTop: 3 },

    // ── Terms ────────────────────────────────────────────────────────
    terms: { marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
    termsLabel: {
      fontSize: fontSize - 2.5,
      fontFamily: bold,
      color: "#9ca3af",
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 5,
    },
    termsText: { fontSize: fontSize - 1.5, color: "#6b7280", lineHeight: 1.6 },

    // ── Watermark ────────────────────────────────────────────────────
    watermark: {
      position: "absolute",
      top: "38%",
      left: "10%",
      fontSize: 90,
      color: "rgba(0,0,0,0.04)",
      fontFamily: bold,
      transform: "rotate(-30deg)",
    },

    // ── Footer ───────────────────────────────────────────────────────
    footer: {
      position: "absolute",
      bottom: 16,
      left: marginH,
      right: marginH,
      borderTopWidth: 1,
      borderTopColor: "#f3f4f6",
      paddingTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    footerText: { fontSize: fontSize - 2.5, color: "#9ca3af" },
    logo: { width: 36, height: 36, marginBottom: 8, objectFit: "contain" },
  });
}

export function ProposalPDF({ proposal, template, style }) {
  const tpl = template || style || {};
  const styles = buildStyles(tpl);
  const headerStyle = tpl?.headerStyle || "classic";
  const accent = tpl?.accentColor || "#2563eb";
  const marginH = inchesToPts(tpl?.marginLeft || 0.55);

  const sections =
    typeof proposal.sections === "string"
      ? JSON.parse(proposal.sections || "[]")
      : proposal.sections || [];
  const pricing =
    typeof proposal.pricing === "string"
      ? JSON.parse(proposal.pricing || "[]")
      : proposal.pricing || [];

  function renderHeader() {
    if (headerStyle === "bold") {
      return (
        <View style={styles.boldHeader}>
          <View style={{ flex: 1 }}>
            {tpl?.showLogo && tpl?.logoUrl ? (
              <Image src={tpl.logoUrl} style={styles.logo} />
            ) : null}
            {tpl?.businessName ? (
              <Text style={styles.businessNameBold}>{tpl.businessName}</Text>
            ) : null}
            {tpl?.businessAddress ? (
              <Text style={styles.businessMetaBold}>{tpl.businessAddress}</Text>
            ) : null}
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.proposalTitleBold, { textAlign: "left" }]}>{proposal.title}</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.proposalLabelBold}>Proposal</Text>
          </View>
        </View>
      );
    }

    if (headerStyle === "minimal") {
      return (
        <>
          <View style={styles.minimalHeader}>
            {tpl?.showLogo && tpl?.logoUrl ? (
              <Image src={tpl.logoUrl} style={styles.logo} />
            ) : null}
            {tpl?.businessName ? (
              <Text style={[styles.businessName, { textAlign: "center" }]}>
                {tpl.businessName}
              </Text>
            ) : null}
          </View>
          <View style={styles.minimalDivider} />
          <View style={{ paddingHorizontal: marginH, marginBottom: 28 }}>
            <Text style={styles.proposalLabel}>Proposal</Text>
            <Text style={[styles.proposalTitle, { textAlign: "left", maxWidth: "100%" }]}>
              {proposal.title}
            </Text>
          </View>
        </>
      );
    }

    // Classic (default)
    return (
      <View style={styles.classicHeader}>
        <View style={styles.classicHeaderLeft}>
          {tpl?.showLogo && tpl?.logoUrl ? (
            <Image src={tpl.logoUrl} style={styles.logo} />
          ) : null}
          {tpl?.businessName ? (
            <Text style={styles.businessName}>{tpl.businessName}</Text>
          ) : null}
          {tpl?.businessAddress ? (
            <Text style={styles.businessMeta}>{tpl.businessAddress}</Text>
          ) : null}
          {tpl?.businessEmail ? (
            <Text style={styles.businessMeta}>{tpl.businessEmail}</Text>
          ) : null}
          {tpl?.businessPhone ? (
            <Text style={styles.businessMeta}>{tpl.businessPhone}</Text>
          ) : null}
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.proposalTitle, { textAlign: "left", maxWidth: 280 }]}>{proposal.title}</Text>
            {proposal.validUntil ? (
              <Text style={[styles.businessMeta, { marginTop: 3 }]}>Valid until {formatDateStr(proposal.validUntil)}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.classicHeaderRight}>
          <Text style={[styles.proposalLabel, { letterSpacing: 2 }]}>Proposal</Text>
          <Text style={[styles.businessMeta, { marginTop: 6 }]}>
            Prepared {formatDateStr(proposal.createdAt)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Document>
      <Page size={tpl?.paperSize || "A4"} style={styles.page}>
        {tpl?.showWatermark ? (
          <Text style={styles.watermark}>DRAFT</Text>
        ) : null}

        {renderHeader()}

        <View style={styles.body}>

          {/* Meta row — client */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionLabel}>Prepared For</Text>
            <Text style={styles.clientName}>{proposal.clientName}</Text>
            {proposal.clientEmail ? (
              <Text style={styles.clientDetail}>{proposal.clientEmail}</Text>
            ) : null}
          </View>

          {/* Introduction */}
          {proposal.intro ? (
            <>
              <Text style={styles.sectionLabel}>Introduction</Text>
              <Text style={styles.introText}>{htmlToText(proposal.intro)}</Text>
            </>
          ) : null}

          {/* Scope sections — clean single-column list */}
          {sections.length > 0 ? (
            <>
              <Text style={[styles.sectionLabel, { marginBottom: 12 }]}>
                Scope of Work
              </Text>
              <View style={styles.scopeList}>
                {sections.map((section, i) => (
                  <View
                    key={i}
                    style={i < sections.length - 1 ? styles.scopeItem : styles.scopeItemLast}
                  >
                    <Text style={styles.scopeHeading}>
                      {section.heading || `Section ${i + 1}`}
                    </Text>
                    {section.body ? (
                      <Text style={styles.scopeBody}>{htmlToText(section.body)}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* Pricing table */}
          {(() => {
            const hasQtyRate = pricing.some((r) => r.qty || r.rate);
            return (
              <>
                <Text style={[styles.sectionLabel, { marginBottom: 8 }]}>Pricing</Text>
                <View style={styles.tableWrapper}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Description</Text>
                    {hasQtyRate && (
                      <>
                        <Text style={[styles.tableHeaderText, { width: 40, textAlign: "right" }]}>Qty</Text>
                        <Text style={[styles.tableHeaderText, { width: 70, textAlign: "right" }]}>Rate</Text>
                      </>
                    )}
                    <Text style={[styles.tableHeaderText, { width: 90, textAlign: "right" }]}>Amount</Text>
                  </View>
                  {pricing.map((item, i) => {
                    const qty = parseFloat(item.qty) || 0;
                    const rate = parseFloat(item.rate) || 0;
                    const rowAmt = qty && rate ? qty * rate : parseFloat(item.amount) || 0;
                    return (
                      <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                        <Text style={styles.tableDesc}>{item.description || `Item ${i + 1}`}</Text>
                        {hasQtyRate && (
                          <>
                            <Text style={[styles.tableAmt, { width: 40 }]}>{item.qty || "-"}</Text>
                            <Text style={[styles.tableAmt, { width: 70 }]}>
                              {item.rate ? formatMoney(item.rate, proposal.currency) : "-"}
                            </Text>
                          </>
                        )}
                        <Text style={styles.tableAmt}>
                          {formatMoney(rowAmt, proposal.currency)}
                        </Text>
                      </View>
                    );
                  })}
                  <View style={styles.tableTotalRow}>
                    <Text style={styles.tableTotalLabel}>Total</Text>
                    <Text style={styles.tableTotalValue}>
                      {formatMoney(proposal.total, proposal.currency)}
                    </Text>
                  </View>
                </View>
              </>
            );
          })()}

          {/* Terms */}
          {tpl?.showTerms && tpl?.termsText ? (
            <View style={styles.terms}>
              <Text style={styles.termsLabel}>Terms & Conditions</Text>
              <Text style={styles.termsText}>{tpl.termsText}</Text>
            </View>
          ) : null}

          {/* Signature block */}
          {tpl?.showSignatureBlock !== false ? (
            <View style={styles.signatureBlock}>
              <View style={styles.signatureSide}>
                <Text style={styles.signatureLabel}>Service Provider</Text>
                <View style={styles.signatureLine} />
                {tpl?.businessName ? (
                  <Text style={styles.signatureName}>{tpl.businessName}</Text>
                ) : null}
                <Text style={styles.signatureDate}>Date: _______________</Text>
              </View>
              <View style={styles.signatureSide}>
                <Text style={styles.signatureLabel}>Client</Text>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureName}>{proposal.clientName}</Text>
                <Text style={styles.signatureDate}>Date: _______________</Text>
              </View>
            </View>
          ) : null}

        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{tpl?.footerText || ""}</Text>
          {tpl?.showPageNumbers !== false ? (
            <Text
              style={styles.footerText}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            />
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
