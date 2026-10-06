# TaskFlow — Modern Work Management Platform for Teams

[![CI Pipeline](https://github.com/00thirt13n/taskflow/actions/workflows/ci.yml/badge.svg)](https://github.com/00thirt13n/taskflow/actions/workflows/ci.yml)
[![PHP Version](https://img.shields.io/badge/PHP-8.3-blue.svg)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)

> *"Turn scattered work into clear execution. A focused work management platform for teams that need visibility, ownership, and predictable delivery."*

TaskFlow is an enterprise-grade commercial work management platform engineered with the craftsmanship of a senior full-stack developer. Designed to deliver the product depth, information architecture, and UI density of modern software tools like Linear, Plane, and GitHub Projects, TaskFlow pairs a high-performance **Laravel 11 REST API** with a modern **React 18 Single-Page Application (SPA)**, powered by **MySQL 8.0** with strategic composite indexing and strict foreign key integrity.

---

## 1. Public Review & Live Demo Credentials

- 🌐 **Public Live Review URL**: [https://taskflow.pochyaa.com/](https://taskflow.pochyaa.com/)
- ⚡ **API Base Endpoint**: [https://taskflow.pochyaa.com/api](https://taskflow.pochyaa.com/api)
- 🟢 **Live System Health Endpoint**: [https://taskflow.pochyaa.com/api/health](https://taskflow.pochyaa.com/api/health)
- 📖 **Interactive OpenAPI Specification**: [https://taskflow.pochyaa.com/openapi.yaml](https://taskflow.pochyaa.com/openapi.yaml) (or [`public/openapi.yaml`](file:///var/www/html/task_manager/public/openapi.yaml))
- 💻 **Local Development URL**: `http://localhost:5173` (Vite) / `http://localhost:8000` (Laravel)

### 🔑 Instant 1-Click Evaluation Personas (Northstar Engineering)
The login screen features instant one-click persona fill buttons for immediate evaluation:

| Persona / Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Maya Lin (Workspace Admin)** | `admin@taskflow.dev` | `Password123!` | Global project oversight, team role administration, audit logs with JSON diffs, and live system diagnostics |
| **Arjun Patel (Lead Engineer)** | `demo@taskflow.dev` | `Password123!` | Engineering lead managing Customer Portal (`PORT`) and Platform Reliability (`REL`) tasks, boards, and subtasks |
| **Sofia Rossi (Staff Designer)** | `sarah@taskflow.dev` | `Password123!` | Staff product designer demonstrating strict tenant isolation and server-side IDOR policy enforcement |

---

## 2. Commercial Domain Model Hierarchy

TaskFlow models real enterprise team operations across five structured tiers:

```
Organization (Northstar Labs)
    ↓
Workspaces (e.g., "Northstar Engineering")
    ↓
Projects (e.g., "Customer Portal v2", "Platform Reliability", "Product Launch")
    ↓
Work Items (e.g., "PORT-101", "REL-204", "LAUNCH-305")
    ↓
Subtasks (Checklist)  •  Blocker Flags  •  Discussions  •  Activity Logs
```

---

## 3. Product Architecture & Capabilities

### Public Commercial Marketing Website
- 🌐 **Modern SaaS Homepage (`/`)**: Value proposition (*"Turn scattered work into clear execution"*), real interactive browser-style product window (with live tabs for Overview, Board, and Timeline), problem-to-solution narrative, and grounded AI showcase.
- 📱 **Role-Based Solutions (`/solutions`)**: Targeted use cases for Engineering, Product Managers, DevOps/Operations, and Executive Leadership.
- 🛡️ **Architecture-Based Security (`/security`)**: Real security specifications: RBAC Policies, anti-IDOR boundaries, rate limiting, and immutable audit logs.
- 💰 **Transparent Editions (`/pricing`)**: Free live Community Demo tier vs Team Workspace and Enterprise Cloud preview tiers.
- 📬 **Interactive Inquiries (`/contact`)**: Instant demo request and contact form with simulated submission feedback.
- 🟢 **Live Status Page (`/status`)**: Real-time probe of API latency, MySQL database connectivity, and worker status.

### Authenticated Workspace Application (`/app/*`)
- 🏠 **Home Cockpit (`/app/home`)**: Morning briefing (*"Good morning, Arjun"*), focus chips, attention needed widget (blocked and overdue deliverables), project health bars, and priority task lists.
- 📥 **My Work (`/app/my-work`)**: Personal productivity hub organized by Overdue, Due Today, Upcoming, and Completed tasks.
- 📁 **Projects & Health (`/app/projects`)**: Delivery streams with calculated health indicators (`Healthy`, `At Risk`, `Delayed`), progress bars, and member rosters.
- 📌 **Multi-View Task Suite (`/app/tasks`)**:
  - **Interactive Table View**: Compact rows, bulk selection toolbar (status, priority, delete), column filtering, and pagination.
  - **Kanban Board**: Drag-and-drop swimlanes (Backlog, Todo, In Progress, Review, Done) with optimistic UI reordering and status persistence.
  - **Monthly Calendar Grid**: Visualizes task due dates and project milestones.
  - **Gantt-Style Timeline Schedule**: Tracks project delivery windows and progress percentages.
- 🔍 **Slide-Over Task Detail Drawer**: Inline status and priority pickers, subtasks checklist with progress counts (e.g. 2/3 completed), blocker toggle with reason, discussion comments feed with author permissions, and chronological activity timeline.
- ⚡ **Global Command Palette (`Ctrl+K` / `/`)**: Universal keyboard search across tasks, projects, users, and navigation shortcuts.
- 🔔 **Notification Center**: Global header bell with unread badge count, notification items (assignments, comments, mentions), and mark-read actions.
- 📊 **Executive Reports (`/app/reports`)**: 7-day velocity net completion trends, project status distributions, team workload breakdown, and streaming CSV export.
- 🛡️ **Admin Center (`/app/admin/*`)**: User management with 1-click role toggles, audit log inspector with JSON diff modal, and live system health diagnostics.
- 🎨 **Enterprise Design System & Dark Mode**: CSS custom properties supporting seamless light and dark mode toggling (`data-theme="dark"`).

### Grounded AI Assistant
- 🤖 **Natural Language Parser**: Converts phrases like *"Deploy Nginx security patches by Friday, high priority, assign to Daniel"* into structured task drafts.
- 📝 **Automated Subtask Decomposition**: Generates actionable checklist subtasks from task descriptions.
- 💡 **Description Enhancer & Priority Classifier**: Refines acceptance criteria with automatic heuristic fallback protection.
- 🔒 **Grounded Principle**: *"AI suggests. Your team decides."* All AI outputs are previewed and confirmed before database persistence.

---

## 4. Technology Stack & Performance

### Backend
- **Framework**: Laravel 11.x on PHP 8.3.35.
- **Authentication**: Laravel Sanctum token-based authentication with anti-enumeration protection and instant token revocation.
- **Authorization**: Granular Laravel Policies (`TaskPolicy`, `ProjectPolicy`, `AdminPolicy`) enforcing strict server-side RBAC and IDOR prevention.
- **Architecture**: Thin controllers, Form Requests for edge validation, Service layer (`AiTaskSuggestionService`, `AuditLoggerService`), and Eloquent API Resources.

### Database & Performance
- **Engine**: MySQL 8.0.46 (InnoDB, UTF8mb4, strict foreign key constraints).
- **Composite Indexing**:
  - `tasks(project_id, status, position)`: Accelerates Kanban queries.
  - `tasks(assignee_id, status, due_date)`: Powers the "My Work" page without disk filesort.
  - `tasks(workspace_id, status, due_date)`: Accelerates executive reports.
- **Measured EXPLAIN Performance**: Under **0.09 ms** execution time with zero temporary disk filesort (`Extra: NULL`).

### Frontend
- **Framework**: React 18, Vite 5, JavaScript (ES2024), React Router v6.
- **Design Tokens**: Custom CSS variables for light/dark themes (`data-theme="dark"`).
- **State Strategy**: Local component state for UI + React Context for application-wide concerns (`AuthContext`, `ThemeContext`).

---

## 5. Quick Start (Local Development)

### Prerequisites
- PHP 8.2 or 8.3 with `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `curl` extensions.
- Composer 2.x
- Node.js 18+ and npm
- MySQL 8.0

### Backend Setup
```bash
# 1. Clone repository
git clone https://github.com/00thirt13n/taskflow.git
cd taskflow

# 2. Install PHP dependencies
composer install

# 3. Configure environment
cp .env.example .env
php artisan key:generate

# 4. Run migrations and enterprise narrative seeder (Northstar Engineering)
php artisan migrate:fresh --seed

# 5. Start Laravel development server
php artisan serve --port=8000
```

### Frontend Setup
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Run Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 6. Testing

### Run Backend Feature & Unit Tests (PHPUnit)
```bash
php artisan test
```
*Current test suite: **47 passing tests, 178 assertions (0 failures)**.*

### Run Frontend Component Tests (Vitest)
```bash
cd frontend
npm test -- --run
```
*Current test suite: **9 passing tests across 4 test files**.*

---

## 7. Complete Documentation Suite

All architectural decisions, benchmarks, and product specifications are documented in [`docs/`](file:///var/www/html/task_manager/docs/):

- [`docs/ui-ux-audit.md`](file:///var/www/html/task_manager/docs/ui-ux-audit.md): Comprehensive UI/UX bug audit across 6 viewports and resolution plan.
- [`docs/design-system.md`](file:///var/www/html/task_manager/docs/design-system.md): Centralized typography, spacing, radius, shadows, and color tokens.
- [`docs/product-positioning.md`](file:///var/www/html/task_manager/docs/product-positioning.md): Brand voice, messaging pillars, and commercial vocabulary.
- [`docs/final-qa.md`](file:///var/www/html/task_manager/docs/final-qa.md): Multi-viewport responsive audit and commercial readiness verification.
- [`docs/architecture.md`](file:///var/www/html/task_manager/docs/architecture.md): System architecture, 5-tier domain hierarchy, and request pipeline.
- [`docs/database.md`](file:///var/www/html/task_manager/docs/database.md): Schema specification, entity relationships, and indexing rationale.
- [`docs/query-optimization.md`](file:///var/www/html/task_manager/docs/query-optimization.md): Before/after `EXPLAIN ANALYZE` benchmarks.
- [`docs/api.md`](file:///var/www/html/task_manager/docs/api.md): REST API reference documentation for all 44 endpoints.
- [`docs/security.md`](file:///var/www/html/task_manager/docs/security.md): Threat modeling, IDOR prevention, and RBAC policies.
- [`docs/observability.md`](file:///var/www/html/task_manager/docs/observability.md): Monolog structured logs, health checks, and diagnostics.
- [`docs/backup-recovery.md`](file:///var/www/html/task_manager/docs/backup-recovery.md): MySQL backup strategy, binlogs, and disaster recovery.
- [`docs/accessibility.md`](file:///var/www/html/task_manager/docs/accessibility.md): WCAG 2.1 Level AA compliance audit.
- [`docs/interview-guide.md`](file:///var/www/html/task_manager/docs/interview-guide.md): 14 in-depth technical interview questions and model answers.
- [`docs/final-verification.md`](file:///var/www/html/task_manager/docs/final-verification.md): Verification matrix with automated test results.

---

## 8. License
The TaskFlow work management platform is open-source software licensed under the [MIT license](LICENSE).
