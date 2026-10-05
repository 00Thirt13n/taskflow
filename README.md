# TaskFlow — Modern Enterprise Work Management Platform

[![CI Pipeline](https://github.com/00thirt13n/taskflow/actions/workflows/ci.yml/badge.svg)](https://github.com/00thirt13n/taskflow/actions/workflows/ci.yml)
[![PHP Version](https://img.shields.io/badge/PHP-8.3-blue.svg)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)

> *"Work should move forward. A focused work management platform for engineering teams that need visibility, ownership, and predictable delivery."*

TaskFlow is an enterprise-grade work management platform engineered with the craftsmanship of a senior full-stack developer. Designed to deliver the product depth and information architecture of modern platforms like Linear, Plane, and GitHub Projects, TaskFlow pairs a high-performance **Laravel 11 REST API** with a dense, modern **React 18 Single-Page Application (SPA)**, backed by **MySQL 8.0** with strategic composite indexing and strict foreign key integrity.

---

## 1. Live Demo & Evaluation Credentials

- **Web Application URL**: `http://localhost:5173` (or deployed domain)
- **API Base Endpoint**: `http://localhost:8000/api`
- **Interactive OpenAPI Specification**: [`public/openapi.yaml`](file:///var/www/html/task_manager/public/openapi.yaml)
- **API Health Endpoint**: `http://localhost:8000/api/health`

### 🔑 Instant 1-Click Evaluation Credentials
The login page provides instant 1-click persona fill buttons for streamlined recruiter and interviewer exploration:

| Persona / Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Administrator (Alex Morgan)** | `admin@taskflow.dev` | `Password123!` | Global project oversight, user role administration, audit logs, and live system health diagnostics |
| **Standard User (Elena Carter)** | `elena@taskflow.dev` | `Password123!` | Developer workspace access, task management, Kanban boards, subtask tracking, and commenting |
| **Standard User (Sarah Chen)** | `sarah@taskflow.dev` | `Password123!` | Product designer demonstrating tenant isolation and IDOR protection against cross-user mutations |

---

## 2. Enterprise Product Hierarchy

TaskFlow avoids flat, simplistic CRUD lists by modeling real enterprise team operations across four structured domain tiers:

```
Organization
    ↓
Workspaces (e.g., "Acme Core Engineering")
    ↓
Projects (e.g., "Website Redesign", "Mobile App v2", "Infra & Security")
    ↓
Tasks (e.g., "WEB-101", "MOB-204", "INF-301")
    ↓
Subtasks  •  Dependencies  •  Discussions / Comments  •  Activity Logs
```

---

## 3. Feature Matrix & Capabilities

### Multi-View Task Suite
- 📋 **Interactive Table View**: High information density, bulk selection toolbar, sortable columns, and pagination.
- 📌 **Kanban Board**: Drag-and-drop swimlanes (Backlog, Todo, In Progress, Review, Done) with optimistic UI updates and instant status persistence.
- 📅 **Monthly Calendar View**: Visualizes task due dates and project milestones on an interactive calendar grid.
- ⏱️ **Gantt-Style Timeline Schedule**: Tracks project delivery windows, start dates, and target due dates.

### Collaboration & Detail Experience
- 🔍 **Slide-Over Task Detail Drawer**: Quick status/priority pickers, subtasks checklist with parent progress indicators (e.g. 2/3 completed), blocker reason flags, and discussion comments feed with author deletion rights.
- 📜 **Chronological Activity Timeline**: Records every state change, status transition, priority adjustment, and assignment with before/after state diffs.
- ⚡ **Global Command Palette (`Ctrl+K` / `/`)**: Keyboard-driven universal search across tasks, projects, users, and navigation shortcuts.
- 🔔 **Notification Center**: Header bell with unread badge count, notification items (assignments, comments, mentions), and mark-read actions.
- 📥 **My Work Experience**: Dedicated personal hub organized by Overdue, Due Today, Upcoming, and Completed tasks.

### Executive Analytics & Administration
- 📈 **Executive Reports & Velocity**: 7-day velocity net completion trends, project status distributions, team workload breakdown, and streaming CSV export.
- 🛡️ **Admin Center**: User management with 1-click role toggles, audit log inspector with JSON diff modal, and live system health diagnostics.
- 🎨 **Enterprise Design System & Dark Mode**: CSS custom properties supporting seamless light and dark mode toggling, system preference detection, and `localStorage` persistence.

### AI Task Assistant
- 🤖 **Natural Language Task Parser**: Parse natural phrases like *"Deploy Nginx security patches by Friday, high priority, assign to Michael"* into structured task drafts.
- 📝 **Automated Subtask Decomposition**: Generates actionable checklist subtasks from task descriptions.
- 💡 **Description Enhancer & Priority Classifier**: Polishes acceptance criteria with automatic heuristic fallback protection.

---

## 4. Technology Stack & Architecture

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

# 4. Run migrations and enterprise narrative seeder
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
*Current test suite: **41 passing tests, 160 assertions (0 failures)**.*

### Run Frontend Component Tests (Vitest)
```bash
cd frontend
npm test -- --run
```
*Current test suite: **9 passing tests across 4 test files**.*

---

## 7. Complete Documentation Suite

All architectural decisions, benchmarks, and interview preparation materials are documented in [`docs/`](file:///var/www/html/task_manager/docs/):

- [`docs/current-state-audit.md`](file:///var/www/html/task_manager/docs/current-state-audit.md): Complete baseline audit and enterprise transformation plan.
- [`docs/architecture.md`](file:///var/www/html/task_manager/docs/architecture.md): System architecture, 4-tier domain hierarchy, and request pipeline.
- [`docs/database.md`](file:///var/www/html/task_manager/docs/database.md): Schema specification, entity relationships, and foreign keys.
- [`docs/query-optimization.md`](file:///var/www/html/task_manager/docs/query-optimization.md): Before/after `EXPLAIN ANALYZE` benchmarks.
- [`docs/api.md`](file:///var/www/html/task_manager/docs/api.md): REST API reference documentation.
- [`docs/security.md`](file:///var/www/html/task_manager/docs/security.md): Threat modeling, IDOR prevention, and RBAC policies.
- [`docs/observability.md`](file:///var/www/html/task_manager/docs/observability.md): Monolog structured logs, health checks, and diagnostics.
- [`docs/backup-recovery.md`](file:///var/www/html/task_manager/docs/backup-recovery.md): MySQL backup strategy, binlogs, and disaster recovery.
- [`docs/accessibility.md`](file:///var/www/html/task_manager/docs/accessibility.md): WCAG 2.1 Level AA compliance audit.
- [`docs/design-decisions.md`](file:///var/www/html/task_manager/docs/design-decisions.md): Enterprise design system tokens and state strategies.
- [`docs/interview-guide.md`](file:///var/www/html/task_manager/docs/interview-guide.md): 14 in-depth interview questions and technical answers.
- [`docs/final-verification.md`](file:///var/www/html/task_manager/docs/final-verification.md): Verification matrix with automated test results.

---

## 8. License
The TaskFlow work management platform is open-source software licensed under the [MIT license](LICENSE).
