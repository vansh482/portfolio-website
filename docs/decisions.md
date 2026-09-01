# Portfolio v2 — Architecture Decisions

> Living document. Captures every decision made during the portfolio rebuild.
> A new session should read this file first to understand the project state.

## Current Status (2026-09-01)

**BUILD STATUS: COMPLETE — all pages built, production build passes (12 pages in 2.68s)**

What's done:
- Astro project scaffolded with React integration
- All 6 pages built: Home, /projects, /projects/[slug], /changelog, /about, /contact
- GitHub API data layer with YAML overrides and fallback data
- 3D hero scene (Three.js network topology with floating rings)
- Custom cursor (dot + trailing ring, hover expansion, click shrink)
- Status bar with live GitHub data
- View transitions between pages
- GitHub Actions deploy pipeline (.github/workflows/deploy.yml)
- Webhook setup documentation (docs/webhook-setup.md)

What's NOT done yet (future sessions):
- View count / like button (needs Supabase or similar — user chose to skip for now)
- Custom domain setup
- Migration from GitHub Pages to Vercel/Cloudflare
- Magnifier easter egg (from v1)
- Theme variations (user interested in Railway/Resend/Linear themes)
- SEO optimization (sitemap, structured data)

## Project Overview

Rebuilding Vansh Gupta's portfolio (vansh482.github.io/portfolio-website) from a single static HTML file into a multi-page, product-style website with auto-updating sections powered by GitHub webhooks.

**Current state (v1):** Single `index.html` (~650 lines), inline CSS/JS, GitHub Pages, magnifying-glass easter egg, Space Grotesk + Space Mono fonts, dark theme with cyan accent.

**Target state (v2):** Multi-page Astro site, product-company aesthetic (like Resend/Linear/Railway), event-log changelog, individual project pages, 3D hero, auto-updates via GitHub webhooks.

---

## Decisions Log

### D1: Architecture Pattern — SSG with Webhook-Triggered Rebuilds
**Decided:** 2026-09-01
**Choice:** Static Site Generation (Pattern A)
**Alternatives rejected:**
- SSR (overkill for a portfolio, needs a running server)
- SPA + API Backend (loading spinners, two systems to maintain)
**Rationale:** Data changes infrequently (a few pushes/day) but is read constantly. SSG flips compute from "per request" to "per change." Free hosting, fast for visitors, no server to maintain.

### D2: Framework — Astro
**Decided:** 2026-09-01
**Choice:** Astro with React islands
**Alternatives rejected:**
- Next.js (more complex, SSR/SSG confusion, heavier)
- SvelteKit (less ecosystem for Three.js)
- Raw HTML (doesn't scale to multi-page with data fetching)
**Rationale:** Island architecture ships zero JS by default; only 3D scenes and interactive widgets get JavaScript. Content-first, file-based routing, built-in View Transitions.

### D3: Hosting — GitHub Pages + Actions
**Decided:** 2026-09-01
**Choice:** GitHub Pages with GitHub Actions for build/deploy
**Migration path:** Move to Vercel or Cloudflare Pages once stable
**Rationale:** Keeps the existing URL (vansh482.github.io/portfolio-website), no new accounts needed. Actions handles build + deploy + webhook rebuilds.

### D4: Database — None
**Decided:** 2026-09-01
**Choice:** No database. GitHub API fetched at build time + YAML config for overrides.
**Rationale:** All data comes from GitHub's REST API (repos, events, languages). Project metadata overrides (featured flag, display names) stored in a YAML file in the repo. Data is baked into static HTML during build.

### D5: Domain — Free URL for now
**Decided:** 2026-09-01
**Choice:** vansh482.github.io/portfolio-website (existing)
**Migration path:** Custom domain (vanshgupta.dev or similar) later

### D6: 3D Approach — Restrained
**Decided:** 2026-09-01
**Choice:** Three.js via React Three Fiber. Network topology hero on homepage, subtle ambient particles on other pages. No 3D on mobile (progressive enhancement).
**Rationale:** 3D is an enhancement, not the core. The site must work without WebGL.

### D7: Design System — Evolved from v1
**Decided:** 2026-09-01
**Choice:** Keep existing tokens (--ink, --cyan, --blue, --indigo, Space Grotesk/Mono). Promote amber (#FFB454) as "live signal" color. Drop numbered section markers (00.1, 00.2). Drop magnifier easter egg in v1 (add back later).
**Reference sites:** Resend (product-company structure), Linear changelog (release page), Railway (infrastructure aesthetic)

### D8: Cross-Repo Webhook Strategy — Per-Repo GitHub Actions
**Decided:** 2026-09-01
**Choice:** Small workflow file in each repo that calls `repository_dispatch` on the portfolio repo
**Migration path:** GitHub App (auto-installed across all repos) later
**Rationale:** Simplest to start. One YAML file per repo, uses existing GitHub Actions infrastructure.

### D9: Theme — Open for iteration
**Decided:** 2026-09-01
**Note:** User likes Railway/Resend/Linear themes. Current plan uses the v1 palette evolved. Theme can be swapped later since design tokens are centralized.

---

## Page Structure

```
/                     → Landing page (hero + featured projects + changelog preview + stats)
/projects             → Filterable project grid (all repos)
/projects/[slug]      → Individual project page (product-style spec sheet)
/changelog            → Event-log-style activity feed (auto-populated from GitHub)
/about                → Story, experience timeline, tech stack
/contact              → Contact cards + status
```

## Key Components

- **StatusBar** — Live indicator below nav: "shipping · last push 2h ago · 142 commits this month"
- **Nav** — Sticky with backdrop blur, monospace links, green "open to work" dot
- **ProjectCard** — Org/year tag, description, tech stack pills, bottom metrics, hover accent
- **ChangelogEntry** — Event-log format: monospace timestamp, type badge, commit SHAs, diff stats
- **HeroScene** — React Three Fiber 3D network topology (homepage only)
- **Footer** — Links, clock, status, copyright

## Data Flow

```
Build time:
  1. GitHub Actions triggers (push to portfolio OR repository_dispatch from other repos)
  2. Astro build starts
  3. src/lib/github.ts calls GitHub REST API:
     - GET /users/vansh482/repos
     - GET /users/vansh482/events
     - GET /repos/vansh482/{repo}/languages
  4. src/lib/transform.ts shapes raw API data into typed models
  5. src/data/project-overrides.yaml provides manual metadata
  6. Astro generates static HTML pages with data baked in
  7. dist/ deployed to GitHub Pages
```

## Secrets Required

- `GH_API_TOKEN` — GitHub Personal Access Token (for API calls during build, 5000 req/hr)
- Token needs: `public_repo` scope (read-only access to public repo data)
