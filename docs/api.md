# TaskFlow REST API Reference Documentation

## 1. Overview & Authentication
TaskFlow provides a RESTful JSON API. All endpoints (except public health and authentication) require a Bearer token issued by Laravel Sanctum:

```http
Authorization: Bearer <personal_access_token>
Accept: application/json
Content-Type: application/json
```

An OpenAPI 3.0 specification is available at [`public/openapi.yaml`](file:///var/www/html/task_manager/public/openapi.yaml) (hosted live at `https://taskflow.pochyaa.com/openapi.yaml`).

### Base URLs
- **Live Public Review Base URL**: `https://taskflow.pochyaa.com/api`
- **Local Development Base URL**: `http://localhost:8000/api`

---

## 2. Standard HTTP Status Codes

| Code | Status | Meaning in TaskFlow |
|---|---|---|
| `200` | OK | Successful retrieval, update, or deletion response. |
| `201` | Created | Resource successfully created (new user registered, task created, etc.). |
| `204` | No Content | Successful request where no payload is returned. |
| `400` | Bad Request | Malformed request syntax or unparseable JSON payload. |
| `401` | Unauthorized | Missing, expired, or invalid Bearer token. |
| `403` | Forbidden | Authenticated, but lacks authorization (e.g. standard user accessing another user's task or regular user hitting `/api/admin/*`). |
| `404` | Not Found | Resource does not exist. |
| `422` | Unprocessable Entity | Validation failed. Returns structured field error dictionary. |
| `429` | Too Many Requests | Rate limit exceeded (e.g. max 10 auth attempts per minute). |
| `500` | Internal Server Error | Unexpected server failure. Never exposes database stack traces in production. |

---

## 3. Endpoints Catalog

### System & Health

#### Public Health Check
- **`GET /api/health`**
- **Auth**: None
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "timestamp": "2026-10-05T17:00:00+00:00",
  "service": "TaskFlow",
  "environment": "production",
  "php_version": "8.3.35",
  "database": {
    "status": "healthy",
    "latency_ms": 1.18
  },
  "memory_usage_mb": 16.42,
  "uptime": "active"
}
```

---

### Authentication

#### Register Account
- **`POST /api/register`**
- **Rate Limit**: 10 requests / minute
- **Body**:
```json
{
  "name": "Elena Carter",
  "email": "elena@taskflow.dev",
  "password": "Password123!",
  "password_confirmation": "Password123!"
}
```
- **Response `201 Created`**: Returns user profile and token.

#### User Login
- **`POST /api/login`**
- **Rate Limit**: 10 requests / minute
- **Body**:
```json
{
  "email": "admin@taskflow.dev",
  "password": "Password123!"
}
```
- **Response `200 OK`**: Returns user profile and token.

#### Current User & Session
- **`GET /api/me`**
- **Auth**: Bearer token
- **Response `200 OK`**: Returns `{ "user": { ... } }`.

#### Logout
- **`POST /api/logout`**
- **Auth**: Bearer token
- **Response `200 OK`**: Revokes current Sanctum access token.

---

### Workspaces & Projects

#### List Workspaces
- **`GET /api/workspaces`**
- **Auth**: Bearer token
- **Response `200 OK`**: Returns array of workspaces with active project listings.

#### List Projects
- **`GET /api/projects`**
- **Auth**: Bearer token
- **Response `200 OK`**: Returns projects with calculated health status (`healthy`, `at_risk`, `delayed`), completion progress, and member count.

#### Create Project
- **`POST /api/projects`**
- **Auth**: Bearer token
- **Body**:
```json
{
  "name": "Mobile App v2",
  "key": "MOB",
  "description": "Cross-platform React Native client rewrite",
  "status": "active",
  "color": "#10b981",
  "start_date": "2026-10-01",
  "target_date": "2026-12-15"
}
```

#### Project Detail
- **`GET /api/projects/{id}`**
- **Auth**: Bearer token
- **Response `200 OK`**: Project with full member list and recent activities.

#### Project Members
- **`GET /api/projects/{id}/members`**
- **`POST /api/projects/{id}/members`** (Body: `{"user_id": 2, "role": "developer"}`)
- **`DELETE /api/projects/{id}/members/{user_id}`**

---

### Multi-View Tasks

#### List Tasks (Table, Board, Calendar, Timeline)
- **`GET /api/tasks`**
- **Auth**: Bearer token
- **Parameters**:
  - `project_id` (int): Filter by project.
  - `assignee_id` (int): Filter by assignee.
  - `status` (`todo`, `in-progress`, `done`): Filter by status.
  - `priority` (`low`, `medium`, `high`): Filter by priority.
  - `view_mode` (`table`, `board`, `calendar`, `timeline`): When `board`, `calendar`, or `timeline` is selected, unpaginated records are returned ordered by `position` or `due_date`.
  - `is_blocked` (bool): Filter by blocked state.
  - `search` (string): Title/description fuzzy match.
  - `page` / `per_page`: Standard pagination for `table` view.

#### Create Task
- **`POST /api/tasks`**
- **Auth**: Bearer token
- **Body**:
```json
{
  "project_id": 1,
  "title": "Configure SSL certificates for edge proxy",
  "description": "Install Let's Encrypt automated certbot renew timer",
  "status": "todo",
  "priority": "high",
  "assignee_id": 2,
  "due_date": "2026-10-18",
  "estimated_minutes": 120
}
```

#### Task Detail
- **`GET /api/tasks/{id}`**
- Returns complete task record with subtasks list, parent task, discussion comments, assignee, creator, and activity logs.

#### Update Task Status
- **`PATCH /api/tasks/{id}/status`**
- **Body**: `{"status": "in-progress"}`

#### Reorder Kanban Position
- **`PATCH /api/tasks/{id}/reorder`**
- **Body**: `{"position": 2, "status": "in-progress"}`

#### Blocker Toggle
- **`POST /api/tasks/{id}/block`**
- **Body**: `{"is_blocked": true, "blocker_reason": "Waiting for Cloudflare API tokens"}`

#### Subtasks
- **`POST /api/tasks/{id}/subtasks`**
- **Body**: `{"title": "Verify staging ingress health", "priority": "medium"}`

#### Discussions / Comments
- **`POST /api/tasks/{id}/comments`**
- **Body**: `{"body": "Deployment succeeded on staging-02. Verified 200 OK."}`
- **`DELETE /api/tasks/{id}/comments/{comment_id}`** (Author or Admin only)

#### Bulk Operations
- **`POST /api/tasks/bulk`**
- **Body**:
```json
{
  "action": "status",
  "value": "done",
  "task_ids": [101, 102, 103]
}
```

---

### Global Search & Command Palette

#### Universal Fuzzy Search
- **`GET /api/search?q=nginx`**
- **Auth**: Bearer token
- **Response**: Aggregated array of matching tasks, projects, and users.

---

### Notifications Center

#### Feed & Unread Count
- **`GET /api/notifications`**
- Returns `{ "unread_count": 3, "notifications": [ ... ] }`.

#### Mark Single as Read
- **`PATCH /api/notifications/{id}/read`**

#### Mark All Read
- **`POST /api/notifications/read-all`**

---

### Saved Views

#### List Views
- **`GET /api/saved-views`**

#### Save View
- **`POST /api/saved-views`**
- **Body**: `{"name": "High Priority Bugs", "filters": {"priority": "high", "status": "todo"}}`

#### Delete View
- **`DELETE /api/saved-views/{id}`**

---

### Analytics & Reports

#### Executive Overview
- **`GET /api/reports/overview`**
- Returns KPI statistics, 7-day net velocity trend, and workload distribution by team member.

#### Streaming CSV Export
- **`GET /api/reports/export?project_id=1`**
- Streams `text/csv` formatted file download with columns `Task Key`, `Title`, `Project`, `Assignee`, `Status`, `Priority`, `Due Date`, `Blocked`, `Created At`.

---

### AI-Assisted Workflows

#### Suggest Priority & Labels
- **`POST /api/ai/suggest`**
- Body: `{"title": "Database connection timeout during peak hours"}`
- Returns: `{"suggested_priority": "high", "suggested_labels": ["Database", "Performance"], "confidence": 0.95}`

#### Generate Subtasks
- **`POST /api/ai/subtasks`**
- Body: `{"title": "Implement OAuth2 login with Google"}`
- Returns array of actionable subtask strings.

#### Improve Description & Acceptance Criteria
- **`POST /api/ai/improve-description`**
- Body: `{"title": "Build user notification center"}`
- Returns expanded formatted description with context, requirements, and acceptance criteria.

#### Parse Natural Language
- **`POST /api/ai/natural-task`**
- Body: `{"prompt": "Deploy security patches by Friday, high priority, assign to Michael"}`
- Returns preview payload: `{"title": "Deploy security patches", "priority": "high", "due_date": "2026-10-09", "assignee_name": "Michael", "confidence": 0.9}`

---

### Administrative Center (Admin Role Enforced)

#### User Management
- **`GET /api/admin/users`**: List all users with roles, project memberships, and task counts.
- **`PATCH /api/admin/users/{id}/role`**: Update role between `admin` and `user`.

#### Audit Logs
- **`GET /api/admin/audit-logs`**: Filterable logs with IP address, action, before/after JSON diffs.

#### System Diagnostics
- **`GET /api/admin/system-health`**: Returns PHP version, Laravel version, database connection status and table counts, queue driver, and cache status.
