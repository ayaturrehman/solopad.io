# SoloPad SEO Audit & Content Plan — August 2026

## 1. Where the site actually stands

- **Organic traffic: 0. Organic keywords ranking: 0. Domain Authority: 4.** solopad.io is not yet visible to Google in any meaningful way — this is a from-zero build, not a rank-the-existing-traffic situation.
- 32 backlinks from 9 referring domains.
- Site audit health score: 80/100 (23 pages crawled).

**Reality check vs. the competitors you're up against:**

| Domain | Domain Authority | Monthly organic traffic | Ranking keywords | Backlinks |
| --- | --- | --- | --- | --- |
| solopad.io | 4 | 0 | 0 | 32 |
| HoneyBook | 60 | ~15,400 | ~7,300 | 1,270,206 |
| Bonsai | 53 | ~29,000 | ~31,800 | 176,346 |
| Dubsado | 46 | ~5,300 | ~163 | 117,611 |

You will not out-rank these on head terms ("freelance invoicing software," "best freelance CRM") for a long time. The path in is long-tail, low-competition, high-intent keywords, published consistently, for months. Bonsai's single biggest traffic driver is a blog post about writing polite reminder emails — nothing to do with their product directly. That's the model: be genuinely useful on searches your competitors haven't bothered to target.

## 2. SEO mistakes found and fixed today

| Issue | Impact | Status |
| --- | --- | --- |
| `/compare` hub page returned 404, breaking 5 internal links from every comparison page | High — broken navigation, wasted link equity | **Fixed** — built `/compare` index page linking to all 5 comparisons |
| Homepage `<title>` was 78 characters (Google truncates ~60) | Medium — lost control of SERP snippet | **Fixed** — root cause was a metadata bug: both the root layout and the marketing layout applied the "\| SoloPad" suffix, doubling it. Removed the duplicate and shortened the title |
| 6 blog post titles were 73–78 characters | Medium — same truncation issue across every article | **Fixed** — shortened all `metaTitle` fields to 47–52 characters |
| `/blog` index page had only 43 words of visible text | Medium — thin content, weak topical signal | **Fixed** — added a real 100+ word intro paragraph |
| `/signup` showed 0 words and no H1 to crawlers | High — page was invisible to search engines despite having real content | **Fixed** — the page is a client-rendered form wrapped in `<Suspense>` with no fallback, so crawlers saw a blank shell. Added a fallback with a real H1 and description text |
| `freelance-invoice-template-examples.mdx` exists in the repo (7th article, marked `featured: true`) but isn't live on the crawled site | High — an entire finished article isn't indexed | **Not a code issue** — this is a deploy gap. The article will appear automatically once the site is rebuilt/redeployed, since it's already wired into the blog index and featured slot |

**Action needed from you:** trigger a redeploy so the orphan article goes live, and confirm Google Search Console is verified with the sitemap submitted. Ubersuggest's data shows no GA/GSC connection on this domain — if that's accurate, Google has no fast path to discover new pages, which matters a lot for a site starting at zero.

## 3. Content strategy: why "better than competitors" isn't the right target yet

At DA 4, competing head-on for what HoneyBook, Bonsai, and Dubsado already rank for is a waste of a new article. The realistic strategy for the next 3-6 months:

1. **Target long-tail, low-competition (SEO difficulty under ~35), commercial-intent keywords** tied directly to SoloPad's actual features (invoicing, contracts, proposals, time tracking, CRM, scheduling, client portal).
2. **Publish consistently.** Google needs a pattern of fresh, indexed content before it trusts a new domain. Daily is aggressive but works if quality doesn't drop — thin daily posts will hurt more than help.
3. **Interlink every new article** to the existing 7 posts and relevant `/compare` pages. This is free authority-sharing across your own content and costs nothing.
4. **Revisit the "adjacent, high-volume, low-competition" play** once the core freelance-tool cluster is covered — Bonsai's reminder-email post proves informational content two steps removed from your product can still be your biggest traffic source.

## 4. Content calendar — next 14 days

All keyword data pulled directly from Ubersuggest (US, English) on 2026-08-11. SD = SEO Difficulty (0-100, lower is easier).

