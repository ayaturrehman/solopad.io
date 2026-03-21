import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const root = process.cwd();
const rawTestDatabaseUrl = process.env.TEST_REGRESSION_DATABASE_URL || "";
const canRunHttpSuite = /^postgres(ql)?:\/\//.test(rawTestDatabaseUrl);

let tmpDir;
let dbUrl;
let baseUrl;
let server;
let prisma;
let seed;
let appDir;

function withSchema(url, schema) {
  const parsed = new URL(url);
  parsed.searchParams.set("schema", schema);
  return parsed.toString();
}

async function runCommand(command, args, options = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "pipe", ...options });
    let output = "";

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with code ${code}\n${output}`));
    });
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(`${url}/api/auth/csrf`);
      if (res.ok) return;
    } catch {}
    await wait(500);
  }
  throw new Error(`Timed out waiting for server at ${url}`);
}

function mergeCookies(existing, setCookieHeaders) {
  const jar = new Map();

  for (const raw of existing) {
    const cookie = raw.split(";", 1)[0];
    const [name] = cookie.split("=", 1);
    jar.set(name, cookie);
  }

  for (const raw of setCookieHeaders) {
    const cookie = raw.split(";", 1)[0];
    const [name] = cookie.split("=", 1);
    jar.set(name, cookie);
  }

  return Array.from(jar.values());
}

function getSetCookies(res) {
  if (typeof res.headers.getSetCookie === "function") {
    return res.headers.getSetCookie();
  }

  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

function cookieHeader(cookies) {
  return cookies.join("; ");
}

async function jsonRequest(pathname, { method = "GET", body, cookies = [], headers = {} } = {}) {
  const res = await fetch(`${baseUrl}${pathname}`, {
    method,
    redirect: "manual",
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookies.length ? { cookie: cookieHeader(cookies) } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  return {
    status: res.status,
    headers: res.headers,
    body: text ? JSON.parse(text) : null,
  };
}

async function textRequest(pathname, { cookies = [], headers = {} } = {}) {
  const res = await fetch(`${baseUrl}${pathname}`, {
    redirect: "manual",
    headers: {
      ...(cookies.length ? { cookie: cookieHeader(cookies) } : {}),
      ...headers,
    },
  });

  return {
    status: res.status,
    headers: res.headers,
    body: await res.text(),
  };
}

async function login(email, password) {
  let cookies = [];

  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  assert.equal(csrfRes.status, 200);
  cookies = mergeCookies(cookies, getSetCookies(csrfRes));
  const { csrfToken } = await csrfRes.json();

  const form = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: `${baseUrl}/dashboard`,
    json: "true",
  });

  const callbackRes = await fetch(`${baseUrl}/api/auth/callback/credentials?json=true`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: cookieHeader(cookies),
    },
    body: form.toString(),
  });

  cookies = mergeCookies(cookies, getSetCookies(callbackRes));
  assert.ok([200, 302].includes(callbackRes.status), `Unexpected login status ${callbackRes.status}`);

  const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { cookie: cookieHeader(cookies) },
  });
  const session = await sessionRes.json();
  assert.equal(session.user.email, email);

  return cookies;
}

if (!canRunHttpSuite) {
  test.skip("multi-tenancy HTTP suite requires TEST_REGRESSION_DATABASE_URL", () => {});
} else {
before(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "portalkit-regression-"));
  appDir = path.join(tmpDir, "app-under-test");
  dbUrl = withSchema(rawTestDatabaseUrl, `regression_${Date.now()}`);
  await fs.cp(root, appDir, {
    recursive: true,
    filter(source) {
      const base = path.basename(source);
      return !["node_modules", ".git", ".next", "output"].includes(base);
    },
  });
  await fs.symlink(path.join(root, "node_modules"), path.join(appDir, "node_modules"), "dir");
  await runCommand("npx", ["prisma", "db", "push", "--skip-generate"], {
    cwd: appDir,
    env: {
      ...process.env,
      DATABASE_URL: dbUrl,
      DIRECT_URL: dbUrl,
    },
  });

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

  await prisma.paymentPlan.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.file.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.recurringExpense.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.pdfTemplate.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilityRule.deleteMany();
  await prisma.service.deleteMany();
  await prisma.project.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  const ownerPassword = await bcrypt.hash("tenant-owner-pass", 10);
  const memberPassword = await bcrypt.hash("tenant-member-pass", 10);
  const otherPassword = await bcrypt.hash("tenant-other-pass", 10);

  const ownerA = await prisma.user.create({
    data: {
      name: "Tenant A Owner",
      email: "tenant-a-owner@example.com",
      password: ownerPassword,
      plan: "pro",
      role: "owner",
    },
  });

  const businessA = await prisma.business.create({
    data: {
      name: "Tenant A Studio",
      plan: "pro",
      ownerId: ownerA.id,
      timezone: "Europe/London",
      users: {
        connect: { id: ownerA.id },
      },
    },
  });

  await prisma.user.update({
    where: { id: ownerA.id },
    data: { businessId: businessA.id, companyName: "Tenant A Studio" },
  });

  const memberA = await prisma.user.create({
    data: {
      name: "Tenant A Member",
      email: "tenant-a-member@example.com",
      password: memberPassword,
      plan: "pro",
      role: "member",
      businessId: businessA.id,
      companyName: "Tenant A Studio",
    },
  });

  const ownerB = await prisma.user.create({
    data: {
      name: "Tenant B Owner",
      email: "tenant-b-owner@example.com",
      password: otherPassword,
      plan: "pro",
      role: "owner",
    },
  });

  const businessB = await prisma.business.create({
    data: {
      name: "Tenant B Studio",
      plan: "pro",
      ownerId: ownerB.id,
      timezone: "Europe/London",
      users: {
        connect: { id: ownerB.id },
      },
    },
  });

  await prisma.user.update({
    where: { id: ownerB.id },
    data: { businessId: businessB.id, companyName: "Tenant B Studio" },
  });

  const teamMemberA = await prisma.teamMember.create({
    data: {
      businessId: businessA.id,
      userId: ownerA.id,
      name: "Assigned Collaborator",
      email: "assignee-a@example.com",
      role: "collaborator",
      permissions: "assign_tasks",
      status: "active",
    },
  });

  const contactA = await prisma.contact.create({
    data: {
      businessId: businessA.id,
      userId: ownerA.id,
      name: "Tenant A Contact",
      email: "contact-a@example.com",
      company: "A Co",
      status: "active",
    },
  });

  const contactB = await prisma.contact.create({
    data: {
      businessId: businessB.id,
      userId: ownerB.id,
      name: "Tenant B Contact",
      email: "contact-b@example.com",
      company: "B Co",
      status: "lead",
    },
  });

  const projectA = await prisma.project.create({
    data: {
      businessId: businessA.id,
      userId: ownerA.id,
      contactId: contactA.id,
      title: "Tenant A Project",
      clientName: "Tenant A Client",
      clientEmail: "client-a@example.com",
      status: "in_progress",
      stage: "kickoff",
      portalToken: "tenantAProj1",
    },
  });

  const projectB = await prisma.project.create({
    data: {
      businessId: businessB.id,
      userId: ownerB.id,
      contactId: contactB.id,
      title: "Tenant B Project",
      clientName: "Tenant B Client",
      clientEmail: "client-b@example.com",
      status: "in_progress",
      stage: "kickoff",
      portalToken: "tenantBProj1",
    },
  });

  const proposalA = await prisma.proposal.create({
    data: {
      businessId: businessA.id,
      userId: ownerA.id,
      projectId: projectA.id,
      title: "Tenant A Proposal",
      clientName: "Tenant A Client",
      clientEmail: "client-a@example.com",
      sections: JSON.stringify([{ title: "Scope" }]),
      pricing: JSON.stringify([{ label: "Base", amount: 1000 }]),
      total: 1000,
      status: "draft",
    },
  });

  const proposalB = await prisma.proposal.create({
    data: {
      businessId: businessB.id,
      userId: ownerB.id,
      projectId: projectB.id,
      title: "Tenant B Proposal",
      clientName: "Tenant B Client",
      clientEmail: "client-b@example.com",
      sections: JSON.stringify([{ title: "Scope" }]),
      pricing: JSON.stringify([{ label: "Base", amount: 800 }]),
      total: 800,
      status: "sent",
    },
  });

  const contractA = await prisma.contract.create({
    data: {
      businessId: businessA.id,
      userId: ownerA.id,
      projectId: projectA.id,
      title: "Tenant A Contract",
      clientName: "Tenant A Client",
      clientEmail: "client-a@example.com",
      clauses: JSON.stringify([{ title: "Terms" }]),
      status: "draft",
    },
  });

  const contractB = await prisma.contract.create({
    data: {
      businessId: businessB.id,
      userId: ownerB.id,
      projectId: projectB.id,
      title: "Tenant B Contract",
      clientName: "Tenant B Client",
      clientEmail: "client-b@example.com",
      clauses: JSON.stringify([{ title: "Terms" }]),
      status: "signed",
    },
  });

  const serviceA = await prisma.service.create({
    data: {
      businessId: businessA.id,
      userId: ownerA.id,
      name: "Tenant A Service",
      defaultRate: 1200,
      unit: "flat",
    },
  });

  const serviceB = await prisma.service.create({
    data: {
      businessId: businessB.id,
      userId: ownerB.id,
      name: "Tenant B Service",
      defaultRate: 700,
      unit: "flat",
    },
  });

  const taskA = await prisma.task.create({
    data: {
      businessId: businessA.id,
      userId: ownerA.id,
      projectId: projectA.id,
      assigneeMemberId: teamMemberA.id,
      title: "Tenant A Task",
      description: "Tenant A note",
      status: "todo",
      priority: "medium",
    },
  });

  const taskB = await prisma.task.create({
    data: {
      businessId: businessB.id,
      userId: ownerB.id,
      projectId: projectB.id,
      title: "Tenant B Task",
      description: "Tenant B note",
      status: "done",
      priority: "low",
    },
  });

  const expenseA = await prisma.expense.create({
    data: {
      businessId: businessA.id,
      userId: ownerA.id,
      projectId: projectA.id,
      description: "Tenant A Expense",
      amount: 320,
      category: "software",
    },
  });

  const expenseB = await prisma.expense.create({
    data: {
      businessId: businessB.id,
      userId: ownerB.id,
      projectId: projectB.id,
      description: "Tenant B Expense",
      amount: 180,
      category: "marketing",
    },
  });

  const templateA = await prisma.pdfTemplate.create({
    data: {
      userId: ownerA.id,
      type: "proposal",
      name: "Tenant A Template",
    },
  });

  const templateB = await prisma.pdfTemplate.create({
    data: {
      userId: ownerB.id,
      type: "contract",
      name: "Tenant B Template",
    },
  });

  seed = {
    ownerA,
    memberA,
    ownerB,
    businessA,
    businessB,
    contactA,
    contactB,
    projectA,
    projectB,
    proposalA,
    proposalB,
    contractA,
    contractB,
    serviceA,
    serviceB,
    taskA,
    taskB,
    expenseA,
    expenseB,
    templateA,
    templateB,
  };

  const port = 3400 + Math.floor(Math.random() * 200);
  baseUrl = `http://127.0.0.1:${port}`;

  server = spawn("npx", ["next", "dev", "--webpack", "--port", String(port)], {
    cwd: appDir,
    env: {
      ...process.env,
      DATABASE_URL: dbUrl,
      NEXTAUTH_URL: baseUrl,
      NEXT_PUBLIC_APP_URL: baseUrl,
      NEXTAUTH_SECRET: "portalkit-regression-secret",
      NODE_ENV: "development",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let serverOutput = "";
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await waitForServer(baseUrl);
  } catch (error) {
    server.kill("SIGTERM");
    throw new Error(`${error.message}\n\nServer output:\n${serverOutput}`);
  }
});

