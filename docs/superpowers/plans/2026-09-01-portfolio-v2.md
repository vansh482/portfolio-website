# Portfolio v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio as a multi-page Astro site with GitHub webhook auto-updates, product-company aesthetic, and 3D hero.

**Architecture:** Astro SSG with React islands for interactive components (Three.js, filters). GitHub API data fetched at build time via `src/lib/github.ts`. GitHub Actions handles build/deploy to GitHub Pages and webhook-triggered rebuilds from other repos.

**Tech Stack:** Astro 5, React 19, TypeScript, Three.js + @react-three/fiber, @react-three/drei, GitHub REST API, GitHub Actions, GitHub Pages

**Spec:** `docs/site-design.md`, `docs/references.html`, `docs/decisions.md`

## Global Constraints

- Node 22 (user has Volta with v22.22.0)
- Deploy target: GitHub Pages (vansh482.github.io/portfolio-website)
- No database — all data from GitHub API + local YAML
- Zero JS shipped by default (Astro islands: `client:visible` / `client:load` only where needed)
- Fonts: Space Grotesk (display), Space Mono (mono) — loaded via Google Fonts
- Dark theme only (no light mode toggle)
- Mobile-first responsive. 3D disabled on mobile via progressive enhancement.
- Existing `index.html` and `README.md` will be replaced by the Astro project

---

### Task 1: Scaffold Astro Project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`
- Create: `src/styles/global.css` (design tokens)
- Create: `src/layouts/Base.astro` (shared HTML shell)
- Create: `src/pages/index.astro` (placeholder home page)
- Remove: `index.html` (replaced by Astro)

**Produces:**
- Working Astro dev server (`npm run dev`)
- Base layout with nav, footer, design tokens
- React integration configured for Three.js islands

- [ ] **Step 1: Initialize Astro project**
```bash
cd /Users/vgupta/Downloads/extension/portfolio-website
# Move old files aside
mv index.html index.html.v1-backup
# Init Astro (we'll create files manually for full control)
npm init -y
npm install astro @astrojs/react react react-dom
npm install -D typescript @types/react @types/react-dom
```

- [ ] **Step 2: Create astro.config.mjs**
```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://vansh482.github.io',
  base: '/portfolio-website',
  integrations: [react()],
  output: 'static',
});
```

- [ ] **Step 3: Create tsconfig.json**
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

- [ ] **Step 4: Create src/styles/global.css with design tokens**
Port all CSS custom properties from v1 index.html + new tokens from the approved design.

- [ ] **Step 5: Create src/layouts/Base.astro**
Shared HTML shell: `<head>` (fonts, meta, global CSS), `<Nav />`, `<StatusBar />`, `<slot />`, `<Footer />`.
Includes Astro ViewTransitions.

- [ ] **Step 6: Create src/components/Nav.astro**
Sticky nav with backdrop blur, monospace links, green "open to work" dot. Active page indicator.

- [ ] **Step 7: Create src/components/Footer.astro**
Links to all sections, live clock (JS island), copyright, "Built with Astro" credit.

- [ ] **Step 8: Create src/pages/index.astro**
Placeholder homepage using Base layout. Just a hero heading + "coming soon" for sections.

- [ ] **Step 9: Update package.json scripts and .gitignore**
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```
`.gitignore`: `node_modules/`, `dist/`, `.astro/`

- [ ] **Step 10: Verify dev server runs**
```bash
npm run dev
```
Open http://localhost:4321/portfolio-website/ — should see placeholder homepage with nav and footer.

- [ ] **Step 11: Commit**
```bash
git add -A
git commit -m "feat: scaffold Astro project with React integration, design tokens, base layout"
```

---

### Task 2: Data Layer — GitHub API + Project Overrides

**Files:**
- Create: `src/lib/github.ts` (API fetch functions)
- Create: `src/lib/transform.ts` (raw API → typed models)
- Create: `src/lib/types.ts` (TypeScript interfaces)
- Create: `src/data/project-overrides.yaml` (manual project metadata)

**Produces:**
- `fetchRepos()`, `fetchEvents()`, `fetchLanguages()` functions
- `Project`, `ChangelogEntry`, `Stats` TypeScript types
- `getProjects()`, `getChangelog()`, `getStats()` transformed data functions

- [ ] **Step 1: Create src/lib/types.ts**
```typescript
export interface Project {
  name: string;
  slug: string;
  description: string;
  url: string;
  language: string;
  languages: Record<string, number>;
  topics: string[];
  stars: number;
  pushedAt: string;
  createdAt: string;
  // From overrides
  featured: boolean;
  category: 'work' | 'personal' | 'experiment';
  displayName: string;
  org?: string;
  year?: string;
  metrics?: { label: string; value: string }[];
  longDescription?: string;
  order?: number;
}

export interface ChangelogEntry {
  id: string;
  type: 'push' | 'create' | 'release' | 'star' | 'fork';
  repo: string;
  repoUrl: string;
  message: string;
  timestamp: string;
  commits?: { sha: string; message: string; url: string }[];
  additions?: number;
  deletions?: number;
  language?: string;
}

