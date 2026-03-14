import { randomBytes } from "crypto";

const EXPORT_COLUMNS = [
  { key: "name", label: "Name", type: "string" },
  { key: "entityType", label: "Type", type: "string" },
  { key: "jobTitle", label: "Job Title", type: "string" },
  { key: "email", label: "Email", type: "string" },
  { key: "phone", label: "Phone", type: "string" },
  { key: "website", label: "Website", type: "string" },
  { key: "company", label: "Company", type: "string" },
  { key: "companyAddress", label: "Company Address", type: "string" },
  { key: "status", label: "Status", type: "string" },
  { key: "source", label: "Source", type: "string" },
  { key: "value", label: "Est. Value", type: "number" },
  { key: "notes", label: "Notes", type: "string" },
  { key: "projects", label: "Projects", type: "number" },
  { key: "added", label: "Added", type: "string" },
];

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i += 1) {
    let current = i;
    for (let bit = 0; bit < 8; bit += 1) {
      current = (current & 1) ? (0xedb88320 ^ (current >>> 1)) : (current >>> 1);
    }
    table[i] = current >>> 0;
  }

  return table;
})();

function escapeCsvValue(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatExportDate(value) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function formatStatus(status) {
  if (status === "active") return "Client";
  if (status === "archived") return "Archived";
  return "Lead";
}

function formatEntityType(type) {
  return type === "organization" ? "Organisation" : "Individual";
}

function joinAddress(...parts) {
  return parts.map((part) => String(part || "").trim()).filter(Boolean).join(", ");
}

function mapContactRow(contact) {
  return {
    name: contact.name || "",
    entityType: formatEntityType(contact.entityType),
    jobTitle: contact.jobTitle || "",
    email: contact.email || "",
    phone: contact.phone || "",
    website: contact.website || "",
    company: contact.company || "",
    companyAddress: joinAddress(
      contact.companyAddressLine1,
      contact.companyCity,
      contact.companyState,
      contact.companyPostalCode,
      contact.companyCountry
    ),
    status: formatStatus(contact.status),
    source: contact.source || "",
    value: typeof contact.value === "number" ? contact.value : "",
    notes: contact.notes || "",
    projects: contact._count?.projects ?? 0,
    added: formatExportDate(contact.createdAt),
  };
}

function getColumnLetter(index) {
  let current = index + 1;
  let result = "";

  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }

  return result;
}

