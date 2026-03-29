# Design System Baseline — Sentiment AI (Analytics / People UI)

Primary design system baseline derived from the reference screenshots (light analytics dashboard, people lists, session detail, funnel builder, globe view). A single source of truth for fonts, colors, spacing, navigation patterns, and component behavior. Use this as the starting point for visual and UX decisions; treat as baseline, not constraint.

**Reference assets (workspace):** `assets/image-*.png` in `.cursor/projects/.../assets/` (same screens as this baseline).

---

## 1. Product context

- **Product:** Sentiment AI — analytics and people-centric workflows (metrics, journeys, funnels, realtime signals).
- **Visual model:** Modern SaaS “airy” light mode: white canvas, thin borders over heavy shadows, purple + sky-blue data accents, **dark floating navigation** for global modules. Popover-heavy filtering (time range, sort, activity level) rather than dense chrome.
- **Tech:** Framework-agnostic tokens; map to CSS variables, Tailwind theme, or a component library (e.g. MUI) as implemented. **Default experience is light mode**; dark tokens apply to the bottom dock and optional dark overlay cards (e.g. globe summary).

---

## 2. Color system

### 2.1 Brand & primary actions

| Role     | Name  | Hex       | Usage |
|----------|-------|-----------|--------|
| Primary  | main  | `#6366F1` | Primary buttons (e.g. Create), active nav item background, focus rings, chart series A, heatmap “active” cell, notification badge fill |
| Primary  | light | `#818CF8` | Hover on primary controls, links on light backgrounds |
| Primary  | dark  | `#4F46E5` | Pressed/active primary |
| Contrast | —     | `#FFFFFF` | Text/icons on primary fills |

Primary is a **vibrant indigo/violet**. Use for **one main CTA per focused view**, selected module in the dock, and primary data series. Avoid filling large areas with solid primary; pair with white space and gray structure.

### 2.2 Secondary & data visualization

| Role        | Name   | Hex       | Usage |
|-------------|--------|-----------|--------|
| Chart / accent B | sky | `#93C5FD` | Second line in charts, secondary emphasis (pairs with primary purple) |
| Pastel palette   | —   | `#C4B5FD`, `#A5B4FC`, `#99F6E4`, `#FDBA74` | Funnel / Sankey stages, soft category fills (use at controlled opacity on light backgrounds) |
| Marker / alert   | red | `#EF4444` | Globe pin, high-signal realtime dots (use sparingly) |

### 2.3 Secondary structure (dark chrome)

| Role        | Name    | Hex       | Usage |
|-------------|---------|-----------|--------|
| Dock / dark panel | surface | `#1A1A1E` | Floating bottom navigation bar |
| Dark card (elevated)| elevated | `#1A1A2E` | Optional dark floating summary card (e.g. metrics over globe); slight purple tint acceptable |
| On-dark text | primary | `#F9FAFB` | Titles and values on dark surfaces |
| On-dark text | muted   | `#94A3B8` | Labels, secondary row text on dark |

### 2.4 Semantic (feedback & status)

| Intent   | Main      | Light     | Dark      |
|----------|-----------|-----------|-----------|
| Success  | `#10B981` | `#34D399` | `#059669` |
| Error    | `#EF4444` | `#F87171` | `#DC2626` |
| Warning  | `#F59E0B` | `#FBBF24` | `#D97706` |
| Info     | `#3B82F6` | `#60A5FA` | `#2563EB` |

Use for delta badges (e.g. **+100%** in green), status chips, validation. **Do not** replace brand purple with semantic blues for primary actions.

### 2.5 Light mode — backgrounds & text

| Token              | Hex / value        | Usage |
|--------------------|--------------------|--------|
| Background default | `#FFFFFF`          | Page canvas (primary) |
| Background subtle  | `#F9FAFB`          | Optional page tint, chart bleed area |
| Background paper   | `#FFFFFF`          | Cards, modals, popovers |
| Background elevated| `#F3F4F6`          | Inputs, inactive controls, table headers |
| Background hover   | `#F3F4F6` / `#E5E7EB` | Row hover, menu item hover |
| Text primary       | `#111827` / `#1A1A1A` | Headings, names, main values |
| Text secondary     | `#6B7280`          | Labels, captions, axis labels |
| Text tertiary      | `#9CA3AF`          | Timestamps, metadata, placeholder |
| Divider / border   | `#E5E7EB` / `#F3F4F6` | 1px card and list borders |

