# TaskFlow Accessibility (a11y) Evaluation & Standards

## 1. Compliance Target: WCAG 2.1 Level AA

TaskFlow adheres to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA criteria across desktop, tablet, and mobile breakpoints.

---

## 2. Key Accessibility Implementations

### Visual Hierarchy & Color Contrast
- **Text Contrast Ratio**: All body copy meets or exceeds `4.5:1` against background tokens in both light and dark themes. Large headings (`h1`, `h2`) exceed `3.0:1`.
- **Status & Priority Indicators**: Status colors (green, amber, blue, red) are never used in isolation to convey meaning. Every badge includes clear textual labels and distinct geometric icon glyphs.

### Keyboard Navigation & Focus Management
- **Focus Rings**: All interactive elements (buttons, inputs, links, dropdowns) have visible focus outlines with 2px offset (`var(--primary)` color).
- **Escape Key Trap**: Modals (Create Task, Confirm Delete, Command Palette) and the Task Detail Slide-over drawer bind to the `Escape` key to close gracefully, returning focus to the trigger element.
- **Global Shortcuts**:
  - `Ctrl + K` or `Cmd + K`: Opens universal Command Palette.
  - `/`: Activates global search.
  - `C`: Triggers Quick Create Task modal (when not focused in an input field).

### Screen Reader & Semantic HTML
- **Semantic Tags**: The application shell utilizes `<header>`, `<nav>`, `<aside>`, `<main>`, `<section>`, and `<footer>` elements.
- **Form Controls**: Every form field features explicit `<label htmlFor="...">` bindings, ensuring screen reader context and clickable touch targets.
- **ARIA Attributes**:
  - Slide-over drawer: `role="dialog"` with `aria-modal="true"` and `aria-labelledby`.
  - Notification badge: `aria-label="5 unread notifications"`.
  - Kanban board columns: `role="region"` with descriptive headings and count badges.

---

## 3. Dark Mode Accessibility Considerations
- Dark mode utilizes dark slate backgrounds (`#090d16` and `#0f172a`) rather than pure `#000000` to prevent eye strain and chromatic aberration.
- Border tokens maintain a minimum `3:1` contrast against dark container backgrounds to ensure structural clarity.
