---
name: web-app-ux-ui-design
description: Design and refine modern web app interfaces for SaaS products, admin panels, dashboards, CRM/ERP modules, forms, tables, landing pages, and detail views. Use when Codex needs to create, redesign, clean up, modernize, or improve UX/UI for product interfaces with emphasis on structure, usability, responsiveness, consistency, brand alignment, and production-ready visual execution.
---

# Web App UX/UI Design

Design product interfaces like a senior product designer and senior UX/UI designer. Prioritize workflow clarity, information hierarchy, responsiveness, and business-ready execution before visual polish.

---

## This App's Design System

Before designing any page or component, internalize the following. All decisions must be grounded in this system.

### Brand Colors

| Role | Tailwind | Hex |
|------|----------|-----|
| Primary action | `blue-600` | #2563eb |
| Primary hover | `blue-700` | #1d4ed8 |
| Sidebar background | hardcoded | #17202d |
| Active nav item bg | hardcoded | #243247 |
| Active nav item text | hardcoded | #dbeafe |
| Success | `green-600` / `green-700` | — |
| Danger | `red-600` / `red-700` | — |
| Warning | `amber-600` | — |
| Info | `blue-500` | — |
| Page background | `bg-white` or `bg-zinc-50` | — |
| Border | `border-zinc-200` | — |
| Text primary | `text-zinc-900` | — |
| Text secondary | `text-zinc-500` / `text-zinc-600` | — |
| Text muted | `text-zinc-400` | — |

**Rules:**
- Never invent new palette directions — always use the Zinc scale for neutrals
- Never use `text-black` or `bg-black` — use `text-zinc-900` and `bg-zinc-900`
- Never use `bg-gray-*` — use `bg-zinc-*`
- `blue-600` is the only primary action color — do not use blue on decorative elements
- Status colors must follow semantic intent (green = positive/active, red = destructive/overdue, amber = warning/pending, zinc = neutral/draft)

### Typography Scale

| Level | Classes |
|-------|---------|
| Page title | `text-2xl font-semibold text-zinc-900` |
| Section heading | `text-lg font-semibold text-zinc-900` |
| Card / modal title | `text-base font-semibold text-zinc-900` |
| Body / table cell | `text-sm text-zinc-700` |
| Field label | `text-[12px] font-medium text-zinc-700` |
| Filter / column label | `text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500` |
| Muted / secondary | `text-zinc-500` or `text-zinc-600` |
| Hint / tertiary | `text-zinc-400` |
| Error | `text-red-600 text-sm` |
| Font family | Kumbh Sans (set in Tailwind theme) |

### Border, Radius & Shadow

- **Standard border**: `border border-zinc-200`
- **Standard radius**: `rounded` (4px) — always, unless noted below
- **Badges only**: `rounded-full`
- **No `rounded-lg`, `rounded-xl`, `rounded-2xl`** on cards, inputs, or containers
- **Shadows**: Only for floating elements (modals: `shadow-xl`, dropdowns: `shadow-md`)
- **No decorative shadows** on cards, sections, or buttons — use `border` instead

### Content Background Rule

All content containers (main column, editor area, sidebar cards, form panels) must have `bg-white` with `border border-zinc-200`. The page background sits at `bg-zinc-50` or the layout default — content lifts off it with white. Never leave the main content area transparent or borderless against the page background.

```jsx
// Correct — content column
<div className="rounded border border-zinc-200 bg-white px-6 py-6">

// Correct — sidebar card
<div className="rounded border border-zinc-200 bg-white p-4">

// Wrong — transparent/no border
<div className="space-y-8">
```

---

### Spacing

| Context | Classes |
|---------|---------|
| Page outer padding | `px-4 md:px-8 py-6` |
| Card body | `px-6 py-5` |
| Card header | `px-6 py-4` |
| Table row | `py-2.5` or `py-3.5` |
| Form field gap | `gap-4` or `gap-5` |
| Section gap | `gap-3` to `gap-6` |
| Inline element gap | `gap-2` or `gap-3` |

### Component Inventory

Always use existing components from `components/ui/` and `components/shared/`. Never recreate what already exists.

#### Button — `components/ui/Button.jsx`
- `variant`: `primary` (blue-600) | `secondary` (white + border) | `danger` (red-600) | `ghost` (text only)
- `size`: `sm` (h-8) | `md` (h-10) | `lg` (h-11)
- Props: `loading`, `disabled`, `onClick`, `type`, `className`
- Focus: `focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900`

#### Input — `components/ui/Input.jsx`
- Height: `h-8`, transparent default border → `border-zinc-900` on focus
- Props: `label`, `error`, `required`, standard input attrs
- Focus ring: `focus:ring-1 ring-zinc-900`

#### Select — `components/ui/Select.jsx`
- Same height and border rules as Input

#### Badge — `components/ui/Badge.jsx`
- Base: `rounded-full px-2.5 py-0.5 text-xs font-medium`
- Color: always passed via `className` — never hardcoded inside component
- Status color classes: see `references/app-design-tokens.md`

#### Card — `components/ui/Card.jsx`
- Wrapper: `rounded border border-zinc-200 bg-white`
- `CardHeader`: `border-b border-zinc-100 px-6 py-4`
- `CardBody`: `px-6 py-5`
- Use sparingly — not every content group needs a card

#### Modal — `components/shared/Modal.jsx`
- `layout`: `center` (default) | `side` (right panel, mobile-aware)
- Backdrop: `bg-black/30`, click-to-close
- Always include: title, description, close button (X icon)
- Body: `overflow-y-auto`

#### Page Header — `components/shared/CollectionPageHeader.jsx`
- Contains: filter dropdown (searchable, grouped), title, primary CTA button, secondary icon actions
- Always use this for index/list pages — do not build custom page headers