---

## 3. Typography

### 3.1 Font family

Prefer a **clean geometric sans** for product UI:

```text
"Inter", "Geist", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

Use **tabular numerals** where metrics update (dashboard counts, percentages). For **URLs and paths** (e.g. `/auth/sign-up`, `/pricing`), use a **monospace** stack at body2 size:

```text
ui-monospace, "SF Mono", "Menlo", Monaco, Consolas, monospace
```

### 3.2 Type scale

| Variant   | Weight | Size        | Line height | Letter spacing | Use |
|-----------|--------|-------------|-------------|----------------|-----|
| display   | 700    | 1.75–2rem (28–32px) | 1.2 | -0.02em | Centered page titles (“People”, funnel titles) |
| h1        | 700    | 1.5rem (24px) | 1.3 | -0.01em | Section titles in pages |
| h2        | 600    | 1.125–1.25rem | 1.4 | default | Card headers, modal titles (“Add steps”) |
| body1     | 400–500| 1rem (16px)   | 1.5 | default | List names, body |
| body2     | 400    | 0.875rem (14px) | 1.5 | default | Subtitles (“8 people this week”), table metadata |
| caption   | 400    | 0.75rem (12px) | 1.4 | 0.02em | Axis ticks, small labels |
| button    | 500–600| 0.875rem (14px) | —   | 0.01em  | Pill buttons, dock (icon-led; label optional) |

- **Buttons:** Sentence case (`text-transform: none`).
- **Metric row:** Label = body2 secondary; **value** = large semibold (≈1.5–2rem) primary; delta = body2 with semantic color.
- **Table headers:** body2, medium gray, not all-caps unless space-constrained.

---

## 4. Shape & spacing

- **Spacing scale:** Base **8px**; use 8, 16, 24, 32, 40, 48 for layout rhythm. Prefer **generous** vertical spacing between title block and controls/lists.
- **Card / panel radius:** **12px** default; large modals or hero cards **16–24px** (e.g. “Add steps”, dark summary card).
- **Pills & inputs:** **9999px** (full pill) for tags (“Slack”, “Direct”, “Today”, date markers) or **6–8px** for compact chips.
- **Bottom dock:** **Stadium** shape (fully rounded ends); internal **active** item uses a **rounded square** (≈10–12px) behind the icon in primary purple.
- **Icon buttons:** Circular or rounded-square hit targets **40–44px** minimum on touch-friendly surfaces.
- **List rows:** No dividers between every row; separate with **padding** (e.g. 12–16px vertical). Optional hairline only when grouping.

---

## 5. Shadows & elevation

Favor **light gray** shadows and **1px hairline borders** on white; avoid heavy black drop shadows except on dark-on-light floating elements.

### 5.1 Popovers, menus, modals (light UI)

| Token        | CSS | Notes |
|--------------|-----|--------|
| **Popover**  | `0px 8px 24px rgba(15, 23, 42, 0.08), 0px 2px 8px rgba(15, 23, 42, 0.04)` | Sort menus, activity filters, workspace dropdowns |
| **Modal**    | `0px 24px 48px rgba(15, 23, 42, 0.12)` | Funnel “Add steps”; optional **backdrop** `rgba(15, 23, 42, 0.25)` with blur |

### 5.2 Dark floating bar / card

| Token        | CSS | Notes |
|--------------|-----|--------|
| **Dock**     | `0px 8px 32px rgba(0, 0, 0, 0.35)` | Bottom navigation |
| **Dark card**| `0px 12px 40px rgba(0, 0, 0, 0.25)` | Globe overlay metrics card |

### 5.3 Generic elevation (fallback)

**Light:**  
- Level 1: `0px 1px 3px rgba(0, 0, 0, 0.06)`  
- Level 2: `0px 4px 12px rgba(0, 0, 0, 0.08)`  

**Charts:** Prefer **flat** or minimal grid; tooltip uses **dark panel** (`#0F172A`–`#1E293B`) with **12px** radius and light text.

---

## 6. Component patterns (summary)

### 6.1 Application shell