after(async () => {
  if (server && !server.killed) {
    server.kill("SIGTERM");
  }
  if (prisma) {
    await prisma.$disconnect();
  }
  if (tmpDir) {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});

test("unauthenticated protected routes are rejected", async () => {
  const res = await jsonRequest("/api/contacts");
  assert.equal(res.status, 401);
  assert.equal(res.body.error, "Unauthorized");
});

test("business members share tenant data and other tenants are isolated", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");
  const memberCookies = await login(seed.memberA.email, "tenant-member-pass");
  const otherCookies = await login(seed.ownerB.email, "tenant-other-pass");

  const [ownerContacts, memberContacts, otherContacts] = await Promise.all([
    jsonRequest("/api/contacts", { cookies: ownerCookies }),
    jsonRequest("/api/contacts", { cookies: memberCookies }),
    jsonRequest("/api/contacts", { cookies: otherCookies }),
  ]);

  assert.equal(ownerContacts.status, 200);
  assert.equal(memberContacts.status, 200);
  assert.equal(otherContacts.status, 200);

  assert.deepEqual(ownerContacts.body.map((item) => item.name), ["Tenant A Contact"]);
  assert.deepEqual(memberContacts.body.map((item) => item.name), ["Tenant A Contact"]);
  assert.deepEqual(otherContacts.body.map((item) => item.name), ["Tenant B Contact"]);
});

