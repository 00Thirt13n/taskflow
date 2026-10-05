# TaskFlow Database Architecture & Design Specification

## 1. Entity-Relationship Overview

TaskFlow relies on a normalized relational schema built on MySQL 8.0 with InnoDB engine, enforcing strict foreign key constraints, UTF8mb4 character encoding, and strategic composite indexes.

```mermaid
erDiagram
    roles ||--o{ users : "assigns role to"
    users ||--o{ tasks : "creates & owns"
    users ||--o{ audit_logs : "triggers"

    roles {
        bigint unsigned id PK
        varchar(50) name UK "Unique role identifier ('admin', 'user')"
        timestamp created_at
        timestamp updated_at
    }

    users {
        bigint unsigned id PK
        bigint unsigned role_id FK "References roles.id (restrictOnDelete)"
        varchar(255) name
        varchar(255) email UK "Normalized lowercase unique email"
        timestamp email_verified_at
        varchar(255) password "Bcrypt hashed password"
        varchar(100) remember_token
        timestamp created_at
        timestamp updated_at
    }

    tasks {
        bigint unsigned id PK
        bigint unsigned user_id FK "References users.id (cascadeOnDelete)"
        varchar(255) title "Non-empty task heading"
        text description "Nullable detailed task notes"
        varchar(20) status "todo | in-progress | done"
        varchar(20) priority "low | medium | high"
        date due_date "Target completion date"
        timestamp created_at
        timestamp updated_at
    }

    audit_logs {
        bigint unsigned id PK
        bigint unsigned user_id FK "References users.id (nullOnDelete)"
        varchar(100) action "Action key (e.g. task.created, task.deleted)"
        varchar(100) entity_type "Audited entity (e.g. task, user)"
        bigint unsigned entity_id "Primary key of target entity"
        json metadata "Contextual payload (old/new states, title)"
        varchar(45) ip_address "IPv4 or IPv6 client address"
        text user_agent "Client User-Agent header"
        timestamp created_at "Append-only timestamp (no updated_at)"
    }
```

---

## 2. Table Explanations & Field Details

### `roles` Table
- **Purpose**: Defines system privileges and authorization boundaries.
- **Fields**:
  - `id`: Auto-incrementing unsigned 64-bit integer primary key.
  - `name`: VARCHAR(50), UNIQUE, NOT NULL. Stores backed enum values (`admin`, `user`).
  - `created_at`, `updated_at`: Standard UTC timestamps.

### `users` Table
- **Purpose**: Stores authenticated principals.
- **Fields**:
  - `id`: Auto-incrementing unsigned 64-bit integer primary key.
  - `role_id`: Unsigned BigInt, NOT NULL. Foreign key pointing to `roles.id`.
  - `name`: VARCHAR(255), NOT NULL. Full name of the user.
  - `email`: VARCHAR(255), UNIQUE, NOT NULL. Normalized email address used for login.
  - `password`: VARCHAR(255), NOT NULL. Salted Bcrypt hash (work factor 12).
  - `remember_token`: VARCHAR(100), NULLABLE.
  - `created_at`, `updated_at`: Standard UTC timestamps.

### `tasks` Table
- **Purpose**: Core entity storing user tasks, lifecycle state, priority, and schedule.
- **Fields**:
  - `id`: Auto-incrementing unsigned 64-bit integer primary key.
  - `user_id`: Unsigned BigInt, NOT NULL. Foreign key pointing to `users.id`.
  - `title`: VARCHAR(255), NOT NULL. The task summary.
  - `description`: TEXT, NULLABLE. Extended markdown/plain text details.
  - `status`: VARCHAR(20), NOT NULL, default `'todo'`. Valid values constrained by `TaskStatus` enum (`todo`, `in-progress`, `done`).
  - `priority`: VARCHAR(20), NOT NULL, default `'medium'`. Valid values constrained by `TaskPriority` enum (`low`, `medium`, `high`).
  - `due_date`: DATE, NULLABLE. Targeted completion date (`YYYY-MM-DD`).
  - `created_at`, `updated_at`: Standard UTC timestamps.