- **Top bar (fixed or sticky):** Left: **logo** (simple ring or mark) + **workspace selector** (text + chevron). Right: **user avatar** (circle, initial). Height ~56–64px; background white; bottom border **1px** `#F3F4F6` optional.
- **Main content:** **Centered column** max-width ~720–960px for list/detail views; full width for charts/globe with consistent side padding **24–32px**.

### 6.2 Floating bottom navigation (“dock”)

- **Position:** Fixed, horizontally centered, **bottom** safe area + 16–24px margin.
- **Style:** Dark background **§2.3**, stadium pill; **5–6** outline icons (stroke ~1.5px). Inactive icons **muted gray**; **active** = icon on **primary rounded-square** or primary-tinted circle.
- **Badges:** Small pill on icon (e.g. globe) — **primary** fill, white **caption** number.

### 6.3 Filters & controls

- **Time filter:** Pill button “Today” / “This week” + chevron; same height as secondary actions.
- **Sort / session / activity:** Secondary **outline** pills; right side: **Recent** (clock + chevron), **filter** icon button. Opening a menu shows **white popover**, **Sort by** label, options with **leading icons** (clock, history, sparkles, grid).
- **Activity level (advanced):** Popover with **back** chevron, title, predicate (“is not”), **search** field, scrollable list (e.g. “Power Users (10+ sessions)”). Row hover = **§2.5** background hover.

### 6.4 Data display

- **Metric row:** Four columns (or responsive grid): dot color matches series → **label** → **big number** → **delta** (green/red). Mobile: 2×2 or swipe.
- **Line chart:** **Two** smooth lines (purple + sky blue); **minimal** axes; X-axis time labels sparse (e.g. 00:00, 10:00, 23:00). **Tooltip:** vertical cursor line; dark tooltip — title line (date + time), metrics as **Label: value** rows.
- **Bar mini-chart (realtime):** Thin vertical bars; **one** bar highlighted in primary.
- **Ring / score:** Neutral track; “Collecting” or loading copy in **text secondary** when empty.
- **Tables (Pages / Sources):** Title row + **Realtime >** or **Performance >** chevron link (body2, secondary). Headers light gray; rows clean; optional **brand icon** in source column.

### 6.5 Lists (People)

- Rows: optional **radio** circle, small **device/bot** icon, **gradient avatar** (vibrant two-stop CSS gradient), **name** (body1 primary), **flag** + **source pill** (Slack / Direct with icon), **relative time** right-aligned (body2 tertiary). **No** heavy row borders.

### 6.6 Profile & session timeline

- **Left column:** Large **gradient avatar**; name + **Anonymous** pill; metadata row (time, Slack pill); **stats** grid “First seen” / “Sessions”; **activity grid** (small circles, GitHub-style) with **one** cell in primary.
- **Right column:** **Today** pill on vertical connector; **session card** white, 12px radius, hairline border; events with **icon**, monospace **path**, duration right; **+N** pill for collapsed events; footer: integration icons + time.

### 6.7 Funnel / builder

- **Modal:** Blurred or dimmed backdrop; **eyebrow** (“Create funnel”) + **title** (“Add steps”); **subtitle** constraint copy; steps in **rounded** gray bordered rows with number, icon, remove **X**; **+ Add step** full-width secondary; footer **Back** (neutral) + **Create** (primary).

### 6.8 Globe / realtime map

- **Globe:** Light gray 3D or stylized sphere; **single** strong marker (red) + city label.  
- **Overlay card (optional):** Dark **§2.3** card with rows **Pages / Referrers / Countries**; each row: label + pill with value/icon + **chevron** affordance.

### 6.9 Buttons & links

- **Primary:** Filled **primary**, white text, **8–12px** radius, padding 12px 20px.  
- **Secondary / ghost:** Border `#E5E7EB`, white fill, text primary.  
- **Text links:** Primary or underline on hover; **“Realtime >”** style = secondary text + chevron, no underline default.

### 6.10 States

- **Empty:** Centered icon + short line in **text tertiary** (“This is where their journey begins”).  
- **Loading:** Skeleton blocks with **§2.5** elevated background; avoid spinners on every row.  
- **Error:** Semantic red + concise retry action.

### 6.11 Reusable primitives (frontend implementation)

The app standardizes on shared **Tailwind class tokens** and small **React primitives** so new screens match motion, focus, and surfaces in `app/globals.css` without duplicating long class strings.