test("foreign tenant records cannot be read or patched by id", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");
  const otherCookies = await login(seed.ownerB.email, "tenant-other-pass");

  const foreignRead = await jsonRequest(`/api/contacts/${seed.contactB.id}`, {
    cookies: ownerCookies,
  });
  assert.equal(foreignRead.status, 404);

  const foreignPatch = await jsonRequest(`/api/proposals/${seed.proposalA.id}`, {
    method: "PATCH",
    cookies: otherCookies,
    body: { title: "Should not update" },
  });
  assert.equal(foreignPatch.status, 404);

  const foreignContractRead = await jsonRequest(`/api/contracts/${seed.contractA.id}`, {
    cookies: otherCookies,
  });
  assert.equal(foreignContractRead.status, 404);
});

test("new records are stamped to the current tenant", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");

  const createProject = await jsonRequest("/api/projects", {
    method: "POST",
    cookies: ownerCookies,
    body: {
      title: "Tenant A Fresh Project",
      clientName: "Fresh Client",
      clientEmail: "fresh@example.com",
      description: "Created inside test",
      status: "in_progress",
    },
  });

  assert.equal(createProject.status, 200);

  const persisted = await prisma.project.findUnique({
    where: { id: createProject.body.id },
    select: { userId: true, businessId: true, title: true },
  });

  assert.equal(persisted.title, "Tenant A Fresh Project");
  assert.equal(persisted.userId, seed.ownerA.id);
  assert.equal(persisted.businessId, seed.businessA.id);
});

