import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

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
  const accent = template?.accentColor || "#18181b";
  const font = getFont(template?.fontFamily);
  const bold = getBoldFont(template?.fontFamily);
  const fontSize = template?.fontSize || 10;
  const marginH = inchesToPts(template?.marginLeft || 0.4);

  return StyleSheet.create({
    page: {
      fontFamily: font,
      fontSize,
      color: "#374151",
      backgroundColor: "#ffffff",
      paddingBottom: 48,
    },
    classicHeader: {
      borderBottomWidth: 3,
      borderBottomColor: accent,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: marginH,
      paddingTop: 40,
      paddingBottom: 24,
      marginBottom: 32,
    },
    boldHeader: {
      backgroundColor: accent,
      paddingHorizontal: marginH,
      paddingTop: 36,
      paddingBottom: 30,
      marginBottom: 32,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    minimalHeader: {
      paddingHorizontal: marginH,
      paddingTop: 40,
      paddingBottom: 16,
      alignItems: "center",
    },
    minimalDivider: {
      height: 1,
      backgroundColor: accent,
      marginHorizontal: marginH,
      marginBottom: 20,
    },
    businessName: { fontSize: fontSize + 8, fontFamily: bold, color: "#111827" },
    businessNameBold: { fontSize: fontSize + 8, fontFamily: bold, color: "#ffffff" },
    businessMeta: { fontSize: fontSize - 2, color: "#6b7280", marginTop: 2 },
    businessMetaBold: { fontSize: fontSize - 2, color: "rgba(255,255,255,0.7)", marginTop: 2 },
    title: { fontSize: fontSize + 14, fontFamily: bold, color: accent },
    titleBold: {
      fontSize: fontSize + 14,
      fontFamily: bold,
      color: "#ffffff",
      textAlign: "right",
    },
    body: { paddingHorizontal: marginH },
    sectionLabel: {
      fontSize: fontSize - 3,
      fontFamily: bold,
      color: "#9ca3af",
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 5,
    },
    partiesRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
      gap: 20,
    },
    partyBox: { flex: 1, backgroundColor: "#f9fafb", borderRadius: 4, padding: 12 },
    partyName: { fontSize: fontSize + 1, fontFamily: bold, color: "#111827", marginBottom: 2 },
    partyDetail: { fontSize: fontSize - 1.5, color: "#6b7280", marginBottom: 1 },
    divider: { height: 1, backgroundColor: "#e5e7eb", marginBottom: 20, marginTop: 4 },
    contractTitle: {
      fontSize: fontSize + 4,
      fontFamily: bold,
      color: "#111827",
      marginBottom: 16,
    },
    clauseWrapper: {
      marginBottom: 16,
      borderLeftWidth: 3,
      borderLeftColor: accent,
      paddingLeft: 12,
    },
    clauseNumber: {
      fontSize: fontSize - 3,
      fontFamily: bold,
      color: "#9ca3af",
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 3,
    },
    clauseHeading: { fontSize: fontSize + 0.5, fontFamily: bold, color: "#111827", marginBottom: 5 },
    clauseBody: { fontSize: fontSize - 1, color: "#6b7280", lineHeight: 1.6 },
    signatureBlock: {
      marginTop: 32,
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
      paddingTop: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 32,
    },
    signatureSide: { flex: 1 },
    signatureLabel: {
      fontSize: fontSize - 3,
      fontFamily: bold,
      color: "#9ca3af",
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    signatureLine: { height: 1, backgroundColor: "#374151", marginBottom: 4 },
    signatureName: { fontSize: fontSize - 1, color: "#374151" },
    signatureDate: { fontSize: fontSize - 2, color: "#9ca3af", marginTop: 2 },
    // Terms
    terms: { marginTop: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
    termsLabel: {
      fontSize: fontSize - 3,
      fontFamily: bold,
      color: "#9ca3af",
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    termsText: { fontSize: fontSize - 1.5, color: "#6b7280", lineHeight: 1.5 },
    watermark: {
      position: "absolute",
      top: "38%",
      left: "15%",
      fontSize: 80,
      color: "rgba(0,0,0,0.05)",
      fontFamily: bold,
      transform: "rotate(-30deg)",
    },
    footer: {
      position: "absolute",
      bottom: 16,
      left: marginH,
      right: marginH,
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
      paddingTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    footerText: { fontSize: fontSize - 2, color: "#9ca3af" },
    logo: { width: 40, height: 40, marginBottom: 6, objectFit: "contain" },
  });
}

export function ContractPDF({ contract, template, style }) {
  const tpl = template || style || {};
  const styles = buildStyles(tpl);
  const headerStyle = tpl?.headerStyle || "classic";

  const clauses =
    typeof contract.clauses === "string"
      ? JSON.parse(contract.clauses || "[]")
      : contract.clauses || [];

  function renderHeader() {
    if (headerStyle === "bold") {
      return (
        <View style={styles.boldHeader}>
          <View>
            {tpl?.showLogo && tpl?.logoUrl ? (
              <Image src={tpl.logoUrl} style={styles.logo} />
            ) : null}
            {tpl?.businessName ? (
              <Text style={styles.businessNameBold}>{tpl.businessName}</Text>
            ) : null}
            {tpl?.businessAddress ? (
              <Text style={styles.businessMetaBold}>{tpl.businessAddress}</Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.titleBold}>CONTRACT</Text>
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
        </>
      );
    }
    return (
      <View style={styles.classicHeader}>
        <View>
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
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.title}>CONTRACT</Text>
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
          <Text style={styles.contractTitle}>{contract.title}</Text>

          <View style={styles.partiesRow}>
            <View style={styles.partyBox}>
              <Text style={styles.sectionLabel}>Service Provider</Text>
              {tpl?.businessName ? (
                <Text style={styles.partyName}>{tpl.businessName}</Text>
              ) : null}
              {tpl?.businessEmail ? (
                <Text style={styles.partyDetail}>{tpl.businessEmail}</Text>
              ) : null}
              {tpl?.businessAddress ? (
                <Text style={styles.partyDetail}>{tpl.businessAddress}</Text>
              ) : null}
            </View>
            <View style={styles.partyBox}>
              <Text style={styles.sectionLabel}>Client</Text>
              <Text style={styles.partyName}>{contract.clientName}</Text>
              {contract.clientEmail ? (
                <Text style={styles.partyDetail}>{contract.clientEmail}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Terms & Conditions</Text>
          {clauses.map((clause, i) => (
            <View key={i} style={styles.clauseWrapper}>
              <Text style={styles.clauseNumber}>Clause {i + 1}</Text>
              <Text style={styles.clauseHeading}>
                {clause.heading || `Section ${i + 1}`}
              </Text>
              <Text style={styles.clauseBody}>{clause.body || ""}</Text>
            </View>
          ))}

          {tpl?.showTerms && tpl?.termsText ? (
            <View style={styles.terms}>
              <Text style={styles.termsLabel}>Additional Terms</Text>
              <Text style={styles.termsText}>{tpl.termsText}</Text>
            </View>
          ) : null}

          {tpl?.showSignatureBlock !== false ? (
            <View style={styles.signatureBlock}>
              <View style={styles.signatureSide}>
                <Text style={styles.signatureLabel}>Service Provider Signature</Text>
                <View style={styles.signatureLine} />
                {tpl?.businessName ? (
                  <Text style={styles.signatureName}>{tpl.businessName}</Text>
                ) : contract.providerSignatureName ? (
                  <Text style={styles.signatureName}>{contract.providerSignatureName}</Text>
                ) : null}
                <Text style={styles.signatureDate}>
                  {contract.providerSignedAt ? `Signed: ${formatDateStr(contract.providerSignedAt)}` : "Date: _______________"}
                </Text>
              </View>
              <View style={styles.signatureSide}>
                <Text style={styles.signatureLabel}>Client Signature</Text>
                <View style={styles.signatureLine} />
                {contract.signatureName ? (
                  <Text style={styles.signatureName}>{contract.signatureName}</Text>
                ) : (
                  <Text style={styles.signatureName}>{contract.clientName}</Text>
                )}
                <Text style={styles.signatureDate}>
                  {contract.signedAt
                    ? `Signed: ${formatDateStr(contract.signedAt)}`
                    : "Date: _______________"}
                </Text>
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
