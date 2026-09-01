# Site Design — Product-Style Portfolio

> Vansh Gupta's portfolio restructured as a tech-company product site.
> Design references: Linear, Vercel, Raycast, Resend.

---

## Site Map

```
vanshgupta.dev/
├── /                     ← Landing page (hero + highlights)
├── /projects             ← Product grid (all projects)
├── /projects/[slug]      ← Individual project page (like a product feature page)
├── /changelog            ← Release-style activity feed
├── /about                ← Story, experience timeline, stack
└── /contact              ← Connect page
```

---

## Page-by-Page Design

### 1. Landing Page (`/`)

The homepage of a product company — bold statement, proof points, then a taste of everything.

```
┌─────────────────────────────────────────────────────────┐
│  NAV:  VG®    Projects  Changelog  About  Contact       │
│  (sticky, blurs on scroll, minimal)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HERO                                                   │
│  ┌───────────────────────────────────────────────┐      │
│  │  Small mono tag: "Backend & Systems Engineer" │      │
│  │                                               │      │
│  │  I build systems                              │      │
│  │  that stay up when                            │      │
│  │  things break.                                │      │
│  │                                               │      │
│  │  [View Projects →]   [Changelog →]            │      │
│  │                                               │      │
│  │  3D SCENE: ambient floating geometry          │      │
│  │  (wireframe nodes + connection lines,         │      │
│  │   reacting to mouse, dark + cyan glow)        │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
│  MARQUEE TICKER (same as current — keywords scroll)     │
│                                                         │
│  FEATURED PROJECTS (3 cards, product-style)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 3D thumb │  │ 3D thumb │  │ 3D thumb │              │
│  │          │  │          │  │          │              │
│  │ Connec-  │  │ Event-   │  │ MCP      │              │
│  │ tors 3.0 │  │ Driven   │  │ Tooling  │              │
│  │          │  │ Replica- │  │          │              │
│  │ Bi-dir   │  │ tion     │  │ LLM-pow- │              │
│  │ sync     │  │          │  │ ered     │              │
│  │          │  │ Aeron→   │  │ internal │              │
│  │ →        │  │ Kafka    │  │ tools    │              │
│  │          │  │ →        │  │ →        │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  Each card links to /projects/[slug]                    │
│                                                         │
│  LATEST FROM CHANGELOG (last 3-5 entries)               │
│  ┌─────────────────────────────────────────────┐        │
│  │  Sep 1  · repo-doc-mcp                      │        │
│  │  "Add webhook handler for branch events"     │        │
│  │                                              │        │
│  │  Aug 30 · pizza-demo                         │        │
│  │  Created repository                          │        │
│  │                                              │        │
│  │  Aug 28 · confluence-mcp                     │        │
│  │  "Add page tree traversal"                   │        │
│  │                                              │        │
│  │  [View full changelog →]                     │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
│  STATS BAR (horizontal, like a metrics dashboard)       │
│  ┌─────────┬──────────┬──────────┬──────────┐           │
│  │ 1600+   │ 2        │ 5M+     │ Expert   │           │
│  │ CF Rat. │ Connectors│ Records │ CF Rank  │           │
│  └─────────┴──────────┴──────────┴──────────┘           │
│                                                         │
│  FOOTER (links, clock, status)                          │
└─────────────────────────────────────────────────────────┘
```

### 2. Projects Page (`/projects`)

Like a product company's "Features" or "Products" page — filterable grid.

