export const CONTACT_STATUSES = ["lead", "active", "archived"];

export const CONTACT_STATUS_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "active", label: "Active client" },
  { value: "archived", label: "Archived" },
];

export const CONTACT_IMPORT_FIELDS = [
  { value: "ignore", label: "Do not import" },
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "company", label: "Company" },
  { value: "status", label: "Status" },
  { value: "source", label: "Source" },
  { value: "value", label: "Value" },
  { value: "notes", label: "Notes" },
];

const STATUS_ALIASES = {
  lead: "lead",
  leads: "lead",
  new: "lead",
  prospect: "lead",
  active: "active",
  client: "active",
  clients: "active",
  customer: "active",
  archived: "archived",
  archive: "archived",
  inactive: "archived",
};

const HEADER_ALIASES = {
  name: "name",
  fullname: "name",
  contactname: "name",
  person: "name",
  email: "email",
  emailaddress: "email",
  mail: "email",
  phone: "phone",
  phonenumber: "phone",
  mobile: "phone",
  mobilephone: "phone",
  telephone: "phone",
  company: "company",
  companyname: "company",
  business: "company",
  organization: "company",
  organisation: "company",
  status: "status",
  type: "status",
  source: "source",
  leadsource: "source",
  value: "value",
  estimatedvalue: "value",
  estvalue: "value",
  dealvalue: "value",
  notes: "notes",
  note: "notes",
  description: "notes",
};

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value) {
  const email = cleanString(value);
  return email ? email.toLowerCase() : "";
}

export function normalizeContactStatus(value) {
  const normalized = cleanString(value).toLowerCase();
  if (!normalized) return "lead";
  return STATUS_ALIASES[normalized] ?? null;
}

export function parseContactValue(value) {
  if (value === null || value === undefined) return { value: null };
  const raw = typeof value === "number" ? String(value) : cleanString(value);
  if (!raw) return { value: null };

  const sanitized = raw.replace(/[^0-9.-]/g, "");
  if (!sanitized || sanitized === "-" || sanitized === "." || sanitized === "-.") {
    return { error: "Value must be a valid number" };
  }

  const parsed = Number.parseFloat(sanitized);
  if (Number.isNaN(parsed)) {
    return { error: "Value must be a valid number" };
  }

  return { value: parsed };
}

export function normalizeContactInput(input = {}, { requireName = false } = {}) {
  const name = cleanString(input.name);
  const status = normalizeContactStatus(input.status);
  const parsedValue = parseContactValue(input.value);
  const errors = [];

  if (requireName && !name) {
    errors.push("Name is required");
  }

  if (!status) {
    errors.push("Status must be lead, active, or archived");
  }

  if (parsedValue.error) {
    errors.push(parsedValue.error);
  }

  return {
    errors,
    data: {
      name,
      email: normalizeEmail(input.email) || null,
      phone: cleanString(input.phone) || null,
      company: cleanString(input.company) || null,
      status: status ?? "lead",
      source: cleanString(input.source) || null,
      value: parsedValue.value ?? null,
      notes: cleanString(input.notes) || null,
    },
  };
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        value += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(value) {
  return cleanString(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function suggestContactImportMapping(headers = []) {
  return headers.map((header) => HEADER_ALIASES[normalizeHeader(header)] ?? "ignore");
}

export function buildContactImportPreview(headers = [], rows = [], mapping = []) {
  if (!rows.length) {
    return {
      validRows: [],
      invalidRows: [{ rowNumber: 0, errors: ["CSV file is empty"] }],
    };
  }

  if (!mapping.includes("name")) {
    return {
      validRows: [],
      invalidRows: [{ rowNumber: 1, errors: ["Map one column to Name before importing"] }],
    };
  }

  const validRows = [];
  const invalidRows = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const hasContent = row.some((cell) => cleanString(cell));
    if (!hasContent) return;

    const record = {};
    mapping.forEach((field, columnIndex) => {
      if (!field || field === "ignore") return;
      record[field] = row[columnIndex] ?? "";
    });

    const normalized = normalizeContactInput(record, { requireName: true });
    if (normalized.errors.length) {
      invalidRows.push({ rowNumber, errors: normalized.errors });
      return;
    }

    validRows.push(normalized.data);
  });

  return { validRows, invalidRows };
}

export function parseContactImportCsv(text) {
  const rows = parseCsv(text);
  if (!rows.length) {
    return {
      rawRows: [],
      validRows: [],
      invalidRows: [{ rowNumber: 0, errors: ["CSV file is empty"] }],
      headers: [],
      mapping: [],
    };
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((header) => cleanString(header));
  const mapping = suggestContactImportMapping(headers);
  const { validRows, invalidRows } = buildContactImportPreview(headers, dataRows, mapping);

  return { headers, rawRows: dataRows, mapping, validRows, invalidRows };
}

export function getContactEmailKey(contact) {
  return normalizeEmail(contact?.email);
}
