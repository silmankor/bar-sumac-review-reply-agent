# SOUS Design System

> **Powering Commerce for F&B**

SOUS is a hospitality-native commerce + operations platform for restaurants and food & beverage operators. It bundles together listings, orders, embedded commerce, inbox/CRM, finance, gift cards, marketing and a "Spotlight" feature for monitoring how a restaurant appears across the open web.

This design system captures the visual language used across the SOUS product (operator portal), marketing site, LinkedIn / launch visuals and the underlying shadcn/ui-based component library it is built on.

## Sources

The system was distilled from a single Figma file:

- **`SOUS X shadcn_ui • Product Design.fig`** — 95 pages, 1.5k top-level frames. Key reference pages used here:
  - `/SOUS-Color-System` — color tokens
  - `/Branding-Logo-Exploration` — logomarks, "Powered by SOUS" lockups
  - `/Typography` + `/Documentation/Variables` — type + variable reference
  - `/Older-Screen-overview`, `/Sign-off-screens`, `/DEMO`, `/Mega-demo` — product screens
  - `/Pro-Blocks-Application` + `/Blocks-Official` — application blocks (cards, sidebars, page headers, etc.)
  - `/Button`, `/Input`, `/Card`, `/Sidebar`, `/Table`, `/Dialog`, etc. — atomic shadcn components
  - `/SOUS-Linkedin-Post`, `/Cover` — brand visuals

The user uploaded the **Inter Display** font family (Light → ExtraBold + Italics) which is the dominant UI typeface in the file. **DM Sans** (used for the SOUS wordmark) and **Geist Mono** (docs / data) are loaded from Google Fonts. See "Caveats" at the bottom.

## Index

| Path | What |
|---|---|
| `colors_and_type.css` | All CSS variables — color, type, spacing, radius, shadow, and semantic resets (h1–h6, p, code, etc). Import this in any artifact. |
| `fonts/` | Inter Display web fonts (woff2). |
| `assets/` | Logos and a couple of brand visuals. |
| `preview/*.html` | Design-system cards (rendered in the Design System tab). |
| `ui_kits/portal/` | UI kit recreating SOUS Portal — sidebar shell, dashboard, listings, orders. |
| `SKILL.md` | Agent skill front-matter so this system can be used as a Claude Code skill. |

## CONTENT FUNDAMENTALS — voice, tone, copy

The product surface is the operator portal of a hospitality SaaS. Copy reads like a calm operations tool, not a consumer app.

- **Voice**: direct, pragmatic, hospitality-native. Reads like a competent ops manager talking to a restaurateur — not a developer, not a marketer.
- **Tone**: calm, confident, low-decoration. No exclamation points in product UI. Marketing copy permits more punch ("Your restaurant, found first.") but stays declarative.
- **Person**: second person ("Your restaurant", "Your guests") in marketing; third-person/imperative in product ("Add product", "Edit listing", "Resolve issue").
- **Casing**:
  - **Sentence case** for headings, page titles, dialog titles ("Edit listing", not "Edit Listing"). This is a strong rule — every page header in the file uses sentence case.
  - **Sentence case** for buttons too (`Save changes`, `Add product`, `Connect platform`).
  - **Title Case** appears only in nav/section labels (`My Locations`, `Order Boxes`, `Embedded Commerce`).
- **No emoji** in product UI. Emoji appears only inside guest-facing chat surfaces, and even then sparingly. Treat the product as emoji-free.
- **No exclamation marks** in operational copy. They are reserved for marketing one-liners.
- **Numbers, currency**: localized formatting (`€12,50`), short relative time (`2m ago`, `Today`, `Yesterday`).
- **Empty states**: a plain title + one-line subtitle + a single primary action. No illustrations of cartoonish characters; if a glyph appears it is a thin Lucide icon in muted grey.
- **Marketing one-liners** observed in animations:
  - "Guests trust what they see."
  - "Platforms rank what they can read."
  - "If your info's missing, you don't get seen."
  - "Inconsistent info online → fewer bookings."
  - "Most restaurants don't see it. Guests do."
  - "Spotlight finds it. Fixes it. Syncs it."
  - "Your restaurant, found first."
  - "Turn existing guests into new revenue."
  - "No new platforms. No extra admin. Just more ways to monetise."

These set the rhythm: short. declarative. periods, not exclamation marks. Often three beats.

## VISUAL FOUNDATIONS

### Surface system
- Predominantly **white** (`#ffffff`) and **off-white slate** (`#f8fafc`) surfaces. The off-white is the primary "canvas" colour — page background — while pure white is for cards/panels that sit on it.
- Hierarchy comes from **whitespace + 1px borders**, never shadows. The most common card is `background: #fff; border: 1px solid #e5e5e5; border-radius: 8–12px; box-shadow: 0 1px 2px rgba(0,0,0,.05)` — and even that shadow is barely there.
- **No glassmorphism**, **no gradients on cards**, **no glowing effects**. Backdrops are flat. Depth, where it exists at all, is the 1px border.

### Color
- **Brand primary**: `#212966` (SOUS Blue / deep navy-indigo). Used almost exclusively for the wordmark + a small set of brand moments. Inside the product UI, `--primary` is treated as near-black (`#0a0a0a`) per shadcn — buttons are black-on-white, not blue-on-white.
- **Accents** (used surgically, never wallpapered):
  - `#4ade80` — Spotlight / success / "found"
  - `#9747ff` — Spotlight Suggestions / AI surfaces
  - `#3b82f6` — info / link
  - `#f43f5e` — destructive