```
┌─────────────────────────────────────────────────────────┐
│  NAV                                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PROJECTS                                               │
│  "Things I've shipped."                                 │
│                                                         │
│  FILTER PILLS:  [All]  [Work]  [Personal]  [Experiment] │
│  SORT:          [Recently pushed ▾]                     │
│                                                         │
│  GRID (2-col on desktop, 1-col mobile)                  │
│  ┌─────────────────────┐ ┌─────────────────────┐        │
│  │ ● Connectors 3.0    │ │ ● Event-Driven      │        │
│  │   Smartsheet / 2025  │ │   Replication        │        │
│  │                      │ │   Futures First / 24 │        │
│  │   Bi-directional     │ │                      │        │
│  │   enterprise sync    │ │   Aeron → Kafka +    │        │
│  │   — Dynamics 365 &   │ │   RocksDB replication│        │
│  │   ServiceNow         │ │   layer              │        │
│  │                      │ │                      │        │
│  │   Java · Spring Boot │ │   C++ · Kafka · gRPC │        │
│  │   AWS · MySQL        │ │   RocksDB            │        │
│  │                      │ │                      │        │
│  │   [View project →]   │ │   [View project →]   │        │
│  └─────────────────────┘ └─────────────────────┘        │
│  ┌─────────────────────┐ ┌─────────────────────┐        │
│  │ ● MCP Tooling       │ │ ● Terminal Profile   │        │
│  │   Smartsheet / 2025  │ │   Personal / 2026    │        │
│  │   ...                │ │   ...                │        │
│  └─────────────────────┘ └─────────────────────┘        │
│                                                         │
│  (GitHub repos without overrides show as smaller cards   │
│   below featured ones — auto-populated from API)         │
│                                                         │
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

### 3. Individual Project Page (`/projects/[slug]`)

This is the key differentiator — each project gets a **product-style landing page**.
Like visiting stripe.com/payments or linear.app/features/cycles.

```
┌─────────────────────────────────────────────────────────┐
│  NAV                                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  BREADCRUMB: Projects / Connectors 3.0                  │
│                                                         │
│  ┌───────────────────────────────────────────────┐      │
│  │  HERO                                         │      │
│  │  Tag: "Smartsheet · 2025"                     │      │
│  │                                               │      │
│  │  Connectors 3.0                               │      │
│  │                                               │      │
│  │  Bi-directional enterprise data sync —        │      │
│  │  Dynamics 365 & ServiceNow connectors         │      │
│  │  built on Nango, load-tested to 5M+ records.  │      │
│  │                                               │      │
│  │  [GitHub →]  [Live Demo →]                    │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
│  TECH STACK PILLS                                       │
│  [Java] [Spring Boot] [AWS ECS] [MySQL] [Nango]         │
│                                                         │
│  KEY METRICS (if applicable)                            │
│  ┌──────────┬──────────┬──────────┐                     │
│  │ 5M+      │ 2        │ Bi-dir   │                     │
│  │ records  │ connectors│ sync    │                     │
│  └──────────┴──────────┴──────────┘                     │
│                                                         │
│  WHAT I BUILT (prose section — from project override)   │
│  "I designed and shipped the connector framework..."     │
│                                                         │
│  ARCHITECTURE DIAGRAM (optional — for featured projects)│
│  (could be a static SVG or interactive 3D diagram)      │
│                                                         │
│  RECENT COMMITS (auto-populated from GitHub API)        │
│  ┌─────────────────────────────────────────────┐        │
│  │  abc123 · "Fix token refresh logic" · 2d ago│        │
│  │  def456 · "Add retry backoff" · 5d ago      │        │
│  │  ghi789 · "Initial connector setup" · 2w ago│        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
│  ← PREV PROJECT    NEXT PROJECT →                       │
│                                                         │
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

### 4. Changelog Page (`/changelog`)

Modeled after Linear's changelog (linear.app/changelog) — clean, date-grouped, release-style.

```
┌─────────────────────────────────────────────────────────┐
│  NAV                                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CHANGELOG                                              │
│  "What I've been shipping."                             │
│                                                         │
│  FILTER: [All repos ▾]  [Push] [Create] [Release]      │
│                                                         │
│  ┌ SEPTEMBER 2026 ──────────────────────────────────┐   │
│  │                                                   │   │
│  │  Sep 1                                            │   │
│  │  ┌────────────────────────────────────────────┐   │   │
│  │  │  repo-doc-mcp                    ● Push    │   │   │
│  │  │                                            │   │   │
│  │  │  3 commits to main                         │   │   │
│  │  │  · Add webhook handler for branch events   │   │   │
│  │  │  · Fix token refresh logic                 │   │   │
│  │  │  · Update README                           │   │   │
│  │  │                                            │   │   │
│  │  │  TypeScript · +142 -38                     │   │   │
│  │  └────────────────────────────────────────────┘   │   │
│  │                                                   │   │
│  │  Aug 30                                           │   │
│  │  ┌────────────────────────────────────────────┐   │   │
│  │  │  pizza-demo                   ● Created    │   │   │
│  │  │                                            │   │   │
│  │  │  New repository                            │   │   │
│  │  │  "3D pizza builder: Vite/Three.js frontend,│   │   │
│  │  │   TS order-adapters backend"               │   │   │
│  │  └────────────────────────────────────────────┘   │   │
│  │                                                   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌ AUGUST 2026 ─────────────────────────────────────┐   │
│  │  ...                                              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

### 5. About Page (`/about`)

Your story + experience timeline + tech stack (replaces the old "index" and "stack" sections).

```
┌─────────────────────────────────────────────────────────┐
│  NAV                                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ABOUT                                                  │
│                                                         │
│  ┌───────────────────────────────────────────────┐      │
│  │  THE SHORT VERSION                            │      │
│  │                                               │      │
│  │  Backend engineer who likes systems that      │      │
│  │  stay up when things go wrong.                │      │
│  │                                               │      │
│  │  (2 paragraphs — from your current index      │      │
│  │   section, resilient services + C++ trading)  │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
│  EXPERIENCE TIMELINE (vertical, like a git log)         │
│  ┌─────────────────────────────────────────────┐        │
│  │  ● 2025 — present                           │        │
│  │  │ SMARTSHEET · SDE                          │        │
│  │  │ Connectors, MCP tooling, enterprise sync  │        │
│  │  │                                           │        │
│  │  ● 2024                                      │        │
│  │  │ FUTURES FIRST · SDE                       │        │
│  │  │ Trading infra, C++, low-latency systems   │        │
│  │  │                                           │        │
│  │  ● 2020 — 2024                               │        │
│  │  │ THE LNMIIT · B.Tech CSE                   │        │
│  │  │ JEE Advanced AIR 9684                     │        │
│  │  ○                                           │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
│  TECH STACK (interactive grid — keep the scan/pin UX)   │
│  ┌─────────┬─────────┬─────────┬─────────┐              │
│  │Languages│ Backend │  Cloud  │  Data   │              │
│  │         │Streaming│ DevOps  │ Observ  │              │
│  │ Java    │ Spring  │  AWS    │ MySQL   │              │
│  │ C++     │ gRPC    │ Docker  │ Postgres│              │
│  │ Python  │ Kafka   │  K8s    │ MongoDB │              │
│  │ SQL     │ RocksDB │Terraform│ Datadog │              │
│  └─────────┴─────────┴─────────┴─────────┘              │
│                                                         │
│  STATS (same counters — CF rating, records, etc.)       │
│                                                         │
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

