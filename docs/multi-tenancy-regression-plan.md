# Multi-Tenancy Regression Plan

This plan is for protecting tenant isolation and current product behavior while the app continues to change.

It is written for the current app surface in:

- `/app/(app)`
- `/app/api`

It covers:

- tenant isolation
- feature regression
- security checks
- performance checks
- release gating

## Goal

Every user must only see, edit, delete, export, send, or assign data that belongs to their own workspace, unless a feature explicitly allows controlled sharing.

## Core Risk Areas

The highest-risk failures in this app are:

- direct object access by guessing IDs
- missing `userId` scoping in API queries
- cross-project leakage through linked records
- shared UI state showing another tenant's data
- background flows creating records in the wrong workspace
- plan, role, or team access exposing actions the user should not have

## Test Data Matrix

Always test with at least these users:

1. `owner_a`
   Workspace A owner with full data.
2. `owner_b`
   Workspace B owner with different data.
3. `member_a`
   Pending or active teammate inside Workspace A.
4. `contractor_a`
   Restricted teammate inside Workspace A.
5. `anonymous`
   Not logged in.

Seed both Workspace A and Workspace B with:

- contacts
- projects
- tasks
- proposals
- contracts
- templates
- invoices
- expenses
- recurring expenses
- services
- time entries
- bookings
- notes/comments/files

Use obvious names so leakage is easy to spot:

- Workspace A project: `A-Website Redesign`
- Workspace B project: `B-Internal Portal`

## Release Gate

Do not ship a change unless these pass:

1. Module regression for the touched area.
2. Tenant isolation checks for the touched area.
3. Top-nav search check for the touched area.
4. Role/plan visibility check if actions changed.
5. No broken create/edit/delete flow.
6. No broken empty state.
7. No console or server runtime errors.

## Global Multi-Tenant Checks

Run these for every major module:

1. Create a record in Workspace A.
   Confirm it does not appear in Workspace B.
2. Edit a Workspace A record.
   Confirm Workspace B still cannot see or mutate it.
3. Delete a Workspace A record.
   Confirm Workspace B is unaffected.
4. Copy a direct detail URL from Workspace A and open it as Workspace B.
   Expect redirect, 404, or forbidden behavior.
5. Call the matching API endpoint using a Workspace B session and a Workspace A record id.
   Expect no access.
6. Check the top-nav search while viewing the module.
   Search must only return current tenant records.
7. Check linked record selectors.
   Project, contact, service, assignee, category selectors must only show the current tenant's data.

## Auth And Session

### Functional

- login with valid credentials
- reject invalid password
- signup creates a user in the correct plan
- session refresh reflects updated name, plan, role, company fields

### Tenant Isolation

- user A cannot authenticate as user B with user A password
- user A session must never resolve user B profile data

### Security

- no session object should expose password hashes
- session update must not let the client set another user's id

### Performance

- login response should remain responsive under repeated attempts
- session callback should not produce excessive DB queries

## Dashboard

### Functional

- greeting renders
- KPI strip renders
- create-new shortcuts route correctly
- project/task/contact/document lists render correctly

### Tenant Isolation

- dashboard cards only count current tenant records
- recent projects, tasks, contacts, proposals, contracts only belong to current tenant

### Performance

- dashboard should load without slow N+1 query patterns
- keep list sizes bounded

## Contacts

### Functional

- create contact
- edit contact
- archive/delete if supported
- filter header works
- top-nav search filters only current module

### Tenant Isolation

- user B cannot open `/contacts/[id]` or mutate user A contact
- project/contact linking must not show foreign tenant contacts

### Security

- contact notes, email, company must not leak through search or detail routes

## Projects

### Functional

- create project
- edit project
- project detail tabs render:
  - overview
  - files
  - activity
  - tasks
  - notes
  - details
- create/edit/assign task from project detail

### Tenant Isolation

- project list, detail, tasks, notes, files, invoices, and linked contact are all tenant-scoped
- project selectors in other modules only show current tenant projects

### Security

- project notes/files/comments cannot be read by another tenant via direct id access

### Performance

- detail page should not fetch more related rows than needed

## Proposals

### Functional

- create proposal
- save draft
- view proposal detail
- use template into proposal flow
- heading filter works
- top-nav search works

### Tenant Isolation

- proposal detail route must reject foreign tenant ids
- proposal template usage must not read another tenant template

### Security

- preview/share/send actions must not expose private proposal data to logged-in foreign tenants

## Contracts

### Functional

- create contract from scratch
- create contract from template
- project link is required and valid
- heading filter works
- top-nav search works

### Tenant Isolation

- foreign tenant contract ids must not resolve
- project dropdown only lists current tenant projects

### Security

- contract builder content, signatures, and linked project data must stay tenant-scoped

## Templates

### Functional

- gallery preview works
- customise routes to builder
- builder save works
- builder update works
- inline editing works
- scroll preview works
- filter heading works
- top-nav search works

### Tenant Isolation

- saved templates are private to the current tenant
- using a template must not pull another tenant's saved template

### Security

- smart field tokens must not resolve foreign tenant data

## Finance Overview

### Functional

- overview KPIs render only on Overview tab
- cashflow chart renders
- chart tooltip shows month, revenue, expenses

### Tenant Isolation

