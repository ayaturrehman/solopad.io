import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

// === A. PERFORMANCE OPTIMIZATIONS ===

test("settings profile page is a server component that fetches data server-side", () => {
  const source = read("app/(app)/settings/profile/page.jsx");
  assert.match(source, /async function ProfilePage/);
  assert.match(source, /const session = await getSession\(\)/);
  assert.match(source, /await db\.user\.findUnique/);
  assert.match(source, /await db\.business\.findUnique/);
  assert.match(source, /select:\s*\{/);
});

test("dashboard uses select in all queries (not raw include)", () => {
  const source = read("app/(app)/dashboard/page.jsx");
  assert.match(source, /select:\s*\{/g);
  assert.doesNotMatch(source, /include:\s*\{/);
});

test("dashboard queries are bounded with take", () => {
  const source = read("app/(app)/dashboard/page.jsx");
  const takeMatches = source.match(/take:\s*\d+/g) || [];
  assert.ok(takeMatches.length >= 4, "dashboard should have at least 4 bounded queries with take");
});

test("dashboard page has revalidate set", () => {
  const source = read("app/(app)/dashboard/page.jsx");
  assert.match(source, /export const revalidate = \d+/);
});

test("dashboard uses Promise.all for parallel queries", () => {
  const source = read("app/(app)/dashboard/page.jsx");
  assert.match(source, /Promise\.all\(/);
});

test("contacts page uses Promise.all for parallel queries", () => {
  const source = read("app/(app)/contacts/page.jsx");
  assert.match(source, /Promise\.all\(/);
});

test("finance page has tab-aware data fetching", () => {
  const source = read("app/(app)/finance/page.jsx");
  assert.match(source, /searchParams/);
  assert.match(source, /tab/);
});

test("notifications API supports countOnly mode", () => {
  const source = read("app/api/notifications/route.js");
  assert.match(source, /countOnly/);
});

// === B. ERROR HANDLING ===

test("all 13 error.jsx files exist", () => {
  const errorFiles = [
    "app/(app)/error.jsx",
    "app/(app)/dashboard/error.jsx",
    "app/(app)/projects/error.jsx",
    "app/(app)/invoices/error.jsx",
    "app/(app)/proposals/error.jsx",
    "app/(app)/contracts/error.jsx",
    "app/(app)/tasks/error.jsx",
    "app/(app)/finance/error.jsx",
    "app/(app)/settings/error.jsx",
    "app/(app)/calendar/error.jsx",
    "app/(app)/services/error.jsx",
    "app/(app)/scheduler/error.jsx",
    "app/(app)/contacts/error.jsx",
  ];

  for (const file of errorFiles) {
    assert.equal(exists(file), true, `Missing error file: ${file}`);
  }
});

test("error files have retry functionality", () => {
  const errorFiles = [
    "app/(app)/error.jsx",
    "app/(app)/dashboard/error.jsx",
    "app/(app)/contacts/error.jsx",
  ];

  for (const file of errorFiles) {
    const source = read(file);
    assert.match(source, /reset\(\)/);
    assert.match(source, /Try again/i);
  }
});

// === C. LOADING STATES ===

test("all 13 loading.jsx files exist", () => {
  const loadingFiles = [
    "app/(app)/loading.jsx",
    "app/(app)/dashboard/loading.jsx",
    "app/(app)/projects/loading.jsx",
    "app/(app)/invoices/loading.jsx",
    "app/(app)/proposals/loading.jsx",
    "app/(app)/contracts/loading.jsx",
    "app/(app)/tasks/loading.jsx",
    "app/(app)/finance/loading.jsx",
    "app/(app)/settings/loading.jsx",
    "app/(app)/calendar/loading.jsx",
    "app/(app)/services/loading.jsx",
    "app/(app)/scheduler/loading.jsx",
    "app/(app)/contacts/loading.jsx",
  ];

  for (const file of loadingFiles) {
    assert.equal(exists(file), true, `Missing loading file: ${file}`);
  }
});

test("loading files use blue dot spinner, not skeleton loaders", () => {
  const source = read("app/(app)/dashboard/loading.jsx");
  assert.match(source, /animate-\[loading-bounce/);
  assert.doesNotMatch(source, /skeleton/i);
});

// === D. TOAST SYSTEM ===

test("Toast.jsx exists with ToastProvider, useToast, role=alert, aria-live", () => {
  const source = read("components/ui/Toast.jsx");
  assert.match(source, /export function ToastProvider/);
  assert.match(source, /export function useToast/);
  assert.match(source, /role="alert"/);
  assert.match(source, /aria-live="assertive"/);
});

test("AppShell wraps with ToastProvider", () => {
  const source = read("components/shared/AppShell.jsx");
  assert.match(source, /ToastProvider/);
});

// === E. ACCESSIBILITY ===

test("Modal.jsx has proper accessibility attributes", () => {
  const source = read("components/shared/Modal.jsx");
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby/);
});

test("Modal.jsx has Tab key focus trapping", () => {
  const source = read("components/shared/Modal.jsx");
  assert.match(source, /if \(e\.key === "Tab"/);
  assert.match(source, /querySelectorAll/);
  assert.match(source, /focus\(\)/);
});

test("Modal.jsx handles Escape key", () => {
  const source = read("components/shared/Modal.jsx");
  assert.match(source, /e\.key === "Escape"/);
  assert.match(source, /onClose\(\)/);
});

test("Navbar has navigation role and aria-label", () => {
  const source = read("components/shared/Navbar.jsx");
  assert.match(source, /role="navigation"/);
  assert.match(source, /aria-label/);
});

test("Navbar shows aria-current=page for active links", () => {
  const source = read("components/shared/Navbar.jsx");
  assert.match(source, /aria-current/);
  assert.match(source, /page/);
});

test("AppShell has skip-to-content link and main content id", () => {
  const source = read("components/shared/AppShell.jsx");
  assert.match(source, /skip.*content/i);
  assert.match(source, /id="main-content"/);
});

test("TopBar has aria-expanded on dropdowns and Escape handler", () => {
  const source = read("components/shared/TopBar.jsx");
  assert.match(source, /aria-expanded/);
  assert.match(source, /e\.key === "Escape"/);
});

test("Button has aria-busy when loading", () => {
  const source = read("components/ui/Button.jsx");
  assert.match(source, /aria-busy/);
});

test("Input has aria-invalid and aria-describedby for errors", () => {
  const inputSource = read("components/ui/Input.jsx");
  assert.match(inputSource, /aria-invalid/);
  assert.match(inputSource, /aria-describedby/);
});

// === F. NEW FEATURES ===

test("TaskKanbanBoard component exists", () => {
  assert.equal(exists("app/(app)/tasks/TaskKanbanBoard.jsx"), true);
});

test("TasksClient has view toggle stored in localStorage", () => {
  const source = read("app/(app)/tasks/TasksClient.jsx");
  assert.match(source, /\[view/);
  assert.match(source, /localStorage\.getItem/);
});

test("Calendar has month/week/day views", () => {
  const source = read("app/(app)/calendar/CalendarView.jsx");
  assert.match(source, /MonthView/);
  assert.match(source, /WeekView/);
  assert.match(source, /DayView/);
});

test("TimeReports component exists", () => {
  assert.equal(exists("app/(app)/time-tracker/TimeReports.jsx"), true);
});

test("TimeTrackerClient has timer/reports tabs", () => {
  const source = read("app/(app)/time-tracker/TimeTrackerClient.jsx");
  assert.match(source, /tab/i);
  assert.match(source, /Timer|timer/);
  assert.match(source, /Reports|reports/);
});

test("Time reports API route exists", () => {
  assert.equal(exists("app/api/time-entries/reports/route.js"), true);
});

// === G. AUTH & JWT ===

test("auth.js includes businessId in JWT token and session", () => {
  const source = read("lib/auth.js");
  assert.match(source, /businessId/);
  assert.match(source, /token\.businessId/);
  assert.match(source, /session\.user\.businessId/);
});

test("session callbacks properly pass businessId", () => {
  const source = read("lib/auth.js");
  assert.match(source, /callbacks:\s*\{/);
  assert.match(source, /jwt\(/);
  assert.match(source, /session\(/);
});

// === H. TENANT FAST PATH ===

test("tenant.js has fast path using session.user.businessId", () => {
  const source = read("lib/tenant.js");
  assert.match(source, /session\.user\.businessId/);
  assert.match(source, /return \{ businessId: session\.user\.businessId \}/);
});

test("tenant.js has legacy fallback for old sessions", () => {
  const source = read("lib/tenant.js");
  assert.match(source, /Legacy fallback/);
  assert.match(source, /resolveTenantUser/);
});

// === I. RECURRING INVOICES ===

test("recurring invoices API routes exist", () => {
  assert.equal(exists("app/api/invoices/recurring/route.js"), true);
  assert.equal(exists("app/api/invoices/recurring/[id]/route.js"), true);
});

test("recurring invoices routes are session-authenticated", () => {
  const createRoute = read("app/api/invoices/recurring/route.js");
  const usesSession = /getSession|requirePermission|session\.user/.test(createRoute);
  assert.equal(usesSession, true, "recurring invoices routes should be authenticated");

  const detailRoute = read("app/api/invoices/recurring/[id]/route.js");
  const usesDetailSession = /getSession|requirePermission|session\.user/.test(detailRoute);
  assert.equal(usesDetailSession, true, "recurring invoices detail route should be authenticated");
});

test("cron routes for invoice generation and reminders exist", () => {
  assert.equal(exists("app/api/cron/generate-invoices/route.js"), true);
  assert.equal(exists("app/api/cron/invoice-reminders/route.js"), true);
});

// === J. FORM VALIDATION ===

test("ProjectFormModal has onBlur validation with touched state", () => {
  const source = read("app/(app)/projects/ProjectFormModal.jsx");
  assert.match(source, /onBlur/);
  assert.match(source, /touched/);
});

test("ContactFormModal has onBlur validation with touched state", () => {
  const source = read("app/(app)/contacts/ContactFormModal.jsx");
  assert.match(source, /onBlur/);
  assert.match(source, /touched/);
});

// === K. BUTTON CONSISTENCY ===

test("InvoicesClient uses Button component (not raw button)", () => {
  const source = read("app/(app)/invoices/InvoicesClient.jsx");
  assert.match(source, /import.*Button/);
  assert.match(source, /<Button/);
});

test("ProjectsClient uses Button component", () => {
  const source = read("app/(app)/projects/ProjectsClient.jsx");
  assert.match(source, /import.*Button/);
  assert.match(source, /<Button/);
});

test("TasksClient uses Button component", () => {
  const source = read("app/(app)/tasks/TasksClient.jsx");
  assert.match(source, /import.*Button/);
  assert.match(source, /<Button/);
});