export interface Stats {
  totalRepos: number;
  totalStars: number;
  topLanguages: { name: string; percentage: number }[];
  lastActive: string;
  activeReposThisMonth: number;
}
```

- [ ] **Step 2: Create src/data/project-overrides.yaml**
```yaml
connectors-3:
  featured: true
  category: work
  displayName: "Connectors 3.0"
  org: "Smartsheet"
  year: "2025"
  longDescription: >
    Designed and shipped the bi-directional enterprise data sync framework.
    Dynamics 365 and ServiceNow connectors built on Nango, load-tested to 5M+ records.
  metrics:
    - { label: "Records tested", value: "5M+" }
    - { label: "Connectors", value: "2" }
    - { label: "Sync mode", value: "Bi-dir" }

# ... (all 4 projects with overrides)
```

- [ ] **Step 3: Install yaml dependency**
```bash
npm install yaml
```

- [ ] **Step 4: Create src/lib/github.ts**
Functions that call the GitHub REST API using `fetch()` with the `GITHUB_TOKEN` env var. Handles pagination, rate limiting, error fallback (return empty arrays if API fails so build doesn't break).

- [ ] **Step 5: Create src/lib/transform.ts**
Merges API data with YAML overrides. Exports `getProjects()`, `getChangelog()`, `getStats()`. Sorts projects by override order → pushedAt. Transforms GitHub events into ChangelogEntry format.

- [ ] **Step 6: Verify data layer works**
```bash
GITHUB_TOKEN=<test-token> npm run dev
```
Add a temp test page that dumps JSON to verify data fetching.

- [ ] **Step 7: Commit**
```bash
git add src/lib/ src/data/
git commit -m "feat: add GitHub API data layer with project overrides"
```

---

### Task 3: Build All Pages

**Files:**
- Create: `src/pages/index.astro` (full homepage)
- Create: `src/pages/projects/index.astro` (project grid)
- Create: `src/pages/projects/[slug].astro` (individual project)
- Create: `src/pages/changelog.astro` (event log)
- Create: `src/pages/about.astro` (story + timeline + stack)
- Create: `src/pages/contact.astro` (contact cards)
- Create: `src/components/StatusBar.astro`
- Create: `src/components/ProjectCard.astro`
- Create: `src/components/ChangelogEntry.astro`
- Create: `src/components/StatsBar.astro`
- Create: `src/components/Marquee.astro`
- Create: `src/components/ExperienceTimeline.astro`
- Create: `src/components/TechStack.astro`

**Consumes:** Data layer from Task 2 (`getProjects()`, `getChangelog()`, `getStats()`)

- [ ] **Step 1: Create StatusBar component**
The signature element. Shows: green pulse dot, "shipping", last push time, repo name, commit count this month. Data from `getStats()`.

- [ ] **Step 2: Update Base.astro to include StatusBar**

- [ ] **Step 3: Build homepage (src/pages/index.astro)**
Hero section (tag + headline + sub + CTAs), Marquee ticker, Featured projects (3 ProjectCards), Latest changelog (3-5 entries), StatsBar. All data fetched in frontmatter.

- [ ] **Step 4: Create ProjectCard component**
Org/year tag, name, description, tech stack pills, bottom metrics row. Hover: cyan top border + arrow animation. Links to `/projects/[slug]`.

- [ ] **Step 5: Create ChangelogEntry component**
Monospace timestamp, type badge (PUSH=blue, CREATE=green, RELEASE=amber), repo name, commit list with SHAs, diff stats (+N -N).

- [ ] **Step 6: Build /projects page**
Filter pills (All/Work/Personal/Experiment) — client-side JS island. Sort dropdown. Full project grid using ProjectCard. Data from `getProjects()`.

- [ ] **Step 7: Build /projects/[slug] page**
Dynamic route. Hero with project name + org/year. Tech stack pills. Metrics row. Long description prose. Recent commits mini-log. Prev/Next navigation. Uses `getStaticPaths()`.

- [ ] **Step 8: Build /changelog page**
Filter tabs (All/Push/Create/Release) — client-side JS island. Date-grouped entries. Full event log using ChangelogEntry. Data from `getChangelog()`.

- [ ] **Step 9: Build /about page**
Short bio, ExperienceTimeline (Smartsheet → Futures First → LNMIIT), TechStack grid (interactive scan/pin from v1), StatsBar.

- [ ] **Step 10: Build /contact page**
Contact cards (Email, LinkedIn, GitHub, Local Time). Status indicator. "Open to hard problems" message.

- [ ] **Step 11: Verify all pages render**
```bash
npm run dev
```
Navigate to every page, check data populates, test responsive at mobile widths.

- [ ] **Step 12: Commit**
```bash
git add src/
git commit -m "feat: build all pages — home, projects, changelog, about, contact"
```

---

### Task 4: 3D Hero Scene

**Files:**
- Create: `src/components/three/HeroScene.tsx` (React Three Fiber)
- Create: `src/components/three/NetworkTopology.tsx` (node/edge visualization)
- Create: `src/components/three/AmbientParticles.tsx` (subtle background for non-home pages)

**Dependencies:**
```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
npm install -D @types/three
```

- [ ] **Step 1: Install Three.js ecosystem**

- [ ] **Step 2: Create HeroScene.tsx**
Canvas with OrbitControls disabled (ambient only), ambient + point lighting, bloom postprocessing. Uses `client:visible` in Astro to load only when scrolled into view.

- [ ] **Step 3: Create NetworkTopology.tsx**
Nodes = projects (positioned in 3D space), edges = shared technologies connecting them. Nodes glow cyan, edges are dim blue lines. Slow rotation. Mouse proximity causes nearest nodes to brighten. Uses instanced meshes for performance.

- [ ] **Step 4: Create AmbientParticles.tsx**
Lightweight particle system for non-homepage backgrounds. Fewer particles than v1 canvas. Subtle, atmospheric.

- [ ] **Step 5: Wire HeroScene into homepage**
```astro
<!-- In index.astro -->
<div class="hero-3d">
  <HeroScene client:visible />
