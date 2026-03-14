# App Design Tokens & Component API Reference

This file is the single source of truth for design tokens, component APIs, and usage patterns in this codebase. Read this before designing any page, component, or UI element.

---

## Color Tokens

### Brand

| Token | Tailwind | Hex | Usage |
|-------|----------|-----|-------|
| Primary | `blue-600` | #2563eb | Buttons, links, active states, focus indicators |
| Primary hover | `blue-700` | #1d4ed8 | Hover state for primary blue |
| Primary light | `blue-50` | #eff6ff | Status badge backgrounds, highlight areas |
| Primary text on light | `blue-700` | #1d4ed8 | Status badge text on blue-50 |

### Sidebar (hardcoded — not in Tailwind config)

| Token | Hex | Usage |
|-------|-----|-------|
| Sidebar background | `#17202d` | Navbar background |
| Active nav bg | `#243247` | Active/selected nav item |
| Active nav text | `#dbeafe` | Active/selected nav item text |

### Neutral (Zinc scale — always use zinc, never gray)

| Token | Tailwind | Usage |
|-------|----------|-------|
| Page background | `bg-white` / `bg-zinc-50` | Main content area |
| Card background | `bg-white` | Card, modal backgrounds |
| Border | `border-zinc-200` | Borders on cards, inputs, dividers |
| Border strong | `border-zinc-300` | Strong dividers |
| Text primary | `text-zinc-900` | Headings, strong text |
| Text body | `text-zinc-700` | Body text, table cells |
| Text secondary | `text-zinc-500` / `text-zinc-600` | Labels, descriptions |
| Text muted | `text-zinc-400` | Placeholder, hints |
| Background subtle | `bg-zinc-50` | Hover states, striped rows |
| Background medium | `bg-zinc-100` | Inactive badges, kbd |
| Bulk action bar | `bg-zinc-900 text-white` | Bulk selection bar background |

### Semantic / Status

| Status | Background | Text |
|--------|-----------|------|
| Success / active / paid | `bg-green-50` | `text-green-700` |
| Warning / lead / pending | `bg-amber-50` | `text-amber-700` |
| Danger / overdue / error | `bg-red-50` | `text-red-700` |
| Info / sent | `bg-blue-50` | `text-blue-700` |
| Draft / neutral / archived | `bg-zinc-100` | `text-zinc-500` / `text-zinc-600` |

---

## Typography Tokens

| Level | Tailwind Classes | When to use |
|-------|-----------------|-------------|
| Page title | `text-2xl font-semibold text-zinc-900` | One per page, top of content area |
| Section heading | `text-lg font-semibold text-zinc-900` | Card headers, sidebar section labels |
| Card/modal title | `text-base font-semibold text-zinc-900` | Inside cards, modal headers |
| Body text | `text-sm text-zinc-700` | Paragraphs, table cells, descriptions |
| Field label | `text-[12px] font-medium text-zinc-700` | Form inputs, detail key-value labels |
| Column/filter label | `text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500` | Table column headers, filter category labels |
| Secondary text | `text-sm text-zinc-500` | Supporting detail, timestamps, counts |
| Muted text | `text-sm text-zinc-400` | Placeholders, empty state descriptions |
| Error text | `text-sm text-red-600` | Inline validation errors |
| Font family | Kumbh Sans | Set in Tailwind theme, applied globally |

---

## Spacing Tokens

| Context | Classes |
|---------|---------|
| Page outer padding | `px-4 md:px-8 py-6` |
| Card body | `px-6 py-5` |
| Card header | `px-6 py-4` |
| Modal content | `px-6 py-4` |
| Table row padding | `py-2.5` compact / `py-3.5` comfortable |
| Table cell horizontal | `px-4` or `px-6` |
| Form field gap | `gap-4` standard / `gap-5` generous |
| Form grid (2-col) | `grid grid-cols-1 md:grid-cols-2 gap-4` |
| Section vertical gap | `space-y-4` to `space-y-6` |
| Inline actions gap | `gap-2` |
| Button group gap | `gap-2` or `gap-3` |

---

## Component API Reference

### Button — `components/ui/Button.jsx`

```jsx
<Button
  variant="primary"   // primary | secondary | danger | ghost
  size="md"           // sm (h-8) | md (h-10) | lg (h-11)
  loading={false}     // shows spinner, disables interaction
  disabled={false}
  type="button"       // button | submit | reset
  onClick={fn}
>
  Label
</Button>
```

**Variant rules:**
- `primary` — for the one main action per page/section
- `secondary` — for secondary actions alongside a primary
- `danger` — for destructive actions (delete, archive, cancel)
- `ghost` — for tertiary/inline actions, icon-only contexts

**Never:**
- Stack two `primary` buttons side by side
- Use `danger` for anything that is not destructive
- Omit loading state when the button triggers an async action

---

### Input — `components/ui/Input.jsx`

```jsx
<Input
  label="Field Name"     // renders label above
  required               // adds red asterisk to label
  error="Error message"  // renders error below field
  placeholder="..."
  value={value}
  onChange={fn}
  // ...all standard input attributes
/>
```

- Height: `h-8` (compact, consistent with table row density)
- Border: transparent → `border-zinc-900` on focus
- Always use `label` prop — never put label outside the component

---

### Select — `components/ui/Select.jsx`

Same height and border conventions as Input. Use for all dropdown selections.

---

### Badge — `components/ui/Badge.jsx`

