# Freelancer Client Portal — Full Validation Analysis
Generated: March 2026

---

# 1. Idea Restatement

A simple, affordable client portal for freelancers that gives clients one link to see project status, files, feedback, and invoices — without the complexity or cost of tools like HoneyBook or Dubsado.

---

# 2. Project Structure

```
freelancer-client-portal/
├── /skills
│   ├── analyze-idea.md          — Full 11-section analysis skill
│   ├── pain-point-deep-dive.md  — Reddit/review mining skill
│   ├── competitor-teardown.md   — Competitor breakdown skill
│   └── mvp-designer.md          — MVP scoping skill
├── /context
│   ├── role.md                  — Researcher role definition
│   ├── output-format.md         — Output template
│   └── constraints.md           — Research rules and evidence hierarchy
├── /sops
│   ├── 01-market-research.md
│   ├── 02-pain-point-discovery.md
│   ├── 03-competitor-analysis.md
│   ├── 04-pricing-research.md
│   ├── 05-positioning-research.md
│   ├── 06-marketing-channels.md
│   └── 07-mvp-scoping.md
├── /research
│   └── freelancer-client-portal/
│       ├── market-research.md
│       ├── pain-points.md
│       ├── competitor-analysis.md
│       ├── pricing-research.md
│       ├── positioning.md
│       ├── marketing-channels.md
│       └── mvp-concepts.md
└── /outputs
    └── freelancer-client-portal-analysis.md  ← this file
```

---

# 3. Research SOPs Used

- SOP 01: Market Research — freelance management market size, growth, categories
- SOP 02: Pain Point Discovery — Reddit, Trustpilot, G2, surveys
- SOP 03: Competitor Analysis — HoneyBook, Dubsado, Bonsai, Plutio, Indy
- SOP 04: Pricing Research — competitor tiers, price hike signals, WTP
- SOP 05: Positioning Research — competitor hero copy, gaps, underserved angles
- SOP 06: Marketing Channels — where freelancers gather, content themes
- SOP 07: MVP Scoping — minimal product concepts ranked by viability

---

# 4. Market Research Summary

## Target Market
Independent freelancers (designers, developers, copywriters, video editors, consultants) managing 2–15 active clients at a time. Primarily solo operators or micro-teams of 1–3 people.

## Market Size
- Global freelance management software market: $4.16B in 2025 → projected $9.24B by 2030 (CAGR ~17%)
- Over 1.5 billion freelancers globally; 64M in the US alone
- Growing fast — remote work normalization is accelerating freelance adoption

## Customer Segments
1. **Solo creative freelancers** — designers, illustrators, photographers ($500–$5k/project)
2. **Solo developers / technical freelancers** — web devs, app devs ($2k–$20k/project)
3. **Solo consultants / coaches** — business, marketing, HR ($1k–$10k/engagement)
4. **Small agencies (2–5 people)** — managing multiple clients simultaneously

## Existing Alternatives
| Tool | Price/mo | Target | Model |
|------|----------|--------|-------|
| HoneyBook | $36–$66 | Creative freelancers | All-in-one CRM |
| Dubsado | $25–$50 | Creatives / coaches | CRM + workflows |
| Bonsai | $25–$79 | Freelancers / small teams | All-in-one |
| Plutio | $19 | Freelancers / agencies | Project + portal |
| Indy | $12 | Solo freelancers | Lightweight suite |
| ManyRequests | $99 | Agencies | Client portal |
| 17hats | $45 | Photographers / creatives | CRM |

## Key Market Observations
- HoneyBook raised prices 89% in February 2025 (from $19 → $36/mo), triggering mass user exodus
- Search volume for "HoneyBook alternatives" surged in early 2025 and remains high
- Most tools try to be all-in-one CRMs — heavy onboarding, steep learning curves
- No tool has a clear "send one link" simplicity story
- The sub-$15/mo space is nearly empty for a clean, modern client portal

---

# 5. Pain Points

## Pain Point 1: Payment delays are systemic and costly
- **Description**: 65% of freelancers wait over 30 days for payment. 19% have at least one unpaid invoice at any time. Average time chasing late payments: 102 hours/year.
- **Who**: All freelancer types, especially those without automated reminders or clear payment workflows
- **Source**: Jobbers 2026 Global Freelance Payment Delay Report (22,847 transactions, 62 countries)
- **Severity**: HIGH
- **Opportunity**: HIGH — automated payment reminders and clear invoice visibility in a client portal directly reduces this

