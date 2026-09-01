# Portfolio v2 — Progress & Status

> Last updated: 2026-09-01 23:17 IST

## Current Status: BUILD COMPLETE

The site is fully built and compiles to production (12 pages in 2.68s). All pages render, fallback data works when GitHub API is rate-limited, and the production build passes cleanly.

---

## What's Built

### Pages (6 routes, 12 HTML files)
- **`/`** — Homepage with hero, 3D scene, featured projects, changelog preview, stats grid
- **`/projects`** — Filterable project grid (All / Work / Personal / Experiment)
- **`/projects/[slug]`** — Individual project pages (7 generated) with metrics, tech stack, prev/next nav
- **`/changelog`** — Event-log-style activity feed with filter tabs (All / Push / Create / Release)
- **`/about`** — Bio, experience timeline, tech stack grid, stats, capability pills
- **`/contact`** — Big headline, 4 contact cards, live clock, status indicator

### Features
- **3D Hero Scene** — Three.js network topology (nodes + edges + floating rings), mouse-reactive, behind hero text
- **Custom Cursor** — Cyan dot + trailing ring, expands on hover over links/buttons, shrinks on click, disabled on mobile
- **Status Bar** — Live indicator: "shipping · last push 2h ago to repo-doc-mcp · 142 commits this month"
- **View Transitions** — Smooth crossfade between pages via Astro ClientRouter, nav persists
- **GitHub API Data Layer** — Fetches repos, events, languages at build time; YAML overrides for project metadata
- **Fallback Data** — Curated static data used when GitHub API is unavailable (rate-limited or down)
- **Responsive** — Mobile-first, 3D disabled on mobile/reduced-motion

### Infrastructure
- **GitHub Actions pipeline** (`.github/workflows/deploy.yml`) — Build + deploy to GitHub Pages
  - Triggers: push to main, `repository_dispatch` (webhook), daily cron at 6 AM UTC
  - Permissions: contents read, pages write, id-token write
- **Webhook setup docs** (`docs/webhook-setup.md`) — Instructions for cross-repo triggers

### File Structure
```
src/
├── components/
│   ├── CustomCursor.astro      — Dot + ring cursor with hover/click states
│   ├── Footer.astro            — Links, clock, status, copyright
│   ├── Nav.astro               — Sticky nav, backdrop blur, "open to work" dot
│   ├── ProjectCard.astro       — Reusable project card with metrics
│   ├── StatusBar.astro         — Live GitHub activity indicator
│   └── three/
│       └── HeroScene.tsx       — React Three Fiber 3D network topology
├── data/
│   ├── fallback.ts             — Static fallback data for when API is unavailable
│   └── project-overrides.yaml  — Manual project metadata (featured, displayName, etc.)
├── layouts/
│   └── Base.astro              — Shared HTML shell (head, nav, status bar, footer, cursor)
├── lib/
│   ├── github.ts               — GitHub REST API fetch functions
│   ├── transform.ts            — Raw API → typed models, merges with overrides
│   └── types.ts                — TypeScript interfaces (Project, ChangelogEntry, Stats)
├── pages/
│   ├── about.astro
│   ├── changelog.astro
│   ├── contact.astro
│   ├── index.astro
│   └── projects/
│       ├── [slug].astro        — Dynamic route for individual projects
│       └── index.astro         — Project grid with filters
└── styles/
    ├── global.css              — Design tokens, resets, utility classes
    └── transitions.css         — View transition animations
```

---

## To Deploy

### Prerequisites
1. **GitHub Personal Access Token** — Fine-grained, `public_repo` scope, for API calls during build
2. **GitHub Pages enabled** — Settings → Pages → Source: "GitHub Actions"

### Steps
1. Create a fine-grained PAT at https://github.com/settings/tokens?type=beta
   - Scope: Public Repositories (read-only)
   - Name: `portfolio-build-token`
2. Add it as a secret in the portfolio repo:
   - Go to https://github.com/vansh482/portfolio-website/settings/secrets/actions
   - New secret: Name = `GH_API_TOKEN`, Value = your token
3. Enable GitHub Pages:
   - Go to https://github.com/vansh482/portfolio-website/settings/pages
   - Source: "GitHub Actions"
4. Push the code:
   ```bash
   git add -A
   git commit -m "feat: portfolio v2 — multi-page Astro site with 3D hero, webhook pipeline"
   git push origin main
   ```
5. Watch the build at https://github.com/vansh482/portfolio-website/actions
6. Site will be live at https://vansh482.github.io/portfolio-website/

### Setting Up Webhooks (for auto-updates from other repos)
See `docs/webhook-setup.md` for full instructions. Quick version:
1. Add `PORTFOLIO_TOKEN` secret to each repo (same PAT value)
2. Add `.github/workflows/notify-portfolio.yml` to each repo
3. Pushes to those repos will trigger a portfolio rebuild

---

## Not Done Yet (Future Sessions)

| Feature | Complexity | Notes |
|---------|-----------|-------|
| View count + like button | Medium | Needs Supabase or Cloudflare KV backend |
| Custom domain | Low | Buy domain, configure DNS, update Astro config |
| Migrate to Vercel/Cloudflare | Low | Better DX, preview deploys, faster edge |
| Magnifier easter egg | Medium | Port from v1, adapt for multi-page |
| Theme variations | Medium | User likes Railway/Resend/Linear themes |
| SEO (sitemap, structured data) | Low | Astro has built-in sitemap integration |
| Blog/writing section | Medium | New page + content collection |
| Analytics | Low | Vercel Analytics or Plausible |

---

## Design Tokens (for reference)

```css
--ink: #070B12       /* Background */
--panel: #0D1422     /* Card/surface */
--line: #1B2740      /* Borders */
--text: #E6EDF8      /* Primary text */
--dim: #6F82A6       /* Secondary text */
--cyan: #34E7E7      /* Primary accent */
--blue: #5B8DEF      /* Secondary accent */
--indigo: #9B8CFF    /* Tertiary accent */
--amber: #FFB454     /* Live signal / highlight */
--green: #46E08B     /* Status / success */

Fonts: Space Grotesk (display), Space Mono (mono)
```

---

## Key Documents
- `docs/decisions.md` — All architectural decisions with rationale
- `docs/architecture-walkthrough.md` — Ground-up explanation of how everything works
- `docs/site-design.md` — Page-by-page wireframes and component spec
- `docs/references.html` — Live mockups of every component (open in browser)
- `docs/webhook-setup.md` — Cross-repo webhook configuration guide
- `docs/superpowers/plans/2026-09-01-portfolio-v2.md` — Implementation plan
