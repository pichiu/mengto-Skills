---
name: 慈濟大巨蛋演繹管理系統
description: 深色、大字、慈濟藍的值勤台——長者志工也讀得清楚的營運工具(手機+瀏覽器 PWA)
colors:
  brand: "oklch(0.68 0.115 245)"
  brand-2: "oklch(0.60 0.12 248)"
  brand-ink: "oklch(0.16 0.02 255)"
  brand-soft: "oklch(0.68 0.115 245 / 0.14)"
  focus: "oklch(0.78 0.11 240)"
  bg: "oklch(0.17 0.014 255)"
  surface: "oklch(0.213 0.016 255)"
  surface-2: "oklch(0.255 0.018 255)"
  surface-3: "oklch(0.30 0.02 255)"
  line: "oklch(0.34 0.018 255)"
  line-soft: "oklch(1 0 0 / 0.08)"
  ink: "oklch(0.97 0.004 255)"
  ink-2: "oklch(0.82 0.010 255)"
  ink-3: "oklch(0.70 0.012 255)"
  ok: "oklch(0.74 0.15 155)"
  warn: "oklch(0.82 0.13 82)"
  danger: "oklch(0.68 0.19 25)"
  costume-white: "oklch(0.90 0.01 255)"
  costume-blue: "oklch(0.66 0.12 245)"
typography:
  display:
    fontFamily: "Noto Sans TC, PingFang TC, Microsoft JhengHei, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Noto Sans TC, PingFang TC, Microsoft JhengHei, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.2
  title:
    fontFamily: "Noto Sans TC, PingFang TC, Microsoft JhengHei, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Noto Sans TC, PingFang TC, Microsoft JhengHei, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Noto Sans TC, PingFang TC, Microsoft JhengHei, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.3
  mono:
    fontFamily: "ui-monospace, SF Mono, monospace"
    fontSize: "0.86rem"
    fontWeight: 400
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "7": "32px"
  "8": "40px"
  "9": "48px"
  "10": "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.md}"
    height: "56px"
    padding: "0 20px"
    typography: "{typography.title}"
  button-primary-hover:
    backgroundColor: "{colors.brand-2}"
    textColor: "{colors.brand-ink}"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "10px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink}"
  chip:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  select:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 40px 0 14px"
  stat-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: 慈濟大巨蛋演繹管理系統

## 1. Overview

**Creative North Star: "莊嚴值勤台 — The Serene Operations Deck"**

This is a working tool for Tzu Chi volunteers coordinating a stadium-scale dharma performance — seating, attendance, and cross-city bus logistics for 2,500+ registrations. It is not a marketing surface and never performs; it recedes so the task can lead. The register is **product**: design serves the work.

Two constraints shape everything. First, the operators skew **elderly** (the eligibility rules — 男<60 / 女<50 — reveal the crowd), so "深色 + 大字" is not a style choice but an **accessibility mandate**: an 18px type floor, ≥48px touch targets, and body contrast never below 4.5:1. Second, this is **慈濟** — the sole accent is 慈濟藍 (Tzu Chi Blue), used as a calm signal, never as decoration. The surface is a near-black blue-tinted deck; depth comes from **tonal layering**, not shadow theatrics. The feeling to reach for is a dignified, well-lit night desk: quiet, legible, instrument-grade.

It explicitly rejects the dark-mode reflexes: no neon/cyberpunk glow, no terminal tech-green, no gradient text, no glassmorphism, no SaaS hero-metric template, no cramped data grids of tiny gray text. Calm and readable beats clever.

**Key Characteristics:**
- Near-black, blue-tinted deck; hierarchy by **tone**, not borders or shadows.
- 慈濟藍 is the only accent — a signal for the current, the active, the actionable.
- Oversized, high-contrast type; 18px base, generous line-height (1.6).
- Large, forgiving touch targets (≥48px; primary actions 56px).
- One responsive shell: mobile bottom-nav ↔ desktop sidebar, same DOM.
- Status carried by a small semantic set: 已到/成功 green, 待確認/請假 amber, 未到/失敗 red.