test("relational create routes reject foreign parent ids", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");

  const createInvoice = await jsonRequest("/api/invoices", {
    method: "POST",
    cookies: ownerCookies,
    body: {
      projectId: seed.projectB.id,
      currency: "USD",
      lineItems: [{ amount: 100 }],
      status: "draft",
    },
  });

  assert.equal(createInvoice.status, 404);
  assert.equal(createInvoice.body.error, "Project not found");
});

test("list routes stay tenant-scoped across critical modules", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");
  const otherCookies = await login(seed.ownerB.email, "tenant-other-pass");

  const [ownerProposals, ownerContracts, ownerServices, ownerTasks, ownerExpenses, ownerTemplates] = await Promise.all([
    jsonRequest("/api/proposals", { cookies: ownerCookies }),
    jsonRequest("/api/contracts", { cookies: ownerCookies }),
    jsonRequest("/api/services", { cookies: ownerCookies }),
    jsonRequest("/api/tasks", { cookies: ownerCookies }),
    jsonRequest("/api/expenses", { cookies: ownerCookies }),
    jsonRequest("/api/pdf-templates", { cookies: ownerCookies }),
  ]);

  assert.equal(ownerProposals.status, 200);
  assert.equal(ownerContracts.status, 200);
  assert.equal(ownerServices.status, 200);
  assert.equal(ownerTasks.status, 200);
  assert.equal(ownerExpenses.status, 200);
  assert.equal(ownerTemplates.status, 200);

  assert.deepEqual(ownerProposals.body.proposals.map((item) => item.title), ["Tenant A Proposal"]);
  assert.deepEqual(ownerContracts.body.contracts.map((item) => item.title), ["Tenant A Contract"]);
  assert.deepEqual(ownerServices.body.map((item) => item.name), ["Tenant A Service"]);
  assert.deepEqual(ownerTasks.body.tasks.map((item) => item.title), ["Tenant A Task"]);
  assert.deepEqual(ownerExpenses.body.map((item) => item.description), ["Tenant A Expense"]);
  assert.deepEqual(ownerTemplates.body.templates.map((item) => item.name), ["Tenant A Template"]);

  const otherServices = await jsonRequest("/api/services", { cookies: otherCookies });
  assert.equal(otherServices.status, 200);
  assert.ok(otherServices.body.every((item) => item.name !== "Tenant A Service"));
});