## Pain Point 2: Scope creep is chronic and unpunished
- **Description**: 49% of freelance projects expand beyond original terms. Clients ask for "one more thing" because nothing is written down in a place both parties actively reference.
- **Who**: All freelancers, especially designers and developers where deliverables are subjective
- **Source**: Plutio scope creep research, Reddit r/freelance recurring threads, Bonsai blog
- **Severity**: HIGH
- **Opportunity**: HIGH — a shared portal where both client and freelancer see the agreed scope creates natural accountability

## Pain Point 3: HoneyBook's 89% price hike left users without a home
- **Description**: HoneyBook raised Starter from $19 → $36/mo in Feb 2025. Thousands of users actively searching for alternatives. Search volume for "HoneyBook alternatives" remains elevated.
- **Who**: Budget-conscious solo freelancers who were on HoneyBook's entry tier
- **Source**: AgencyHandy pricing analysis, multiple 2025 comparison articles
- **Severity**: MEDIUM-HIGH (primarily a timing opportunity)
- **Opportunity**: VERY HIGH — there is active, ready-to-switch demand right now

## Pain Point 4: Tools are over-engineered for solo operators
- **Description**: HoneyBook, Dubsado, and Bonsai require 5–10 hours of setup before sending a single client link. Freelancers want to be set up in 10 minutes.
- **Who**: New freelancers, part-time freelancers, freelancers switching tools
- **Source**: Reddit r/freelance, HoneyBook reviews on Trustpilot, comparison blogs
- **Severity**: MEDIUM
- **Opportunity**: HIGH — a "set up in 10 minutes" story is unoccupied positioning

## Pain Point 5: Client communication is scattered across too many apps
- **Description**: Files in Google Drive, messages in email, feedback in Slack, invoices in another tool. Clients are confused; freelancers waste time hunting for things.
- **Who**: Freelancers managing 3+ concurrent clients
- **Source**: Reddit thread survey (3,200 freelancers), DEV Community analysis
- **Severity**: MEDIUM
- **Opportunity**: MEDIUM-HIGH — one link that has everything is genuinely unsolved at a simple/cheap tier

---

# 6. Pricing Insights

## Common Pricing Models
- Monthly subscription (dominant — used by all major competitors)
- Annual discount (typically 20–30% off)
- Per-seat add-ons (HoneyBook, Bonsai for teams)
- Transaction fees on payments (HoneyBook charges these; a competitive differentiator to avoid them)

## Typical Price Ranges
| Tier | Price Range | Tools |
|------|-------------|-------|
| Budget | $9–$19/mo | Indy ($12), Plutio ($19) |
| Mid | $20–$36/mo | Bonsai ($25), HoneyBook Starter ($36) |
| Full-suite | $40–$79/mo | Dubsado ($50), HoneyBook Premium ($66) |
| Agency | $99+/mo | ManyRequests ($99+) |

## Key Pricing Observations
- The $9–$15/mo slot is nearly empty for a modern, clean client portal
- Indy ($12) is the closest but has mixed reviews and lacks polish
- No transaction fees is a strong differentiator — HoneyBook charges them; freelancers hate them
- AppSumo lifetime deals in this space have sold 500–3,000 units at $49–$69 (strong early revenue signal)

## Suggested Initial Pricing
- **Free tier**: 1 active client, basic portal (no payment processing) — for lead capture
- **Solo**: $9/mo — up to 10 clients, file sharing, feedback, invoices, payment reminders
- **Pro**: $19/mo — unlimited clients, custom branding, contract e-sign, auto-reminders
- Launch with AppSumo lifetime deal at $49 for early traction and testimonials

---

# 7. Positioning Ideas

## Angle 1: "The One-Link Client Portal"
- **Target user**: Solo freelancers tired of juggling tools
- **Core promise**: Send clients one link. They see everything. You stop chasing.
- **Why it may work**: Simple, memorable, solves the #1 daily frustration
- **Risk**: Broad positioning — could attract users who then want more features

## Angle 2: "The HoneyBook Alternative That Costs Less"
- **Target user**: Freelancers actively fleeing HoneyBook's price hike
- **Core promise**: Everything HoneyBook does for $9/mo. No setup. No surprises.
- **Why it may work**: Existing high-intent search volume for "HoneyBook alternatives" — you rank for that traffic
- **Risk**: Comparative positioning invites feature comparison; make sure core features match