## 2. Colors

A restrained dark palette: a blue-tinted near-black ground, three tonal surface lifts, a single blue accent, and a three-stop semantic set for status.

### Primary
- **慈濟藍 Tzu Chi Blue** (`oklch(0.68 0.115 245)`): the one accent. Active nav, primary buttons, current selection, progress fills, focus, links, "my seat". Rare by design — its scarcity is what makes it read as *signal*.
- **慈濟藍 Deep** (`oklch(0.60 0.12 248)`): primary-button hover/pressed only.
- **Blue Ink** (`oklch(0.16 0.02 255)`): text/icon color *on* blue fills, for AA contrast against the accent.
- **Blue Wash** (`oklch(0.68 0.115 245 / 0.14)`): translucent accent tint for selected chips, "報名"/"已到" pills, and subtle active zones.
- **Focus Blue** (`oklch(0.78 0.11 240)`): the `:focus-visible` ring only — a hair lighter than the brand so it reads on both surface and accent.

### Neutral (the deck)
- **Deck** (`oklch(0.17 0.014 255)`): page background. Near-black with a faint blue cast — never pure `#000`.
- **Surface** (`oklch(0.213 0.016 255)`): cards, panels, the resting plane.
- **Surface-2** (`oklch(0.255 0.018 255)`): secondary buttons, chips, app-bar chip, inset controls.
- **Surface-3** (`oklch(0.30 0.02 255)`): hover lift, progress-track, the topmost tonal step.
- **Line** (`oklch(0.34 0.018 255)`): opaque control borders (inputs, chips, buttons).
- **Line Soft** (`oklch(1 0 0 / 0.08)`): hairline dividers and card edges.
- **Ink** (`oklch(0.97 0.004 255)`): primary text — ~17:1 on Deck.
- **Ink-2** (`oklch(0.82 0.010 255)`): secondary text, labels.
- **Ink-3** (`oklch(0.70 0.012 255)`): metadata only (timestamps, sub-captions). The floor — never used for body copy.

### Tertiary (status + domain)
- **已到 Green** (`oklch(0.74 0.15 155)`): attendance present, success, 共修 events, capacity-healthy bars.
- **待確認 Amber** (`oklch(0.82 0.13 82)`): 請假 / 待確認 / 驗收 events / at-capacity warnings.
- **未到 Red** (`oklch(0.68 0.19 25)`): absent, failure, overload, 取消.
- **白服裝** (`oklch(0.90 0.01 255)`) / **藍服裝** (`oklch(0.66 0.12 245)`): the two costume states painted directly onto seat cells.

### Named Rules
**The One Blue Rule.** 慈濟藍 marks only what is *current, active, or actionable*. If more than roughly a tenth of a screen is blue, something non-signal has been painted with the signal color — pull it back to a neutral.

**The Blue-Tint Rule.** Every neutral carries a whisper of the brand hue (255). No pure black, no pure gray. The deck is quietly, unmistakably Tzu Chi's own.

## 3. Typography

**Display / Body Font:** Noto Sans TC (falls back to PingFang TC, Microsoft JhengHei, system-ui) — one humanist CJK family carrying the whole hierarchy through weight, not through pairing.
**Label / Mono Font:** `ui-monospace, SF Mono` — for seat numbers (`{列}-{排}`), phone numbers, plates, timestamps, and system metadata only.

**Character:** One warm, highly-legible CJK sans across the board; contrast comes from **size and weight**, never from a second family. No external webfonts load — the stack resolves to the reader's own system CJK face, which keeps the PWA self-contained and fast. Mono appears only where a fixed, scannable code reads better than prose.

