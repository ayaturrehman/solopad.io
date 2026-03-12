import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = "/Users/ayaturrehman/Documents/syslom/Project/freelancer/freelance-managment-app";

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

const modulePages = [
  "app/(app)/dashboard/page.jsx",
  "app/(app)/contacts/page.jsx",
  "app/(app)/projects/page.jsx",
  "app/(app)/proposals/page.jsx",
  "app/(app)/contracts/page.jsx",
  "app/(app)/templates/page.jsx",
  "app/(app)/finance/page.jsx",
  "app/(app)/services/page.jsx",
  "app/(app)/tasks/page.jsx",
  "app/(app)/time-tracker/page.jsx",
  "app/(app)/scheduler/page.jsx",
  "app/(app)/settings/page.jsx",
];

const sessionTenantRoutes = [
  "app/api/contacts/route.js",
  "app/api/contacts/import/route.js",
  "app/api/contacts/[id]/route.js",
  "app/api/projects/route.js",
  "app/api/projects/[id]/route.js",
  "app/api/proposals/route.js",
  "app/api/proposals/[id]/route.js",
  "app/api/contracts/route.js",
  "app/api/contracts/[id]/route.js",
  "app/api/invoices/route.js",
  "app/api/invoices/[id]/route.js",
  "app/api/tasks/route.js",
  "app/api/tasks/[id]/route.js",
  "app/api/templates/route.js",
  "app/api/templates/[id]/route.js",
  "app/api/expenses/route.js",
  "app/api/expenses/[id]/route.js",
  "app/api/recurring-expenses/route.js",
  "app/api/recurring-expenses/[id]/route.js",
  "app/api/services/route.js",
  "app/api/services/[id]/route.js",
  "app/api/time-entries/route.js",
  "app/api/time-entries/[id]/route.js",
  "app/api/bookings/[id]/route.js",
  "app/api/notes/route.js",
  "app/api/notes/[id]/route.js",
  "app/api/comments/route.js",
  "app/api/files/route.js",
  "app/api/notifications/route.js",
];

const publicTenantRoutes = [
  "app/api/bookings/route.js",
];

const createRoutes = [
  "app/api/contacts/route.js",
  "app/api/contacts/import/route.js",
  "app/api/projects/route.js",
  "app/api/proposals/route.js",
  "app/api/contracts/route.js",
  "app/api/tasks/route.js",
  "app/api/templates/route.js",
  "app/api/expenses/route.js",
  "app/api/recurring-expenses/route.js",
  "app/api/services/route.js",
  "app/api/time-entries/route.js",
  "app/api/notes/route.js",
  "app/api/comments/route.js",
  "app/api/files/route.js",
];

const ownershipThroughRelationsCreateRoutes = [
  "app/api/invoices/route.js",
];

test("regression plan document exists", () => {
  assert.equal(exists("docs/multi-tenancy-regression-plan.md"), true);
});

test("core app modules exist", () => {
  for (const file of modulePages) {
    assert.equal(exists(file), true, `Missing module page: ${file}`);
  }
});

test("tenant helper preserves business fallback and user ownership stamping", () => {
  const file = read("lib/tenant.js");
  assert.match(file, /businessId/);
  assert.match(file, /return \{ businessId: user\.businessId \}/);
  assert.match(file, /return \{ userId: session\.user\.id \}/);
  assert.match(file, /userId: session\.user\.id/);
});

test("critical API routes are session-gated", () => {
  for (const file of sessionTenantRoutes) {
    const source = read(file);
    assert.match(source, /getSession/, `${file} should use getSession`);
    assert.match(source, /Unauthorized/, `${file} should reject unauthenticated access`);
  }
});

test("critical API routes include tenant scoping helpers", () => {
  for (const file of sessionTenantRoutes) {
    const source = read(file);
    const usesTenantHelper = /getTenantFilter|getTenantData/.test(source);
    const usesExplicitOwnerCheck = /userId\s*!==\s*session\.user\.id|userId:\s*session\.user\.id/.test(source);
    assert.equal(
      usesTenantHelper || usesExplicitOwnerCheck,
      true,
      `${file} should use tenant helper scoping or explicit owner checks`
    );
  }
});

test("public booking creation route still validates the target tenant safely", () => {
  const source = read("app/api/bookings/route.js");
  assert.doesNotMatch(source, /getSession/);
  assert.match(source, /findUnique/);
  assert.match(source, /Freelancer not found/);
  assert.match(source, /userId/);
});

test("create routes stamp tenant ownership on new records", () => {
  for (const file of createRoutes) {
    const source = read(file);
    const stampsViaTenantHelper = /getTenantData|tenantData/.test(source);
    const stampsViaDirectUserOwnership = /userId:\s*session\.user\.id/.test(source);
    assert.equal(
      stampsViaTenantHelper || stampsViaDirectUserOwnership,
      true,
      `${file} should stamp tenant ownership on create`
    );
  }
});

test("relational create routes verify ownership through a tenant-scoped parent", () => {
  for (const file of ownershipThroughRelationsCreateRoutes) {
    const source = read(file);
    assert.match(source, /getTenantFilter/);
    assert.match(source, /project\.findFirst/);
    assert.match(source, /Project not found/);
  }
});

test("id-based mutation routes guard against cross-tenant access before mutating", () => {
  const guardedRoutes = [
    "app/api/contacts/[id]/route.js",
    "app/api/tasks/[id]/route.js",
    "app/api/contracts/[id]/route.js",
    "app/api/expenses/[id]/route.js",
    "app/api/recurring-expenses/[id]/route.js",
    "app/api/proposals/[id]/route.js",
  ];

  for (const file of guardedRoutes) {
    const source = read(file);
    assert.match(source, /findFirst/, `${file} should fetch a tenant-scoped record before mutation`);
    assert.match(source, /Not found/, `${file} should return not found for foreign tenant ids`);
  }
});

test("dashboard queries stay bounded for performance", () => {
  const source = read("app/(app)/dashboard/page.jsx");
  const takeCount = (source.match(/take:\s*\d+/g) || []).length;
  assert.ok(takeCount >= 4, "dashboard should keep key queries bounded with take");
});

test("contacts page uses tenant-aware scoping", () => {
  const source = read("app/(app)/contacts/page.jsx");
  assert.match(source, /getTenantFilter/);
  assert.match(source, /where:\s*filter/);
});

test("task page keeps modal-based create flow and date filters", () => {
  const source = read("app/(app)/tasks/TasksClient.jsx");
  assert.match(source, /<Modal/);
  assert.match(source, /Today/);
  assert.match(source, /Tomorrow/);
  assert.match(source, /This Week/);
  assert.match(source, /Overdue/);
});

test("shared top-nav search supports current module search placeholders", () => {
  const source = read("components/shared/TopBar.jsx");
  for (const placeholder of [
    "Search contacts...",
    "Search projects...",
    "Search proposals...",
    "Search contracts...",
    "Search templates...",
    "Search invoices...",
    "Search expenses...",
    "Search tasks...",
    "Search services...",
  ]) {
    assert.match(source, new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
