# .AGENTS REPOSITORY REGISTRY & IMPLEMENTATION AUTHORITY INDEX

**Document**: `docs/agents/agents-index.md`  
**Purpose**: Primary Source of Truth for UI/UX, Frontend Architecture, Visual Design, Coding Standards, Accessibility, Testing, and Review Methodology in TaskFlow.  
**Authority Level**: STRICT IMPLEMENTATION MANDATE (Takes precedence over generic templates, AI dashboard patterns, and personal preferences).

---

## 1. Precedence & Governance Hierarchy

When resolving architectural, visual, or implementation questions, the following precedence hierarchy applies:

1. **Top Priority (Tier 1)**: `.agents/rules/` (`coding-standards.md`, `security-rules.md`, `testing-rules.md`).
   - Hard behavioral constraints, data protection, strict typing, and zero-defect rules.
2. **Design & UX Authority (Tier 2)**: `.agents/skills/frontend-design/SKILL.md` + `.agents/skills/theme-factory/SKILL.md` + `.agents/skills/web-artifacts-builder/SKILL.md`.
   - Authoritative anti-AI-slop design rules, typography hierarchy, palette constraints, layout discipline, and restrained purposeful motion.
3. **Verification & Quality Authority (Tier 3)**: `.agents/skills/webapp-testing/SKILL.md` + `.agents/rules/testing-rules.md`.
   - Browser reconnaissance, DOM inspection, Playwright / browser testing methodology, and zero regression policy.
4. **Domain & Task Guidance (Tier 4)**: Supporting skills (`brand-guidelines`, `livewire-crud`, `migration-generator`, `claude-api`, `doc-coauthoring`).

---

## 2. Inventory of Rules (`.agents/rules/`)

