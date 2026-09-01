# Dynamic Portfolio — Architecture Walkthrough

> A ground-up guide for turning a static portfolio into a webhook-driven, multi-page, 3D-interactive site.

---

## Table of Contents

1. [How Websites Work — The Mental Model](#1-how-websites-work)
2. [Static vs Dynamic — What Changes](#2-static-vs-dynamic)
3. [Architecture Patterns — The Three Roads](#3-architecture-patterns)
4. [Our Chosen Architecture — SSG + Webhook Rebuild](#4-our-chosen-architecture)
5. [Full System Diagram — Bird's Eye View](#5-full-system-diagram)
6. [Component Deep-Dive](#6-component-deep-dive)
7. [Data Model — What We Pull From GitHub](#7-data-model)
8. [Multi-Page Structure](#8-multi-page-structure)
9. [3D & Interactivity Layer](#9-3d--interactivity-layer)
10. [Deployment Pipeline](#10-deployment-pipeline)
11. [Design Patterns Used](#11-design-patterns-used)
12. [Cost & Free Tier Limits](#12-cost--free-tier-limits)
13. [Decisions Still to Make](#13-decisions-still-to-make)

---

## 1. How Websites Work

### The Simplest Version

When someone types `vansh482.github.io/portfolio-website` into their browser:

```
Browser → "Hey DNS, where is this?" → DNS: "It's at IP 185.199.108.153"
Browser → "Hey server at that IP, give me /" → Server: "Here's index.html"
Browser → parses HTML, fetches CSS/JS/images → renders the page
```

### Key Terms

| Term | What It Is | Analogy |
|------|-----------|---------|
| **Frontend** | Code that runs in the visitor's browser (HTML, CSS, JS) | The restaurant's dining room |
| **Backend** | Code that runs on a server you control | The kitchen |
| **API** | A contract: "send this request, get this response" | The menu |
| **Database** | Where data lives persistently on the server | The pantry/fridge |
| **CDN** | Content Delivery Network — copies of your site cached worldwide | Franchises of the same restaurant everywhere |
| **Webhook** | A server-to-server callback: "when X happens, POST to this URL" | A restaurant that calls you when your table is ready |
| **DNS** | Domain Name System — translates `vansh482.github.io` → IP address | Phone book for the internet |
| **SSG** | Static Site Generation — build all HTML at deploy time | Printing a newspaper |
| **SSR** | Server-Side Rendering — build HTML per request | Chef cooks each order fresh |
| **SPA** | Single Page Application — one HTML file, JS swaps content | A building with one door but many rooms |

### Your Current Setup

```
You (write HTML) → push to GitHub → GitHub Pages serves index.html
                                     (a CDN, free, fast)
                                           ↓
                                     Visitor sees the exact same HTML every time
```

**GitHub Pages** is a free static file host. It takes whatever's in your repo and serves it as a website. No backend, no database, no processing — just files.

---

## 2. Static vs Dynamic — What Changes

### Static (now)
- Content is hardcoded in HTML
- To update the projects section, you edit `index.html` and push
- Every visitor sees the same thing
- Fast, simple, free

### Dynamic (goal)
- Content comes from data (GitHub API, a database, or build-time fetched JSON)
- When you push to ANY GitHub repo, the portfolio updates itself
- A "changelog" section shows your recent activity in real time
- Projects, stats, and tech stack stay current without manual editing

### What Stays the Same
- The visual design language (dark theme, cyan accents, Space Grotesk)
- The magnifying glass / secret easter eggs
- GitHub Pages (or similar) for hosting — still static files, just rebuilt more often

---

## 3. Architecture Patterns — The Three Roads

### Pattern A: SSG (Static Site Generation) with Webhook-Triggered Rebuilds

```
Push to any repo → GitHub webhook → GitHub Actions rebuilds site
                                      ↓
                   Fetches data from GitHub API at build time
                                      ↓
                   Generates fresh HTML pages → deploys to CDN
```

**How it works:**
1. You push code to any of your repos
2. GitHub fires a webhook to a GitHub Actions workflow
3. The workflow runs your site's build command
4. During build, it calls the GitHub API to get your latest repos, commits, languages
5. The framework (Astro/Next.js) generates static HTML pages with that fresh data baked in
6. The built files get deployed to Vercel/Cloudflare Pages/Netlify

**Pros:**
- Blazing fast for visitors (pure HTML, cached on CDN)
- No backend server to maintain or pay for
- Simple security model — nothing to hack
- Free hosting
- SEO-perfect — search engines see full HTML

**Cons:**
- Not truly real-time (rebuild takes 30-90 seconds)
- GitHub Actions has a free tier limit (2,000 min/month — plenty for this)
- Build step adds complexity vs plain HTML

**Best for:** Portfolios, blogs, documentation sites — anything where data changes infrequently and freshness within 1-2 minutes is fine.

### Pattern B: SSR (Server-Side Rendering)

```
Visitor requests /projects → server fetches data → renders HTML → sends response
```

**How it works:**
1. A server runs your app code 24/7
2. When a visitor hits `/projects`, the server calls the GitHub API
3. Generates HTML with fresh data and sends it to the browser

**Pros:**
- Always 100% fresh data
- Can do complex server-side logic
- Good for personalized content

**Cons:**
- Needs a running server (costs money, even if small)
- Slower first page load (server has to compute each response)
- More things that can break
- Overkill for a portfolio

**Best for:** E-commerce, dashboards, apps with user auth.

### Pattern C: SPA + API Backend

```
Browser loads static shell → JS calls /api/changelog → renders data in browser
```

**How it works:**
1. A static HTML/JS shell loads instantly
2. JavaScript makes fetch() calls to your API (a Cloudflare Worker / Lambda)
3. The API reads from a database and returns JSON
4. JavaScript updates the DOM with the data

**Pros:**
- Frontend and backend are fully independent
- Can update data without rebuilding the site
- Real-time updates possible

**Cons:**
- "Loading spinner" moment while data fetches
- Two systems to maintain (frontend + backend)
- SEO harder for dynamic content
- More complex than SSG for this use case

**Best for:** Web apps with heavy interactivity and real-time requirements.

### Our Pick: Pattern A — SSG with Webhook Rebuilds

For a portfolio, **Pattern A** is the clear winner:
- You want fast, beautiful pages → SSG gives you that
- You want auto-updates → webhook-triggered rebuilds handle it
- You're learning → SSG has the fewest moving parts
- It's free → no server costs
- You want 3D/animations → SSG frameworks support Three.js perfectly

---

## 4. Our Chosen Architecture — SSG + Webhook Rebuild

### The Flow, Step by Step

```
1. You push code to github.com/vansh482/some-project
   
2. GitHub detects the push and fires a webhook
   (a POST request with JSON describing what happened)
   
3. The webhook hits a GitHub Actions "repository_dispatch" event
   on your portfolio-website repo
   
4. GitHub Actions spins up a virtual machine (runner) that:
   a. Checks out your portfolio code
   b. Runs `npm run build` (or equivalent)
   c. During build, your framework calls the GitHub API:
      - GET /users/vansh482/repos → your public repos
      - GET /users/vansh482/events → recent activity
      - GET /repos/vansh482/{repo} → repo details, languages
   d. The framework generates static HTML/CSS/JS pages
   e. Deploys to your hosting provider (Vercel / Cloudflare Pages)
   
5. Within ~60 seconds, your live site reflects the new data
```

### Why This Works So Well

The key insight: **your data source (GitHub) has a free, rate-limited API**. For a portfolio, you only need to fetch data at build time (maybe 10-20 API calls). GitHub's free API limit is 5,000 requests/hour — you'll use 0.4% of that per rebuild.

---

## 5. Full System Diagram — Bird's Eye View

```
┌─────────────────────────────────────────────────────────────────────┐
│                        YOUR DEVELOPMENT                             │
│                                                                     │
│   repo-a/   repo-b/   portfolio-website/   repo-c/   ...           │
│     │          │              │                │                     │
│     └──────────┴──────────────┴────────────────┘                    │
│                       │                                              │
│                  git push                                            │
└──────────────────┬──────────────────────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         GITHUB                                       │
│                                                                     │
│  ┌──────────────┐     ┌─────────────────────────────┐               │
│  │  Push Event   │────▶│  Webhook (repository_dispatch)│             │
│  │  on any repo  │     │  → portfolio-website repo     │             │
│  └──────────────┘     └──────────┬──────────────────┘               │
│                                  │                                   │
│                                  ▼                                   │
│  ┌───────────────────────────────────────────────────┐              │
│  │              GitHub Actions Runner                  │              │
│  │                                                     │              │
│  │  1. Checkout portfolio-website code                 │              │
│  │  2. npm install                                     │              │
│  │  3. npm run build                                   │              │
│  │     ┌─────────────────────────────────┐             │              │
│  │     │  Build Step (Astro/Next.js)      │             │              │
│  │     │                                   │             │              │
│  │     │  fetch("api.github.com/users/     │             │              │
│  │     │         vansh482/repos")           │             │              │
│  │     │  fetch("api.github.com/users/     │             │              │
│  │     │         vansh482/events")          │             │              │
│  │     │  → generates /index.html          │             │              │
│  │     │  → generates /projects/index.html │             │              │
│  │     │  → generates /changelog/index.html│             │              │
│  │     │  → generates /about/index.html    │             │              │
│  │     └─────────────────────────────────┘             │              │
│  │  4. Deploy built files to hosting                   │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                     │
│  ┌──────────────────┐                                               │
│  │  GitHub REST API   │  ← called at build time                     │
│  │  /users/vansh482/* │                                             │
│  └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
                   │
                   │ deploy
                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    HOSTING (Vercel / Cloudflare Pages)                │
│                                                                     │
│  CDN Edge Nodes (worldwide)                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │ Mumbai  │ │ Tokyo   │ │ London  │ │ Virginia│                  │
│  │  copy   │ │  copy   │ │  copy   │ │  copy   │                  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                  │
│                                                                     │
│  Each edge has: index.html, /projects/index.html,                   │
│                 /changelog/index.html, CSS, JS, 3D assets           │
└─────────────────────────────────────────────────────────────────────┘
                   │
                   │ visitor requests page
                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        VISITOR'S BROWSER                             │
│                                                                     │
│  1. Loads HTML from nearest CDN edge (fast!)                        │
│  2. Parses CSS → renders layout                                     │
│  3. Loads JS → initializes Three.js 3D scene                       │
│  4. Loads page transitions (view transitions API)                   │
│  5. All data is ALREADY in the HTML — no loading spinners           │
└─────────────────────────────────────────────────────────────────────┘
```

### Cross-Repo Webhook: How One Push Triggers Another Repo's Workflow

This is the trickiest part conceptually. Here's how it works:

```
You push to vansh482/repo-doc-mcp
         │
         ▼
GitHub: "A push happened on repo-doc-mcp"
         │
         ▼
GitHub checks: does repo-doc-mcp have any webhooks configured?
   Option 1: Per-repo webhook → POST to a URL you configure
   Option 2: GitHub App/Action → use the GitHub API to trigger 
             a "repository_dispatch" event on portfolio-website
         │
         ▼
GitHub Actions on portfolio-website repo:
   Workflow file (.github/workflows/rebuild.yml) says:
   "on: repository_dispatch → run this build"
         │
         ▼
Site rebuilds with fresh data
```

**Two ways to trigger cross-repo:**

**Way 1: GitHub Actions Workflow in Every Repo (simpler)**
Add a small workflow file to each repo that calls the GitHub API:
```yaml
# .github/workflows/notify-portfolio.yml (in every repo)
on: push
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

**Way 2: Organization-Level Webhook (cleaner, if you use a GitHub org)**
One webhook for all repos → calls a Cloudflare Worker → triggers the rebuild.

**Way 3: GitHub App (most scalable)**
A GitHub App installed on your account receives events from all repos automatically.

For your case, **Way 1** is the simplest to start. Later you can move to a GitHub App.

---

## 6. Component Deep-Dive

### 6.1 The Framework: Astro

**What is Astro?**
A web framework designed for content-heavy sites. It generates static HTML by default but lets you add interactive "islands" (React/Svelte/Vue components) where needed.

**Why Astro over Next.js for this project:**
- **Simpler** — less to learn (no `getServerSideProps`, no API routes confusion)
- **Faster output** — ships zero JS by default, only loads JS for interactive components
- **Content-first** — built for blogs, portfolios, docs
- **Island Architecture** — only the 3D scene and interactive widgets ship JS
- **Built-in** — page routing, image optimization, Markdown support

**Island Architecture explained:**
```
┌──────────────────────────────────────────┐
│  Page: /projects                          │
│                                           │
│  ┌──────────────────────────────┐  Static │
│  │  Header / Nav                 │  HTML   │
│  └──────────────────────────────┘         │
│  ┌──────────────────────────────┐         │
│  │  3D Hero Scene (Three.js)     │  ← Island (JS loaded)
│  │  client:visible               │         │
│  └──────────────────────────────┘         │
│  ┌──────────────────────────────┐  Static │
│  │  Project Grid                  │  HTML   │
│  │  (built at compile time)      │         │
│  └──────────────────────────────┘         │
│  ┌──────────────────────────────┐         │
│  │  Filter/Sort Controls         │  ← Island (JS loaded)
│  │  client:load                  │         │
│  └──────────────────────────────┘         │
│  ┌──────────────────────────────┐  Static │
│  │  Footer                       │  HTML   │
│  └──────────────────────────────┘         │
└──────────────────────────────────────────┘
```

Only the 3D scene and filter controls ship JavaScript. Everything else is pure HTML. This means the page loads FAST and is fully accessible/SEO-friendly.

### 6.2 Three.js + React Three Fiber

**What is Three.js?**
A JavaScript library that talks to your GPU via WebGL to render 3D graphics in the browser. It handles: cameras, lighting, materials, geometry, animations, post-processing.

**What is React Three Fiber (R3F)?**
A React wrapper around Three.js. Instead of imperative code, you write declarative JSX:

```jsx
// Without R3F (imperative Three.js):
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 'cyan' });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// With R3F (declarative):
<mesh>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="cyan" />
</mesh>
```

**Key libraries in the 3D ecosystem:**
| Library | Purpose |
|---------|---------|
| `three` | The core 3D engine |
| `@react-three/fiber` | React bindings for Three.js |
| `@react-three/drei` | Pre-built helpers (OrbitControls, Text, Environment, etc.) |
| `@react-three/postprocessing` | Bloom, vignette, chromatic aberration effects |
| `leva` | Debug GUI for tweaking 3D params in development |
| `gsap` or `framer-motion-3d` | Animation (scroll-driven, timeline-based) |

### 6.3 GitHub API — Our Data Source

At build time, we'll call these endpoints:

```
GET https://api.github.com/users/vansh482/repos?sort=pushed&per_page=100
→ Returns: name, description, language, topics, pushed_at, stargazers_count, html_url

GET https://api.github.com/users/vansh482/events?per_page=100
→ Returns: type (PushEvent, CreateEvent, etc.), repo, payload (commits), created_at

GET https://api.github.com/repos/vansh482/{repo}/languages
→ Returns: { "TypeScript": 45000, "JavaScript": 12000, "CSS": 3000 }
  (byte counts per language)
```

**Rate limits:**
- Unauthenticated: 60 requests/hour (not enough)
- With a Personal Access Token: 5,000 requests/hour (way more than enough)

We'll use a PAT stored as a GitHub Actions secret.

### 6.4 Hosting: Vercel (recommended) or Cloudflare Pages

**Vercel:**
- Built specifically for Next.js/Astro
- Free tier: 100 GB bandwidth, unlimited deploys
- Preview deploys for every PR
- Automatic HTTPS
- Custom domain support
- Edge network (fast worldwide)

**Cloudflare Pages:**
- Free tier: unlimited bandwidth, 500 deploys/month
- Slightly faster edge network
- More manual setup for Astro

For a first project, **Vercel** has the smoothest experience.

---

## 7. Data Model — What We Pull From GitHub

### 7.1 Projects Data

Fetched from the GitHub API at build time and enriched:

```typescript
interface Project {
  // From GitHub API
  name: string;            // "repo-doc-mcp"
  description: string;     // "AI-powered branch documentation tool"
  url: string;             // "https://github.com/vansh482/repo-doc-mcp"
  language: string;        // "TypeScript"
  languages: Record<string, number>;  // { TypeScript: 45000, JavaScript: 12000 }
  topics: string[];        // ["mcp", "ai", "documentation"]
  stars: number;
  pushedAt: string;        // ISO date
  createdAt: string;

  // Enriched (from a local config file in your portfolio repo)
  featured: boolean;       // show on homepage?
  category: 'work' | 'personal' | 'experiment';
  displayName?: string;    // override name: "Repo Doc Generator" instead of "repo-doc-mcp"
  emoji?: string;          // icon for the card
  order?: number;          // manual sort override
}
```

**The enrichment file** (`src/data/project-overrides.yaml`):
```yaml
repo-doc-mcp:
  featured: true
  category: work
  displayName: "Repo Doc Generator"
  emoji: "📄"
  order: 1

portfolio-website:
  featured: true
  category: personal
  displayName: "This Portfolio"
  emoji: "🌐"
```

Repos without an override entry still show up — they just use GitHub defaults.

### 7.2 Changelog / Activity Feed

Fetched from the Events API:

```typescript
interface ChangelogEntry {
  id: string;
  type: 'push' | 'create' | 'release' | 'star' | 'fork';
  repo: string;           // "vansh482/repo-doc-mcp"
  repoUrl: string;
  message: string;        // commit message or event description
  timestamp: string;       // ISO date
  commits?: {
    sha: string;
    message: string;
    url: string;
  }[];
}
```

We'll transform GitHub events into a clean timeline:

```
Sep 1, 2026  → Pushed 3 commits to repo-doc-mcp
               "Add webhook handler for branch events"
               "Fix token refresh logic"
               "Update README"

Aug 30, 2026 → Created repository pizza-demo
               "3D pizza builder: Vite/Three.js frontend"

Aug 28, 2026 → Pushed to confluence-mcp
               "Add page tree traversal"
```

### 7.3 Stats

Aggregated at build time:

```typescript
interface Stats {
  totalRepos: number;
  totalCommitsLast90Days: number;
  topLanguages: { name: string; percentage: number }[];
  totalStars: number;
  longestStreak: number;  // consecutive days with commits (from events)
  lastActive: string;     // "2 hours ago"
}
```

### 7.4 Tech Stack (auto-detected)

Built from the `languages` endpoint across all repos:

```typescript
interface TechStackItem {
  name: string;         // "TypeScript"
  category: 'language' | 'framework' | 'tool' | 'cloud';
  totalBytes: number;   // across all repos
  repoCount: number;    // how many repos use it
  icon: string;         // devicon URL or custom SVG
}
```

We can auto-detect languages, but frameworks (Spring Boot, React) need to be inferred from `package.json`, `pom.xml`, etc. — or maintained manually.

---

## 8. Multi-Page Structure

```
portfolio-website/
├── src/
│   ├── pages/
│   │   ├── index.astro          ← Home / Hero
│   │   ├── projects/
│   │   │   ├── index.astro      ← Project grid (all repos)
│   │   │   └── [slug].astro     ← Individual project page (dynamic route)
│   │   ├── changelog.astro      ← Activity feed
│   │   └── about.astro          ← Story, stats, stack
│   ├── components/
│   │   ├── three/               ← 3D components (React Three Fiber)
│   │   │   ├── HeroScene.tsx    ← Main 3D hero animation
│   │   │   ├── ProjectOrb.tsx   ← 3D orb per project
│   │   │   └── Background.tsx   ← Ambient particle system
│   │   ├── ProjectCard.astro    ← Project grid card
│   │   ├── ChangelogItem.astro  ← Single changelog entry
│   │   ├── Nav.astro            ← Top navigation
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Base.astro           ← Shared HTML shell (head, nav, footer)
│   ├── data/
│   │   └── project-overrides.yaml
│   ├── lib/
│   │   ├── github.ts            ← GitHub API fetch functions
│   │   ├── transform.ts         ← Raw API → our data model
│   │   └── types.ts             ← TypeScript interfaces
│   └── styles/
│       └── global.css           ← Your design tokens (--cyan, --ink, etc.)
├── public/
│   ├── fonts/
│   ├── models/                  ← 3D model files (.glb)
│   └── og-image.jpg
├── .github/
│   └── workflows/
│       └── rebuild.yml          ← Webhook-triggered rebuild
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

### Page Routing in Astro

Astro uses **file-based routing** — the folder structure IS the URL structure:

```
src/pages/index.astro        → vanshgupta.dev/
src/pages/projects/index.astro → vanshgupta.dev/projects/
src/pages/projects/[slug].astro → vanshgupta.dev/projects/repo-doc-mcp/
src/pages/changelog.astro    → vanshgupta.dev/changelog/
src/pages/about.astro        → vanshgupta.dev/about/
```

The `[slug].astro` file is a **dynamic route** — at build time, Astro generates one HTML page per project.

### Page Transitions

Astro supports the **View Transitions API** — smooth, app-like transitions between pages without a full-page reload:

```astro
// Base.astro layout
<head>
  <ViewTransitions />
</head>
```

This gives you crossfade/morph transitions between pages for free.

---

## 9. 3D & Interactivity Layer

### What "3D Interactive" Means in Practice

For a portfolio, 3D typically means:

1. **3D Hero Scene** — an animated 3D object/environment that reacts to mouse movement and scroll
2. **Scroll-Driven Animations** — elements transform in 3D as you scroll (parallax on steroids)
3. **Particle Systems** — ambient floating particles (you already have 2D particles!)
4. **Interactive 3D Models** — rotate/zoom objects on hover (e.g., a 3D server rack for your infra projects)
5. **Post-Processing** — bloom, depth of field, chromatic aberration for that premium feel

### Performance Considerations

3D is GPU-intensive. Key strategies:

| Strategy | What It Means |
|----------|--------------|
| **Progressive Enhancement** | 3D loads AFTER the page content. If WebGL isn't available, the page still works |
| **Level of Detail (LOD)** | Simpler geometry on mobile/low-power devices |
| **client:visible** | Only load the 3D component when it scrolls into view |
| **Instancing** | Render 1000 particles with a single draw call instead of 1000 |
| **Compressed Textures** | Use .ktx2 or .basis instead of .png for 3D textures |

### The 3D Stack for This Project

```
Astro (static HTML) 
  └─ React Islands (interactive components)
       └─ @react-three/fiber (3D rendering)
            ├─ @react-three/drei (helpers: Environment, Float, Text3D, etc.)
            ├─ @react-three/postprocessing (bloom, vignette)
            └─ gsap (ScrollTrigger for scroll-driven 3D animation)
```

### Example: Scroll-Driven 3D Camera

As the visitor scrolls down the page, the 3D camera orbits around a central object:

```
Scroll position: 0% (top of page)
  → Camera: front view, close up
  → Object: glowing wireframe sphere
  
Scroll position: 25% (about section)
  → Camera: rotated 90°, pulled back
  → Object: morphs into a grid/mesh
  
Scroll position: 50% (projects)
  → Camera: top-down view
  → Object: explodes into individual project orbs
  
Scroll position: 100% (contact)
  → Camera: far out, seeing the whole scene
  → Object: particles reform into your initials "VG"
```

This is achieved with GSAP ScrollTrigger controlling Three.js camera/object properties.

---

## 10. Deployment Pipeline

### The Rebuild Workflow

```yaml
# .github/workflows/rebuild.yml
name: Rebuild Portfolio

on:
  # Trigger 1: Direct push to portfolio repo
  push:
    branches: [main]

  # Trigger 2: Webhook from other repos
  repository_dispatch:
    types: [rebuild]

  # Trigger 3: Scheduled (daily, as a safety net)
  schedule:
    - cron: '0 6 * * *'  # 6 AM UTC daily

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npm run build
        env:
          GITHUB_TOKEN: ${{ secrets.GH_API_TOKEN }}

      - uses: amondnet/vercel-action@v25  # or cloudflare/pages-action
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./dist
```

### Setting Up Cross-Repo Webhooks

For each of your repos, add a small workflow:

```yaml
# .github/workflows/notify-portfolio.yml
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
            -d '{"event_type": "rebuild", "client_payload": {"repo": "${{ github.repository }}"}}'
```

---

## 11. Design Patterns Used

### 1. Content Layer Pattern (Data Fetching at Build Time)

Instead of fetching data at runtime, we fetch once during the build and embed it in the HTML. This is the core of SSG.

```
Build time: fetch() → transform → embed in HTML → deploy
Runtime:    serve pre-built HTML (no fetch needed)
```

### 2. Island Architecture (Astro's Core Pattern)

Most of the page is static HTML. Only interactive parts ("islands") ship JavaScript:

```
Page = Static HTML ocean + Interactive JS islands
```

This means a 50KB page instead of a 500KB SPA bundle.

### 3. Progressive Enhancement

The site works without JavaScript. 3D is an enhancement, not a requirement:

```
Layer 0: HTML content (works everywhere, accessible, SEO-friendly)
Layer 1: CSS animations (smooth transitions, hover effects)
Layer 2: JavaScript interactivity (filters, search, page transitions)
Layer 3: WebGL 3D scene (hero animation, particle system)
```

Each layer enhances the one below it. If WebGL fails, the page still looks great.

### 4. Event-Driven Architecture (Webhook Flow)

The rebuild is triggered by events, not polling:

```
Event (push) → Notification (webhook) → Reaction (rebuild)
```

This is the same pattern used in microservices, message queues, and reactive systems.

### 5. Separation of Concerns

```
Data fetching  → src/lib/github.ts     (how to get data)
Data transform → src/lib/transform.ts  (how to shape data)
Presentation   → src/components/*.astro (how to display data)
Configuration  → src/data/overrides.yaml (what to customize)
Automation     → .github/workflows/    (when to rebuild)
```

Each file has one job. Changing how you display a project card doesn't require changing how you fetch data.

---

## 12. Cost & Free Tier Limits

| Service | Free Tier | Your Usage | Headroom |
|---------|-----------|-----------|----------|
| **GitHub Actions** | 2,000 min/month | ~50 min (30 rebuilds x ~1.5 min) | 97% |
| **Vercel** | 100 GB bandwidth, unlimited deploys | ~1 GB | 99% |
| **GitHub API** | 5,000 req/hour (authenticated) | ~20 per rebuild | 99.6% |
| **Cloudflare Pages** (alt) | Unlimited bandwidth, 500 deploys/month | ~30 deploys | 94% |
| **Custom Domain** | $10-15/year | Optional | — |

**Total cost: $0/month** (or $10-15/year if you want a custom domain like `vanshgupta.dev`).

---

## 13. Decisions Still to Make

Before we start building, we need to decide on:

### Must-Decide
- [ ] **Framework:** Astro (recommended) vs Next.js vs SvelteKit
- [ ] **Hosting:** Vercel (recommended) vs Cloudflare Pages vs Netlify
- [ ] **3D scope:** Full scroll-driven 3D narrative vs subtle 3D accents on a 2D layout
- [ ] **Domain:** Custom domain (vanshgupta.dev?) or stick with vercel.app/github.io subdomain

### Can-Decide-Later
- [ ] **Cross-repo trigger method:** Per-repo workflow (start here) vs GitHub App (scale later)
- [ ] **Content:** Keep the magnifier/secrets mechanic or start fresh?
- [ ] **Dark/light mode:** Dark only (current) or both?
- [ ] **Blog/writing section:** Add later?
- [ ] **Analytics:** Vercel Analytics (free) or Plausible/Fathom?

---

## Next Steps

Once we've discussed this doc and made the decisions above, the implementation order will be:

1. **Scaffold** the Astro project with the multi-page structure
2. **Build the data layer** (GitHub API fetch + transform)
3. **Port your existing design** into Astro components
4. **Add 3D scenes** with React Three Fiber
5. **Set up the webhook pipeline** (GitHub Actions)
6. **Deploy** to Vercel
7. **Add the changelog section**
8. **Set up cross-repo triggers**
9. **Custom domain** (if desired)

Each step is independent and testable. We'll build one at a time.
