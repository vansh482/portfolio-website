<div align="center">

<!-- Animated Header -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:070B12,50:34E7E7,100:5B8DEF&height=220&section=header&text=Portfolio%20Website&fontSize=42&fontColor=E6EDF8&fontAlignY=35&desc=A%20single-file%20interactive%20portfolio%20with%20a%20magnifying%20glass%20that%20reveals%20hidden%20secrets&descSize=14&descColor=6F82A6&descAlignY=55&animation=fadeIn" width="100%" />

<br/>

[![HTML5](https://img.shields.io/badge/HTML5-single_file-E34F26?style=flat-square&logo=html5&logoColor=white)](index.html)
[![CSS](https://img.shields.io/badge/CSS-inline-1572B6?style=flat-square&logo=css3&logoColor=white)](#-css-architecture)
[![JS](https://img.shields.io/badge/JS-vanilla_ES5-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#-javascript-systems)
[![Lines](https://img.shields.io/badge/~600-lines_total-34E7E7?style=flat-square)](#)
[![No Build](https://img.shields.io/badge/build-none-46E08B?style=flat-square)](#)

</div>

---

## 🔍 The Core Idea

> **A magnifying glass cursor that reveals hidden content scoped to its circular area.**

The entire site is a single `index.html` — no build step, no framework, no dependencies beyond two CDN fonts and a smooth-scroll library. The magnifying glass isn't decorative; it's a functional lens that clones the DOM and shows secrets invisible on the main page.

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                            │
├─────────────┬──────────────────────┬────────────────────────┤
│   <style>   │       <main>         │      <script>          │
│   ~200 LOC  │   Semantic HTML      │      ~350 LOC          │
│   CSS vars  │   5 sections         │      Vanilla ES5       │
│   Keyframes │   Hidden secrets     │      No transpiler     │
└─────────────┴──────────────────────┴────────────────────────┘
```

### Why Single-File?

- **Zero deploy friction** — drop it anywhere, it works
- **No state management** — the DOM *is* the state
- **Inspectable** — View Source shows everything, no sourcemaps needed
- **Fast** — one request, one parse, done

---

## 🔮 Interactive Features & How They Work

### 1. Magnifying Glass Lens

```
┌──────────────────────────────────────────────────────────────┐
│  HOW IT WORKS                                                │
│                                                              │
│  Page (opacity:0 secrets)     Lens Clone (opacity:1 secrets) │
│  ┌───────────────────┐        ┌─────────┐                   │
│  │ Hello World       │        │ ●●●●●●● │ ← 160px circle    │
│  │ [secret hidden]   │───────▶│ SECRET! │    overflow:hidden │
│  │ More content      │ clone  │ ●●●●●●● │    scale(1.6)     │
│  └───────────────────┘        └─────────┘                    │
│                                                              │
│  Technique: cloneNode(true) → position with rAF → zoom 1.6x │
└──────────────────────────────────────────────────────────────┘
```

**Key insight:** The lens isn't a CSS filter — it's a full DOM clone of `<main>` positioned inside a 160px circle with `overflow:hidden`. Secrets have `opacity:0` on the page but `opacity:1!important` inside `.lens-inner`.

```css
/* Page: invisible */
.secret { opacity: 0; pointer-events: none; }

/* Inside lens clone: visible */
.lens-inner .secret { opacity: 1 !important; }
```

```javascript
// Every frame: position the clone to match cursor
lensEl.style.transform = `translate(${mouseX - 80}px, ${mouseY - 80}px)`;
lensInner.style.transform = `translate(${80 - 1.6*mouseX}px, ${80 - 1.6*(mouseY+scrollY)}px) scale(1.6)`;
```

**Rebuild strategy:** The clone goes stale when content changes (scroll reveals, count-up animations). It rebuilds:
- On page load + delayed (2.7s, 5s)
- On scroll (debounced 800ms)
- On resize (debounced 250ms)
- Stat values are patched directly from `data-count` attributes after cloning

---

### 2. Lens Border — Interactive Feedback

```
┌────────────────────────────────┐
│  Default     → White border    │
│  Over <a>    → Cyan glow       │
│  Over <btn>  → Cyan glow       │
│  cursor:ptr  → Cyan glow       │
└────────────────────────────────┘
```

Uses `document.elementFromPoint()` in the mousemove handler. Works because the lens has `pointer-events:none` — hit testing sees through it.

```javascript
var hovered = document.elementFromPoint(e.clientX, e.clientY);
var isClickable = hovered && (
  hovered.tagName === 'A' ||
  hovered.tagName === 'BUTTON' ||
  hovered.closest('a') ||
  hovered.closest('button') ||
  getComputedStyle(hovered).cursor === 'pointer'
);
lensEl.classList.toggle('hovering-link', !!isClickable);
```

---

### 3. Click-to-Reveal Secrets

```
┌──────────────────────────────────────────────────────────────┐
│  1. User sees partial secret text in magnifying glass        │
│  2. Clicks near it (within 100px radius)                     │
│  3. Secret gets .revealed class → full opacity + glow        │
│  4. After 4.8s → class removed, fades back to hidden         │
│                                                              │
│  Distance calc:                                              │
│  √((clickX - secretCenterX)² + (clickY - secretCenterY)²)   │
│  < 100px → REVEAL                                            │
└──────────────────────────────────────────────────────────────┘
```

---

### 4. Easter Egg: Unlock All 4 Numbered Secrets

```
Reveal #1 ─┐
Reveal #2 ─┤── All 4 revealed simultaneously? ──▶ 🏆 Popup!
Reveal #3 ─┤     │
Reveal #4 ─┘     ├─ First time: "secret unlocked" message
                  └─ Subsequent: Random fun message (5 variants)
```

The trick: each secret auto-hides after 4.8s, so you need to click all 4 quickly enough that they overlap.

---

### 5. Stack Section — Scatter & Reveal

```
┌─────────────────────────────────────┐
│        "Languages"  (centered)       │  ← Default: title visible
│                                      │
│   [hover] → title fades out          │
│   Tech icons scattered randomly      │
│   Only visible within 80px radius    │
│   of cursor position                 │
│                                      │
│   [click] → all pinned, grid layout  │
└─────────────────────────────────────┘
```

```javascript
// Distance-based opacity per tech item
var dist = Math.sqrt((mouseX - itemX)² + (mouseY - itemY)²);
item.style.opacity = dist < 80 ? '1' : '0';
```

---

### 6. Interactive Background (Canvas)

A network graph with ~54 nodes and proximity-based edge drawing. Nodes drift with slight velocity, edges appear when nodes are within range. Lightweight — no physics library.

---

## 🎨 CSS Architecture

### Design Tokens (CSS Custom Properties)

```css
:root {
  --ink: #070B12;      /* Deep dark background */
  --panel: #0D1422;    /* Card/section panels */
  --cyan: #34E7E7;     /* Primary accent */
  --blue: #5B8DEF;     /* Gradient end */
  --amber: #FFB454;    /* Stat suffix color */
  --ease: cubic-bezier(.16, 1, .3, 1);  /* Smooth overshoot */
}
```

### Animation Patterns

| Animation | Technique | Duration |
|-----------|-----------|----------|
| Hero letters | Per-char `animationDelay` stagger | 0.6s + stagger |
| Section reveals | IntersectionObserver + `.in` class | 0.8s ease |
| Stat count-up | `requestAnimationFrame` + easeOutCubic | 1.3s |
| Secret pulse | CSS `@keyframes` infinite | 2s |
| Rotating tagline | `setInterval` + opacity crossfade | 2.7s cycle |

### Responsive Strategy

- `clamp()` everywhere — no breakpoints for sizing
- Single `@media (max-width:820px)` for layout shifts
- `prefers-reduced-motion` — disables all animations, pins everything visible

---

## ⚡ JavaScript Systems

### No Framework — Just Patterns

| System | Lines | Technique |
|--------|-------|-----------|
| Lens clone & tracking | ~30 | `cloneNode(true)` + `rAF` loop |
| Reveal observer | ~8 | `IntersectionObserver` threshold 0.18 |
| Count-up animation | ~10 | `rAF` + easeOutCubic `(1-(1-p)³)` |
| Click-to-reveal | ~20 | Euclidean distance check on click |
| Stack scatter | ~30 | Per-item distance calc on mousemove |
| Canvas background | ~40 | Node/edge proximity graph |
| Smooth scroll | ~3 | Lenis library (optional) |

### Performance Considerations

- **Lens rebuild is expensive** (full DOM clone) — debounced, not per-frame
- **Lens positioning is cheap** — just transform updates in rAF
- **Canvas** uses `devicePixelRatio` capping at 2x
- **Stack mousemove** only calculates when `.exploring` (not pinned)
- **All animations** respect `prefers-reduced-motion`

---

## 📂 File Structure

```
portfolio-website/
└── index.html          ← Everything. CSS + HTML + JS. That's it.
```

---

## 🚀 Run Locally

```bash
# Any static server works. Pick one:
python3 -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

Open `http://localhost:8000` — no install, no build.

---

## 🧩 Reusable Patterns

### Want the magnifying glass in your project?

```html
<!-- 1. Add the lens element -->
<div class="lens"><div class="lens-inner"></div></div>

<!-- 2. CSS: circle + overflow hidden -->
<style>
.lens {
  position: fixed; width: 160px; height: 160px;
  border-radius: 50%; overflow: hidden;
  pointer-events: none; z-index: 9998;
}
.lens-inner { position: absolute; transform-origin: 0 0; }

/* Hidden on page, visible in lens */
.secret { opacity: 0; }
.lens-inner .secret { opacity: 1 !important; }
</style>

<!-- 3. JS: clone + track -->
<script>
const lens = document.querySelector('.lens');
const inner = document.querySelector('.lens-inner');
const SIZE = 160, ZOOM = 1.6;

// Clone your content container
function buildLens() {
  const clone = document.querySelector('main').cloneNode(true);
  clone.style.width = innerWidth + 'px';
  inner.innerHTML = '';
  inner.appendChild(clone);
}
buildLens();

// Track cursor every frame
(function loop() {
  const x = mouseX, y = mouseY, sy = scrollY;
  lens.style.transform = `translate(${x - SIZE/2}px, ${y - SIZE/2}px)`;
  inner.style.transform = `translate(${SIZE/2 - ZOOM*x}px, ${SIZE/2 - ZOOM*(y+sy)}px) scale(${ZOOM})`;
  requestAnimationFrame(loop);
})();
</script>
```

### Want click-to-reveal nearby elements?

```javascript
document.addEventListener('click', function(e) {
  document.querySelectorAll('.secret').forEach(function(s) {
    const r = s.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (dist < 100) {
      s.classList.add('revealed');
      setTimeout(() => s.classList.remove('revealed'), 4500);
    }
  });
});
```

### Want the scatter-reveal on hover?

```javascript
container.addEventListener('mousemove', function(e) {
  const rect = container.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  
  items.forEach(function(item) {
    const ir = item.getBoundingClientRect();
    const ix = ir.left + ir.width/2 - rect.left;
    const iy = ir.top + ir.height/2 - rect.top;
    const dist = Math.hypot(mx - ix, my - iy);
    item.style.opacity = dist < 80 ? '1' : '0';
  });
});
```

---

## 🎯 Design Decisions

| Decision | Why |
|----------|-----|
| Single file | Zero friction deploy, fully inspectable |
| No React/Vue | DOM clone trick doesn't play well with virtual DOM |
| ES5 syntax | No transpiler needed, runs everywhere |
| CSS vars over Sass | Native, no compile step, runtime-changeable |
| `cloneNode` over `mask-image` | Mask can't zoom or show different content |
| Debounced lens rebuild | Clone is expensive; transform is cheap |
| `overflow:hidden` circle | Simpler than clip-path for the lens effect |
| Inline secrets | They live in the DOM flow, not a separate layer |

---

## 🛠️ Tech Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Fonts | [Space Grotesk + Space Mono](https://fonts.google.com) | Display + monospace |
| Icons | [Devicon CDN](https://devicon.dev) | Tech stack icons in SVG |
| Scroll | [Lenis](https://lenis.darkroom.engineering) | Smooth scroll (optional) |
| Background | Canvas 2D | Animated node graph |
| Everything else | Vanilla HTML/CSS/JS | No dependencies |

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:070B12,50:34E7E7,100:5B8DEF&height=100&section=footer" width="100%" />

<sub>Built with obsessive attention to interaction design · ~600 lines · 0 dependencies · 1 file</sub>

</div>
