# Node.js + Express + PostgreSQL Migration Guide

*This document details the architectural and code-level mapping required to port TaskFlow's backend to Node.js, Express, and PostgreSQL.*

---

## 1. Architectural Component Mapping

| Layer / Responsibility | Laravel 11 + MySQL 8.0 Implementation | Node.js + Express + PostgreSQL Implementation |
|---|---|---|
| **Web Server / Framework** | Laravel 11 Router & Controllers | Express.js / Fastify with modular route handlers |
| **Authentication** | Laravel Sanctum Bearer tokens (`personal_access_tokens`) | `jsonwebtoken` (JWT) or session middleware with Redis store |
| **Authorization** | Laravel Policies (`TaskPolicy`) | Custom Express middleware or CASL / `@casl/ability` |
| **Validation** | Form Request classes (`StoreTaskRequest`) | `zod` or `express-validator` schemas |
| **ORM / Data Access** | Eloquent Models (`App\Models\Task`) | Prisma ORM, Drizzle ORM, or Knex.js |
| **Database** | MySQL 8.0 (InnoDB, UTF8mb4) | PostgreSQL 16 (pgaudit, UTF-8) |
| **Connection Strategy** | PHP-FPM process per request (short-lived connection) | Node.js single-process event loop with `pg.Pool` connection pool |

---

## 2. Controller & Route Migration Example

### Laravel 11 Implementation
```php
class TaskController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Task::class);
        $user = $request->user();

        $query = Task::select(['id', 'title', 'status', 'priority', 'due_date']);
        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        return TaskResource::collection($query->paginate(10));
    }
}
```

### Express.js + Prisma Equivalent
```typescript
import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/tasks', authenticate, async (req: Request, res: Response) => {
  const user = req.user;
  const page = parseInt(req.query.page as string || '1', 10);
  const perPage = Math.min(parseInt(req.query.per_page as string || '10', 10), 50);
  const skip = (page - 1) * perPage;

  const whereClause: any = {};
  if (!user.isAdmin) {
    whereClause.userId = user.id;
  }

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where: whereClause }),
    prisma.task.findMany({
      where: whereClause,
      select: { id: true, title: true, status: true, priority: true, dueDate: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ]);

  return res.json({
    data: tasks,
    meta: {
      currentPage: page,
      perPage,
      total,
      lastPage: Math.ceil(total / perPage),
    },
  });
});
```

---

## 3. Database Schema: MySQL vs PostgreSQL Differences

### 1. Enums
- **MySQL**: Stored as `VARCHAR(20)` with application-level validation via PHP backed enums.
- **PostgreSQL**: Supports native `CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'done');`.

### 2. Auto-Incrementing Primary Keys
- **MySQL**: `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY`.
- **PostgreSQL**: `BIGSERIAL PRIMARY KEY` or `BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`.

### 3. Case Insensitivity in Text Search
- **MySQL**: Default collation `utf8mb4_unicode_ci` performs case-insensitive comparisons for `LIKE '%search%'`.
- **PostgreSQL**: `LIKE` is case-sensitive. Must use `ILIKE '%search%'` or create a `pg_trgm` GIN index on `title` and `description` for high-performance substring searches.

---

## 4. Connection Pooling Considerations

In PHP-FPM, every web worker opens and closes a database connection per request, or relies on MySQL's built-in thread cache.

In Node.js, the runtime is an asynchronous, event-driven single process. A global connection pool (e.g. `pg.Pool({ max: 20, idleTimeoutMillis: 30000 })` or PgBouncer) must be shared across all request handlers to prevent connection starvation under high concurrency.
