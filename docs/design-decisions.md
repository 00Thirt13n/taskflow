# TaskFlow Architecture & Engineering Design Decisions

This document details the architectural decisions, trade-offs, evaluated alternatives, and engineering rationale behind TaskFlow.

---

### 1. Framework: Why Laravel 11?
- **Decision**: Use Laravel 11 on PHP 8.3.
- **Rationale**: Laravel provides a mature, enterprise-ready foundation with first-class database migrations, Eloquent ORM, dependency injection, Form Request validation, Policies, and comprehensive testing harnesses.
- **Alternatives Considered**: Symfony, Slim, Express.js.
- **Trade-off**: Slightly higher framework footprint compared to micro-frameworks like Slim, but vastly superior developer velocity, security defaults, and architectural standardization.

---

### 2. API Style: Why REST over GraphQL or RPC?
- **Decision**: RESTful JSON API adhering to standard HTTP verbs and status codes.
- **Rationale**: For an entity-focused resource manager (tasks, users, audit logs), REST aligns naturally with HTTP semantics (GET, POST, PUT, PATCH, DELETE). It is immediately understandable to interviewers, simplifies client caching, and avoids GraphQL's query complexity and authorization explosion.
- **Alternatives Considered**: GraphQL, gRPC.
- **Trade-off**: Multiple round-trips if client needs heterogeneous ad-hoc graphs; mitigated in TaskFlow by eager loading and dedicated single-query aggregate endpoints (`/api/tasks/stats`).

---

### 3. Authentication: Why Laravel Sanctum?
- **Decision**: Laravel Sanctum for API token issuance and SPA authentication.
- **Rationale**: Sanctum provides lightweight, secure personal access tokens without the cryptographic bloat and token-revocation difficulty of stateless JWTs, or the massive complexity of OAuth2 servers (Laravel Passport).
- **Alternatives Considered**: Laravel Passport, custom JWT via `tymon/jwt-auth`.
- **Trade-off**: Database query on token lookup per authenticated request; mitigated in production by MySQL InnoDB buffer pool indexing on `personal_access_tokens.token`.

---

### 4. Authorization: Why Policies over Controller Conditionals?
- **Decision**: Centralize authorization logic in dedicated Laravel Policies (`TaskPolicy`, `AuditLogPolicy`).
- **Rationale**: Inlined checks like `if ($user->role === 'admin' || $task->user_id === $user->id)` scattered throughout controllers lead to severe security regressions, code duplication, and IDOR vulnerabilities. Policies establish an authoritative, isolated security boundary that is easily unit-tested.
- **Alternatives Considered**: Spatie Laravel-Permission, inlined controller gates.
- **Trade-off**: Requires dedicated policy classes, but guarantees uniform access control across the entire application.

---

### 5. Database: Why MySQL 8.0 with InnoDB?
- **Decision**: MySQL 8.0 InnoDB relational storage with strict foreign keys.
- **Rationale**: TaskFlow requires ACID transactional integrity, strict referential constraints (`cascadeOnDelete`, `restrictOnDelete`), and rich B-Tree index traversal. MySQL 8.0 also provides native JSON support for audit metadata and advanced execution plan metrics via `EXPLAIN ANALYZE`.
- **Alternatives Considered**: PostgreSQL, MongoDB.
- **Trade-off**: Relational schema migrations require disciplined DDL management compared to schema-less document stores.

---

### 6. Indexing: Why Strategic Composite Indexes?
- **Decision**: Composite indexes: `idx_tasks_user_status_due_date` `(user_id, status, due_date)` and `idx_tasks_status_due_date` `(status, due_date)`.
- **Rationale**: In task management systems, users almost never query `due_date` in isolation; they query `status = 'todo' ORDER BY due_date ASC`. A single composite index satisfies the WHERE filter and the ORDER BY clause simultaneously, eliminating MySQL's disk filesort pass.
- **Alternatives Considered**: Single-column indexes on each field.
- **Trade-off**: Slightly higher storage footprint on disk and modest write overhead on inserts/updates. For a read-heavy SaaS application, the 10x-50x read throughput boost heavily outweighs the cost.

---

### 7. Pagination: Why Offset Pagination for TaskFlow?
- **Decision**: Length-aware offset pagination with standard metadata (`meta.total`, `meta.last_page`).
- **Rationale**: In desktop task dashboards, users expect direct jump navigation ("Page 3 of 5") and deterministic total task counters. Active task datasets per user rarely exceed several thousand records, making offset seeks instantaneous under our composite indexes.
- **Alternatives Considered**: Keyset / Cursor pagination.
- **Trade-off**: At millions of records, deep offset seeks degrade. For enterprise scale (> 1,000,000 records), cursor pagination would be introduced.

---

### 8. Frontend: Why React + Vite over Livewire or Inertia?
- **Decision**: Standalone React 18 Single-Page Application bundled via Vite.
- **Rationale**: A fully decoupled React SPA demonstrates true full-stack versatility, separation of concerns, and modern clientside state management. The API remains pure and reusable across mobile apps or third-party integrations.
- **Alternatives Considered**: Laravel Livewire 3, Inertia.js, Next.js.
- **Trade-off**: Requires managing client-side routing, auth tokens, and CORS, but proves deep architectural competence across both frontend and backend domains.

---

### 9. State Management: Why React Context over Redux / Zustand?
- **Decision**: Native React `AuthContext` and custom hooks (`useTasks`, `useDebounce`).
- **Rationale**: Avoid premature over-engineering. TaskFlow's state consists of authentication session and task list data. Native React Context and custom hooks provide clean, predictable state propagation without adding hundreds of lines of boilerplate reducers, actions, and third-party dependencies.
- **Alternatives Considered**: Redux Toolkit, Zustand, MobX.
- **Trade-off**: For massive multi-team apps with hundreds of globally shared states, Zustand would be preferred. For TaskFlow, Context is lean and maintainable.

---

### 10. AI: Why Gemini with Heuristic Fallback?
- **Decision**: Google Gemini 1.5 Flash API with local rule-based heuristic fallback.
- **Rationale**: Gemini 1.5 Flash provides sub-second latency and cost-effective task classification. The backend-only proxy protects API keys, while the deterministic regex heuristic guarantees 100% uptime even during network interruptions, API deprecations, or quota exhaustion.
- **Alternatives Considered**: OpenAI GPT-4o, Anthropic Claude, pure client-side heuristics.
- **Trade-off**: External network dependency; mitigated by the 3.5s timeout and automatic heuristic engine.