| Day | Target keyword | Volume | SD | Intent | Working title |
| --- | --- | --- | --- | --- | --- |
| 1 (published today) | freelance time tracking software | 210 | 6 | Commercial | Freelance Time Tracking Software — Honest Guide |
| 2 | freelance contract template free | 110 | 37 | Transactional | The Free Freelance Contract Template Trap (And What to Check Before You Use One) |
| 3 | freelance proposal template | 140 | 41 | Informational | 5 Freelance Proposal Templates That Actually Get Replies |
| 4 | freelance invoicing software (long-tail angle) | 480 | 38 | Commercial | Freelance Invoicing Software: What I Wish I Knew Before Switching Tools |
| 5 | how to price freelance work *(validate volume before writing)* | — | — | Informational | How I Price Freelance Projects Without Underselling Myself |
| 6 | freelance client onboarding checklist | — | 4 | Informational | The Freelance Client Onboarding Checklist I Use for Every New Project |
| 7 | freelance late payment / chasing invoices *(validate volume)* | — | — | Informational | What I Actually Say When a Client Pays Late |
| 8 | freelance CRM for solo freelancers *(validate volume)* | — | — | Commercial | Do Solo Freelancers Actually Need a CRM? |
| 9 | freelance scheduling software | 40 | 24 | Commercial | Freelance Scheduling Software: Calendly vs. Built-In Booking Tools |
| 10 | client portal for freelancers | 10 | 28 | Commercial | What a Client Portal Actually Does (And Why I Stopped Emailing PDFs) |
| 11 | freelance retainer agreement *(validate volume)* | — | — | Informational | How to Structure a Freelance Retainer So Clients Don't Cancel Early |
| 12 | freelance rate calculator *(validate volume — likely decent)* | — | — | Transactional | How I Actually Calculate My Freelance Hourly Rate |
| 13 | freelance tax deductions UK/US *(validate + pick region)* | — | — | Informational | Freelance Tax Deductions Freelancers Forget to Claim |
| 14 | recurring invoices for freelancers *(validate volume)* | — | — | Commercial | Recurring Invoices: Setting Up Retainers So You Stop Manually Billing |

Rows marked "validate volume" need a quick `keyword_overview` check the morning they're written — I prioritized topics by product relevance and low expected competition, but didn't burn API calls validating every single one today. Confirm before publishing if it changes the target keyword meaningfully.

## 7. Expanding to "everything freelance" — a topical map, not just a tool blog

Broadening past tools/software is the right call at DA 4. Bonsai's biggest post isn't about their product — it's a generic email-writing guide. A blog that only covers invoicing and contracts caps out fast; a blog that covers the whole freelance life gives Google (and readers) far more surface area to find you on. But "everything freelance" needs structure or it turns into random posts with no internal linking logic. Here's the pillar map, each backed by real Ubersuggest volume/SD data pulled today (US, English).

### Pillar A — Getting Started / Freelance Careers by niche
The single biggest volume opportunity found today. Freelance writing alone has search demand in the tens of thousands — most of it too competitive for a DA-4 site, but several sub-niches are wide open.

| Keyword | Volume | SD | Notes |
| --- | --- | --- | --- |
| freelance writing jobs working from home | 4,400 | **7** | Best find of the whole research pass — real volume, near-zero difficulty |
| freelance writing job board | 390 | **6** | Same pattern, smaller |
| how to become a freelancer writer | 1,300 | 16 | Low difficulty, high volume |
| freelance writing platform | 22,200 | 19 | Huge volume, still gettable |
| freelance writing remote job | 2,900 | 14 | |
| freelance writing upwork | 3,600 | 15 | |
| freelance writing side hustle | 22,200 | 28 | Big prize, harder |
| how to become a freelancer | 720 | 38 | Good pillar/cornerstone piece — links out to every niche sub-page |
| freelance jobs for beginners online | 720 | 26 | |
| freelance web developer | 1,600 | 46 | Harder — save for later once domain authority builds |
| digital freelance marketing | 3,600 | 29 | |

### Pillar B — Money: rates, pricing, taxes
Ties directly to SoloPad's invoicing/proposals angle, so these convert as well as they rank.