- **Neutrals**: shadcn `neutral` scale (`#fafafa → #0a0a0a`). Borders are almost always `#e5e5e5`.
- Color is restraint. A single dashboard view will routinely use **one** accent (a green dot for "live", a red badge for "issues") and the rest is neutral.

### Type
- **Inter Display** Medium (500) is the dominant face, mostly at **14px / 21px line-height** for body and table copy. Inter Display Regular handles secondary lines.
- **Inter Display** SemiBold (600) at 16/18/20/24 for headings.
- **DM Sans Medium** with `letter-spacing: -0.03em` is reserved for the SOUS wordmark and large brand moments only — do not use it for product copy.
- **Geist Mono** for inline tokens, IDs, and docs sample code.
- All headings use **sentence case** + tight tracking (`-0.02em`).
- Body text uses `text-wrap: pretty`; headings `text-wrap: balance`.

### Spacing
- 4px base. Common rhythm: 8 / 12 / 16 / 24 / 32 / 64. Pages breathe — typical page header has 32–48px of vertical padding.
- Tables and lists are deliberately roomy — row height 44–56px, never 28.

### Radius
- Defaults: `--radius: 8px` for buttons + inputs, `12–16px` for cards. Pill (`9999px`) only for chips/badges and icon-only ghost buttons. No exaggerated balloon cards.

### Borders
- `1px solid #e5e5e5` is the default everywhere.
- Selected/focused borders shift to neutral-300 (`#d4d4d4`) or the brand `#212966` with `box-shadow: 0 0 0 3px rgba(33,41,102,0.18)`.

### Shadow / depth
Three tiers, all faint:
- `--shadow-xs: 0 1px 2px rgba(0,0,0,.05)` — default for cards / buttons.
- `--shadow-md` — popovers / dropdowns.
- `--shadow-lg` — dialogs.

There are no "lifted" or "floating" cards. Cards sit. The platform is grounded, editorial, not glossy.

### Imagery
- Restaurant interiors and food, mostly warm-toned, photographic, light-natural. Not overly saturated. Often softly desaturated and slightly warm (think hospitality magazine).
- Logos of partner restaurants appear as small monochrome marks.
- For brand renders / launch visuals, the SOUS "S" logomark is rendered with a subtle inner shadow giving a deboss/embedded look — but this is **brand-only** treatment, never used inside the product.

### Animation
- Subtle, smooth, quiet. Opacity + small `translateY(2–6px)` on hover/enter. Never bounces, never overshoots.
- Easing: standard `cubic-bezier(0.2, 0, 0.2, 1)` (Tailwind `ease-out` flavour). Durations 120–240ms for state, 300–500ms for entry.

### Hover / press
- **Hover** = small opacity drop (`0.85`) on icon/ghost buttons, a one-step darker fill on solid buttons, and a `--bg-muted` tint on rows / list items.
- **Press** = no scale effect. Solid buttons drop another tone darker (`#1a2055` for primary). Ghost items tint `--bg-subtle`.
- Focus rings are explicit: `box-shadow: 0 0 0 3px rgba(33,41,102,0.35)` on the brand surface; on light surfaces, `rgba(0,0,0,0.18)`.

### Transparency / blur
Avoided. The system reads as flat panels. The only approved use is the dialog scrim (`rgba(0,0,0,0.5)`).

### Layout
- App shell: fixed left sidebar (260–280px), main column scrolls, sticky page header with breadcrumbs + actions.
- Pages cap at ~1280px content width with 32–48px gutters.
- Tables and forms are full-bleed within their card; cards are placed in a 16/24px gap grid.
- Marketing pages cap at ~1200px; headings sit on a soft slate canvas (`#f8fafc`).

## ICONOGRAPHY

The Figma file uses **Lucide** icons throughout (the `Icon / *` components reference Lucide names: `CircleHelp`, `Calendar`, `MapPin`, `Clock`, `Users`, `SendHorizontal`, `Gift`, `InnerShadowTop`, `Brightness`, `Dashboard`, `List`, `ChartBar`, `CirclePlus`, …). Stroke weight 1.5–2, square caps, square joins.

In this system we load Lucide from CDN (`https://unpkg.com/lucide@latest`) and reference it by name. No emoji is used in product UI. No PNG icon sprites — all icons are SVG, monochrome, sized 16/20/24px. Two-tone or filled icons appear only for status pills (a filled circle dot in `--accent-green` etc.).

The **SOUS logomark** itself (the curved "S" shape in `assets/sous-logomark.svg`) is the only custom-drawn brand mark. Use it at any size; it is `currentColor` so it inherits the wrapping text colour. The wordmark "SOUS" is set in **DM Sans Medium** with `-0.03em` tracking — there is no SVG wordmark; type it.

## CAVEATS

- **DM Sans** and **Geist Mono** are loaded from Google Fonts (no woff2 was uploaded for them). If you need them offline, please attach the woff2 files.
- The font file `InterVariable-Italic.woff2` was uploaded but no upright variable Inter was provided; Inter Display covers the upright weights and that's what the file actually uses, so I wired Inter Display directly.
- `Caveat` and `Merriweather` show up in the Figma metadata but at trivial counts — they are not part of the system.
- The "Spotlight" purple `#9747ff` is treated as an AI/feature accent; outside of those surfaces, prefer `--primary` (SOUS Blue) for accent moments.
- The product is large; the UI kit covers the most-used shell + dashboard + listings + orders patterns. Other surfaces (CRM, Finance, Gift Cards) reuse the same primitives.