### 6. Contact Page (`/contact`)

Clean, product-style. Not a form — just clear ways to reach you.

```
┌─────────────────────────────────────────────────────────┐
│  NAV                                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  LET'S BUILD                                            │
│  SOMETHING THAT                                         │
│  STAYS UP.                                              │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  ✉ Email          │  │  in LinkedIn      │             │
│  │  vansh0123...     │  │  vansh-vg         │             │
│  │  [Copy →]         │  │  [Open →]         │             │
│  └──────────────────┘  └──────────────────┘             │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  gh GitHub        │  │  ◷ Local Time     │             │
│  │  vansh482         │  │  20:43 IST        │             │
│  │  [Open →]         │  │  Bangalore, IN    │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                         │
│  STATUS: ● Open to hard problems                        │
│  LOOKING FOR: L4 / E4 / SDE II roles                    │
│                                                         │
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Shared Components

### Navigation
- Sticky top bar, blurs background on scroll
- Current page indicator (underline or dot)
- Logo: `VG®` or `VANSH GUPTA®` (links to `/`)
- Links: Projects, Changelog, About, Contact
- Optional: GitHub icon link, theme toggle

### Footer
- Consistent across all pages
- Links to all sections
- Clock, status, copyright
- "Built with Astro + Three.js" subtle credit

### Page Transitions
- View Transitions API (Astro built-in)
- Crossfade between pages
- Shared element transitions (nav stays fixed, content morphs)

### 3D Background
- Ambient particle/node system (like current canvas but 3D)
- Subtle, behind content, reacts to mouse
- Same across all pages (persistent, doesn't reload)
- Reduced/hidden on mobile for performance

---

## Visual Design System

Carrying forward your existing tokens:

```
Colors:
  --ink: #070B12       (background)
  --panel: #0D1422     (card/surface)
  --line: #1B2740      (borders)
  --text: #E6EDF8      (primary text)
  --dim: #6F82A6       (secondary text)
  --cyan: #34E7E7      (primary accent)
  --blue: #5B8DEF      (secondary accent)
  --indigo: #9B8CFF    (tertiary accent)
  --amber: #FFB454     (highlight)
  --green: #46E08B     (status/success)

Typography:
  Display: Space Grotesk (headings)
  Mono: Space Mono (labels, code, metadata)

Spacing:
  Section padding: clamp(80px, 11vw, 160px)
  Card padding: 24-30px
  Grid gap: clamp(24px, 4vw, 40px)
```

---

## Auto-Update Sections (Webhook-Driven)

These sections rebuild automatically when you push to any repo:

| Section | Data Source | Update Trigger |
|---------|-----------|---------------|
| Featured projects (homepage) | GitHub API + overrides.yaml | Push to featured repo |
| Project grid (/projects) | GitHub API repos endpoint | Push to any repo |
| Project page commits | GitHub API commits endpoint | Push to that repo |
| Changelog (/changelog) | GitHub API events endpoint | Push to any repo |
| Stats (homepage + about) | GitHub API aggregate | Push to any repo |
| Tech stack (about) | GitHub API languages | Push to any repo |

Sections that DON'T auto-update (manual via portfolio repo edits):
- Hero text/tagline
- About page prose
- Contact info
- Project overrides (featured flag, display name, descriptions)
- Experience timeline

---

## Decisions Needed

- [ ] **Does this page structure feel right?** Any pages to add/remove/merge?
- [ ] **3D scope:** Full hero scene on every page, or just landing + subtle accents elsewhere?
- [ ] **Keep the magnifier/secrets easter egg?** It's unique — could be a fun signature element
- [ ] **Project content:** Are the 4 current projects all that should be "featured"? Others to add?
