/**
 * Shared default PDF template — used as fallback when no user template is set.
 * Single source of truth for all three PDF types (invoice, proposal, contract).
 */
export const DEFAULT_PDF_TEMPLATE = {
  accentColor: "#18181b",
  fontFamily: "helvetica",
  fontSize: 10,
  headerStyle: "classic",
  showLogo: true,
  showWatermark: false,
  showPageNumbers: true,
  showItemNumbers: true,
  showTaxColumn: false,
  tableHeaderBg: "#18181b",
  tableHeaderTextColor: "#ffffff",
  showTerms: false,
  termsText: null,
  showSignatureBlock: true,
  paperSize: "A4",
  orientation: "portrait",
  marginTop: 0.4,
  marginBottom: 0.4,
  marginLeft: 0.4,
  marginRight: 0.4,
  footerText: null,
  logoUrl: null,
  businessName: null,
  businessAddress: null,
  businessEmail: null,
  businessPhone: null,
};

export const VALID_PAPER_SIZES = ["A4", "A5", "Letter"];
export const VALID_ORIENTATIONS = ["portrait", "landscape"];
export const VALID_HEADER_STYLES = ["classic", "minimal", "bold"];
export const VALID_FONT_FAMILIES = ["helvetica", "times", "courier"];

export function validateTemplateUpdates(updates) {
  const errors = [];

  if (updates.paperSize !== undefined && !VALID_PAPER_SIZES.includes(updates.paperSize)) {
    errors.push(`paperSize must be one of: ${VALID_PAPER_SIZES.join(", ")}`);
  }
  if (updates.orientation !== undefined && !VALID_ORIENTATIONS.includes(updates.orientation)) {
    errors.push(`orientation must be one of: ${VALID_ORIENTATIONS.join(", ")}`);
  }
  if (updates.headerStyle !== undefined && !VALID_HEADER_STYLES.includes(updates.headerStyle)) {
    errors.push(`headerStyle must be one of: ${VALID_HEADER_STYLES.join(", ")}`);
  }
  if (updates.fontFamily !== undefined && !VALID_FONT_FAMILIES.includes(updates.fontFamily)) {
    errors.push(`fontFamily must be one of: ${VALID_FONT_FAMILIES.join(", ")}`);
  }
  if (updates.fontSize !== undefined) {
    const fs = Number(updates.fontSize);
    if (isNaN(fs) || fs < 7 || fs > 16) errors.push("fontSize must be between 7 and 16");
  }
  for (const margin of ["marginTop", "marginBottom", "marginLeft", "marginRight"]) {
    if (updates[margin] !== undefined) {
      const v = Number(updates[margin]);
      if (isNaN(v) || v < 0 || v > 3) errors.push(`${margin} must be between 0 and 3 inches`);
    }
  }
  if (updates.accentColor !== undefined && !/^#[0-9a-fA-F]{3,8}$/.test(updates.accentColor)) {
    errors.push("accentColor must be a valid hex color");
  }
  if (updates.tableHeaderBg !== undefined && !/^#[0-9a-fA-F]{3,8}$/.test(updates.tableHeaderBg)) {
    errors.push("tableHeaderBg must be a valid hex color");
  }

  return errors;
}