| File / Path | Purpose & Scope | Applicable Area | Precedence | When to Use |
|---|---|---|---|---|
| [`.agents/rules/coding-standards.md`](file:///var/www/html/task_manager/.agents/rules/coding-standards.md) | Enforces PHP 8.3+, typed properties, backed enums, model `$fillable`, explicit return types, PSR-12, service separation, and policy-driven authorization. | Backend (PHP, Laravel, Eloquent, Models, Controllers, Enums) | **Tier 1 (Mandatory)** | Before writing or refactoring any PHP/Laravel code, controllers, enums, or models. |
| [`.agents/rules/security-rules.md`](file:///var/www/html/task_manager/.agents/rules/security-rules.md) | Mandates strict tenant boundary isolation, policy enforcement on every resource, immutable append-only audit logging, CSRF, and input validation. | Backend Security, Authorization, Database, RBAC | **Tier 1 (Mandatory)** | On all API endpoints, policies, role updates, and data mutation handlers. |
| [`.agents/rules/testing-rules.md`](file:///var/www/html/task_manager/.agents/rules/testing-rules.md) | Requires MySQL testing (RefreshDatabase), deterministic assertions, zero mock of core calculations, and test-first verification before declaring work done. | Automated Testing, PHPUnit, Feature Tests | **Tier 1 (Mandatory)** | Prior to declaring any backend or API task complete. |

---

## 3. Inventory of Core UI/UX & Frontend Skills (`.agents/skills/`)

| Skill / Path | Purpose & Scope | Applicable Area | Precedence | Core Rules & Directives |
|---|---|---|---|---|
| [`.agents/skills/frontend-design/SKILL.md`](file:///var/www/html/task_manager/.agents/skills/frontend-design/SKILL.md) | Distinctive, intentional visual design. Explicitly forbids generic AI design tropes (cream background + serif + clay accent; all-caps labels; SaaS card kits; tracked-out eyebrows; random purple/blue gradients). | UI/UX Design, CSS, Typography, Layout, Copywriting | **Tier 2 (Primary Design Authority)** | For every page layout, typography choice, color palette decision, and component design. Spend boldness in one place; keep everything else quiet and disciplined. |
| [`.agents/skills/theme-factory/SKILL.md`](file:///var/www/html/task_manager/.agents/skills/theme-factory/SKILL.md) | Curated professional font and color themes (e.g., Tech Innovation `#0066ff`/`#00ffff`/`#1e1e1e`, Modern Minimalist `#36454f`/`#708090`/`#ffffff`, Ocean Depths). | Visual Identity, CSS Tokens, Color Palettes | **Tier 2 (Design Tokens)** | Defining the design token system and establishing consistent surfaces, borders, and text contrasts. |
| [`.agents/skills/web-artifacts-builder/SKILL.md`](file:///var/www/html/task_manager/.agents/skills/web-artifacts-builder/SKILL.md) | Component architecture and anti-AI-slop frontend guidelines. | Frontend React, Component Boundaries, State | **Tier 2 (Frontend Architecture)** | Building clean React component trees, avoiding excessive centered layouts, uniform rounded corners, or generic AI aesthetics. |
| [`.agents/skills/webapp-testing/SKILL.md`](file:///var/www/html/task_manager/.agents/skills/webapp-testing/SKILL.md) | Browser verification methodology (reconnaissance-then-action: navigate, wait for `networkidle`, inspect DOM, screenshot, execute actions). | Browser QA, End-to-End Verification, Responsive Testing | **Tier 3 (Verification)** | Verifying rendered application in actual browser viewports (1440, 1280, 1024, 768, 430, 390, 375). |
| [`.agents/skills/brand-guidelines/SKILL.md`](file:///var/www/html/task_manager/.agents/skills/brand-guidelines/SKILL.md) | Brand color harmony, contrast ratios, and typography pairing principles. | Brand Identity, Marketing Assets | **Tier 4 (Brand Cohesion)** | When styling marketing pages and aligning brand voice between public and authenticated app. |

---

## 4. Supporting Tooling & Domain Skills (`.agents/skills/`)

| Skill | Purpose | Applicable Area |
|---|---|---|
| `livewire-crud` | Checklist and patterns for tenant-scoped CRUD screens. | Full-stack CRUD UI workflows |
| `migration-generator` | Generating Laravel migrations matching strict database schemas. | Database schema evolution |
| `audit-engine` | High-precision audit logic, rule execution, and diff calculation. | Task audit and change tracking |
| `doc-coauthoring` | Structured workflow for technical specifications and decision documentation. | Architecture documentation |
| `mcp-builder` | Building Model Context Protocol servers. | Integrations & agent toolkits |
| `internal-comms` | Clear, concise communication patterns. | UI notifications & user feedback |
| `discernment-nudge` | Self-critique and assumption checking. | Code review & pre-release checks |

---

## 5. Explicit Anti-Patterns Forbidden by `.agents/`

1. **AI Design Tells (from `frontend-design` & `web-artifacts-builder`)**:
   - ❌ Never accent a single word in a headline with italic/bold/color.
   - ❌ Never use tracked-out ALL CAPS eyebrows above headings.
   - ❌ Never use the "SaaS-card kit" (content chopped into identical rounded cards with soft shadow `rgba(0,0,0,0.1)` and decorative gradient washes).
   - ❌ Never use random purple/blue gradients or generic "AI-powered" badge decoration.
   - ❌ Never use generic middle-dot meta strings (`A · B · C`) or append arbitrary `→` to every button.
   - ❌ Never decorate with meaningless floating geometric shapes or excessive whitespace.
2. **Copywriting Tells**:
   - ❌ Never write vague sales filler.
   - ✅ Write plain verbs, active voice, sentence case ("Save changes", not "Submit").
   - ✅ Errors must explain what went wrong and how to fix it without apologizing.
3. **Visual Restraint**:
   - ✅ Spend boldness in ONE memorable place; keep everything around it quiet, disciplined, and functional.
   - ✅ Visual structure must be information, not decoration.
