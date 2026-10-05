# TaskFlow — Comprehensive Implementation Plan

## 1. Project Overview & Objectives
**TaskFlow** is an enterprise-grade, full-stack Task Management application designed and built to reflect the engineering standards of a strong 4-year experienced PHP/Laravel/MySQL full-stack developer.

The system prioritizes:
- **Rock-solid Core**: Authentication (Sanctum), RBAC (Admin & User roles), Task CRUD with rich filtering, search, pagination, and ownership controls.
- **Relational Integrity & Query Performance**: Normalized schema, foreign key constraints, strategic composite indexes, and documented `EXPLAIN` analysis.
- **Clean Architecture**: Thin controllers, Form Request validation, Laravel Policies for authorization, Eloquent API Resources, dedicated service classes for AI and Audit, and centralized exception handling.
- **Modern Responsive Frontend**: React + Vite SPA, clean functional components with Hooks, responsive UI with Bootstrap 5 + custom CSS tokens, accessible interactive controls, debounced search, and zero leaky secrets.
- **Production DevOps & Security**: Docker Compose stack (Nginx, PHP-FPM, MySQL), GitHub Actions CI/CD pipeline, hardened HTTP security headers, CORS, rate limiting, and audit logging.
- **Optional Resilient AI**: Gemini-powered task suggestion (priority, category, summary) with backend isolation and graceful heuristic fallback.

---

## 2. Environment & System Inspection Findings (Phase 0)

| Component | Detected Version / Status | Assessment & Decision |
|---|---|---|
| **Operating System** | Ubuntu 24.04 LTS (x86_64) | Local development and execution host. |
| **PHP** | 8.3.35 (cli) with OPcache | Supports modern PHP 8.3 features: typed properties, backed enums, match expressions, readonly properties. |
| **PHP Extensions** | `pdo_mysql`, `bcmath`, `curl`, `mbstring`, `openssl`, `tokenizer`, `xml`, `zip`, `redis` | All required Laravel 11 extensions are present and active. |
| **Composer** | 2.7.1 | Ready for Laravel package installation. |
| **Node.js & npm** | Node v22.23.3, npm 10.9.9 | Modern Node runtime, fully compatible with Vite 5/6 and React 18+. |
| **Database** | MySQL 8.0.46 (active on port 3306) | Local MySQL instance active. Database `taskflow` will be provisioned. |
| **Cache / Queue** | Redis active on 127.0.0.1:6379 | Available for sessions/cache/queue when configured. |
| **Web Server** | Apache 2 active on port 80; Nginx available | Apache runs default vhosts. For TaskFlow, Laravel dev server (`artisan serve`) and Vite dev server (`npm run dev`) provide local DX, while production Nginx configs are prepared for Docker/VPS. |
| **Tunneling / Public URL** | `cloudflared` & `ngrok` installed | Ready for instant live HTTPS tunneling and verification. |
| **Docker** | Not installed on host | Complete multi-stage Dockerfiles (`Dockerfile.backend`, `Dockerfile.frontend`) and `docker-compose.yml` will be provided and documented. |
| **Git** | Initialized on `main` branch | Clean atomic commits mapped to milestones. |

---

## 3. System Architecture & Directory Structure