| Keyword | Volume | SD | Notes |
| --- | --- | --- | --- |
| freelance rates graphic design | 390 | **9** | Near-zero difficulty |
| self employed vs freelance | 590 | 23 | Informational, feeds business-setup content |
| freelance taxes calculator | 590 | 25 | |
| calculating freelance rates | 390 | 33 | |
| freelance taxes | 1,000 | 43 | Cornerstone piece, harder — link out to region-specific sub-pages |
| calculate freelance taxes | 1,000 | 54 | |

### Pillar C — Finding clients & platforms
Lower volume across the board today, but "best freelance platforms" is a solid commercial-intent anchor that every freelancer eventually searches, and it links naturally to your `/compare` pages.

| Keyword | Volume | SD | Notes |
| --- | --- | --- | --- |
| best freelance platforms | 720 | 27 | |
| freelance jobs for beginners | 320 | 26 | |

### Pillar D — Tools & Software (existing focus, now a sub-pillar not the whole blog)
Everything from the original 14-day calendar (time tracking, scheduling, client portals, CRM) lives here. Keep publishing these — they're the highest-converting content since they're one click from a signup — just don't make them the *only* thing on the blog anymore.

### Pillar E — Freelance business operations (contracts, invoicing, onboarding)
Already your strongest existing cluster (proposals, contracts, invoice templates). Keep extending it — onboarding checklists, retainer structures, late payment handling — from the original calendar above.

### What I'd deprioritize
Freelance burnout / work-life balance searches returned effectively zero measurable volume today. Worth a post eventually for reader trust and shareability, but not a keyword play — don't schedule it as a priority.

### Recommended blog taxonomy update
The `category` field in each post's frontmatter is a free string — no code change needed to add categories. Recommend expanding beyond the current "Guides" and "Comparisons" to: **Getting Started**, **Money**, **Client Acquisition**, **Tools**, **Business Ops**. This also sets up pillar pages later (e.g., "Freelance Writing: The Complete Guide" linking out to every writing sub-article) once each category has 4-5 posts.

### Next 10 articles, reprioritized with this data (highest opportunity first)
1. Freelance Writing Jobs Working From Home — What's Actually Legit (4,400 vol, SD 7)
2. How to Become a Freelance Writer With No Experience (1,300 vol, SD 16)
3. Freelance Rates for Graphic Designers: What to Actually Charge (390 vol, SD 9)
4. The Best Freelance Job Boards, Ranked by What They Actually Pay (390 vol, SD 6)
5. Self-Employed vs. Freelancer: What's the Actual Difference? (590 vol, SD 23)
6. Freelance Writing Jobs on Upwork: Is It Worth It in 2026? (3,600 vol, SD 15)
7. Best Freelance Platforms Compared: Upwork, Fiverr, and the Rest (720 vol, SD 27)
8. How to Become a Freelancer: The Complete Starting Guide (720 vol, SD 38 — cornerstone piece, links to every niche article above)
9. Freelance Tax Calculator: How Much to Set Aside Each Month (590 vol, SD 25)
10. Remote Freelance Writing Jobs: Where to Actually Find Them (2,900 vol, SD 14)

## 5. Today's article

Published: `content/blog/freelance-time-tracking-software.mdx`
Target keyword: "freelance time tracking software" (210 vol/mo, SD 6 — very low competition, $25 CPC commercial intent)
Format matches existing site voice: first-person, tested-not-theoretical, comparison table (Toggl, Clockify, Harvest, Bonsai, SoloPad), FAQ schema for rich results, internal links ready to add once more posts publish.

## 6. Recommended next steps

1. Redeploy the site so today's fixes and the orphan invoice-template article go live.
2. Verify Google Search Console, submit the sitemap, and request indexing for all 8 live blog posts.
3. Keep the daily cadence — I can draft and commit one MDX article per day directly into `content/blog/`. Say the word and I'll set this up as a recurring scheduled task so it runs automatically each morning.
4. Revisit rankings in 30 days. At DA 4 with zero backlinks, expect slow movement — the first real signal will be Search Console impressions on long-tail terms, not page-one rankings.