</div>
```
Absolute-positioned behind hero text. Falls back gracefully (empty div) if WebGL unavailable.

- [ ] **Step 6: Add reduced-motion and mobile checks**
`prefers-reduced-motion: reduce` → skip 3D entirely. Mobile (no hover) → skip 3D, show static gradient instead.

- [ ] **Step 7: Verify 3D renders without blocking page load**
The page content should be visible before Three.js initializes (`client:visible` ensures this).

- [ ] **Step 8: Commit**
```bash
git add src/components/three/
git commit -m "feat: add 3D hero scene with network topology visualization"
```

---

### Task 5: GitHub Actions — Build, Deploy, Webhook Rebuild

**Files:**
- Create: `.github/workflows/deploy.yml` (build + deploy to GitHub Pages)
- Create: `.github/workflows/rebuild.yml` (webhook-triggered rebuild)
- Create: `docs/webhook-setup.md` (instructions for adding webhook to other repos)

- [ ] **Step 1: Create .github/workflows/deploy.yml**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  repository_dispatch:
    types: [rebuild]
  schedule:
    - cron: '0 6 * * *'  # Daily safety-net rebuild at 6 AM UTC

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          GITHUB_TOKEN: ${{ secrets.GH_API_TOKEN }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Create docs/webhook-setup.md**
Instructions for adding the notify workflow to other repos:
```yaml
# .github/workflows/notify-portfolio.yml (add to each repo)
name: Notify Portfolio
on:
  push:
    branches: [main]
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST \
            -H "Authorization: token ${{ secrets.PORTFOLIO_TOKEN }}" \
            -H "Accept: application/vnd.github.v3+json" \
            https://api.github.com/repos/vansh482/portfolio-website/dispatches \
            -d '{"event_type": "rebuild"}'
```

- [ ] **Step 3: Configure GitHub Pages in repo settings**
Document the manual steps: Settings → Pages → Source: GitHub Actions.

- [ ] **Step 4: Test build locally**
```bash
GITHUB_TOKEN=<token> npm run build
npx serve dist/
```

- [ ] **Step 5: Commit and push**
```bash
git add .github/ docs/webhook-setup.md
git commit -m "feat: add GitHub Actions deploy pipeline with webhook rebuild support"
```

---

### Task 6: View Transitions + Polish

**Files:**
- Modify: `src/layouts/Base.astro` (add ViewTransitions)
- Create: `src/styles/transitions.css` (custom transition animations)
- Modify: all pages (add `transition:name` directives where needed)

- [ ] **Step 1: Enable Astro View Transitions**
```astro
<!-- In Base.astro <head> -->
---
import { ViewTransitions } from 'astro:transitions';
---
<ViewTransitions />
```

- [ ] **Step 2: Add transition names to shared elements**
Nav, footer, status bar persist across transitions. Project cards morph into project page heroes.

- [ ] **Step 3: Add custom transition CSS**
Crossfade for content areas, slide for page-specific sections.

- [ ] **Step 4: Test all page transitions**
Navigate between every page pair. Verify no layout shift, no flash of unstyled content.

- [ ] **Step 5: Responsive polish pass**
Test at 375px, 768px, 1024px, 1440px widths. Fix any overflow, stacking, or spacing issues.

- [ ] **Step 6: Commit**
```bash
git add src/
git commit -m "feat: add view transitions and responsive polish"
```

---

## Execution Order

```
Task 1 (Scaffold)
  └→ Task 2 (Data Layer)
       └→ Task 3 (All Pages)
            ├→ Task 4 (3D Hero) — can parallel with Task 5
            └→ Task 5 (GitHub Actions)
                 └→ Task 6 (Transitions + Polish)
```

Tasks 4 and 5 are independent and can run in parallel after Task 3.
