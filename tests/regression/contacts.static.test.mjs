import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = "/Users/ayaturrehman/Documents/syslom/Project/freelancer/freelance-managment-app";

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

test("contacts normalization preserves current required-field rules", () => {
  const source = read("lib/contacts.js");

  assert.match(source, /if \(requireName && !name\)/);
  assert.match(source, /errors\.push\("Name is required"\)/);
  assert.match(source, /entityType \?\? "individual"/);
  assert.match(source, /status \?\? "lead"/);
  assert.match(source, /Organisation name is required/);
});

test("contacts normalization still handles website, value, and company address fields", () => {
  const source = read("lib/contacts.js");

  assert.match(source, /normalizeWebsite/);
  assert.match(source, /parseContactValue/);
  assert.match(source, /companyAddressLine1/);
  assert.match(source, /companyCity/);
  assert.match(source, /companyState/);
  assert.match(source, /companyPostalCode/);
  assert.match(source, /companyCountry/);
  assert.doesNotMatch(source, /addressLine1:/);
});

test("contacts collection page remains top-nav-search driven with modal create flow", () => {
  const pageSource = read("app/(app)/contacts/page.jsx");
  const tableSource = read("app/(app)/contacts/ContactsTable.jsx");

  assert.match(pageSource, /params\?\.q/);
  assert.match(pageSource, /website/);
  assert.match(pageSource, /source/);
  assert.match(pageSource, /companyCity/);

  assert.match(tableSource, /const createParam = searchParams\.get\("create"\) === "1"/);
  assert.match(tableSource, /<ContactFormModal/);
  assert.match(tableSource, /handleCreateModalChange/);
});

test("contacts API routes stay tenant-scoped and validated", () => {
  const collectionRoute = read("app/api/contacts/route.js");
  const detailRoute = read("app/api/contacts/[id]/route.js");

  assert.match(collectionRoute, /getTenantFilter/);
  assert.match(collectionRoute, /getTenantData/);
  assert.match(collectionRoute, /normalizeContactInput/);
  assert.match(collectionRoute, /website/);
  assert.match(collectionRoute, /source/);

  assert.match(detailRoute, /getTenantFilter/);
  assert.match(detailRoute, /normalizeContactInput/);
  assert.match(detailRoute, /findFirst/);
  assert.match(detailRoute, /Not found/);
});

test("contact form remains a side-sheet with shared input components and visible required fields", () => {
  const source = read("app/(app)/contacts/ContactFormModal.jsx");

  assert.match(source, /import Modal from "@\/components\/shared\/Modal"/);
  assert.match(source, /import Input from "@\/components\/ui\/Input"/);
  assert.match(source, /import Select from "@\/components\/ui\/Select"/);
  assert.match(source, /layout="side"/);
  assert.match(source, /label="Full name"/);
  assert.match(source, /label="Type"/);
  assert.match(source, /label="Status"/);
  assert.match(source, /label="Address"/);
  assert.match(source, /label="Notes"/);
  assert.match(source, /Save contact/);
});
