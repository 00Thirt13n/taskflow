# TASKFLOW STRICT AGENT/UX DESIGN SPECIFICATION & AUDIT MANIFESTO

**Document**: `docs/design/implementation-spec.md`  
**Governing Authority**: `.agents/` (`rules/coding-standards.md`, `rules/security-rules.md`, `skills/frontend-design/SKILL.md`, `skills/theme-factory/SKILL.md`, `skills/web-artifacts-builder/SKILL.md`)  
**Status**: APPROVED DESIGN BLUEPRINT  

---

## 1. Phase 4: Expected vs Actual Behavior Audit

### Finding 1: AI Hero Headline & Gradient Gimmicks on Public Landing (`/`)
- **Applicable `.agents` Rule**: `.agents/skills/frontend-design/SKILL.md` (Design Principles & Typographic tells):
  > *"Avoid these default typographic treatments; they are the commonest tells of a generated page: Accenting just a single word or phrase in a headline, like putting one word in italic/bold or a different color... template chrome that appears whatever the subject: a tracked-out ALL-CAPS eyebrow label above every heading... a '→' appended to link and button text."*
- **Current Implementation**:
  - `LandingPage.jsx:38`: `<h1 className="hero-headline">Turn scattered work into <span className="hero-headline-gradient">clear execution</span>.</h1>`
  - Floating pill above headline: `<span className="hero-pill-badge"><span className="hero-pill-dot"></span>Modern Work Management Platform v2.0</span>`
  - Primary button: `Explore Live Demo →` with appended arrow icon.
  - Browser mockup contains fake macOS traffic light dots (`dot-red`, `dot-yellow`, `dot-green`).
- **Violation**: Classic AI design slop tell. Gratuitous gradient text accent, generic badge above headline, fake window dots decoration.
- **User Impact**: Communicates an amateur, generated product rather than a serious, credible commercial B2B work management system.
- **Root Cause**: Reliance on popular AI hero templates rather than disciplined editorial typography.
- **Proposed Correction**:
  - Remove gradient text span. Set headline in clean, deliberate high-contrast typography: *"The work management platform for high-velocity engineering."*
  - Remove fake macOS traffic dots and floating pill badge.
  - Remove generic `→` on button text; use clear active verb: *"Launch Interactive Demo"*.

---

### Finding 2: Unscoped Project Query Causing Duplicated Projects in Sidebar & Dashboard
- **Applicable `.agents` Rule**: `.agents/rules/security-rules.md` (Tenant Isolation):
  > *"Tenant Isolation: Every model with organization_id / workspace context MUST respect tenant boundaries. Never run tenant-scoped queries with no user/org context."*
- **Current Implementation**:
  - `ProjectController.php:25-36`: For admin users, queries `Project::with(['owner', 'members'])->get()` without scoping to the active workspace (`workspace_id`).
  - `Sidebar.jsx:17` & `ProjectsPage.jsx`: Fetches all projects, resulting in 8 projects (4 projects from Workspace 1 and 4 duplicate projects from Workspace 2) displayed simultaneously in the sidebar and cards.
- **Violation**: Severe tenant leaking / duplication bug.
- **User Impact**: Maya Lin sees duplicate "Website Redesign", "Mobile Application v2", etc., cluttering navigation and corrupting dashboard metrics.
- **Root Cause**: Missing workspace scope in `ProjectController::index` and lack of workspace context parameter.
- **Proposed Correction**: Scope `ProjectController::index` to the authenticated user's active workspace (e.g., `workspace_id = 1` for Northstar Engineering), deduplicating the project tree.

---

### Finding 3: SaaS Card Kit & Over-Rounded Card Clutter on Dashboard (`/app/home`)
- **Applicable `.agents` Rule**: `.agents/skills/frontend-design/SKILL.md` (Process & Restraint):
  > *"the SaaS-card kit: content chopped into identical rounded cards, one border-radius on everything regardless of hierarchy, the same soft grey shadow under each, and gradient washes as decoration... Spend your boldness in one place. Let one element be the memorable thing, keep everything around it quiet and disciplined, and cut any decoration that does not serve the brief."*