```
task_manager/
├── app/
│   ├── Enums/                 # Backed string enums (TaskStatus, TaskPriority, UserRole)
│   ├── Http/
│   │   ├── Controllers/       # Thin API controllers (AuthController, TaskController, AdminController, HealthController)
│   │   ├── Middleware/        # Rate limiting, security headers, role checks
│   │   ├── Requests/          # Authoritative validation (RegisterRequest, LoginRequest, TaskRequest)
│   │   └── Resources/         # Eloquent API Resources (UserResource, TaskResource, AuditLogResource)
│   ├── Models/                # User, Role, Task, AuditLog
│   ├── Policies/              # TaskPolicy, UserPolicy, AuditLogPolicy
│   ├── Services/              # AiTaskSuggestionService, AuditLoggerService
│   └── Exceptions/            # Custom API exception handling
├── bootstrap/                 # Laravel 11 bootstrap & app config
├── config/                    # database.php, sanctum.php, cors.php, services.php
├── database/
│   ├── factories/             # UserFactory, TaskFactory
│   ├── migrations/            # roles, users, tasks, audit_logs tables + composite indexes
│   └── seeders/               # DatabaseSeeder, RoleSeeder, UserSeeder, TaskSeeder
├── docs/                      # Architectural & interview documentation suite
├── frontend/                  # React + Vite Single Page Application
│   ├── src/
│   │   ├── components/        # Navbar, TaskCard, TaskTable, TaskForm, Badges, Modals
│   │   ├── context/           # AuthContext (centralized user state & token handling)
│   │   ├── hooks/             # useTasks, useDebounce, useAuth
│   │   ├── layouts/           # AppLayout, AuthLayout
│   │   ├── pages/             # Landing, Login, Register, Dashboard, TaskList, TaskEdit, AdminLogs
│   │   ├── routes/            # ProtectedRoute, AdminRoute, AppRouter
│   │   └── services/          # api.js (Axios instance), authService, taskService, adminService
│   ├── package.json
│   └── vite.config.js
├── routes/
│   ├── api.php                # RESTful API routes
│   └── web.php                # Health and fallback routes
├── tests/
│   ├── Feature/               # Auth, Task CRUD, RBAC, Filter, AuditLog API tests
│   └── Unit/                  # Model & Service tests
├── .env.example               # Safe environment variable template
├── docker-compose.yml         # Production multi-container definition
└── README.md                  # Comprehensive interviewer-focused documentation
```

---

## 4. Milestone Roadmap

### Milestone 1: Foundation & Project Bootstrapping
- Scaffold Laravel 11 application with PHP 8.3 standards.
- Scaffold React + Vite frontend inside `frontend/`.
- Configure `.env.example`, `.gitignore`, and Git repository.

### Milestone 2: Relational Database Schema & Models
- Migrations: `roles`, `users`, `tasks`, `audit_logs`.
- Foreign key constraints with explicit onDelete actions (`cascade` / `restrict`).
- Backed Enums: `TaskStatus` (`todo`, `in-progress`, `done`), `TaskPriority` (`low`, `medium`, `high`), `UserRole` (`admin`, `user`).
- Database seeders with realistic demo accounts (1 Admin, 2 Regular Users, 30+ categorized tasks).

### Milestone 3: Authentication & Security Boundaries (Sanctum)
- `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/me`.
- Strong password hashing (bcrypt), token expiration, rate limiting (`throttle:auth`).
- Sanitized email normalization and enumeration protection.

### Milestone 4: Role-Based Access Control (RBAC)
- Laravel Policies (`TaskPolicy`, `AuditPolicy`).
- User scope: regular users can only read, create, update, and delete their own tasks.
- Admin scope: admins can view, filter, update, and delete all tasks, view audit logs, and inspect users.
- Automated tests verifying 401 Unauthenticated and 403 Forbidden enforcement.

### Milestone 5: Task CRUD API & Resources
- Endpoints: `GET /api/tasks`, `POST /api/tasks`, `GET /api/tasks/{id}`, `PUT /api/tasks/{id}`, `PATCH /api/tasks/{id}/status`, `DELETE /api/tasks/{id}`.
- Pagination: default 10, max 50, standard pagination metadata.
- Filtering: `status`, `priority`, `search` (title/description), `due_date`, `user_id` (admin only).
- API Resource transformations (`TaskResource`) preventing data leaks.

### Milestone 6: Authoritative Request Validation & Error Handling
- Dedicated Form Requests: `StoreTaskRequest`, `UpdateTaskRequest`, `UpdateTaskStatusRequest`.
- Centralized JSON error format: standard error payloads with clear validation bags.

