# Solopad

**The all-in-one workspace for solo freelancers.**

Manage clients, projects, proposals, contracts, invoices, tasks, and time tracking — all in one place. Share a client portal with a single link.

🌐 [solopad.io](https://solopad.io)

---

## Table of Contents

1. [Features Overview](#features-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Authentication & Authorisation](#authentication--authorisation)
5. [Multi-Tenancy & Data Isolation](#multi-tenancy--data-isolation)
6. [Module Reference](#module-reference)
   - [Contacts](#contacts)
   - [Projects](#projects)
   - [Proposals](#proposals)
   - [Contracts](#contracts)
   - [Invoices & Payments](#invoices--payments)
   - [Finance & Expenses](#finance--expenses)
   - [Tasks](#tasks)
   - [Time Tracker](#time-tracker)
   - [Scheduler & Bookings](#scheduler--bookings)
   - [Services](#services)
   - [Team](#team)
   - [Client Portal](#client-portal)
   - [Notifications](#notifications)
   - [PDF Templates](#pdf-templates)
7. [Stripe Integration](#stripe-integration)
8. [Email (Resend)](#email-resend)
9. [AI Features](#ai-features)
10. [Database Schema](#database-schema)
11. [API Reference](#api-reference)
12. [Security & Safety Checks](#security--safety-checks)
13. [Getting Started](#getting-started)
14. [Environment Variables](#environment-variables)
15. [Deployment](#deployment)

---

## Features Overview

| Module | What it does |
|---|---|
| **Contacts** | CRM — manage leads, active clients, archived contacts; CSV import/export; bulk actions |
| **Projects** | Track projects with status, stages, file uploads, notes, and comments |
| **Proposals** | Rich-text proposal builder; send via email; track accepted/declined status |
| **Contracts** | Clause-based contract builder; send for e-signature |
| **Invoices** | Line-item invoice builder; Stripe payment link; PDF export |
| **Finance** | Revenue, expenses, profit overview; recurring expenses; expense categories |
| **Tasks** | Task management with subtasks, priority, assignees, AI generation |
| **Time Tracker** | Log billable/non-billable time per project |
| **Scheduler** | Public booking page; availability rules; calendar view |
| **Services** | Reusable service library with pricing |
| **Team** | Invite team members; role-based permissions |
| **Client Portal** | One-link portal for clients to view files, pay invoices, leave comments |
| **PDF Templates** | Customisable PDF templates for invoices, proposals, and contracts |
| **Notifications** | In-app notification bell for portal views, invoice payments, and more |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v4 — JWT strategy, credentials provider |
| Payments | Stripe Checkout + Stripe Connect |
| Email | Resend |
| Rich Text | TipTap (ProseMirror) |
| PDF Generation | @react-pdf/renderer |
| AI | Vercel AI SDK + OpenAI |
| Icons | Lucide React |
| Validation | Zod |
| File Storage | Local filesystem `/uploads/` (dev); swap to S3/R2 for production |

---

## Architecture

```
app/
  page.jsx                    Landing / marketing page
  layout.js                   Root layout — wraps app in SessionProvider
  (app)/                      Authenticated app shell
    layout.jsx                Sidebar (Navbar) + TopBar + page slot
    dashboard/                KPI overview + recent activity
    contacts/                 CRM module
    projects/                 Project management
    proposals/                Proposal builder
    contracts/                Contract builder
    invoices/                 Invoice management (also accessible via /finance)
    finance/                  Tabbed: Overview · Invoices · Payments · Expenses
    tasks/                    Task management
    time-tracker/             Time entries
    scheduler/                Availability + calendar
    services/                 Service library
    settings/                 Profile · Business · Team · Stripe · Plan · PDF Templates
  p/[token]/                  Public client portal (no auth)
  book/[userId]/              Public booking page (no auth)
  login/                      Login page
  signup/                     Signup page
  join/                       Team invite acceptance page
  api/                        All API routes (see API Reference)

components/
  shared/                     Layout-level components (Navbar, TopBar, Modal, etc.)
  ui/                         Primitive UI components (Button, Input, Select, Card)

lib/
  db.js                       Prisma client singleton
  auth.js                     NextAuth authOptions
  session.js                  getSession() — server-side session helper
  utils.js                    cn(), formatCurrency(), formatDate(), STATUS_* constants
  pdf-templates/              PDF rendering logic
  services.js                 Shared service helpers

prisma/
  schema.prisma               Full database schema
  migrations/                 Migration history
```

**Request lifecycle (authenticated page):**

1. Browser requests `/projects`
2. `proxy.js` (middleware) checks for valid NextAuth JWT cookie → redirects to `/login` if absent
3. Next.js renders the server component — calls `getServerSession(authOptions)` to get user context
4. Server component fetches data from the database scoped by `businessId` (tenant isolation)
5. React renders the page; client components hydrate and handle interactivity

---

## Authentication & Authorisation

### Strategy

- **Provider**: Credentials (email + bcrypt password)
- **Session**: JWT stored in a signed HTTP-only cookie (`next-auth.session-token`)
- **Password hashing**: bcryptjs with 10 rounds

### Sign-up flow

```
POST /api/auth/register
  → validate email/name/password (Zod)
  → hash password with bcrypt
  → create User + Business records in a DB transaction
  → return success → client calls signIn("credentials")
```

### Sign-in flow

```
NextAuth credentials provider
  → look up user by email
  → bcrypt.compare(password, user.password)
  → if valid: return user object
  → jwt() callback: embed id, email, name, plan, role, businessId in JWT
  → session() callback: re-fetch fresh user data from DB on each request
```

### JWT token payload

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "Jane Smith",
  "plan": "solo",
  "role": "owner",
  "businessId": "biz_id",
  "companyName": "Jane's Studio",
  "timezone": "Europe/London"
}
```

### Route protection

`proxy.js` (Next.js middleware) protects all `/dashboard`, `/projects`, `/settings`, `/contacts`, `/invoices`, `/finance`, `/tasks`, `/contracts`, `/proposals`, `/services`, `/time-tracker`, `/scheduler`, `/calendar` routes. Unauthenticated requests are redirected to `/login`.

Public routes (no auth required): `/`, `/login`, `/signup`, `/join`, `/p/[token]`, `/book/[userId]`, `/payment/*`

### Authorisation in API routes

Every protected API route follows this pattern:

```js
const session = await getSession(req);
if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

const filter = getTenantFilter(session); // { businessId } or { userId }
const data = await db.model.findMany({ where: { ...filter } });
```

This ensures users can only read and write their own tenant's data.

### Role-based access

| Role | Description |
|---|---|
| `owner` | Full access; created automatically on signup |
| `member` | Invited team member; access gated by `permissions` JSON array |

Team member permissions are checked in the relevant API routes before allowing create/edit/delete operations.

---

## Multi-Tenancy & Data Isolation

Every data model has either a `userId` or `businessId` (or both) foreign key. The `getTenantFilter()` helper returns the appropriate scope based on the session:

- If the user belongs to a business → filter by `businessId`
- Otherwise → filter by `userId`

This means a user can never read, update, or delete another tenant's records — every database query is automatically scoped.

---

## Module Reference

### Contacts

**Purpose**: CRM for managing leads and clients.

**Frontend**: `app/(app)/contacts/`
- `page.jsx` — Server component; fetches contacts with search/filter/pagination; renders `ContactsClient`
- `ContactsClient.jsx` — Client; table view; filter by status (lead/active/archived); search by name/email/company
- `ContactFormModal.jsx` — Create/edit contact modal
- `ContactsImportModal.jsx` — CSV bulk import with field mapping
- `ContactsExportModal.jsx` — Export contacts as CSV

**Backend**: `app/api/contacts/`
- `GET /api/contacts` — Returns paginated contacts; supports `q`, `status`, `page` query params
- `POST /api/contacts` — Creates contact; validates required fields; normalises phone/email
- `GET /api/contacts/[id]` — Fetch single contact with linked projects
- `PATCH /api/contacts/[id]` — Update contact fields
- `DELETE /api/contacts/[id]` — Delete contact
- `POST /api/contacts/bulk` — Bulk status update or bulk delete
- `POST /api/contacts/import` — Parse CSV; validate rows; insert in batch
- `POST /api/contacts/export` — Stream CSV response with all contact data

**Data collected**: name, email, phone, company, company address, entity type (individual/company), status, estimated value, notes, tags.

---

### Projects

**Purpose**: Track work for clients from start to finish.

**Frontend**: `app/(app)/projects/`
- `page.jsx` — Project list with search, filter by status, archive toggle
- `[id]/page.jsx` — Project detail: header, files, notes, comments, tasks, invoices, time entries
- `ProjectHeader.jsx` — Status/stage controls; portal link; archive/delete
- `ProjectTasksSection.jsx` — Embedded tasks list with same UI as the Tasks module
- `new/page.jsx` — Create project form (title, contact, description, deadline)

**Backend**: `app/api/projects/`
- `GET /api/projects` — Filtered, paginated list
- `POST /api/projects` — Create project; generates unique `portalToken` via nanoid
- `PATCH /api/projects/[id]` — Update status, stage, title, deadline, archived flag
- `DELETE /api/projects/[id]` — Cascade deletes files, comments, invoices, tasks

**Data flow**: Project creation generates a `portalToken` used to build the client portal URL (`/p/[token]`). Files are stored at `/uploads/[projectId]/[filename]` on the server.

---

### Proposals

**Purpose**: Create and send professional proposals to clients.

**Frontend**: `app/(app)/proposals/`
- `ProposalsClient.jsx` — List; filter by status (draft/sent/accepted/declined)
- `new/ProposalBuilderClient.jsx` — Multi-section rich-text builder; pricing table; validity date
- `[id]/page.jsx` — Proposal detail view with status controls
- `[id]/edit/` — Edit existing proposal
- `ProposalRichTextEditor.jsx` — TipTap editor (headings, bold, lists, tables, links, images)
- `[id]/ProposalActions.jsx` — Send, download PDF, mark accepted/declined
- `[id]/DownloadPdfButton.jsx` — Triggers `GET /api/pdf/proposal/[id]`

**Backend**:
- `GET/POST /api/proposals` — List/create
- `PATCH/DELETE /api/proposals/[id]` — Update/delete
- `POST /api/proposals/draft` — AI-assisted draft generation
- `POST /api/proposals/[id]/send` — Send proposal email via Resend; sets `sentAt` and `status: "sent"`
- `GET /api/pdf/proposal/[id]` — Render @react-pdf/renderer PDF response

**Data collected**: title, client name/email, intro text, rich-text sections (JSON array), pricing line items (JSON array), total, currency, valid-until date.

---

### Contracts

**Purpose**: Create binding contracts and collect e-signatures.

**Frontend**: `app/(app)/contracts/`
- `ContractsClient.jsx` — List; filter by status
- `new/ContractBuilderClient.jsx` — Clause-based editor; each clause has a title and rich-text body
- `[id]/page.jsx` — Contract detail; signature collection UI
- `[id]/DownloadPdfButton.jsx` — PDF download

**Backend**:
- `GET/POST /api/contracts` — List/create
- `PATCH/DELETE /api/contracts/[id]` — Update/delete; includes signature name + `signedAt`
- `POST /api/contracts/draft` — AI-assisted clause generation
- `POST /api/contracts/[id]/send` — Email contract; sets `status: "sent"`
- `GET /api/pdf/contract/[id]` — PDF render

**Data collected**: title, client name/email, clauses array (JSON), status, signature name, signed timestamp.

---

### Invoices & Payments

**Purpose**: Create line-item invoices and collect payment via Stripe.

**Frontend**: `app/(app)/invoices/` and `app/(app)/finance/?tab=invoices`
- `InvoicesClient.jsx` — List; filter by status (draft/sent/paid/overdue/cancelled); search
- `new/InvoiceBuilderClient.jsx` — Line item builder; tax rate; discount (flat/percent); currency; due date; payment plan option
- `[id]/page.jsx` — Invoice detail view
- `[id]/InvoiceActions.jsx` — Send, mark paid manually, download PDF, copy payment link
- `[id]/edit/` — Edit invoice

**Backend**:
- `GET/POST /api/invoices` — List/create; `lineItems` stored as JSON string
- `PATCH/DELETE /api/invoices/[id]` — Update/delete
- `POST /api/invoices/bulk-send` — Send multiple invoice emails at once
- `POST /api/invoices/checkout` — Create Stripe Checkout session (see [Stripe Integration](#stripe-integration))
- `GET /api/pdf/invoice/[id]` — PDF render
- `POST /api/webhooks/stripe` — Mark invoice paid; create notification; send payment confirmation email

**Invoice status lifecycle**:

```
draft → sent → paid
             → overdue (if past due date)
             → cancelled
```

**Data collected**: invoice number, project, line items (description, quantity, unit price), subtotal, tax rate, discount type/value, total, currency, due date, notes, payment plan instalments.

---

### Finance & Expenses

**Purpose**: Financial overview — revenue, expenses, profit. Track individual expenses and recurring costs.

**Frontend**: `app/(app)/finance/`
- `page.jsx` — Tabbed layout: Overview · Invoices · Payments · Expenses
- `ExpensesClient.jsx` — Expense list; filter by category/date; link to project
- `AddExpenseForm.jsx` — Create/edit expense
- `ExpenseCategoriesManager.jsx` — Custom expense category management

**Backend**:
- `GET /api/finance` — Aggregated revenue/expenses/profit with time period filter
- `GET/POST /api/expenses` — List/create expenses
- `PATCH/DELETE /api/expenses/[id]` — Update/delete expense
- `POST /api/expense-categories` — Create custom category
- `GET/POST /api/recurring-expenses` — Manage recurring expenses; auto-creates expense entries on load if `nextDate` has passed

**Data collected**: description, amount, category, date, receipt (file path), project link, recurring flag, frequency.

---

### Tasks

**Purpose**: Task management across projects or standalone.

**Frontend**: `app/(app)/tasks/TasksClient.jsx`
- Filter by status, priority, project, assignee
- Subtask expansion with progress bar
- Loading state on checkbox tick (no optimistic UI — waits for API confirmation)
- Auto-completes main task when all subtasks are ticked
- AI task generation panel

**Shared utilities**: `app/(app)/tasks/taskUtils.js`
- `PRIORITY_DOT`, `STATUS_OPTIONS`, `STATUS_PILL`, `makeSubtask()`, `cleanSubtasks()`, `isOverdue()`
- Imported by both `TasksClient` and `ProjectTasksSection` for consistent UI

**Backend**:
- `GET/POST /api/tasks` — List/create tasks; `subtasks` stored as JSON string
- `PATCH /api/tasks/[id]` — Update status, priority, assignee, subtasks
- `DELETE /api/tasks/[id]` — Delete task
- `POST /api/tasks/ai-generate` — Stream AI-generated task list from project description (OpenAI)

**Data collected**: title, description, project, assignee (team member), priority (low/medium/high), due date, status (todo/in_progress/done), subtasks (JSON array with `id`, `title`, `done`).

---

### Time Tracker

**Purpose**: Log time spent on projects; track billable hours.

**Frontend**: `app/(app)/time-tracker/TimeTrackerClient.jsx`
- Manual time entry form (start time, end time, or duration)
- Filter by project; toggle billable flag
- Calculates total hours and billable value

**Backend**:
- `GET/POST /api/time-entries` — List/create entries
- `PATCH/DELETE /api/time-entries/[id]` — Update/delete

**Data collected**: project, description, start time, end time, duration (minutes), billable (boolean), hourly rate.

---

### Scheduler & Bookings

**Purpose**: Let clients book meetings by sharing a public booking page.

**Frontend**:
- `app/(app)/scheduler/SchedulerClient.jsx` — Set availability rules (days + hours); view upcoming bookings
- `app/(app)/calendar/page.jsx` — Calendar view of all bookings and entries
- `app/book/[userId]/BookingForm.jsx` — Public booking form (3-column layout: info panel · calendar · time slots/form)

**Public booking flow**:
1. Freelancer shares `/book/[userId]` link
2. Client selects duration (30 or 60 min), picks a date, picks a time slot
3. Client fills in name, email, notes → submits
4. `POST /api/bookings` creates booking; sends confirmation email

**Backend**:
- `GET/POST /api/bookings` — List/create bookings
- `PATCH/DELETE /api/bookings/[id]` — Update/cancel booking
- `POST /api/scheduler/availability` — Save availability rules per day of week

**Slot generation logic** (`BookingForm.jsx → generateSlots()`):
- Reads availability rules for the selected day
- Generates 30-minute interval slots between start and end time
- Filters out slots that overlap with existing bookings or are in the past

**Data collected**: client name, client email, start time, end time, title, notes, status (confirmed/cancelled).

---

### Services

**Purpose**: Reusable service catalogue for quick invoice/proposal line-item population.

**Frontend**: `app/(app)/services/ServicesManager.jsx`
- Create, edit, archive services
- Unit types: flat rate or hourly

**Backend**:
- `GET/POST /api/services` — List/create
- `PATCH/DELETE /api/services/[id]` — Update/delete; `status` field (active/archived)

**Data collected**: name, description, default rate, unit (flat/hourly), status.

---

### Team

**Purpose**: Invite collaborators to the business workspace.

**Frontend**: `app/(app)/settings/page.jsx` — Team section
- Invite by email with role selection
- View pending / active members
- Remove members

**Backend**:
- `GET/POST /api/settings/team` — List members; send invite email with unique token
- `PATCH /api/settings/team/[id]` — Update role/permissions
- `DELETE /api/settings/team/[id]` — Remove member
- `POST /api/join` — Accept invite; creates user account linked to business

**Invite flow**:
1. Owner enters email + role → `POST /api/settings/team`
2. Resend sends invite email with link `/join?token=[inviteToken]`
3. Invitee clicks link → `app/join/page.jsx` — sets password, creates account
4. `TeamMember.status` updated to `"active"`

**Roles**: `collaborator`, `admin`, `contractor`
**Permissions** (JSON array): granular per-module flags e.g. `"canViewInvoices"`, `"canManageTasks"`

---

### Client Portal

**Purpose**: Share a single read-only link with clients so they can track progress, download files, and pay invoices — without needing a login.

**URL**: `/p/[portalToken]`
**Auth**: None — access is controlled by the unique, unguessable portal token (nanoid)

**Frontend**: `app/p/[token]/ClientPortal.jsx`
- Project name, status, and stage display
- File list — only files with `visibleToClient: true`
- Notes — only notes with `visibleToClient: true`
- Invoice list with "Pay now" button → triggers Stripe Checkout
- Comments thread — client can add comments (no auth required; name stored as provided)

**Backend behaviour on portal load**:
1. Fetch project by `portalToken`
2. Increment `viewCount` on project
3. Update `lastViewedAt`
4. If first view OR viewCount is a multiple of 5 → create in-app notification for the freelancer

**Security**: Portal tokens are generated with nanoid (21 characters, ~126 bits of entropy). Without the token, no project data is accessible. Tokens can be regenerated by the freelancer to revoke access.

---

### Notifications

**Purpose**: Alert freelancers to important events in real time.

**Frontend**: `components/shared/TopBar.jsx`
- Bell icon with unread count badge
- Dropdown panel shows recent notifications (unread highlighted in blue)
- "Mark all read" button

**Backend**:
- `GET /api/notifications` — Returns `{ unreadCount, notifications[] }`
- `PATCH /api/notifications` — Marks all as read

**Notification triggers**:
| Event | Type |
|---|---|
| Client viewed portal | `portal_viewed` |
| Invoice paid via Stripe | `invoice_paid` |
| Team invite sent | `team_invite` |
| Proposal accepted | `proposal_accepted` |
| Contract signed | `contract_signed` |

---

### PDF Templates

**Purpose**: Customise the look of exported PDFs (invoices, proposals, contracts).

**Frontend**: `app/(app)/settings/pdf-templates/`
- Create multiple templates per document type
- Set one as default per type
- Live preview

**Backend**:
- `GET/POST /api/pdf-templates` — List/create templates
- `PATCH/DELETE /api/pdf-templates/[id]` — Update/delete
- `POST /api/pdf-templates/[id]/set-default` — Sets `isDefault: true` for this type, unsets others

**Template fields**: paper size, orientation, margins, accent colour, logo, font family/size, header style, footer text, page numbers, tax column visibility, watermark, terms text, signature block.

---

## Stripe Integration

### Stripe Connect (Freelancer linking their account)

Freelancers connect their own Stripe account so that invoice payments go directly to them.

```
Freelancer clicks "Connect with Stripe" in Settings
  → GET /api/settings/stripe/connect
  → Redirects to https://connect.stripe.com/oauth/v2/authorize
    with client_id=STRIPE_CLIENT_ID, scope=read_write, state=userId, redirect_uri

Stripe redirects to GET /api/settings/stripe/callback?code=...&state=userId
  → POST https://connect.stripe.com/oauth/token  (raw fetch — SDK v20 removed oauth.token())
  → Receives stripe_user_id (connected account ID)
  → stripe.accounts.retrieve(accountId) — checks charges_enabled
  → Saves stripeAccountId + stripeOnboarded to User record
  → Redirects to /settings?stripe=connected
```

**Environment variables required**:
```
STRIPE_SECRET_KEY=sk_test_...    (PortalKit platform secret key)
STRIPE_CLIENT_ID=ca_...          (PortalKit Connect client ID — from Stripe Dashboard → Connect → Settings)
```

**Redirect URI** must be registered in Stripe Dashboard → Connect → Settings → Redirects:
```
http://localhost:3000/api/settings/stripe/callback    (development)
https://yourdomain.com/api/settings/stripe/callback   (production)
```

### Invoice Payment Flow

```
Client clicks "Pay Now" on portal or invoice
  → POST /api/invoices/checkout { invoiceId }
  → Creates Stripe Checkout Session
      mode: "payment"
      automatic_payment_methods: { enabled: true }
      line_items: mapped from invoice.lineItems
      customer_email: project.clientEmail
  → If freelancer has connected Stripe (stripeOnboarded = true):
      payment_intent_data.transfer_data.destination = freelancer.stripeAccountId
      application_fee_amount = 2% of total (platform fee to PortalKit)
  → Returns { url: checkoutUrl }
  → Client is redirected to Stripe-hosted checkout page
  → On success: redirected to /payment/success?invoiceId=...

Stripe fires checkout.session.completed webhook
  → POST /api/webhooks/stripe
  → Verify signature with STRIPE_WEBHOOK_SECRET
  → Find invoice by stripeSessionId
  → Update invoice status to "paid", set paidAt
  → Create Notification record for freelancer
  → Send payment confirmation email via Resend
```

---

## Email (Resend)

All transactional emails are sent via [Resend](https://resend.com).

| Trigger | Template |
|---|---|
| Invoice sent | Invoice with payment link |
| Payment received | Payment confirmation to freelancer |
| Proposal sent | Proposal with view link |
| Contract sent | Contract with signing link |
| Team invite | Invite with join link |
| Booking confirmed | Booking details to client |

**Environment variable**: `RESEND_API_KEY=re_...`

---

## AI Features

Powered by the Vercel AI SDK with OpenAI as the provider.

| Feature | Route | Description |
|---|---|---|
| AI Task Generator | `POST /api/tasks/ai-generate` | Streams a list of tasks from a project description |
| Proposal Drafter | `POST /api/proposals/draft` | Generates proposal sections from project brief |
| Contract Drafter | `POST /api/contracts/draft` | Generates contract clauses from project description |

**Environment variable**: `OPENAI_API_KEY=sk-...`

---

## Database Schema

### Core models and relations

```
Business ─┬─ User (owner)
           ├─ User[] (members via TeamMember)
           ├─ Contact[]
           ├─ Project[]
           ├─ Invoice[]
           ├─ Task[]
           ├─ Expense[]
           ├─ Service[]
           ├─ Booking[]
           └─ Notification[]

Project ──┬─ Contact (optional)
           ├─ File[]
           ├─ Note[]
           ├─ Comment[]
           ├─ Invoice[]
           ├─ Task[]
           ├─ TimeEntry[]
           ├─ Proposal[]
           └─ Contract[]

Invoice ──┬─ Project
           └─ PaymentPlan[]

Task ─────┬─ Project (optional)
           └─ TeamMember (assignee, optional)
```

### JSON fields

These fields are stored as JSON strings in the database and parsed on read:

| Model | Field | Shape |
|---|---|---|
| Invoice | `lineItems` | `[{ description, quantity, unitPrice }]` |
| Task | `subtasks` | `[{ id, title, done }]` |
| Proposal | `sections` | `[{ title, body (HTML) }]` |
| Proposal | `pricing` | `[{ description, quantity, unitPrice }]` |
| Contract | `clauses` | `[{ title, body (HTML) }]` |
| TeamMember | `permissions` | `["canViewInvoices", ...]` |

---

## API Reference

### Authentication
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user + business |
| POST | `/api/auth/[...nextauth]` | NextAuth sign-in / sign-out / session |

### Contacts
| Method | Path | Description |
|---|---|---|
| GET | `/api/contacts` | List contacts (q, status, page) |
| POST | `/api/contacts` | Create contact |
| GET | `/api/contacts/[id]` | Get contact + projects |
| PATCH | `/api/contacts/[id]` | Update contact |
| DELETE | `/api/contacts/[id]` | Delete contact |
| POST | `/api/contacts/bulk` | Bulk update status / bulk delete |
| POST | `/api/contacts/import` | CSV import |
| POST | `/api/contacts/export` | CSV export |

### Projects
| Method | Path | Description |
|---|---|---|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| PATCH | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Delete project (cascades) |

### Invoices
| Method | Path | Description |
|---|---|---|
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create invoice |
| PATCH | `/api/invoices/[id]` | Update invoice |
| DELETE | `/api/invoices/[id]` | Delete invoice |
| POST | `/api/invoices/checkout` | Create Stripe checkout session |
| POST | `/api/invoices/bulk-send` | Send multiple invoice emails |
| POST | `/api/webhooks/stripe` | Stripe payment webhook |

### Proposals & Contracts
| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/proposals` | List / create proposal |
| PATCH/DELETE | `/api/proposals/[id]` | Update / delete |
| POST | `/api/proposals/draft` | AI draft generation |
| POST | `/api/proposals/[id]/send` | Send proposal email |
| GET/POST | `/api/contracts` | List / create contract |
| PATCH/DELETE | `/api/contracts/[id]` | Update / delete |
| POST | `/api/contracts/draft` | AI draft generation |
| POST | `/api/contracts/[id]/send` | Send contract email |

### Tasks & Time
| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/tasks` | List / create task |
| PATCH/DELETE | `/api/tasks/[id]` | Update / delete task |
| POST | `/api/tasks/ai-generate` | Stream AI task generation |
| GET/POST | `/api/time-entries` | List / create time entry |
| PATCH/DELETE | `/api/time-entries/[id]` | Update / delete |

### Finance
| Method | Path | Description |
|---|---|---|
| GET | `/api/finance` | Revenue / expense / profit aggregation |
| GET/POST | `/api/expenses` | List / create expense |
| PATCH/DELETE | `/api/expenses/[id]` | Update / delete |
| POST | `/api/expense-categories` | Create category |
| GET/POST | `/api/recurring-expenses` | List / create recurring expense |

### Settings & Stripe
| Method | Path | Description |
|---|---|---|
| GET/PATCH | `/api/settings/profile` | User profile |
| GET/PATCH | `/api/settings/business` | Business details |
| GET/PATCH | `/api/settings/payments` | Payment method settings |
| GET/PATCH | `/api/settings/plan` | Plan management |
| GET/POST | `/api/settings/team` | Team members |
| PATCH/DELETE | `/api/settings/team/[id]` | Update / remove team member |
| GET | `/api/settings/stripe/connect` | Start Stripe Connect OAuth |
| GET | `/api/settings/stripe/callback` | Stripe Connect OAuth callback |
| GET | `/api/settings/stripe/status` | Check connection status |
| POST | `/api/settings/stripe/disconnect` | Disconnect Stripe account |

### PDF & Notifications
| Method | Path | Description |
|---|---|---|
| GET | `/api/pdf/invoice/[id]` | Generate invoice PDF |
| GET | `/api/pdf/proposal/[id]` | Generate proposal PDF |
| GET | `/api/pdf/contract/[id]` | Generate contract PDF |
| GET/POST | `/api/pdf-templates` | List / create PDF template |
| POST | `/api/pdf-templates/[id]/set-default` | Set default template |
| GET | `/api/notifications` | Fetch notifications |
| PATCH | `/api/notifications` | Mark all as read |

### Bookings & Scheduler
| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/bookings` | List / create booking |
| PATCH/DELETE | `/api/bookings/[id]` | Update / cancel booking |
| POST | `/api/scheduler/availability` | Save availability rules |

---

## Security & Safety Checks

### Authentication checks
- Every API route verifies `session.user` exists before processing; returns `401` if not
- JWT is signed with `NEXTAUTH_SECRET`; tampering invalidates the token
- Passwords are never stored in plaintext — bcrypt with 10 rounds
- HTTP-only cookie prevents JavaScript access to the session token

### Tenant isolation
- All database queries are scoped by `businessId` or `userId` via `getTenantFilter()`
- A user cannot read, update, or delete records belonging to another tenant — enforced at every query level, not just at the route level

### Stripe webhook verification
- `POST /api/webhooks/stripe` verifies the `Stripe-Signature` header using `stripe.webhooks.constructEvent()`
- Requests with invalid signatures are rejected with `400`
- This prevents forged webhook events from marking invoices as paid

### Client portal access
- Portal tokens are 21-character nanoid strings (~126 bits of entropy)
- No authentication required, but the token must be known to access the portal
- Tokens can be regenerated by the freelancer to revoke access
- Only files/notes with `visibleToClient: true` are exposed

### Input validation
- API routes validate required fields and data types
- Zod is used for schema validation on critical routes
- File uploads are restricted to allowed MIME types

### Stripe Connect security
- Platform fee is calculated server-side — clients cannot manipulate the amount
- `stripeOnboarded` flag is set only after `charges_enabled` is confirmed from Stripe
- OAuth state parameter contains the userId to prevent CSRF in the callback

### Environment secrets
Never commit these to version control:
- `NEXTAUTH_SECRET` — must be a random 32+ character string in production
- `STRIPE_SECRET_KEY` — server-side only; never exposed to the client
- `STRIPE_WEBHOOK_SECRET` — used to verify webhook authenticity
- `DATABASE_URL` — contains DB credentials

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example and fill in your values:

```bash
cp .env.local.example .env.local
```

See [Environment Variables](#environment-variables) below for all required values.

### 3. Set up the database

```bash
npx prisma migrate dev --name init
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. (Optional) Browse the database

```bash
npx prisma studio
```

---

## Environment Variables

```env
# App
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-to-a-random-32-char-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database (PostgreSQL — Neon, Supabase, Railway, or local)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"

# Stripe — https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
# Stripe Connect Client ID — https://dashboard.stripe.com/settings/connect
STRIPE_CLIENT_ID=ca_...
# Webhook secret — run: stripe listen --forward-to localhost:3000/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET=whsec_...

# Email — https://resend.com/api-keys
RESEND_API_KEY=re_...

# AI (optional — required for AI task/proposal generation)
OPENAI_API_KEY=sk-...
```

---

## Deployment

### Vercel (recommended)

```bash
npx vercel
```

Or connect your GitHub repo to Vercel and set environment variables in the dashboard.

**Important**: Update these for production:
- `NEXTAUTH_URL` → your production domain
- `NEXT_PUBLIC_APP_URL` → your production domain
- `STRIPE_WEBHOOK_SECRET` → re-run `stripe listen` or set up a production webhook endpoint in Stripe Dashboard
- Register your production domain as an allowed redirect URI in Stripe Connect settings

### Database

Use a managed PostgreSQL provider:
- [Neon](https://neon.tech) — serverless Postgres (recommended for Vercel)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

### File storage

For production, replace local `/uploads/` with S3 or Cloudflare R2. Update the file upload and download routes in `app/api/files/`.

---

## Development Commands

```bash
npm run dev                              # Start dev server
npm run build                            # Production build
npm run lint                             # Lint check
npx prisma studio                        # Browse database
npx prisma migrate dev --name <name>     # Create migration
npx prisma db push                       # Push schema without migration
npx prisma generate                      # Regenerate Prisma client
stripe listen --forward-to localhost:3000/api/webhooks/stripe  # Forward Stripe webhooks locally
```