- **Current Implementation**:
  - 4 identical metric boxes in a 2x2 grid with generic color indicators (`#22c55e`, `#3b82f6`, `#eab308`, `#ef4444`).
  - 3 generic pill outline buttons (`[Kanban Board] [My Work] [All Projects]`) cluttering the header.
  - Project cards with identical empty progress bars ("0 of 1 deliverables completed 0%").
- **Violation**: Unfocused information architecture, repetitive KPI card boxes, lack of typographic hierarchy.
- **User Impact**: User does not know what needs attention first; looks like an AI tutorial dashboard.
- **Root Cause**: Filling screen space with widgets instead of answering: *"What is blocked, what is due today, and what am I working on?"*
- **Proposed Correction**:
  - Replace the 4 KPI boxes with a disciplined status bar focused on actionable signals: Blocked items requiring triage, urgent due dates, and active sprint velocity.
  - Remove repetitive empty progress bar cards. Provide a clean project status table/list with clear owners, key identifiers, and health indicators.

---

### Finding 4: ALL-CAPS Column Headers & Monospace Overuse in Tasks Views (`/app/tasks`)
- **Applicable `.agents` Rule**: `.agents/skills/frontend-design/SKILL.md` (Typographic Tells):
  > *"Avoid these default typographic treatments; they are the commonest tells of a generated page: Using all caps for labels... a monospace face for small data labels."*
- **Current Implementation**:
  - Kanban columns: `<span className="small fw-bold text-muted text-uppercase">To Do</span>`, `IN PROGRESS`, `DONE`.
  - Table headers: `KEY`, `TITLE & PROJECT`, `STATUS`, `PRIORITY`, `ASSIGNEE`, `DUE DATE`, `ACTIONS` in ALL CAPS.
  - Task keys: `<span className="font-monospace fw-bold text-primary">PORT-104</span>`.
  - Filter bar stacks 7 individual dropdowns and buttons taking up 350px on mobile before the first card is visible.
- **Violation**: Excessive all-caps labels, artificial monospace font on IDs, bloated mobile filter controls.
- **User Impact**: Harsh visual noise, poor readability, mobile Kanban unusable because filters push cards off-screen.
- **Proposed Correction**:
  - Switch all headers to clean, natural sentence case (`Todo`, `In progress`, `Done`, `Key`, `Title`, `Status`, `Assignee`, `Due date`).
  - Use clean tabular sans-serif figures instead of raw monospace for task keys.
  - Consolidate mobile filter toolbar into a compact single-row filter bar with responsive search and view pills.

---

## 2. Page-by-Page Strict Implementation Specifications

### Page 1: Global Application Shell (`Sidebar.jsx`, `GlobalHeader.jsx`, `AppLayout.jsx`)
- **Purpose**: Unified workspace navigation framing projects and personal work.
- **Primary User**: Any authenticated team member or engineering admin.
- **Information Hierarchy**:
  1. Workspace Header (TaskFlow mark + Northstar Engineering selector).
  2. Primary Navigation: **My Work** (active tasks assigned to me), **Projects** (structured initiatives), **Tasks** (global cross-project execution), **Reports** (delivery velocity).
  3. Projects Hierarchy: Scoped list of active projects (`WEB`, `MOB`, `INF`, `SEC`) with indicator dots.
  4. Administration (Admin only): **Team**, **Audit Log**, **System Health**.
  5. User Footer: Minimal avatar, name, theme toggle, sign out.
- **Anti-AI Tells Rules**: No ALL-CAPS section titles (use natural sentence case: "Overview", "Projects", "Admin"), no excessive borders, no floating glowing badges.

---

### Page 2: Public Homepage (`LandingPage.jsx`)
- **Purpose**: Communicates TaskFlow's value proposition as a commercial high-velocity engineering platform.
- **Primary User**: Prospective engineering lead or technical recruiter.
- **Information Hierarchy**:
  1. Header: Clean brand mark, direct links (Product, Security, Pricing, Docs), Sign in, and primary CTA.
  2. Hero: Direct, confident headline without gradient spans. Grounded copy on connecting roadmaps to commit velocity.
  3. Interactive Product Simulator: Real, authentic task and board simulator demonstrating actual state transitions without fake mac dots.
  4. Core Pillars: 4-tier domain model (Workspace → Projects → Tasks → Subtasks), policy-enforced RBAC, and verified database indexes.
  5. Footer: Clean site directory, status indicator, copyright.