### Hierarchy
- **Display** (700, `2.75rem` / clamp ceiling ~96px, line-height 1.15, `-0.01em`): the one big screen title per view (總覽, 交通調度…).
- **Headline** (800, `2.25rem`, line-height 1.2): the giant stat numbers on tiles (2,592 / 368 / 8 台).
- **Title** (700, `1.375rem`, line-height 1.3): card headings, person/bus names, section titles.
- **Body** (400, `1rem` = **18px**, line-height 1.6): all reading text. `text-wrap: balance` on headings.
- **Label** (700, `0.78rem`, line-height 1.3): chips, tile captions, axis codes. Sentence/term case — **never** all-caps tracked eyebrows.
- **Mono** (400, `0.86rem`): seat codes, phones, plates, timestamps.

### Named Rules
**The 18px Floor.** Body text never renders below 18px and body contrast never below 4.5:1. This is for the volunteers' eyes, not the designer's taste. Elegance that costs legibility is a defect here.

**The No-Eyebrow Rule.** No tiny uppercase tracked kicker above sections, and no `01/02/03` numbered markers. Hierarchy is size and weight; sequence is used only when the content is genuinely ordered.

## 4. Elevation

**Flat, layered by tone — not by shadow.** Depth is read from the four-step tonal ramp (Deck → Surface → Surface-2 → Surface-3), reinforced by `line-soft` hairlines. Cards sit on the deck with only a whisper of shadow; the app-bar is a translucent Deck (`/.92`) with a hairline, **no backdrop blur**. Real shadow is reserved for things that float above the page.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 2px oklch(0 0 0 / .35)`): cards and tiles — barely-there separation from the deck.
- **Floating** (`box-shadow: 0 8px 24px oklch(0 0 0 / .32)`): modals, toasts, and popovers only.

### Named Rules
**The Tonal-Lift Rule.** To raise an element, step it up the surface ramp (and lighten on hover to Surface-3) — do not reach for a shadow. Shadows mark *floating above the page*, not *emphasis within it*.

## 5. Components

### Buttons
- **Shape:** softly rounded (12px, `rounded.md`); pill only for toggles/chips.
- **Primary:** solid 慈濟藍 (`brand`) with Blue Ink text, full-width, **56px** tall, title-weight. The single loud action per context. Hover → 慈濟藍 Deep (`brand-2`).
- **Secondary (default):** Surface-2 fill, Ink text, `line` border, **48px** min. Hover lifts to Surface-3; `:active` scales to .97.
- **Ghost:** transparent with a `line` border; hover fills to Surface-2. For low-emphasis inline actions.
- **Icon button:** 48×48 square, Surface-2, `line` border — steppers, close, call.
- All buttons transition background/border/color at 200ms and transform at 150ms on the `cubic-bezier(.16,1,.3,1)` ease. Disabled = 0.45 opacity, `not-allowed`.

### Chips
- **Style:** pill (`rounded.pill`), Surface-2 fill, Ink-2 text, `line` border, label typography (700 / 0.78rem).
- **Typed variants:** event type chips tint toward their status hue via `color-mix` — 彩排 blue, 共修 green, 驗收 amber — border and text share the hue, fill is the matching `-soft` wash. Filter chips show selection with the Blue Wash fill + brand text.

### Cards / Containers
- **Corner:** 16px (`rounded.lg`); large surfaces 20px (`rounded.xl`).
- **Background:** Surface, on the Deck.
- **Shadow:** Resting only (see Elevation). **Never** nest a card inside a card.
- **Border:** 1px `line-soft` hairline.
- **Padding:** 20px (`spacing.5`) default; 16px on dense tiles.

### Inputs / Fields
- **Style:** Surface fill, `line` border, 12px radius, **48px** min height, 18px text; custom inline SVG chevron on selects (no native arrow).
- **Focus:** the global `:focus-visible` ring — 3px Focus-Blue, 2px offset. Applied consistently to every focusable control; `:focus{outline:none}` alone is never left bare.
- **Disabled / out-of-scope:** 0.45–0.5 opacity + `not-allowed`; scope-locked rows render read-only, tagged, and dimmed rather than hidden.

### Navigation
- **Mobile (<1024px):** fixed bottom bar, ~76px tall, 5 large icon+label targets; active item is 慈濟藍, `:active` scales to .94, safe-area padded.
- **Desktop (≥1024px):** 272px left sidebar — logo, the same items as rows (active = Blue Wash fill + brand text + brand rail), and a persona/user card pinned to the bottom.
- Same DOM drives both; nav items appear/disappear by capability, and the bar stays balanced as the count changes.

### Attendance Segment (signature)
A three-state exclusive control (`未到 / 已到 / 請假`) built as a bordered pill-group of ≥48px segments. Active states paint semantically: 未到 → Surface-3 (neutral), 已到 → Green on Green-wash, 請假 → Amber on Amber-wash. Optimistic taps get a brief `pulse` (250ms), then settle to the server value. The registration variant swaps in a `報名` state (Green-wash) for upcoming events.

### Seat Grid (signature)
The招牌 view: the West-One quadrant of the stadium (列 1–54 × 排 16–22) rendered as a CSS grid with `gridColumn = 55 − 列`, `gridRow = 排 − 15` (列1 rightmost, 排16 topmost). Cells carry a mono seat code `{列}-{排}`; on desktop they also show occupant name + 和氣 inline (no tap needed). Costume is painted per cell (白/藍); empty cells are outlined; "my seat" gets a double brand ring. Axis numbers run along the top (列) and left (排); an every-3-列 band labels {AB}·{藍白}·{男女}. The clipped corner (列51→排21, 52→20, 53→19, 54→18) is left unrendered so the count reads exactly **368**. The grid scrolls horizontally inside its own container (`overflow-x:auto`); the page body never scrolls sideways.

### Persona Switcher (signature)
A labeled "Demo · 以…身份檢視" select (grouped 個人 / 幕僚) in the app-bar (mobile) and sidebar card (desktop). Changing it swaps the viewer's scope + PII tier + capabilities + account type and re-renders every screen behind a 200ms fade, with a "檢視範圍" chip echoing the active identity.

## 6. Do's and Don'ts

### Do:
- **Do** keep body text ≥18px and ≥4.5:1 contrast; push toward Ink, not Ink-3, whenever it's close.
- **Do** make every interactive target ≥48px (primary buttons 56px), with full default/hover/`:focus-visible`/active/disabled states.
- **Do** convey depth by stepping the surface ramp (Deck → Surface → Surface-2 → Surface-3), not by adding shadow.
- **Do** reserve 慈濟藍 for the current/active/actionable — the One Blue Rule.
- **Do** carry status in the three-stop set: 已到 green, 請假/待確認 amber, 未到/失敗 red.
- **Do** let wide content (seat grid, tables) scroll inside an `overflow-x:auto` container; the body stays put.
- **Do** tint every neutral toward hue 255 — no pure black or gray.

### Don't:
- **Don't** use neon/cyberpunk glow, terminal tech-green, or any accent other than 慈濟藍. The blue is the identity.
- **Don't** use `background-clip:text` gradient text — solid color, emphasis by weight/size.
- **Don't** use glassmorphism/backdrop-blur as decoration (the app-bar is a plain translucent Deck, no blur).
- **Don't** build the SaaS hero-metric template or endless identical icon+heading+text card grids.
- **Don't** add tiny uppercase tracked eyebrows or `01/02/03` section markers.
- **Don't** use a colored `border-left`/`border-right` >1px as a side-stripe accent — use full hairlines, tonal fills, or leading chips instead.
- **Don't** let a heading overflow its container at any breakpoint — reduce the clamp or rewrite the copy; the viewport is part of the design.
- **Don't** drop body text to a light gray "for elegance" — on this deck that's the single biggest legibility failure, and these readers can least afford it.
