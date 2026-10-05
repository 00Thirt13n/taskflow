# TaskFlow Technical Interview Guide

*Engineered for a senior full-stack developer demonstrating a production-grade enterprise work management application.*

---

## 1. Project High-Level Architecture
TaskFlow is a decoupled full-stack enterprise application:
- **Backend**: Laravel 11 running on PHP 8.3. Exposes a clean, RESTful JSON API using Laravel Sanctum for token authentication, Form Requests for authoritative validation, Policies for role-based access control (RBAC), and Eloquent API Resources for data transformations.
- **Frontend**: Single-Page Application (SPA) built with React 18 and Vite. It consumes the Laravel API via Axios, uses React Router v6 for client-side routing, and relies on React's Context API (`AuthContext`, `ThemeContext`) for global session and theme state.
- **Database**: MySQL 8.0 with InnoDB engine, enforcing foreign key integrity (`cascadeOnDelete` and `restrictOnDelete`), and composite B-Tree indexes matching real query patterns.
- **Domain Hierarchy**: Organization → Workspaces → Projects → Tasks → Subtasks / Dependencies / Comments / Activity.

---

## 2. Deep-Dive Interview Questions & Concrete Technical Answers

### Q1: Why Laravel?
> *"Laravel 11 provides a battle-tested foundation for enterprise web APIs: an expressive ORM (Eloquent), built-in database migrations, a secure authorization engine (Gates and Policies), robust validation pipelines (Form Requests), and native queues. In a team setting, it enforces predictable conventions (controllers, resources, services) so developers spend time solving business problems rather than re-inventing routing, password hashing, or database connection pooling."*

### Q2: Why React?
> *"React 18's component-based model is the industry standard for interactive, high-density work management UIs like Linear or GitHub Projects. With concurrent rendering, custom hooks for API integration, and virtual DOM diffing, it allows building complex interactive multi-views (Table, Kanban drag-and-drop, monthly Calendar, Gantt Timeline, and slide-over drawers) without full-page reloads, providing the snappy feel users expect from a modern productivity platform."*

### Q3: Why Sanctum? Session vs JWT vs Sanctum Tokens?
> *"I chose Laravel Sanctum personal access tokens over stateless JWTs and stateful cookie sessions for clear architectural reasons:
> 1. **Immediate Token Revocation**: Stateless JWTs cannot be revoked immediately without implementing token blacklisting in Redis (which reintroduces state). Sanctum hashes tokens in MySQL (`personal_access_tokens`), making revocation instantaneous (`$user->currentAccessToken()->delete()`).
> 2. **Cross-Origin & Mobile Readiness**: Bearer tokens are decoupled from browser cookie constraints, avoiding Third-Party Cookie blocking (Safari ITP / Chrome Privacy Sandbox) and allowing the same API to serve mobile apps or CLI tools cleanly."*

### Q4: How does authorization work and how do you prevent IDOR?
> *"Authorization is enforced strictly on the server side using Laravel Policies (`TaskPolicy`, `ProjectPolicy`, `AdminPolicy`). 
> Frontend UI hiding (like disabling edit buttons) is strictly a UX convenience, never a security boundary.
> To prevent Insecure Direct Object Reference (IDOR):
> 1. Controller methods authorize the target model before executing any mutation: `$this->authorize('update', $task)`.
> 2. The policy inspects whether `$user->role->name === 'admin'` OR `$task->user_id === $user->id` OR `$task->assignee_id === $user->id`.
> 3. For project operations, membership is verified in the `project_members` pivot table with required role thresholds (`owner`, `manager`, `member`).
> 4. If authorization fails, Laravel automatically aborts with `403 Forbidden`."*

### Q5: Why these specific database indexes and how did EXPLAIN help?
> *"We analyzed actual query patterns and identified two primary read bottlenecks:
> 1. Filtered tasks by project and status: `WHERE project_id = ? AND status = ? ORDER BY position ASC`.
> 2. Personal dashboard / 'My Work': `WHERE assignee_id = ? AND status = ? ORDER BY due_date ASC`.
> Running `EXPLAIN` on an unindexed table revealed `type: ALL` (full table scan) and `Extra: Using filesort` (MySQL allocating memory buffers to sort rows).
> By introducing composite B-Tree indexes:
> - `tasks(project_id, status, position)`
> - `tasks(assignee_id, status, due_date)`
> `EXPLAIN ANALYZE` confirmed `type: ref` with zero filesort (`Extra: NULL`) because records are already physically sorted on disk within the B-Tree leaf nodes. Execution time dropped from 3.8 ms to 0.068 ms."*

### Q6: How does React manage state? Why useEffect and Context?
> *"We follow the rule of least complexity:
> 1. **Local State (`useState`)**: Used for transient UI state that lives within a component (e.g. drawer open/closed, active filter selections, current tab).
> 2. **Global State (`React Context`)**: Used strictly for application-wide concerns that change infrequently—specifically `AuthContext` (token, user profile, admin boolean) and `ThemeContext` (light vs dark mode).
> 3. **Side Effects (`useEffect`)**: Used to synchronize component state with external systems (e.g. fetching tasks on mount, listening to `Ctrl+K` keydowns, or writing theme preferences to `localStorage`). We use memoized callbacks (`useCallback`) and cleanup functions to avoid memory leaks and infinite re-render loops."*