## Angle 3: "Built for Freelancers Who Just Want to Get Paid"
- **Target user**: Freelancers losing 100+ hours/year chasing payments
- **Core promise**: Automated reminders, clear invoicing, client-facing payment status — stop the awkward follow-up emails
- **Why it may work**: Payment pain is the highest-severity, most quantifiable problem
- **Risk**: Overlaps with Bonsai and Indy — needs differentiation on simplicity or price

## Angle 4: "The Client Portal That Stops Scope Creep"
- **Target user**: Designers and developers with repeat scope creep problems
- **Core promise**: Both you and your client see exactly what was agreed. No more "I thought this was included."
- **Why it may work**: Niche problem with high emotional resonance; underserved in marketing language
- **Risk**: Smaller addressable audience than general portal positioning

## Angle 5: "Ready in 10 Minutes, Not 10 Hours"
- **Target user**: New freelancers or those switching from over-engineered tools
- **Core promise**: Onboard in 10 minutes. Send your first client link today.
- **Why it may work**: Setup friction is a real reason people abandon HoneyBook/Dubsado
- **Risk**: Simplicity story can signal "limited features" to power users

---

# 8. Marketing Insights

## Best Acquisition Channels

### SEO (Long-term, high ROI)
- Target: "HoneyBook alternatives", "Dubsado alternatives", "client portal for freelancers", "simple freelancer invoicing"
- These terms have confirmed search volume and commercial intent
- Write comparison posts: "HoneyBook vs [YourTool]", "Best client portals for designers 2026"

### Reddit (Immediate, free)
- r/freelance (500k+ members), r/webdev, r/graphic_design, r/copywriting, r/socialmediamarketing
- Don't spam — participate genuinely, then share your tool when relevant
- Post a "Show HN" / "Show Reddit: I built this after 5 years of freelancing" style post

### Twitter/X Build-in-Public
- Document the build journey weekly
- Freelancer/indie hacker community actively engages with this content
- Target: #buildinpublic, #freelance, #indiehacker

### ProductHunt Launch
- Strong for initial spike, social proof, and backlinks
- Target a Tuesday launch for maximum visibility
- Build an email waitlist before launching (aim for 200+ before PH day)

### YouTube
- Tutorial content: "How I manage clients as a freelancer", "Best tools for freelancers 2026"
- Partner with small freelance YouTubers for honest reviews

### AppSumo
- Lifetime deal ($49–$69) for early revenue and user feedback
- 500–2,000 sales is realistic; provides $25k–$100k upfront + strong testimonials

## Where the Audience Gathers
- r/freelance, r/webdev, r/graphic_design (Reddit)
- Facebook groups: "Freelance Heroes", "Freelance Designers", niche skill groups
- Twitter/X freelance community
- YouTube freelance channels (Roberto Blake, Mike Locke, etc.)
- Newsletters: Freelancer's Union, The Freelance Files

## Messaging Themes That Resonate
- "Stop chasing clients" (payment + communication)
- "No setup nightmare" (simplicity)
- "Your clients will actually use it" (client UX matters)
- "Cheaper than [big name]" (direct pricing comparison)
- "Built by a freelancer, for freelancers" (authenticity)

---

# 9. Minimal Product Ideas

## MVP 1: "The One-Link Portal" (Recommended)
- **What it does**: Freelancer creates a project → gets a shareable link → client sees: project status, deliverables, files, feedback thread, invoice with pay button
- **Who it's for**: Solo freelancers managing 1–10 clients
- **Why minimal**: No CRM, no lead management, no contracts — just the active project view
- **Pain point solved**: Scattered communication, client confusion, missing context
- **Monetization**: Free (1 client) → $9/mo (unlimited) → launch AppSumo deal at $49

## MVP 2: "Payment Reminder Machine"
- **What it does**: Freelancer creates an invoice → client gets a link → automated email reminders at 7, 14, 30 days → escalating message tone
- **Who it's for**: Freelancers losing 100+ hours/year chasing payments
- **Why minimal**: Just invoicing + automated reminders. No portal, no file sharing.
- **Pain point solved**: Payment delays, awkward follow-up emails
- **Monetization**: $9/mo flat or 0.5% transaction fee (no flat fee — competitive)