test("authenticated app routes render successfully for the active tenant", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");

  const routeChecks = [
    ["/dashboard", "Good"],
    ["/contacts", "Contacts"],
    ["/projects", "Projects"],
    ["/proposals", "Proposals"],
    ["/contracts", "Contracts"],
    ["/finance?tab=invoices", "Invoices"],
    ["/tasks", "Tasks"],
    ["/services", "Services"],
    ["/settings", "Settings"],
    ["/settings/pdf-templates", "PDF Templates"],
  ];

  for (const [pathname, marker] of routeChecks) {
    const page = await textRequest(pathname, { cookies: ownerCookies });
    assert.equal(page.status, 200, `${pathname} should render`);
    assert.match(page.body, new RegExp(marker, "i"), `${pathname} should include ${marker}`);
  }
});

test("tasks CRUD and isolation — Tenant A creates a task, Tenant B can't see it", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");
  const otherCookies = await login(seed.ownerB.email, "tenant-other-pass");

  const createTask = await jsonRequest("/api/tasks", {
    method: "POST",
    cookies: ownerCookies,
    body: {
      projectId: seed.projectA.id,
      title: "Tenant A Fresh Task",
      status: "todo",
      priority: "high",
    },
  });

  assert.equal(createTask.status, 200);
  const freshTaskId = createTask.body.id;

  const ownerTasks = await jsonRequest("/api/tasks", { cookies: ownerCookies });
  assert.ok(ownerTasks.body.tasks.some((t) => t.id === freshTaskId));

  const otherTasks = await jsonRequest("/api/tasks", { cookies: otherCookies });
  assert.ok(!otherTasks.body.tasks.some((t) => t.id === freshTaskId));
});

test("services CRUD and isolation — Create service as A, verify B can't see it", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");
  const otherCookies = await login(seed.ownerB.email, "tenant-other-pass");

  const createService = await jsonRequest("/api/services", {
    method: "POST",
    cookies: ownerCookies,
    body: {
      name: "Tenant A Fresh Service",
      defaultRate: 1500,
      unit: "hourly",
    },
  });

  assert.equal(createService.status, 200);
  const freshServiceId = createService.body.id;

  const ownerServices = await jsonRequest("/api/services", { cookies: ownerCookies });
  assert.ok(ownerServices.body.some((s) => s.id === freshServiceId));

  const otherServices = await jsonRequest("/api/services", { cookies: otherCookies });
  assert.ok(!otherServices.body.some((s) => s.id === freshServiceId));
});

test("notifications isolation — Each tenant only sees their own notifications", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");
  const otherCookies = await login(seed.ownerB.email, "tenant-other-pass");

  const ownerNotifications = await jsonRequest("/api/notifications", { cookies: ownerCookies });
  const otherNotifications = await jsonRequest("/api/notifications", { cookies: otherCookies });

  assert.equal(ownerNotifications.status, 200);
  assert.equal(otherNotifications.status, 200);

  // Both should have notifications, but none should be shared across tenants
  if (ownerNotifications.body.length > 0) {
    const ownerIds = ownerNotifications.body.map((n) => n.id);
    const otherIds = otherNotifications.body.map((n) => n.id);
    const shared = ownerIds.filter((id) => otherIds.includes(id));
    assert.equal(shared.length, 0);
  }
});