```jsx
<Badge className="bg-green-50 text-green-700">Active</Badge>
```

- Base: `rounded-full px-2.5 py-0.5 text-xs font-medium`
- Color always passed via `className`
- Use status color table from SKILL.md
- Never show both a badge and a plain text status side-by-side

---

### Card — `components/ui/Card.jsx`

```jsx
<Card>
  <CardHeader>
    <h2 className="text-base font-semibold text-zinc-900">Title</h2>
  </CardHeader>
  <CardBody>
    {/* content */}
  </CardBody>
</Card>
```

- Wrapper: `rounded border border-zinc-200 bg-white`
- Use when you need to bound a group of related data as a distinct record
- Do not wrap every section in a Card — use spacing and dividers first

---

### Modal — `components/shared/Modal.jsx`

```jsx
<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Modal Title"
  description="Short supporting description"
  layout="center"   // center | side
>
  {/* content */}
</Modal>
```

- `center`: overlay dialog, default for confirmations and forms
- `side`: right panel, for detail editing without leaving the list
- Always include title and description
- Keep content scrollable for long forms: body uses `overflow-y-auto`

---

### CollectionPageHeader — `components/shared/CollectionPageHeader.jsx`

Use on all list/index pages (invoices, contacts, proposals, contracts, tasks, etc.).

```jsx
<CollectionPageHeader
  title="Invoices"
  filterOptions={[...]}          // grouped options with search
  activeFilter={filter}
  onFilterChange={setFilter}
  primaryAction={{
    label: "New Invoice",
    onClick: () => router.push('/invoices/new'),
  }}
  secondaryActions={[...]}       // icon button actions
/>
```

- Never build a custom page header for list pages — always use this component
- Place filter close to the content it changes (already handled inside component)

---

### CollectionDataTable — `components/shared/CollectionDataTable.jsx`

Use on all list/table pages. Handles selection, sorting, pagination, bulk actions.

```jsx
<CollectionDataTable
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status' },
    // ...
  ]}
  rows={data}
  renderRow={(row) => (
    <tr key={row.id}>
      <td>{row.name}</td>
      <td><Badge className="...">{row.status}</Badge></td>
    </tr>
  )}
  selection={selection}         // { selected, onSelect, onSelectAll }
  sort={sort}                   // { key, direction, onChange }
  pagination={pagination}       // { page, pageSize, total, onChange }
  bulkActions={[...]}
  emptyState={{
    icon: <IconComponent />,
    title: 'No invoices',
    description: 'Create your first invoice to get started.',
    action: { label: 'New Invoice', onClick: fn },
  }}
/>
```

- Never build a custom table — always use this component
- Column labels use the filter/column label typography: `text-[11px] font-semibold uppercase tracking-[0.18em]`
- Bulk action bar: `bg-zinc-900 text-white`

---

## Layout Patterns

### List / Index Page

```
CollectionPageHeader
  ├─ Filter dropdown
  ├─ Title (with active filter label)
  └─ Primary CTA + secondary icon actions

CollectionDataTable
  ├─ Bulk action bar (when rows selected)
  ├─ Column headers (sortable)
  ├─ Rows with inline hover actions
  ├─ Pagination
  └─ Empty state (with action CTA)
```

### Detail Page

```
Page header row
  ├─ Back link + breadcrumb
  ├─ Record title + status badge
  └─ Primary action (e.g. "Send", "Download")

Content area (two-column on desktop, stacked on mobile)
  ├─ Left (2/3): Main record content (line items, body, tasks)
  └─ Right (1/3): Metadata sidebar (status, dates, contact, totals)
```

### Form Page / Modal

```
Title + description (header)

Form sections (group by user task, not schema)
  ├─ Section 1: Core fields (2-col grid where sensible)
  ├─ Section 2: Secondary fields
  └─ Section 3: Optional/advanced (collapsed if rarely used)

Action row
  ├─ Primary submit button (right-aligned)
  └─ Cancel / back link
```

### Dashboard

```
Greeting + date

KPI row (3–4 metrics max — only actionable ones)

Two-column content
  ├─ Left: Recent activity list (invoices, tasks, projects)
  └─ Right: Quick actions or upcoming schedule
```

---

## Responsive Behavior

| Breakpoint | Behavior |
|-----------|----------|
| Mobile (`< md`) | Bottom nav, single-column layout, stacked forms |
| Tablet (`md`) | Sidebar appears, 2-col grid unlocks |
| Desktop (`lg+`) | Full sidebar, multi-column detail layouts |

- Always specify `md:` variants for layout changes
- Detail page two-column: `grid-cols-1 md:grid-cols-3`
- Form grid: `grid-cols-1 md:grid-cols-2`
- Never rely on horizontal scroll for mobile table layouts — use condensed row views

---

## Final Checklist Before Outputting Any UI

- [ ] Does every section earn its place?
- [ ] Is the primary action obvious and singular?
- [ ] Is `CollectionPageHeader` used for list pages?
- [ ] Is `CollectionDataTable` used for tables?
- [ ] Are all status badges using the correct color mapping?
- [ ] Is `rounded` (not `rounded-lg`) used for all containers?
- [ ] Are cards used only where they genuinely improve grouping?
- [ ] Is there no duplicated information on the page?
- [ ] Are all Tailwind classes from the Zinc scale (not Gray)?
- [ ] Are hover, focus, loading, disabled, and empty states designed?
- [ ] Does the layout make sense at mobile breakpoint?
- [ ] Would this screen hold up under daily use?