| Artifact | Path | Role |
|----------|------|------|
| `cn()` | `frontend/lib/cn.ts` | Joins conditional class strings (`className={cn("base", condition && "extra")}`). |
| `ds` | `frontend/lib/ds.ts` | **Design tokens** — exported `ds.typography`, `ds.input`, `ds.button`, `ds.surface`, `ds.toast`, `ds.layout` with precomposed Tailwind for typography, inputs, buttons, modal/float surfaces, error toast, and modal layout rows. Prefer importing a `ds.*` key over copying the same utilities in multiple files. |
| UI barrel | `frontend/components/ui/index.ts` | Re-exports primitives; import from `@/components/ui`. |

**`ds` (summary — align new UI with these names)**

- **`ds.typography`:** `title` (modal / h2-style titles), `sectionTitle`, `cardSectionTitle` (compact in-card headings), `body`, `bodyPrimary`, `caption`, `overline`, `emptyState`.
- **`ds.input`:** `pill` (full pill, e.g. floating pair field), `search` (rounded field with room for a leading icon), `invalid` (validation ring — combine with pill or search).
- **`ds.button`:** `primaryRound` (circular primary CTA, e.g. analyze), `secondaryPill` (outline pill trigger), `ghostIcon` (icon-only ghost), `tabInactive` / `tabActive` (category tabs), `headerIcon` / `avatar` (top bar), `errorDismiss` (pale-rose error toast close).
- **`ds.surface`:** `card`, `modalPanel` (sheet / pair picker shell), `floatBar` (bottom floating analyze bar).
- **`ds.toast`:** `error` (validation / API error surface).
- **`ds.layout`:** `modalHeaderRow`, `modalNav`, `searchRow` (modal chrome).

**Components (`@/components/ui`)**

| Component | Use when |
|-----------|----------|
| **`Input`** | Single-line text; set `variant="pill"` or `variant="search"`, and `invalid` when validation fails. |
| **`SearchField`** | Modal search with optional **leading icon** — composes label + icon slot + `Input` `search` variant. |
| **`Spinner`** | Inline loading indicator; `size` in px; `variant="onPrimary"` for a white ring on **primary** fills (e.g. submit button loading). |
| **`IconButton`** | Square or circular **icon-only** controls; `variant`: `ghost`, `header`, `avatar`, `errorDismiss` (positions dismiss on error toasts). Always pass a clear `label` for accessibility. |

**Composition:** Prefer `ds` + `cn` for any new control. If Motion needs `motion.button` or `motion.div`, keep layout/motion on the motion node and pass **`className={cn(ds.button.secondaryPill, className)}`** (or the matching `ds` key) so visuals stay consistent.

---

## 7. Messaging & voice

- **Tone:** Professional, calm, precise — users scan metrics and journeys quickly. Avoid playful copy in dense analytics views; **empty states** may use one light metaphor (e.g. campfire) only if it matches product personality.
- **Hierarchy:** One primary number or action per card; supporting text in **secondary** color.
- **Time & relativity:** Prefer human-readable ranges (“This week”) with exact timestamps in tooltips or detail.
- **Actions:** Verbs for CTAs (**Create**, **Add step**); navigation chevrons imply **deeper detail**, not commitment.
- **Accessibility:** Maintain **4.5:1** contrast for body text on white; primary on white passes for large text/buttons; do not rely on color alone for series — include **legend dots** and tooltip labels.

---

## 8. UX flows & screen map (reference model)

Use this map when wiring routes and navigation; align module icons with the dock.

| Flow | Pattern |
|------|--------|
| **Workspace** | User switches context from top bar; persists filters where sensible. |
| **Dashboard** | Land on metrics + main chart; time filter drives series; drill via cards/tables. |
| **People list** | Time + sort + filter → scrollable list → row navigates to **person detail**. |
| **Person detail** | Split: identity + stats + activity grid \| session timeline; sessions expand inline. |
| **Funnels** | List or canvas → **Create** opens modal **Add steps** → Sankey/funnel visualization with pastel stages. |
| **Globe / realtime** | Full-bleed viz + optional dark summary card; badge on globe icon for pending items. |

**Interaction principles:** Prefer **overlays** (popover, modal) for secondary tasks; keep **scroll position** on list when closing popovers; **dock** always visible for orientation.

---

*End of baseline.*
