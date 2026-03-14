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
  const tableHeaderBg = template?.tableHeaderBg || accent;
  const tableHeaderTextColor = template?.tableHeaderTextColor || "#ffffff";
  const font = getFont(template?.fontFamily);
  const bold = getBoldFont(template?.fontFamily);
  const fontSize = template?.fontSize || 10;
  const marginH = inchesToPts(template?.marginLeft || 0.4);

  return StyleSheet.create({
    page: {
      fontFamily: font,
      fontSize: fontSize,
      color: "#374151",
      backgroundColor: "#ffffff",
      paddingTop: 0,
      paddingBottom: 48,
      paddingHorizontal: 0,
    },
    // Classic header
    classicHeader: {
      backgroundColor: "#ffffff",
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
    classicHeaderLeft: { flexDirection: "column" },
    classicHeaderRight: { alignItems: "flex-end" },
    businessNameClassic: {
      fontSize: fontSize + 8,
      fontFamily: bold,
      color: "#111827",
    },
    businessMeta: { fontSize: fontSize - 2, color: "#6b7280", marginTop: 2 },
    invoiceTitleClassic: {
      fontSize: fontSize + 16,
      fontFamily: bold,
      color: accent,
      letterSpacing: 1,
    },
    invoiceNumberClassic: { fontSize: fontSize - 1, color: "#6b7280", marginTop: 3 },
    // Minimal header
    minimalHeader: {
      paddingHorizontal: marginH,
      paddingTop: 40,
      paddingBottom: 16,
      marginBottom: 4,
      alignItems: "center",
    },
    minimalBusinessName: {
      fontSize: fontSize + 3,
      fontFamily: bold,
      color: "#111827",
      textAlign: "center",
    },
    minimalDivider: {
      height: 1,
      backgroundColor: accent,
      marginHorizontal: marginH,
      marginBottom: 20,
    },
    minimalTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: marginH,
      marginBottom: 24,
    },
    minimalInvoiceTitle: {
      fontSize: fontSize + 12,
      fontFamily: bold,
      color: "#111827",
    },
    minimalInvoiceNumber: { fontSize: fontSize - 1, color: "#6b7280", marginTop: 4 },
    // Bold header
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
    boldBusinessName: { fontSize: fontSize + 8, fontFamily: bold, color: "#ffffff" },
    boldMeta: { fontSize: fontSize - 2, color: "rgba(255,255,255,0.7)", marginTop: 2 },
    boldInvoiceTitle: {
      fontSize: fontSize + 16,
      fontFamily: bold,
      color: "#ffffff",
      letterSpacing: 1,
      textAlign: "right",
    },
    boldInvoiceNumber: {
      fontSize: fontSize - 1,
      color: "rgba(255,255,255,0.75)",
      textAlign: "right",
      marginTop: 3,
    },
    // Body
    body: { paddingHorizontal: marginH },
    billToRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
    sectionLabel: {
      fontSize: fontSize - 3,
      fontFamily: bold,
      color: "#9ca3af",
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 5,
    },
    clientName: { fontSize: fontSize + 2, fontFamily: bold, color: "#111827", marginBottom: 2 },
    clientDetail: { fontSize: fontSize - 1, color: "#6b7280", marginBottom: 1 },
    detailRow: { flexDirection: "row", marginBottom: 3 },
    detailLabel: { fontSize: fontSize - 1, color: "#9ca3af", width: 70 },
    detailValue: { fontSize: fontSize - 1, color: "#374151", flex: 1 },
    // Table
    tableHeader: {
      flexDirection: "row",
      backgroundColor: tableHeaderBg,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    tableHeaderText: {
      fontSize: fontSize - 3,
      fontFamily: bold,
      color: tableHeaderTextColor,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#f3f4f6",
      paddingHorizontal: 10,
      paddingVertical: 9,
    },
    tableRowAlt: { backgroundColor: "#fafafa" },
    tableDesc: { flex: 1, fontSize: fontSize - 1, color: "#374151" },
    tableNum: { width: 50, fontSize: fontSize - 1, color: "#6b7280", textAlign: "right" },
    tableAmt: {
      width: 70,
      fontSize: fontSize - 1,
      color: "#374151",
      textAlign: "right",
      fontFamily: bold,
    },
    tableIdx: { width: 22, fontSize: fontSize - 1, color: "#9ca3af" },
    tableTax: { width: 55, fontSize: fontSize - 1, color: "#6b7280", textAlign: "right" },
    // Totals
    totalsBlock: { alignSelf: "flex-end", width: 220, marginTop: 16 },
    totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
    totalLabel: { fontSize: fontSize - 1, color: "#6b7280" },
    totalValue: { fontSize: fontSize - 1, color: "#374151" },
    totalFinalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1.5,
      borderTopColor: "#e5e7eb",
      paddingTop: 8,
      marginTop: 4,
    },
    totalFinalLabel: { fontSize: fontSize + 1, fontFamily: bold, color: "#111827" },
    totalFinalValue: { fontSize: fontSize + 1, fontFamily: bold, color: accent },
    // Notes
    notes: {
      marginTop: 24,
      backgroundColor: "#f9fafb",
      borderRadius: 4,
      padding: 12,
    },
    notesLabel: {
      fontSize: fontSize - 3,
      fontFamily: bold,
      color: "#9ca3af",
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    notesText: { fontSize: fontSize - 1, color: "#6b7280", lineHeight: 1.5 },
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
    // Watermark
    watermark: {
      position: "absolute",
      top: "38%",
      left: "15%",
      fontSize: 80,
      color: "rgba(0,0,0,0.05)",
      fontFamily: bold,
      transform: "rotate(-30deg)",
    },
    // Footer
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

function ClassicHeader({ template, invoice, styles }) {
  return (
    <View style={styles.classicHeader}>
      <View style={styles.classicHeaderLeft}>
        {template?.showLogo && template?.logoUrl ? (
          <Image src={template.logoUrl} style={styles.logo} />
        ) : null}
        {template?.businessName ? (
          <Text style={styles.businessNameClassic}>{template.businessName}</Text>
        ) : null}
        {template?.businessAddress ? (
          <Text style={styles.businessMeta}>{template.businessAddress}</Text>
        ) : null}
        {template?.businessEmail ? (
          <Text style={styles.businessMeta}>{template.businessEmail}</Text>
        ) : null}
        {template?.businessPhone ? (
          <Text style={styles.businessMeta}>{template.businessPhone}</Text>
        ) : null}
      </View>
      <View style={styles.classicHeaderRight}>
        <Text style={styles.invoiceTitleClassic}>INVOICE</Text>
        {invoice.invoiceNumber ? (
          <Text style={styles.invoiceNumberClassic}>#{invoice.invoiceNumber}</Text>
        ) : null}
      </View>
    </View>
  );
}

function MinimalHeader({ template, invoice, styles }) {
  return (
    <>
      <View style={styles.minimalHeader}>
        {template?.showLogo && template?.logoUrl ? (
          <Image src={template.logoUrl} style={[styles.logo, { marginBottom: 8 }]} />
        ) : null}
        {template?.businessName ? (
          <Text style={styles.minimalBusinessName}>{template.businessName}</Text>
        ) : null}
      </View>
      <View style={styles.minimalDivider} />
      <View style={styles.minimalTitleRow}>
        <View>
          <Text style={styles.minimalInvoiceTitle}>Invoice</Text>
          {invoice.invoiceNumber ? (
            <Text style={styles.minimalInvoiceNumber}>#{invoice.invoiceNumber}</Text>
          ) : null}
        </View>
      </View>
    </>
  );
}

function BoldHeader({ template, invoice, styles }) {
  return (
    <View style={styles.boldHeader}>
      <View>
        {template?.showLogo && template?.logoUrl ? (
          <Image src={template.logoUrl} style={[styles.logo, { marginBottom: 4 }]} />
        ) : null}
        {template?.businessName ? (
          <Text style={styles.boldBusinessName}>{template.businessName}</Text>
        ) : null}
        {template?.businessAddress ? (
          <Text style={styles.boldMeta}>{template.businessAddress}</Text>
        ) : null}
        {template?.businessEmail ? (
          <Text style={styles.boldMeta}>{template.businessEmail}</Text>
        ) : null}
        {template?.businessPhone ? (
          <Text style={styles.boldMeta}>{template.businessPhone}</Text>
        ) : null}
      </View>
      <View>
        <Text style={styles.boldInvoiceTitle}>INVOICE</Text>
        {invoice.invoiceNumber ? (
          <Text style={styles.boldInvoiceNumber}>#{invoice.invoiceNumber}</Text>
        ) : null}
      </View>
    </View>
  );
}

export function InvoicePDF({ invoice, template, style }) {
  // Support legacy `style` prop for backwards compatibility
  const tpl = template || style || {};
  const styles = buildStyles(tpl);
  const headerStyle = tpl?.headerStyle || "classic";
  const lineItems =
    typeof invoice.lineItems === "string"
      ? JSON.parse(invoice.lineItems)
      : invoice.lineItems || [];

  const showNumbers = tpl?.showItemNumbers ?? true;
  const showTax = tpl?.showTaxColumn ?? false;

  return (
    <Document>
      <Page size={tpl?.paperSize || "A4"} style={styles.page}>
        {tpl?.showWatermark ? (
          <Text style={styles.watermark}>DRAFT</Text>
        ) : null}

        {headerStyle === "classic" && (
          <ClassicHeader template={tpl} invoice={invoice} styles={styles} />
        )}
        {headerStyle === "minimal" && (
          <MinimalHeader template={tpl} invoice={invoice} styles={styles} />
        )}
        {headerStyle === "bold" && (
          <BoldHeader template={tpl} invoice={invoice} styles={styles} />
        )}

        <View style={styles.body}>
          <View style={styles.billToRow}>
            <View>
              <Text style={styles.sectionLabel}>Billed To</Text>
              <Text style={styles.clientName}>{invoice.project?.clientName || ""}</Text>
              {invoice.project?.clientEmail ? (
                <Text style={styles.clientDetail}>{invoice.project.clientEmail}</Text>
              ) : null}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.sectionLabel}>Invoice Details</Text>
              {invoice.invoiceNumber ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Invoice #:</Text>
                  <Text style={styles.detailValue}>{invoice.invoiceNumber}</Text>
                </View>
              ) : null}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Issued:</Text>
                <Text style={styles.detailValue}>{formatDateStr(invoice.createdAt)}</Text>
              </View>
              {invoice.dueDate ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Due:</Text>
                  <Text style={styles.detailValue}>{formatDateStr(invoice.dueDate)}</Text>
                </View>
              ) : null}
              {invoice.project?.title ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Project:</Text>
                  <Text style={styles.detailValue}>{invoice.project.title}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Line items table */}
          <View style={styles.tableHeader}>
            {showNumbers ? (
              <Text style={[styles.tableHeaderText, styles.tableIdx]}>#</Text>
            ) : null}
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.tableNum]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.tableNum]}>Rate</Text>
            {showTax ? (
              <Text style={[styles.tableHeaderText, styles.tableTax]}>Tax</Text>
            ) : null}
            <Text style={[styles.tableHeaderText, styles.tableAmt]}>Amount</Text>
          </View>
          {lineItems.map((item, i) => {
            const qty = parseFloat(item.quantity) || 1;
            const amt = parseFloat(item.amount) || 0;
            const rate = parseFloat(item.rate || amt / (qty || 1)) || 0;
            return (
              <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                {showNumbers ? (
                  <Text style={styles.tableIdx}>{i + 1}</Text>
                ) : null}
                <Text style={styles.tableDesc}>{item.description || ""}</Text>
                <Text style={styles.tableNum}>{qty}</Text>
                <Text style={styles.tableNum}>{formatMoney(rate, invoice.currency)}</Text>
                {showTax ? (
                  <Text style={styles.tableTax}>
                    {invoice.taxRate > 0 ? `${invoice.taxRate}%` : "-"}
                  </Text>
                ) : null}
                <Text style={styles.tableAmt}>{formatMoney(amt, invoice.currency)}</Text>
              </View>
            );
          })}

          {/* Totals */}
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {formatMoney(invoice.subtotal ?? invoice.total, invoice.currency)}
              </Text>
            </View>
            {invoice.taxRate > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
                <Text style={styles.totalValue}>
                  +{formatMoney(invoice.taxAmount, invoice.currency)}
                </Text>
              </View>
            ) : null}
            {invoice.discountAmount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={[styles.totalValue, { color: "#ef4444" }]}>
                  -{formatMoney(invoice.discountAmount, invoice.currency)}
                </Text>
              </View>
            ) : null}
            <View style={styles.totalFinalRow}>
              <Text style={styles.totalFinalLabel}>Total</Text>
              <Text style={styles.totalFinalValue}>
                {formatMoney(invoice.total, invoice.currency)}
              </Text>
            </View>
          </View>

          {/* Notes */}
          {invoice.notes ? (
            <View style={styles.notes}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          ) : null}

          {/* Terms */}
          {tpl?.showTerms && tpl?.termsText ? (
            <View style={styles.terms}>
              <Text style={styles.termsLabel}>Terms & Conditions</Text>
              <Text style={styles.termsText}>{tpl.termsText}</Text>
            </View>
          ) : null}
        </View>

        {/* Footer */}
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