test("time entries CRUD and isolation — Tenant A creates time entry, B can't see it", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");
  const otherCookies = await login(seed.ownerB.email, "tenant-other-pass");

  const createTimeEntry = await jsonRequest("/api/time-entries", {
    method: "POST",
    cookies: ownerCookies,
    body: {
      projectId: seed.projectA.id,
      duration: 60,
      description: "Tenant A Fresh Time Entry",
      date: new Date().toISOString().split("T")[0],
    },
  });

  assert.equal(createTimeEntry.status, 200);
  const freshTimeEntryId = createTimeEntry.body.id;

  const ownerTimeEntries = await jsonRequest("/api/time-entries", { cookies: ownerCookies });
  assert.ok(ownerTimeEntries.body.some((t) => t.id === freshTimeEntryId));

  const otherTimeEntries = await jsonRequest("/api/time-entries", { cookies: otherCookies });
  assert.ok(!otherTimeEntries.body.some((t) => t.id === freshTimeEntryId));
});

test("expenses CRUD and isolation — Create expense as A, verify B can't see it", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");
  const otherCookies = await login(seed.ownerB.email, "tenant-other-pass");

  const createExpense = await jsonRequest("/api/expenses", {
    method: "POST",
    cookies: ownerCookies,
    body: {
      projectId: seed.projectA.id,
      description: "Tenant A Fresh Expense",
      amount: 450,
      category: "travel",
    },
  });

  assert.equal(createExpense.status, 200);
  const freshExpenseId = createExpense.body.id;

  const ownerExpenses = await jsonRequest("/api/expenses", { cookies: ownerCookies });
  assert.ok(ownerExpenses.body.some((e) => e.id === freshExpenseId));

  const otherExpenses = await jsonRequest("/api/expenses", { cookies: otherCookies });
  assert.ok(!otherExpenses.body.some((e) => e.id === freshExpenseId));
});

test("contact detail isolation — Tenant A can't GET Tenant B's contact by ID", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");

  const foreignRead = await jsonRequest(`/api/contacts/${seed.contactB.id}`, {
    cookies: ownerCookies,
  });

  assert.equal(foreignRead.status, 404);
});

test("project CRUD — Create and update project, verify tenant stamping", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");

  const createProject = await jsonRequest("/api/projects", {
    method: "POST",
    cookies: ownerCookies,
    body: {
      title: "Tenant A Stamped Project",
      clientName: "Stamped Client",
      clientEmail: "stamped@example.com",
      description: "Verify tenant ownership",
      status: "active",
    },
  });

  assert.equal(createProject.status, 200);
  const projectId = createProject.body.id;

  const updateProject = await jsonRequest(`/api/projects/${projectId}`, {
    method: "PATCH",
    cookies: ownerCookies,
    body: { title: "Tenant A Updated Project" },
  });

  assert.equal(updateProject.status, 200);
  assert.equal(updateProject.body.title, "Tenant A Updated Project");
  assert.equal(updateProject.body.businessId, seed.businessA.id);
});

test("cross-tenant task mutation blocked — Tenant B can't PATCH Tenant A's task", async () => {
  const ownerCookies = await login(seed.ownerA.email, "tenant-owner-pass");
  const otherCookies = await login(seed.ownerB.email, "tenant-other-pass");

  const patchForeignTask = await jsonRequest(`/api/tasks/${seed.taskA.id}`, {
    method: "PATCH",
    cookies: otherCookies,
    body: { title: "Malicious update" },
  });

  assert.equal(patchForeignTask.status, 404);
});

test("cross-tenant service mutation blocked — Tenant B can't DELETE Tenant A's service", async () => {
  const otherCookies = await login(seed.ownerB.email, "tenant-other-pass");

  const deleteForeignService = await jsonRequest(`/api/services/${seed.serviceA.id}`, {
    method: "DELETE",
    cookies: otherCookies,
  });

  assert.equal(deleteForeignService.status, 404);
});
}