#### Data Table — `components/shared/CollectionDataTable.jsx`
- Features: checkbox selection, bulk action bar, sortable columns, pagination, empty state
- Bulk bar style: `bg-zinc-900 text-white`
- Pass: `columns`, `rows`, `renderRow`, `selection`, `sort`, `pagination`, `emptyState`
- Always use this for list/table pages — do not build custom tables

### Status Badge Colors Per Entity

| Entity | Status | Badge classes |
|--------|--------|---------------|
| Invoice | `draft` | `bg-zinc-100 text-zinc-600` |
| Invoice | `sent` | `bg-blue-50 text-blue-700` |
| Invoice | `paid` | `bg-green-50 text-green-700` |
| Invoice | `overdue` | `bg-red-50 text-red-700` |
| Invoice | `cancelled` | `bg-zinc-100 text-zinc-500` |
| Proposal | `draft` | `bg-zinc-100 text-zinc-600` |
| Proposal | `sent` | `bg-blue-50 text-blue-700` |
| Proposal | `accepted` | `bg-green-50 text-green-700` |
| Proposal | `declined` | `bg-red-50 text-red-700` |
| Contact | `lead` | `bg-amber-50 text-amber-700` |
| Contact | `active` | `bg-green-50 text-green-700` |
| Contact | `archived` | `bg-zinc-100 text-zinc-500` |
| Contract | `draft` | `bg-zinc-100 text-zinc-600` |
| Contract | `sent` | `bg-blue-50 text-blue-700` |
| Contract | `signed` | `bg-green-50 text-green-700` |

### App-Specific Anti-Patterns

| Avoid | Use instead |
|-------|------------|
| `rounded-lg` / `rounded-xl` on cards | `rounded` |
| `shadow-md` on cards | `border border-zinc-200` |
| Decorative gradients | Solid brand/neutral colors |
| `bg-gray-*` | `bg-zinc-*` |
| `text-black` | `text-zinc-900` |
| Repeated status pill + status text | One display of status only |
| Multiple primary CTAs on same page | One primary, rest secondary/ghost |
| Custom page header instead of `CollectionPageHeader` | Use `CollectionPageHeader` |
| Custom table instead of `CollectionDataTable` | Use `CollectionDataTable` |
| Inline styles for spacing/color | Tailwind classes only |
| `font-bold` arbitrarily | Use the type scale above |
| Cards around every content block | Use spacing and dividers first |

---

## Operating Model

1. Establish the page goal, primary user tasks, and key actions before changing layout or styling.
2. Audit the current screen for clutter, duplicate information, weak hierarchy, broken workflows, and responsiveness risks.
3. Restructure the UX first by simplifying flows, grouping related information, and removing anything that does not help the user complete the job.
4. Apply restrained visual design through spacing, typography, alignment, contrast, and intentional brand-color usage.
5. Validate the result across desktop, tablet, and mobile. Reorganize layout patterns for smaller screens instead of merely shrinking the desktop UI.
6. Remove decorative UI that has no product, content, or usability reason.

## Non-Negotiables

- Respect the existing brand and product context. Reuse established colors, type, spacing, and component patterns unless the user explicitly asks for a new direction.
- Keep interfaces clean, minimal, professional, functional, consistent, and business-ready.
- Prefer structure over decoration. Do not rely on unnecessary cards, heavy shadows, oversized radii, random gradients, or boxed sections.
- Avoid duplicate information, repeated summaries, decorative filler, and dashboard bloat.
- Make daily-use workflows easy to scan, easy to understand, and easy to act on.
- Keep component treatment consistent across the full page or module.

## Design Workflow

### 1. Define the job

- Identify the user, the page purpose, the primary decision, and the main next action.
- Decide which information is essential, secondary, or removable.
- Preserve product reality. Favor workflows that support actual use over UI that only looks good in a static screenshot.

### 2. Organize the page

- Place the highest-value actions close to the page context that explains them.
- Group related controls with the data or content they affect.
- Collapse, merge, or remove repeated summaries and duplicate blocks.
- Choose the simplest layout pattern that supports the workflow: overview, list/table, form, detail view, settings page, or marketing page.

### 3. Style with restraint

- Use spacing, alignment, typography hierarchy, and subtle contrast to create structure.
- Keep border radius minimal. In Tailwind CSS, prefer `rounded` unless there is a clear reason to do more.
- Use borders, dividers, and shadows sparingly and only when they clarify grouping.
- Use brand colors for primary actions, active states, highlights, focus states, and identity moments. Do not let accent color take over the full interface.

### 4. Validate interaction states

- Check empty, loading, error, success, disabled, hover, and focus states.
- Make forms easy to complete and tables easy to scan.
- Keep navigation, actions, filters, tabs, and status indicators intentional and lightweight.

### 5. Validate responsiveness

- Reflow layout intelligently for tablet and mobile.
- Keep hierarchy intact when space collapses.
- Convert dense multi-column areas into clearer vertical sequences when needed.

## Reference File

Read [references/product-interface-guidelines.md](references/product-interface-guidelines.md) when designing or refining an interface. Use only the sections that match the page type you are working on:

- Core mindset and anti-patterns for all screens
- Dashboards and overview pages
- Tables, lists, filters, and bulk actions
- Forms, settings, and data entry
- Detail pages, modals, and side panels
- Landing and marketing pages inside product contexts

## Output Expectations

- Improve the UX structure first, hierarchy second, and visual polish third.
- Explain major layout decisions in terms of workflow, clarity, or usability when design reasoning matters.
- Mention responsive behavior when layout changes across breakpoints.
- Before finalizing, run the checklist in the reference file and remove any duplicated or decorative UI that slipped in.