- KPI values use only current tenant invoices and expenses
- chart data only reflects current tenant data

## Invoices

### Functional

- create invoice
- edit invoice
- send invoice
- delete/cancel invoice if supported
- heading filter works
- project filter works
- top-nav search works

### Tenant Isolation

- invoice list/detail/send/delete must be tenant-scoped
- invoice project/client links must belong to current tenant

### Security

- bulk send must not include another tenant's invoices
- checkout route must not accept foreign invoice ids

### Performance

- invoice list should still load with 500+ rows using search and filters

## Expenses

### Functional

- add one-time expense
- add recurring expense using the recurring checkbox
- edit expense
- optional project link works
- optional note up to 100 chars works
- expense search works from top nav
- heading filter works:
  - expenses
  - one-time
  - recurring

### Tenant Isolation

- project dropdown only shows current tenant projects
- category list only shows current tenant categories plus defaults
- recurring sync only generates expenses for the correct tenant

### Security

- user B cannot edit user A expense or recurring setup by id

### Performance

- recurring sync should not duplicate rows on repeated page loads
- expense list should stay usable with 500+ rows

## Expense Categories

### Functional

- create category
- edit category
- search works
- pagination works
- used categories cannot be deleted

### Tenant Isolation

- custom categories are tenant-scoped
- user B cannot rename or delete user A categories

## Services

### Functional

- create service
- edit service
- delete service
- top-nav search works

### Tenant Isolation

- service list is tenant-scoped
- service selectors in invoice/proposal flows only show tenant services

## Tasks

### Functional

- add task through modal
- edit task
- mark done/undo
- expand notes/subtasks
- toggle subtasks
- heading filter works
- top-nav search works

### Tenant Isolation

- assignee options only show current tenant members
- project linking only shows current tenant projects
- task detail state never leaks foreign task data

### Security

- `/api/tasks/[id]` must reject foreign tenant ids for PATCH and DELETE

## Time Tracker

### Functional

- start timer
- stop timer
- manual log works
- day grouping renders with correct labels
- delete entry works

### Tenant Isolation

- entries are only visible to the current tenant
- project selector only shows current tenant projects

### Performance

- long entry history should still group and render acceptably

## Scheduler

### Functional

- bookings tab loads
- availability tab loads
- copy booking link works
- cancel booking works
- save availability works

### Tenant Isolation

- bookings only belong to current tenant
- availability rules only mutate current tenant schedule
- booking page URL should not resolve another tenant's private schedule data

## Settings

### Functional

- profile tab saves name/email-related fields
- business details save
- settings tab loads roles, team, payments, plan
- role section moved inside settings tab
- plan changes reflect in session

### Tenant Isolation

- team invites only affect current tenant workspace
- payment methods/settings stay tenant-scoped

### Security

- invite flow must not allow adding teammates to another workspace
- profile update must not mutate another user by crafted payload

## Files, Notes, Comments, Notifications

### Functional

- create note/comment/file where supported
- list renders correctly
- delete/update works where allowed

### Tenant Isolation

- direct file, note, comment, notification ids must be tenant-scoped

## Search Regression

For every module that uses top-nav search:

- with no query, list is unchanged
- with matching query, only matching tenant records appear
- with no matches, show empty search state
- changing route updates placeholder to the current module
- query should not bleed between modules in a confusing way

## Role And Plan Regression

Check these combinations:

1. free owner
2. solo owner
3. pro owner
4. active teammate
5. pending teammate
6. contractor

Verify:

- who can invite
- who can assign tasks
- who can edit finance data
- who can access settings sections
- who can create project-linked records

## Security Abuse Cases

Run these manually against every critical route:

1. Replace a visible id in the URL with another tenant id.
2. Replay a PATCH request with another tenant id.
3. Replay a DELETE request with another tenant id.
4. Submit a foreign `projectId`, `contactId`, `templateId`, `serviceId`, `categoryId`, or `assigneeMemberId`.
5. Try using a pending teammate id outside its workspace.
6. Attempt mass updates using bulk endpoints with mixed-tenant ids.

Expected result:

- 404
- forbidden
- ignored mutation

Never success.

## Performance Smoke Targets

These are not hard SLAs, but they should be used as regression alarms.

- dashboard server render: under 1.5s on local seeded data
- list pages with 500 rows: under 2s initial render
- filter/search interactions: visually immediate
- modal open/close: no layout jank
- recurring expense sync: no duplicate row creation, no noticeable repeated delay

## Bug Regression Checklist

Before merging any feature change, re-check:

- create works
- edit works
- delete works
- filter works
- top-nav search works
- empty state works
- modal open/close works
- direct detail route works
- foreign tenant id is blocked

## Recommended Automation Order

If automated testing is added later, implement in this order:

1. API authorization tests for tenant isolation.
2. High-value UI smoke tests for:
   - login
   - dashboard
   - contacts
   - projects
   - proposals
   - contracts
   - invoices
   - expenses
   - tasks
3. Search/filter regression tests.
4. Performance smoke checks on list views.

## Notes For Future Implementation

The repo currently does not have a first-class browser or unit test runner configured in `package.json`.

If you want this plan turned into executable tests next, the best path is:

1. add Playwright for end-to-end multi-tenant flows
2. add API integration tests for authorization boundaries
3. seed two workspaces in a disposable test database