### `audit_logs` Table
- **Purpose**: Immutable, append-only security log tracking critical user actions (creation, deletion, cross-user updates).
- **Fields**:
  - `id`: Auto-incrementing unsigned 64-bit integer primary key.
  - `user_id`: Unsigned BigInt, NULLABLE. Foreign key to `users.id`.
  - `action`: VARCHAR(100), NOT NULL. Action identifier (`task.created`, `task.status_changed`, etc.).
  - `entity_type`: VARCHAR(100), NOT NULL.
  - `entity_id`: Unsigned BigInt, NULLABLE.
  - `metadata`: JSON, NULLABLE. Structured payload capturing delta of changes.
  - `ip_address`: VARCHAR(45), NULLABLE. Captures client IP for security audits.
  - `user_agent`: TEXT, NULLABLE.
  - `created_at`: TIMESTAMP, NOT NULL, default `CURRENT_TIMESTAMP`. No `updated_at` column exists because audit rows are strictly immutable.

---

## 3. Foreign Key Decisions & Cascading Behavior

| Relationship | Constraint Type | Delete Behavior | Engineering Rationale |
|---|---|---|---|
| `users.role_id` -> `roles.id` | Foreign Key | `RESTRICT` | Roles must never be accidentally deleted while users are assigned to them. Deleting an active role would leave orphaned user authorization states. |
| `tasks.user_id` -> `users.id` | Foreign Key | `CASCADE` | Tasks are private to a user account. If an account is deleted, all associated private tasks should be cleanly purged, preventing orphaned records. |
| `audit_logs.user_id` -> `users.id` | Foreign Key | `SET NULL` | For security, compliance, and non-repudiation, audit records must survive user account deletions. Setting `user_id` to NULL preserves the immutable log trail even if the actor is purged. |

---

## 4. Indexing Decisions & Query Mapping

Indexes are intentionally engineered around high-frequency queries executed by the application:

| Index Name | Table | Columns | Target Query / Use Case |
|---|---|---|---|
| `idx_tasks_user_status` | `tasks` | `(user_id, status)` | `WHERE user_id = ? AND status = ?` (Standard user filtering their tasks by status). |
| `idx_tasks_user_status_due_date` | `tasks` | `(user_id, status, due_date)` | `WHERE user_id = ? AND status = ? ORDER BY due_date ASC` (User dashboard sorting upcoming tasks by urgency). |
| `idx_tasks_user_priority` | `tasks` | `(user_id, priority)` | `WHERE user_id = ? AND priority = ?` (User filtering tasks by priority). |
| `idx_tasks_status_due_date` | `tasks` | `(status, due_date)` | `WHERE status = ? ORDER BY due_date ASC` (Admin global dashboard inspecting pending/overdue tasks across the entire organization). |
| `idx_audit_logs_action_created` | `audit_logs` | `(action, created_at)` | `WHERE action = ? ORDER BY created_at DESC` (Admin audit trail filter). |
| `idx_audit_logs_created` | `audit_logs` | `(created_at)` | `ORDER BY created_at DESC LIMIT 20` (Chronological audit pagination). |

---

## 5. Indexing Tradeoffs & Engineering Analysis

1. **Composite Index Left-to-Right Ordering Rule**:
   - The index `idx_tasks_user_status_due_date` has the column order `(user_id, status, due_date)`.
   - In MySQL InnoDB B-Trees, this index serves three distinct queries:
     1. `WHERE user_id = ?`
     2. `WHERE user_id = ? AND status = ?`
     3. `WHERE user_id = ? AND status = ? ORDER BY due_date` (avoids filesort entirely!)
   - It cannot serve a query filtering solely on `due_date` without `user_id`. Hence, the supplementary index `idx_tasks_status_due_date` was created for global administrative queries.

2. **Write Amplification vs Read Throughput**:
   - Every additional index requires InnoDB to update an extra B-Tree on every `INSERT`, `UPDATE`, and `DELETE`.
   - For a task management application, read-to-write ratio is typically > 10:1 (users view, filter, and page tasks far more frequently than they create or edit).
   - The 4 composite indexes on `tasks` occupy minimal storage while reducing CPU-intensive disk scans and temporary table filesorts from `O(N)` to `O(log N)`.