function getDosDateTime(date = new Date()) {
  const safeYear = Math.max(date.getFullYear(), 1980);
  const dosTime =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    (((safeYear - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);

  return { dosTime, dosDate };
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function crc32Byte(crc, byte) {
  return (CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)) >>> 0;
}

function initZipCryptoKeys(passwordBuffer) {
  const keys = [0x12345678, 0x23456789, 0x34567890];

  const updateKeys = (byte) => {
    keys[0] = crc32Byte(keys[0], byte);
    keys[1] = (Math.imul((keys[1] + (keys[0] & 0xff)) >>> 0, 134775813) + 1) >>> 0;
    keys[2] = crc32Byte(keys[2], keys[1] >>> 24);
  };

  for (const byte of passwordBuffer) {
    updateKeys(byte);
  }

  return {
    updateKeys,
    encryptByte(byte) {
      const temp = (keys[2] | 2) >>> 0;
      const magic = ((Math.imul(temp, temp ^ 1) >>> 8) & 0xff) >>> 0;
      const encrypted = byte ^ magic;
      updateKeys(byte);
      return encrypted;
    },
  };
}

function encryptZipEntry(data, password, crc) {
  const cryptoState = initZipCryptoKeys(Buffer.from(password, "utf8"));
  const verification = Buffer.from([(crc >>> 16) & 0xff, (crc >>> 24) & 0xff]);
  const header = Buffer.concat([randomBytes(10), verification]);
  const encrypted = Buffer.alloc(header.length + data.length);

  for (let i = 0; i < header.length; i += 1) {
    encrypted[i] = cryptoState.encryptByte(header[i]);
  }

  for (let i = 0; i < data.length; i += 1) {
    encrypted[header.length + i] = cryptoState.encryptByte(data[i]);
  }

  return encrypted;
}

function createZipBuffer(files, { password } = {}) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const now = new Date();

  files.forEach((file) => {
    const nameBuffer = Buffer.from(file.name, "utf8");
    const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data);
    const checksum = crc32(data);
    const { dosTime, dosDate } = getDosDateTime(now);
    const encrypted = password ? encryptZipEntry(data, password, checksum) : data;
    const flags = password ? 0x0001 : 0x0000;

    const localHeader = Buffer.alloc(30 + nameBuffer.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(flags, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(encrypted.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuffer.copy(localHeader, 30);

    const centralHeader = Buffer.alloc(46 + nameBuffer.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(flags, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(encrypted.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    nameBuffer.copy(centralHeader, 46);

    localParts.push(localHeader, encrypted);
    centralParts.push(centralHeader);
    offset += localHeader.length + encrypted.length;
  });

  const centralDirectory = Buffer.concat(centralParts);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(offset, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, endRecord]);
}

function makeStringCell(reference, value, style = 0) {
  return `<c r="${reference}" t="inlineStr"${style ? ` s="${style}"` : ""}><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function makeNumberCell(reference, value, style = 0) {
  return `<c r="${reference}"${style ? ` s="${style}"` : ""}><v>${value}</v></c>`;
}

function buildWorksheetXml(rows) {
  const lastColumn = getColumnLetter(EXPORT_COLUMNS.length - 1);
  const sheetRows = rows.map((row, rowIndex) => {
    const cells = EXPORT_COLUMNS.map((column, columnIndex) => {
      const reference = `${getColumnLetter(columnIndex)}${rowIndex + 1}`;
      const value = row[column.key];

      if (rowIndex === 0) {
        return makeStringCell(reference, value, 1);
      }

      if (column.type === "number" && typeof value === "number") {
        return makeNumberCell(reference, value);
      }

      return makeStringCell(reference, value ?? "");
    }).join("");

    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("");

  const columnWidths = [22, 28, 18, 22, 14, 18, 14, 36, 12, 18]
    .map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastColumn}${rows.length}"/>
  <sheetViews>
    <sheetView workbookViewId="0"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>${columnWidths}</cols>
  <sheetData>${sheetRows}</sheetData>
</worksheet>`;
}

export function buildContactsCsvBuffer(contacts) {
  const rows = [
    EXPORT_COLUMNS.reduce((record, column) => ({ ...record, [column.key]: column.label }), {}),
    ...contacts.map(mapContactRow),
  ];

  const csv = rows
    .map((row) => EXPORT_COLUMNS.map((column) => escapeCsvValue(row[column.key])).join(","))
    .join("\n");

  return Buffer.from(csv, "utf8");
}

export function buildContactsXlsxBuffer(contacts) {
  const rows = [
    EXPORT_COLUMNS.reduce((record, column) => ({ ...record, [column.key]: column.label }), {}),
    ...contacts.map(mapContactRow),
  ];

  const files = [
    {
      name: "[Content_Types].xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    },
    {
      name: "docProps/app.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>SoloPad</Application>
</Properties>`,
    },
    {
      name: "docProps/core.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Contacts Export</dc:title>
  <dc:creator>SoloPad</dc:creator>
  <cp:lastModifiedBy>SoloPad</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`,
    },
    {
      name: "xl/workbook.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Contacts" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    {
      name: "xl/styles.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
</styleSheet>`,
    },
    {
      name: "xl/worksheets/sheet1.xml",
      data: buildWorksheetXml(rows),
    },
  ];

  return createZipBuffer(files);
}

export function createPasswordProtectedZipBuffer({ fileName, data, password }) {
  return createZipBuffer([{ name: fileName, data }], { password });
}