### Milestone 7 & 8: React Frontend & Polished UI/UX
- Functional React SPA with React Router v6.
- Responsive design with custom modern CSS tokens and Bootstrap 5 utilities.
- Pages: Landing page, Login, Register, Dashboard (statistics cards & overdue alerts), Task Management, Create/Edit Modals, Admin Audit Log Viewer.
- User feedback: Debounced search, loading skeletons, confirmation dialogs, toast notifications.

### Milestone 9 & 10: Performance Optimization & Query EXPLAIN Analysis
- Eager loading to eliminate N+1 queries.
- Column projection (`select('id', 'title', ...)`) to minimize memory allocation.
- Strategic composite indexes (`user_id, status`, `user_id, status, due_date`).
- Documented `EXPLAIN` query execution plans in `docs/query-optimization.md`.

### Milestone 11: Audit Logging Engine
- Append-only audit trail logging administrative and security actions.
- Action tracking: task status overrides, cross-user task modifications, deletions.
- Endpoint: `GET /api/admin/audit-logs` (Admin only).

### Milestone 12: Security Review & Hardening
- IDOR mitigation: server-side ownership checks via Policies.
- Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, CSP basics.
- Dependency audit (`composer audit`, `npm audit`).

### Milestone 13: Interactive API Documentation
- OpenAPI / Swagger 3.0 specification (`docs/api.md` & `public/openapi.yaml`).

### Milestone 14: Comprehensive Automated Testing
- PHPUnit feature tests for Auth, RBAC, Task CRUD, Filtering, Pagination, and Audit.
- Vitest frontend component tests.

### Milestone 15: Observability & Health Checks
- `GET /api/health` checking database latency, memory usage, and application status.
- Structured application logging.

### Milestone 16: Background Queue Architecture
- Queue configuration for asynchronous email notifications and AI parsing jobs.

### Milestone 17: Optional AI Task Assistant
- `AiTaskSuggestionService`: Gemini API integration with timeout and error resilience.
- Deterministic heuristic fallback when offline or no API key is configured.
- Dedicated documentation in `docs/ai.md`.

### Milestone 18 & 19: Docker, DevOps & CI/CD
- Multi-stage Dockerfile and `docker-compose.yml`.
- GitHub Actions CI workflow (`.github/workflows/ci.yml`).

### Milestone 20 & 21: Verification, Documentation & Interview Guide
- Comprehensive documentation suite: `architecture.md`, `database.md`, `query-optimization.md`, `security.md`, `design-decisions.md`, `interview-guide.md`, `code-review.md`.
- Live end-to-end verification checklist (`docs/final-verification.md`).

---

## 5. Risk Assessment & Mitigations

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **IDOR / Leaky Authorization** | High | All task queries go through Laravel Policies (`$this->authorize()`) and scoped Eloquent queries (`$user->tasks()`). Never trust client-supplied `user_id`. |
| **N+1 Query Bottlenecks** | Medium | Eager-load relations (`with('user:id,name,email')`) where required; test queries with query log listener; write unit tests asserting query counts. |
| **External AI API Outages / Latency** | Low | Implement strict 3-second timeout and fallback heuristic engine; AI failure will never block task creation. |
| **Docker Host Unavailability** | Low | Provide fully verified Dockerfile and compose configurations while ensuring native Ubuntu system runs all tests and servers cleanly. |
| **Frontend Token Expiry / Session State** | Medium | Centralized Axios response interceptor for 401 responses redirecting to login with gentle session expiration toast. |

---

## 6. Testing Strategy
- **Unit Tests**: Enum casting, service heuristics, DTO transformations.
- **Feature Tests**: API endpoint tests with `RefreshDatabase` covering all HTTP status codes (200, 201, 204, 401, 403, 404, 422, 429).
- **Frontend Component Tests**: Form validation, status badges, protected route redirection.
- **End-to-End Browser Verification**: Full flow tested via browser agent: Registration -> Task Creation -> Status Update -> Filter -> Search -> Admin inspection.
