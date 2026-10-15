export const BANK_FIELDS = [
  "accountName",
  "bankName",
  "sortCode",
  "accountNumber",
  "iban",
  "bic",
];
export function validateBankDetails(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Enter bank details.");
  const details = Object.fromEntries(
    BANK_FIELDS.map((key) => [
      key,
      typeof value[key] === "string" ? value[key].trim() : "",
    ]),
  );
  if (
    Object.values(details).some(
      (value) => value.length > 150 || /[\x00-\x1F]/.test(value),
    )
  )
    throw new Error("Bank details contain invalid characters or are too long.");
  details.sortCode = details.sortCode.replace(/[ -]/g, "");
  details.accountNumber = details.accountNumber.replace(/ /g, "");
  details.iban = details.iban.replace(/ /g, "").toUpperCase();
  details.bic = details.bic.toUpperCase();
  if (!details.accountName) throw new Error("Account holder name is required.");
  const uk =
    /^\d{6}$/.test(details.sortCode) && /^\d{8}$/.test(details.accountNumber);
  if ((details.sortCode || details.accountNumber) && !uk)
    throw new Error("Enter a 6-digit sort code and 8-digit account number.");
  if (details.iban) {
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(details.iban))
      throw new Error("Enter a valid IBAN.");
    const rearranged = details.iban.slice(4) + details.iban.slice(0, 4);
    let remainder = 0;
    for (const character of rearranged) {
      const digits = /[A-Z]/.test(character)
        ? String(character.charCodeAt(0) - 55)
        : character;
      for (const digit of digits)
        remainder = (remainder * 10 + Number(digit)) % 97;
    }
    if (remainder !== 1) throw new Error("IBAN checksum is invalid.");
  }
  if (!uk && !details.iban)
    throw new Error("Enter UK bank details or an IBAN.");
  if (details.bic && !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(details.bic))
    throw new Error("Enter a valid BIC / SWIFT code.");
  return details;
}
export function bankPaymentReference(invoice) {
  // Stored immutable reference fits the 18-character UK bank reference limit.
  return invoice.paymentReference || `SP-${invoice.id}`;
}
export function bankDetailLines(details) {
  if (!details) return [];
  return [
    ["Account holder", details.accountName],
    ["Bank", details.bankName],
    ["Sort code", details.sortCode],
    ["Account number", details.accountNumber],
    ["IBAN", details.iban],
    ["BIC / SWIFT", details.bic],
  ].filter(([, value]) => value);
}
