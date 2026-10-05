# TaskFlow Database Architecture & Design Specification

## 1. Entity-Relationship Overview

TaskFlow relies on a normalized relational schema built on MySQL 8.0 with InnoDB engine, enforcing strict foreign key constraints, UTF8mb4 character encoding, and strategic composite indexes.

```mermaid
erDiagram
    roles ||--o{ users : "assigns role to"
    users ||--o{ workspaces : "owns"
    workspaces ||--o{ projects : "contains"
    users ||--o{ project_members : "participates in"
    projects ||--o{ project_members : "has members"
    projects ||--o{ tasks : "groups"
    users ||--o{ tasks : "creates & assigns"
    tasks ||--o{ tasks : "subtasks of parent"
    tasks ||--o{ comments : "discussion feed"
    tasks ||--o{ activity_logs : "audit trail"
    tasks ||--o{ task_dependencies : "blocked by / blocks"
    users ||--o{ notifications : "receives"
    users ||--o{ saved_views : "saves filters"

    workspaces {
        bigint unsigned id PK
        varchar(120) name
        varchar(140) slug UK
        text description
        bigint unsigned owner_id FK
        timestamp created_at
        timestamp updated_at
    }

    projects {
        bigint unsigned id PK
        bigint unsigned workspace_id FK
        varchar(120) name
        varchar(10) key "e.g. WEB, MOB, INF"
        text description
        varchar(30) status "planning | active | on_hold | completed | archived"
        varchar(30) color
        date start_date
        date target_date
        bigint unsigned owner_id FK
        timestamp created_at
        timestamp updated_at
    }

    tasks {
        bigint unsigned id PK
        varchar(20) task_key UK "e.g. WEB-101"
        bigint unsigned project_id FK
        bigint unsigned user_id FK "Creator"
        bigint unsigned assignee_id FK "Assignee"
        bigint unsigned parent_task_id FK "Subtask parent"
        varchar(255) title
        text description
        varchar(30) status "todo | in-progress | done"
        varchar(20) priority "low | medium | high"
        date due_date
        date start_date
        int estimated_minutes
        int logged_minutes
        int position "Kanban order"
        boolean is_blocked
        varchar(255) blocker_reason
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }

    comments {
        bigint unsigned id PK
        bigint unsigned task_id FK
        bigint unsigned user_id FK
        text body
        timestamp created_at
        timestamp updated_at
    }

    activity_logs {
        bigint unsigned id PK
        bigint unsigned task_id FK
        bigint unsigned user_id FK
        varchar(60) action "created | status_changed | priority_changed | commented"
        text description
        json metadata
        timestamp created_at
    }

    notifications {
        bigint unsigned id PK
        bigint unsigned user_id FK
        varchar(60) type
        varchar(255) title
        text message
        json data
        timestamp read_at
        timestamp created_at
    }

    saved_views {
        bigint unsigned id PK
        bigint unsigned user_id FK
        varchar(100) name
        json filters
        timestamp created_at
        timestamp updated_at
    }

    audit_logs {
        bigint unsigned id PK
        bigint unsigned user_id FK
        varchar(100) action
        varchar(100) entity_type
        bigint unsigned entity_id
        json metadata
        varchar(45) ip_address
        text user_agent
        timestamp created_at
    }
```

---

## 2. Table Explanations & Field Details

### `workspaces`
Represents an organization or department boundary (e.g. "Acme Core Engineering").
- `id`: Auto-incrementing unsigned BigInt primary key.
- `name`: Human-readable workspace name.
- `slug`: Unique lowercase slug for URL pathing.
- `owner_id`: Foreign key referencing `users.id` (`restrictOnDelete` to prevent orphaned workspaces).

### `projects`
Work management containers that group tasks and team members.
- `id`: Auto-incrementing unsigned BigInt primary key.
- `workspace_id`: Foreign key referencing `workspaces.id` (`cascadeOnDelete`).
- `key`: 2-5 letter uppercase identifier (e.g., `WEB`, `MOB`, `INF`). Used as prefix for human-readable task keys.
- `status`: Project state (`planning`, `active`, `on_hold`, `completed`, `archived`).
- `color`: Hex color accent for visual cards and timeline bars.

### `tasks`
Core work item entity upgraded with enterprise fields.
- `task_key`: Unique identifier (e.g. `WEB-101`) generated automatically from project key and auto-increment sequence.
- `parent_task_id`: Self-referencing foreign key pointing to parent task for checklist subtasks (`cascadeOnDelete`).
- `position`: Numeric ordering index within a Kanban column for smooth drag-and-drop reordering.
- `is_blocked` & `blocker_reason`: Explicit blocker flags for executive risk management.
- `estimated_minutes` & `logged_minutes`: Time tracking for delivery velocity metrics.

### `comments`
Discussion feed associated with a specific task. Supports simple markdown and mentions.
- Authors can edit/delete their own comments; administrators can moderate comments.

### `activity_logs`
Chronological event audit log for tasks, capturing status transitions, priority updates, and assignments with before/after state diffs.

### `notifications`
In-app notification items for task assignment, due date reminders, and mentions. Includes `read_at` timestamp for unread counter tracking.

### `saved_views`
User-configured filter presets (e.g., "High Priority Bugs", "Due This Week") stored as JSON objects.

---

## 3. Indexing & Optimization Strategy

1. **`tasks (project_id, status)`**:
   - Accelerates Kanban board queries and project statistics aggregation.
2. **`tasks (assignee_id, status, due_date)`**:
   - Powers the "My Work" page (Overdue, Due Today, Upcoming) without full table scans.
3. **`tasks (workspace_id, status, due_date)`**:
   - Accelerates executive reports and multi-project task searches.
4. **`activity_logs (task_id, created_at)`**:
   - Optimizes slide-over drawer activity feed retrieval.
5. **`notifications (user_id, read_at)`**:
   - Enables instant `O(1)` unread count queries via index-only scans.
