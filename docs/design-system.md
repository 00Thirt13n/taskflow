# TaskFlow Commercial Design System Specification

## 1. Design Philosophy: Dense, Modern, Intentional

TaskFlow's visual language is engineered for high-performance software teams. It emphasizes:
- **High Information Density**: No wasted vertical space, compact tables, scannable badges, and structured side panels.
- **Visual Restraint**: Subtle borders (`1px solid var(--border-subtle)`), low-opacity surface elevation, and purposeful color usage.
- **Flow & Momentum**: Fluid micro-transitions (150ms-200ms ease), optimistic UI updates, and instant keyboard shortcuts.

---

## 2. Color Palette & Semantic Tokens

### Brand Identity
- **Primary Brand**: Electric Indigo (`#4f46e5` / `#6366f1`) symbolizing clarity, focus, and modern engineering execution.
- **Secondary Accent**: Vibrant Cyan (`#06b6d4` / `#0ea5e9`) used for active indicators, timeline highlights, and progress markers.

### Semantic Status Tokens
Every status badge combines a distinct geometric icon with an accessible background and foreground color:
- `todo`: Neutral Slate (`#64748b`) — Work queued for execution.
- `in-progress`: Energetic Blue (`#2563eb`) — Active sprint or in-flight development.
- `review`: Royal Violet (`#7c3aed`) — Staged, QA review, or PR pending.
- `blocked`: Alert Crimson (`#dc2626`) — Dependencies missing or external impediment.
- `done`: Fresh Emerald (`#059669`) — Verified and completed.
- `archived`: Subdued Slate (`#94a3b8`) — Historical record.

### Semantic Priority Tokens
- `low`: Cool Gray (`#64748b`)
- `medium`: Amber Glow (`#d97706`)
- `high`: Warm Orange (`#ea580c`)
- `urgent`: Vibrant Rose (`#e11d48`) with subtle pulsing indicator

---

## 3. Typography Scale

TaskFlow utilizes a modern grotesque sans-serif stack (`Inter`, system sans-serif) for interface readability and an authentic monospace stack for code, timestamps, and task keys:

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `--font-display` | `2.5rem` (40px) | `1.15` | `700` | Landing Page Hero |
| `--font-h1` | `1.875rem` (30px) | `1.25` | `700` | Page Titles, Major Sections |
| `--font-h2` | `1.5rem` (24px) | `1.3` | `600` | Section Headings, Drawer Headers |
| `--font-h3` | `1.25rem` (20px) | `1.35` | `600` | Card Titles, Modal Headers |
| `--font-body-lg` | `1.0625rem` (17px) | `1.5` | `400 / 500` | Marketing Subheads, Featured Callouts |
| `--font-body` | `0.9375rem` (15px) | `1.5` | `400 / 500` | Primary Interface Text, Descriptions |
| `--font-caption` | `0.8125rem` (13px) | `1.4` | `500` | Table Headers, Meta Labels, Badges |
| `--font-mono` | `0.8125rem` (13px) | `1.4` | `600` | Task Keys (`WEB-101`), Timestamps, Commit Hashes |

---

## 4. Spacing Scale

Based on a consistent 4px / 8px grid:
- `--space-1`: `4px`
- `--space-2`: `8px`
- `--space-3`: `12px`
- `--space-4`: `16px`
- `--space-5`: `20px`
- `--space-6`: `24px`
- `--space-8`: `32px`
- `--space-10`: `40px`
- `--space-12`: `48px`

---

## 5. Border Radius & Shadows

### Radius Tokens
- `--radius-sm`: `4px` (Small badges, tags, compact inputs)
- `--radius-md`: `8px` (Buttons, inputs, task cards, dropdowns)
- `--radius-lg`: `12px` (Modals, cards, slide-over panels)
- `--radius-xl`: `16px` (Marketing containers, hero product frames)
- `--radius-full`: `9999px` (Pill badges, avatars)

### Elevation Shadows
- `--shadow-xs`: `0 1px 2px rgba(0, 0, 0, 0.05)`
- `--shadow-sm`: `0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)`
- `--shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- `--shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- `--shadow-xl`: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`

---

## 6. Dark Theme Tokens (`data-theme="dark"`)

Rather than simple color inversion, the dark theme is specifically tuned for low eye fatigue:
- Background: Deep slate-blue (`#090d16` canvas, `#0f172a` surface, `#1e293b` elevated surfaces).
- Borders: Crisp, low-contrast slate borders (`rgba(255, 255, 255, 0.08)`).
- Text: Primary `#f8fafc`, Secondary `#94a3b8`, Muted `#64748b`.
