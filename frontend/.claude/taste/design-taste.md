# Gamervox — Design Taste & Aesthetic Direction

## Archetype: Dark Gaming Platform

**Primary reference:** GitHub Dark + gaming purple accent. Think: developer-grade dark UI adapted for a gaming community — dense, confident, low-noise.

**Closest named systems:** Linear (dark mode), GitHub (dark), Vercel (dark) — but with a purple primary instead of blue/neutral.

---

## Core Aesthetic Rules

### What this design IS
- **Dark-first, single mode.** No light mode. Background `#0b0e11` (near-black, slightly blue-tinted). Surface `#161b22`. These are GitHub's exact dark palette values.
- **Purple as the only accent.** `#9d4edd` — vivid, saturated, OKLCH ≈ (0.48, 0.21, 293°). Used for: primary actions, vote buttons, focus rings, hover borders, active states.
- **Yellow as semantic "No" / danger.** `#ffd60a` — unconventional. Not used as a warning color; it's the "No vote" paired against purple's "Yes vote". High contrast on dark (16:1). Treat as a semantic vote color, not a generic destructive.
- **Card-as-poster.** GameCard is portrait aspect-ratio (220:295), full-bleed image with gradient overlay, text at bottom. Feels like a game box art shelf.
- **Hover reveals depth.** Cards lift (-translateY), border switches to primary purple, deep shadow appears. Motion is orchestrated: translate + border + shadow all at 300ms ease-out.
- **Compact, dense UI.** Small text (14px body), tight spacing. Not airy. Information-dense by design — this is a feed/ranking app.

### What this design IS NOT
- No light backgrounds, no white surfaces.
- No blue primary (not Bootstrap, not default Tailwind, not Material).
- No rounded pill buttons — radius is 6px (control) and 10px (surface). Restrained, not bubbly.
- No decorative gradients on backgrounds — gradients only inside cards (image overlay: black to transparent).
- No emoji anywhere — use Lucide icons (ThumbsUp, ThumbsDown, ChartNoAxesCombined, Search, etc.).
- No drop shadows on flat surfaces — shadow only on hover state for depth signal.
- No color-only indicators — votes show icon + number + color.

---

## Token Usage Reference

| Intent | Token | Hex | Example |
|--------|-------|-----|---------|
| Page background | `bg-background` | `#0b0e11` | `<body>`, page wrapper |
| Card / panel | `bg-surface` | `#161b22` | GameCard, LoginPage card, Header |
| Body text | `text-foreground` | `#f0f6fc` | Headings, card titles |
| Secondary text | `text-muted-foreground` | `#8b949e` | Subtitles, labels, nav links at rest |
| Primary action | `bg-primary`, `text-primary` | `#9d4edd` | Buttons, links, active states, focus |
| Primary hover | `bg-primary-hover`, `text-primary-hover` | `#b06ee6` | Hover on primary elements |
| "No" vote / danger | `text-destructive`, `bg-destructive` | `#ffd60a` | No-vote button, error messages |
| Decorative border | `border-border` | `#30363d80` | Card edges, dividers |
| Structural border | `border-border-strong` | `#30363d` | Inputs, social login buttons |

---

## Typography Rules

- **One font: Inter.** No serif, no mono unless displaying code.
- **Headings:** bold (700), tight letter-spacing (`tracking-tight`). Size depends on context: page title = 3xl/4xl, section = xl/2xl, card = sm.
- **UI labels and nav:** semibold (600) or medium (500), 14px.
- **Body / descriptions:** base (16px) or sm (14px), medium (500).
- **Muted context text:** text-muted-foreground, same size as surrounding text.

---

## Motion Rules

- **Respect reduced-motion always.** Every transform has a `motion-reduce:` override.
- **Card lift:** 300ms ease-out. All properties together (translate + border + shadow via `transition-all`).
- **Button press:** 150ms ease-out, scale-90 on active. Fast = feels responsive.
- **Image zoom on card hover:** 300ms ease-out, scale-105. Paired with card lift.
- **Shimmer overlay:** 500ms ease-out, opacity 0→15% on hover. Subtle.

---

## Component Patterns

### Buttons
- **Primary CTA:** `bg-primary px-6 py-2.5 rounded-lg font-semibold text-white` — note `text-white` not `text-primary-foreground` (better contrast).
- **Secondary / outline:** `border border-border-strong px-3 py-2 rounded-control text-muted-foreground hover:border-foreground hover:text-foreground`.
- **Vote button:** `bg-primary/20 text-primary-hover h-9 rounded-lg` (yes) / `bg-destructive/20 text-destructive h-9 rounded-lg` (no). Semi-transparent fill, full-opacity text.
- **Tag chip:** `border border-primary rounded-lg px-1.5 py-0.5 text-xs` — minimal, label-like.

### Cards
- Portrait 220:295 aspect ratio. Full-bleed image. Gradient overlay `from-black via-black/50 to-transparent`. Text + VoteButtons at bottom inset.

### Inputs
- `bg-background border border-border-strong rounded-control` — inputs sit on the background color (darker than surface) to create depth.
- Focus: `focus-visible:border-primary focus-visible:outline-none` (border shift, no box ring — ring is global via `:focus-visible` in base styles).

---

## Banned Defaults (do not use)
- `bg-blue-*`, `text-blue-*` — no blue in this palette
- `bg-red-*`, `text-red-*` — red is not in this palette; yellow is the danger/destructive color
- `bg-gray-*`, `text-gray-*` — use semantic tokens (`muted-foreground`, `border-strong`) instead
- `bg-white`, `text-black` — never on dark surfaces (exception: `text-white` on gradient image overlays where the token would be wrong)
- `rounded-full` on buttons — reserved for avatars and very specific badge shapes
- Hardcoded hex values anywhere in TSX — always use token classes
- Emoji as icons — Lucide only