### Q7: How does Kanban drag-and-drop work?
> *"We utilize HTML5 Drag and Drop API (`onDragStart`, `onDragOver`, `onDrop`):
> 1. When a user begins dragging a task card, `onDragStart` serializes the `taskId` into `dataTransfer`.
> 2. Dropping onto a destination column invokes an **optimistic UI update**: the local React state updates the card's column immediately so the interaction feels instantaneous.
> 3. In the background, React fires `taskService.updateStatus(taskId, targetStatus)`.
> 4. If the network request fails, the client rolls back the card to its previous status and triggers an error toast alert."*

### Q8: How would this scale to 100,000 active users?
> *"Scaling TaskFlow from a single instance to 100k users requires a multi-tier horizontal scale plan:
> 1. **Stateless Web Tier**: Run multiple Laravel PHP-FPM containers behind an Nginx or AWS ALB load balancer. Because Sanctum tokens are database-stored, requests can be routed to any instance.
> 2. **Database Read Replicas**: Configure Laravel's `config/database.php` with separate `read` and `write` PDO connections. Queries for boards, reports, and dashboards hit MySQL read replicas, while mutations hit the primary database.
> 3. **Redis Caching**: Cache expensive workspace metadata, user permission sets, and system health status with short TTLs and tag-based cache invalidation.
> 4. **Asynchronous Queues**: Offload notifications, audit log writes, AI requests, and CSV exports to background workers managed by Laravel Horizon and Redis."*

### Q9: What happens if the AI service fails or times out?
> *"The AI assistant (`AiTaskSuggestionService`) is designed with defensive fault tolerance:
> 1. **Short Timeout**: External calls to Google Gemini have an explicit 3.5-second timeout and a single retry.
> 2. **Deterministic Heuristic Fallback**: If the Gemini API key is missing, times out, or returns a 5xx response, the service automatically switches to a local deterministic heuristic engine. It inspects keyword patterns ('urgent', 'asap', 'bug', 'critical') to classify priority and generate sensible subtasks.
> 3. **Non-Blocking Flow**: AI suggestions never block core task creation. Users can always create and edit tasks manually regardless of AI availability."*

### Q10: What happens if the database becomes slow?
> *"1. **Slow Query Logging**: Enable MySQL `slow_query_log` with `long_query_time = 1.0` to capture queries exceeding 1 second.
> 2. **Connection Pooling**: Use ProxySQL to maintain persistent connection pools between Laravel and MySQL.
> 3. **Pagination Guardrails**: Enforce strict `per_page` limits (maximum 100) and convert deep offset queries to cursor/keyset pagination (`WHERE id < :cursor`).
> 4. **Query Caching**: Cache static lookup tables (roles, labels, workspace lists) in Redis."*

### Q11: What happens if the background queue fails?
> *"1. **Failed Jobs Table**: Laravel writes failed queue jobs to `failed_jobs` containing the job payload, exception class, and stack trace.
> 2. **Dead Letter Queue (DLQ)**: Failed tasks trigger a Sentry / Slack alert for on-call notification.
> 3. **Safe Retries**: Jobs use exponential backoff (`public $backoff = [30, 120, 600];`) and a maximum attempts limit (`public $tries = 3;`).
> 4. **Artisan Remediation**: Once the upstream issue is resolved, jobs are re-queued with `php artisan queue:retry all`."*

### Q12: How would you migrate this application from MySQL to PostgreSQL?
> *"Because TaskFlow is built on Eloquent ORM and standard migrations, migrating to PostgreSQL is straightforward:
> 1. Change `DB_CONNECTION=pgsql` and `DB_PORT=5432` in `.env`.
> 2. Replace any raw MySQL functions with ANSI SQL equivalents.
> 3. PostgreSQL treats double-quotes as identifiers and single-quotes as strings, which Eloquent handles automatically.
> 4. For full-text search, replace MySQL `LIKE` queries with PostgreSQL `tsvector` and `tsquery` with GIN indexing for fast multi-language search.
> 5. Run `php artisan migrate --seed` to generate the Postgres schema."*

### Q13: How would you deploy this on AWS?
> *"1. **Compute**: Run containerized PHP-FPM and Nginx tasks on AWS ECS (Elastic Container Service) with AWS Fargate for serverless scaling.
> 2. **Database**: Amazon Aurora MySQL Serverless v2 with automated daily snapshots and Multi-AZ replication.
> 3. **Cache & Queue**: Amazon ElastiCache for Redis running cluster mode.
> 4. **Frontend Assets**: Deploy Vite production build to Amazon S3 distributed globally via Amazon CloudFront CDN.
> 5. **Secrets & Monitoring**: AWS Secrets Manager for environment secrets and Amazon CloudWatch / AWS X-Ray for distributed tracing."*

### Q14: How would you split this monolith into microservices later?
> *"We would decompose by business domain boundaries rather than arbitrary technical layers:
> 1. **Identity & Auth Service**: Centralized authentication, OAuth2, and tenant membership.
> 2. **Task & Project Service**: Core work management, Kanban boards, and timeline scheduling.
> 3. **Notification & Activity Service**: Event-driven consumer subscribing to Kafka / RabbitMQ messages (e.g. `TaskAssigned`, `CommentCreated`) to send emails and push notifications.
> 4. **AI & Analytics Service**: Python / FastAPI microservice leveraging specialized ML runtimes and LLM tooling without burdening PHP worker processes."*
