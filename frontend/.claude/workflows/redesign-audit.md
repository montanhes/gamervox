# Redesign Audit Workflow

## Sequence: Scan → Diagnose → Direct → Apply → Verify

### 1. Scan
- Read `tokens/colors.json`, `tokens/typography.json`, `tokens/motion.json`, `tokens/borders.json`, `tokens/shadows.json` — the token source of truth.
- Read `taste/design-taste.md` — the aesthetic archetype and banned defaults.
- Read `src/index.css` — the CSS custom properties that back every token class.
- Identify all components involved in the target change.

### 2. Diagnose
Check against banned defaults in `taste/design-taste.md`:
- Any hardcoded hex? → replace with token class
- Any blue/gray/red/white used outside of exceptions? → flag
- Emoji used? → replace with Lucide icon
- Radius inconsistent with token usage table? → align
- Motion missing `motion-reduce:` override? → add it
- `text-primary-foreground` on primary bg? → check contrast, may need `text-white`

### 3. Direct
This project's archetype is **Dark Gaming Platform** (see `taste/design-taste.md`).
Every component must feel at home in this aesthetic — dense, confident, dark, purple-accented.

For hero / marketing sections specifically:
- Tagline: large, bold, tight tracking. Size 3xl (mobile) → 4xl (sm+). Color: `text-foreground`.
- Subtitle: muted, base size, max-width constrained (max-w-xl). Color: `text-muted-foreground`.
- CTA button: `bg-primary` with `text-white`, `rounded-lg`, `px-6 py-2.5`, `font-semibold`. Hover: `bg-primary-hover`.
- CTA strip: `border border-border bg-surface rounded-surface` — subtle panel, not a banner. Text left, link right.
- No gradients on hero background. No decorative blobs. No hero images behind text.

### 4. Apply
Order of changes:
1. Token classes first — fix any off-token values.
2. Typography — size, weight, tracking.
3. Spacing — padding, gap, margin aligned to 4px grid.
4. States — hover, focus, active, disabled.
5. Motion — add transition + reduced-motion where missing.

Never change: routes, data fetching, i18n keys, aria labels, semantic HTML.

### 5. Verify
- `npm run build` — zero TypeScript errors.
- `npm run lint` — zero ESLint errors.
- Visual check: dark background, purple accent only, no blue/red/white surprises.
- Responsive: check mobile (375px) and wide (1280px+).
- Reduced-motion: every transform has motion-reduce override.

## Output Completeness Rule
Deliver complete component code. No `// ... rest unchanged` placeholders.
If a file is touched, deliver the whole file.