## MVP 3: "Scope Lock"
- **What it does**: Freelancer defines deliverables in a simple checklist → client signs off on it → both parties can see what's in scope vs. out of scope at any time → change requests require client approval
- **Who it's for**: Designers and developers with chronic scope creep
- **Why minimal**: No invoicing, no portal — just a scope document with e-signature and change request flow
- **Pain point solved**: Scope creep, "I thought this was included" disputes
- **Monetization**: $12/mo or $49 AppSumo lifetime deal

## MVP 4: "HoneyBook Escape Kit"
- **What it does**: Importer that pulls HoneyBook/Dubsado data (clients, projects, invoice history) → migrates it to a simpler, cheaper tool
- **Who it's for**: HoneyBook refugees post-price hike
- **Why minimal**: Migration wizard + the minimal portal they land in is the product
- **Pain point solved**: Switching friction is the #1 barrier to HoneyBook abandonment
- **Monetization**: Free migration → $9/mo ongoing

## MVP 5: "Weekly Client Digest"
- **What it does**: Freelancer logs 3 bullet points each Friday (what was done, what's next, any blockers) → client gets a branded email digest automatically
- **Who it's for**: Consultants and developers who lose clients to "I had no idea what was happening"
- **Why minimal**: Just a structured weekly update with a branded template — nothing else
- **Pain point solved**: Client anxiety, trust, communication overhead
- **Monetization**: $7/mo per client or $19/mo unlimited clients

---

# 10. Best Opportunity

## Recommended Direction: MVP 1 — "The One-Link Portal" at $9/mo

### Why It Stands Out
1. **Clearest pain**: Communication scatter and client confusion are universal across all freelancer types — not niche
2. **Best timing**: HoneyBook's 89% price hike created a ready-to-switch audience actively searching for alternatives right now — this window is live
3. **Simplest MVP**: A shared project page is technically a static-ish web page with auth, file uploads, a comment thread, and Stripe integration — buildable in 4–6 weeks solo
4. **Pricing gap is real**: The $9/mo slot for a modern, clean portal is genuinely empty
5. **Strongest SEO play**: "HoneyBook alternatives 2026" has confirmed search intent and existing article traffic you can compete with

### Clearest Pain Point
> "65% of freelancers wait over 30 days for payment. The average freelancer spends 102 hours/year chasing late payments. The client doesn't pay late because they're malicious — they pay late because there's no persistent, visible invoice in front of them."

### Best Positioning
> "The one-link client portal. $9/mo. Ready in 10 minutes."

### Simplest MVP Path
1. Landing page + waitlist (Week 1)
2. Build: project creation, shareable client link, file upload, comment thread, invoice + Stripe (Weeks 2–6)
3. Beta with 10 real freelancers (Week 7–8)
4. Public launch on ProductHunt + Reddit (Week 9)
5. AppSumo pitch (Week 10+)

---

# 11. Next Actions

1. **Validate demand this week** — Post in r/freelance: "I'm building a simple client portal for $9/mo. What's the one thing your current tool gets wrong?" Collect 20+ responses before writing a line of code.

2. **Launch a landing page in 48 hours** — Use Carrd or Framer. Headline: "The client portal freelancers actually use." Email capture + waitlist. Goal: 100 signups before building.

3. **Study the top 3 HoneyBook alternative articles** — Find what keywords they rank for. These are your SEO targets. Write one comparison post: "HoneyBook vs [YourTool Name]: Why I Switched."

4. **Build the core loop in 4 weeks** — Project creation → shareable client link → file upload → comment thread → invoice → Stripe payment. Nothing else. Ship that.

5. **Get 5 paying beta users at $9/mo before launching publicly** — Do manual onboarding calls. Listen. Fix the top 3 complaints. Then go wide.

---

## 12. Product Requirements Document (PRD)

### Product Name

**PortalKit** *(working title — "The One-Link Client Portal for Freelancers")*

### Version

v1.0 — MVP

### Document Owner

Founder / Solo Developer

### Last Updated

March 2026

---

## 12.1 Problem Statement

Freelancers manage active client projects across 4–6 disconnected tools simultaneously — email for updates, Google Drive for files, Slack for chat, separate invoicing software for payments. Clients are confused about project status. Freelancers waste 100+ hours/year chasing late payments and repeating context. Existing tools (HoneyBook, Dubsado, Bonsai) solve this but cost $25–$66/mo and require 5–10 hours of setup. The $9–$15/mo slot for a clean, modern, opinionated client portal is empty.

---

## 12.2 Goal

Build the simplest possible client portal that a freelancer can set up in under 10 minutes and share with a client via one link — containing everything the client needs and nothing they don't.

---

## 12.3 Target Users

### Primary: Solo Freelancer (Payer)

- Designers, developers, copywriters, video editors, consultants
- Managing 2–10 active clients at any time
- Currently using email + Drive + Stripe/PayPal in combination
- Pain: scattered communication, late payments, scope creep
- Willingness to pay: $9–$19/mo confirmed by market

### Secondary: Freelancer's Client (Free User)

- SMB owners, startup founders, marketing managers
- Receives a link, does not create an account by default
- Pain: no single place to see what's happening on a project
- Does not pay — but their ease of use is critical to product retention

---

## 12.4 Success Metrics (MVP)

| Metric | Target (Week 12) |
|--------|-----------------|
| Paying users | 50 |
| MRR | $450 |
| Avg. projects per user | 3+ |
| Client link open rate | >70% |
| Churn (monthly) | <10% |
| Setup time (P50) | <10 minutes |
| NPS | >40 |

---

## 12.5 Scope — What's In MVP (v1.0)

### Must Have (Launch Blockers)

- [ ] Freelancer account creation (email + password)
- [ ] Create a project (name, description, start date, status)
- [ ] Generate a unique shareable client link per project (no client login required)
- [ ] Project status indicator (In Progress / Review / Complete)
- [ ] File upload — freelancer uploads deliverables (up to 500MB per project)
- [ ] Comment thread — both freelancer and client can leave messages on the project page
- [ ] Invoice creation — line items, amount, due date
- [ ] Payment via Stripe (client clicks "Pay Now" on the portal page)
- [ ] Automated payment reminders — email at Day 1, Day 7, Day 14 after due date
- [ ] Freelancer dashboard — list of all projects and their statuses
- [ ] Email notifications to freelancer when client views the link, leaves a comment, or pays

### Should Have (v1.1 — Post-Launch)

- [ ] Custom branding (logo + color on the client-facing portal page)
- [ ] Contract / scope of work text field with client e-signature (DocuSign-lite)
- [ ] Multiple file versions (upload v1, v2 etc. with labels)
- [ ] Project notes (private, freelancer-only)
- [ ] Partial payment / deposit support
- [ ] Activity log visible to client ("Files uploaded on March 5")

### Won't Have in MVP (Explicitly Out of Scope)

- CRM / lead management
- Proposal builder
- Time tracking
- Scheduling / calendar booking
- Team/multi-user collaboration
- Mobile app (responsive web only for v1)
- Integrations (Zapier, Slack, etc.)
- White-label / custom domain (v2)

---

## 12.6 User Stories

### Freelancer Stories

| ID | As a freelancer I want to... | So that... | Priority |
|----|------------------------------|------------|----------|
| F1 | Create a project and get a shareable link in under 5 minutes | I can send it to the client today | P0 |
| F2 | Upload deliverable files to the project page | My client always has the latest version | P0 |
| F3 | Create an invoice and have it visible on the client portal | The client can pay without me sending a separate email | P0 |
| F4 | Receive automated payment reminders sent to my client | I stop writing awkward follow-up emails | P0 |
| F5 | See when my client viewed the portal link | I know if they've seen my work | P1 |
| F6 | Get an email when a client comments or pays | I don't need to check the dashboard constantly | P0 |
| F7 | See all my projects and their statuses in one dashboard | I have a quick overview of my workload | P0 |
| F8 | Add custom branding (logo/color) to the portal | My client sees a professional experience | P1 |
| F9 | Add a scope-of-work text that both parties can see | I have proof of what was agreed | P1 |

### Client Stories

| ID | As a client I want to... | So that... | Priority |
|----|--------------------------|------------|----------|
| C1 | Open a link and immediately see what's happening on my project | I don't need to email to ask for status | P0 |
| C2 | Download files directly from the portal | I don't need to search my email for attachments | P0 |
| C3 | Leave a comment or feedback directly on the portal | My feedback is in one place | P0 |
| C4 | Pay an invoice with a card via the portal | I can pay immediately without receiving a separate invoice | P0 |
| C5 | See what I've already paid and what's outstanding | I have a clear financial record | P1 |

---

## 12.7 Functional Requirements

### Authentication

- Email + password signup for freelancers
- No mandatory signup for clients (access via unique token-based link)
- Optional: client enters their name/email before accessing portal (for notification purposes)
- Password reset via email

### Project Management

- Freelancer creates projects with: name, client name, client email (optional), description, start date, status
- Status options: Not Started / In Progress / In Review / Complete
- Projects listed in dashboard sorted by last updated
- Archive/hide completed projects

### Shareable Client Link

- Each project gets a unique URL: `app.portalkit.io/p/[unique-token]`
- Link is permanent unless freelancer regenerates it
- No expiry by default
- Optional password protection on the link (v1.1)
- Freelancer can see view count and last viewed timestamp

### File Management

- Freelancer uploads files (any type, max 100MB per file, 500MB per project on Solo plan)
- Files listed with name, upload date, file size
- Client can download but not upload (v1.0)
- File versioning label field (e.g., "Final v2") — text label only, not automated versioning

### Messaging / Comments

- Threaded comment section on each project page
- Both freelancer and client can post
- Client identified by name they enter (or "Client" if anonymous)
- Freelancer receives email notification on new client comment
- Client receives email notification on new freelancer comment (if email provided)
- No real-time chat — async only

### Invoicing

- Freelancer creates invoice within a project
- Line items: description + amount
- Total auto-calculated
- Due date field
- Currency selection (USD, GBP, EUR, AUD — v1.0)
- Invoice visible on client portal with "Pay Now" button
- Stripe Checkout integration for payment
- Invoice status: Unpaid / Partially Paid / Paid
- Payment confirmation email to both freelancer and client

### Payment Reminders

- Automatic email reminders when invoice is unpaid:
  - Day 1 after due date: friendly reminder
  - Day 7: follow-up
  - Day 14: firm reminder
- Freelancer can disable reminders per invoice
- Reminder emails are sent from the product domain (branded, not spam-looking)

### Notifications (Freelancer)

- Email when client views portal for the first time
- Email when client leaves a comment
- Email when client pays invoice
- In-app notification badge on dashboard

---

## 12.8 Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Portal page load < 2 seconds on 4G |
| Uptime | 99.5% monthly uptime target |
| Security | HTTPS everywhere, Stripe for all payments (no card data stored), unique non-guessable link tokens |
| Data | File storage via S3 or Cloudflare R2 |
| Scalability | Must support 1,000 concurrent projects without degradation |
| Accessibility | WCAG 2.1 AA for client-facing portal (clients may not be technical) |
| Mobile | Responsive web — client portal must be fully usable on mobile |
| Email | Transactional email via Resend or Postmark |

---

## 12.9 Technical Architecture (Suggested)

### Stack Recommendation (Solo Founder, Fast Shipping)

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | Next.js (App Router) | Fast, SEO-friendly, easy deployment |
| Styling | Tailwind CSS + shadcn/ui | Pre-built components, consistent design fast |
| Backend | Next.js API Routes or tRPC | Keep it one repo, no separate backend to manage |
| Database | PostgreSQL via Supabase | Managed DB, auth included, generous free tier |
| Auth | Supabase Auth | Email/password + magic link out of the box |
| File Storage | Supabase Storage or Cloudflare R2 | Cheap, S3-compatible |
| Payments | Stripe Checkout | Standard, well-documented, handles invoicing |
| Email | Resend + React Email | Simple API, beautiful templates in React |
| Deployment | Vercel | Zero-config Next.js deployment |
| Analytics | Plausible or Posthog (free tier) | Privacy-friendly, easy |

### Data Models (Core)

```text
User (Freelancer)
  id, email, name, avatar_url, stripe_account_id,
  plan (free | solo | pro), created_at

Project
  id, user_id (FK), client_name, client_email,
  title, description, status, portal_token (unique),
  portal_password (nullable), created_at, updated_at

File
  id, project_id (FK), name, url, size_bytes,
  label, uploaded_by (freelancer | client), created_at

Comment
  id, project_id (FK), author_name, author_type (freelancer | client),
  body, created_at

Invoice
  id, project_id (FK), line_items (JSON), total,
  currency, due_date, status (unpaid | paid | partial),
  stripe_payment_intent_id, created_at, paid_at

Payment
  id, invoice_id (FK), amount, stripe_charge_id, created_at
```

---

## 12.10 UX & Design Principles

1. **Client portal is read-mostly** — client should never feel lost. Status and files front and centre.
2. **Zero onboarding for clients** — open the link, see the project. No signup wall.
3. **Freelancer dashboard is a list** — not a Kanban board, not a calendar. A simple list with status badges.
4. **One action per page** — don't show 7 buttons. Guide the user to the most important next action.
5. **Mobile-first for client portal** — clients often open links on their phone.
6. **Speed over features** — a blank state that loads fast beats a feature-rich page that loads slow.

### Key Screens

| Screen | Who Sees It | Purpose |
|--------|-------------|---------|
| `/dashboard` | Freelancer | All projects list + status |
| `/projects/new` | Freelancer | Create new project |
| `/projects/[id]` | Freelancer | Manage project, files, invoice, comments |
| `/p/[token]` | Client | The shareable portal — status, files, comments, invoice |
| `/settings` | Freelancer | Profile, branding, billing |
| `/login` `/signup` | Freelancer | Auth |

---

## 12.11 Pricing & Plans (MVP)

| Plan | Price  | Limits                             | Features                                                                          |
|------|--------|------------------------------------|-----------------------------------------------------------------------------------|
| Free | $0/mo  | 1 active project, 100MB storage    | Portal link, files, comments, 1 invoice                                           |
| Solo | $9/mo  | Unlimited projects, 5GB storage    | All Free + payment reminders, invoice history, email notifications                |
| Pro  | $19/mo | Unlimited projects, 20GB storage   | All Solo + custom branding (logo + color), contract/scope field, e-signature      |

- **No transaction fees** on payments (Stripe's standard 2.9% + 30¢ applies but no platform cut)
- Annual billing: 2 months free (Solo = $81/yr, Pro = $162/yr)
- AppSumo LTD at launch: $49 = Solo plan lifetime

---

## 12.12 Go-To-Market Plan

### Phase 1: Pre-Launch (Weeks 1–2)

- Launch landing page (Carrd or Framer): headline, 3 pain points, email capture
- Post in r/freelance, r/webdev, r/graphic_design for pain point validation
- Goal: 100 email waitlist signups

### Phase 2: Beta (Weeks 3–8)

- Build MVP (see scope above)
- Onboard 10 beta users manually — free access, weekly feedback calls
- Fix top 3 complaints before public launch

### Phase 3: Public Launch (Week 9–10)

- ProductHunt launch (Tuesday)
- Reddit "I built this" posts in r/freelance, r/SaaS, r/webdev
- Twitter/X build-in-public thread recap
- Goal: 50 paying users, $450 MRR

### Phase 4: Growth (Weeks 11–16)

- Publish SEO comparison posts: "Best HoneyBook Alternatives 2026", "Dubsado vs PortalKit"
- Pitch AppSumo (LTD deal for early revenue injection)
- Add custom branding feature → move Solo users to Pro
- Goal: 200 paying users, $2,000 MRR

---

## 12.13 Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| HoneyBook fixes pricing / users go back | Medium | High | Build retention through simplicity — not just price |
| Competitors copy the "simple portal" angle | High | Medium | Ship fast, build brand, get testimonials early |
| Stripe adds complexity / fees change | Low | Medium | Abstract payment layer — can swap to Paddle or Lemon Squeezy |
| Feature requests push scope beyond MVP | High | High | Maintain a strict "not in v1" list. Ship the simple thing. |
| Low client portal adoption (clients ignore the link) | Medium | High | Make the portal page genuinely useful on first open — files + invoice front and centre |
| SEO takes too long to generate traffic | Medium | Medium | Reddit + ProductHunt for launch spike while SEO builds |

---

## 12.14 Open Questions (Decide Before Building)

1. **Client auth or no?** — Should clients be required to create an account, or is a token-based magic link enough for v1? (Recommendation: no auth for v1 — lower friction)
2. **File upload by client?** — Should clients be able to upload files back (e.g., assets, briefs)? (Recommendation: Yes in v1.1 — out of scope for v1.0)
3. **Multi-project per client?** — Should one client link show all their projects, or is it one link per project? (Recommendation: one link per project for v1 — simpler)
4. **Stripe Connect or Stripe Standard?** — Stripe Connect needed if platform holds funds. Standard + direct Stripe account per freelancer is simpler. (Recommendation: Standard — freelancer connects their own Stripe account)
5. **Domain strategy** — Subdomain (`app.portalkit.io`) or path-based (`portalkit.io/app`)? (Recommendation: subdomain — cleaner separation)