- **Anti-AI Tells Rules**: No fake customer logos, no floating 3D shapes, no gradient text highlights, no arrows appended to buttons.

---

### Page 3: Authentication (`LoginPage.jsx`, `RegisterPage.jsx`)
- **Purpose**: Secure access with quick demo exploration for evaluators.
- **Primary User**: Evaluator, recruiter, or team member.
- **Information Hierarchy**:
  1. TaskFlow brand mark.
  2. Direct credential form (email, password).
  3. Clean persona selector for instant evaluation (Workspace Admin, Lead Engineer, Security Reviewer).
  4. Clear feedback banners on invalid credentials or rate limits without vague errors.

---

### Page 4: Home Cockpit (`DashboardPage.jsx`)
- **Purpose**: What needs my attention right now?
- **Information Hierarchy**:
  1. Actionable Header: Greeting, current sprint focus, immediate blocker alert if items blocked.
  2. Two-Column Working Layout:
     - Left: Active Deliverables & Blocked Work Items (direct jump to task detail).
     - Right: Sprint Delivery Velocity & Project Milestones.
- **Anti-AI Tells Rules**: No 4 oversized colorful KPI cards; use tight, disciplined metadata.

---

### Page 5: Tasks & Execution (`TasksPage.jsx`)
- **Purpose**: Core multi-view execution surface (List, Board, Calendar, Timeline).
- **Information Hierarchy**:
  1. View Switcher Bar: Minimalist segmented control (`List`, `Board`, `Calendar`, `Timeline`).
  2. Compact Filter Strip: Search input, project filter, status pill filters.
  3. Main Viewport:
     - **List**: Clean table with hover actions, inline status badge, assignee avatar, due date.
     - **Board**: Natural sentence case columns (`Todo`, `In progress`, `Done`), clean card typography, drag handle.
     - **Calendar**: Clean month grid with task agenda drawer.
     - **Timeline**: Chronological gantt bars with start/target date bounds.
- **Anti-AI Tells Rules**: No ALL-CAPS table headers, no monospace task keys, no lone red trash can icons without context.

---

### Page 6: Projects & Initiatives (`ProjectsPage.jsx`, `ProjectDetailPage.jsx`)
- **Purpose**: High-level initiative planning and team member management.
- **Information Hierarchy**:
  1. Project Header: Key, title, lead, target date, progress percentage.
  2. Scoped Project Tasks: Filtered view of tasks belonging strictly to this project.
  3. Team Members: Project roster with add/remove member controls guarded by owner/admin permissions.

---

## 3. Design Tokens & Palette Specification (`frontend/src/index.css`)

In accordance with `.agents/skills/theme-factory/themes/modern-minimalist.md` and `.agents/skills/frontend-design/SKILL.md`:
- **Surface Neutrals**:
  - Background Body: `#f8fafc` (Light) / `#090d16` (Deep technical slate dark)
  - Surface Card: `#ffffff` (Light) / `#131b2e` (Dark)
  - Subtle Border: `#e2e8f0` (Light) / `#1e293b` (Dark)
  - Text Primary: `#0f172a` (Light) / `#f1f5f9` (Dark)
  - Text Muted: `#64748b` (Light) / `#94a3b8` (Dark)
- **Primary Accent**: Single deliberate Indigo (`#4338ca` - disciplined, not neon).
- **Status Accents**:
  - Success: Emerald (`#059669`)
  - Warning: Amber (`#d97706`)
  - Blocker: Rose (`#e11d48`)
- **Typography**: System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) with strict sentence-case labels, no ALL-CAPS eyebrows.
- **Radius**: Restrained 6px (`0.375rem`) for buttons and inputs; 8px (`0.5rem`) for cards. No pill buttons or giant 24px rounded cards.
