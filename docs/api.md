# TaskFlow REST API Reference Documentation

## 1. Overview & Authentication
TaskFlow provides a RESTful JSON API. All endpoints (except public health and authentication) require a Bearer token issued by Laravel Sanctum:

```http
Authorization: Bearer <personal_access_token>
Accept: application/json
Content-Type: application/json
```

An OpenAPI 3.0 specification is available at [`public/openapi.yaml`](file:///var/www/html/task_manager/public/openapi.yaml).

---

## 2. Standard HTTP Status Codes

| Code | Status | Meaning in TaskFlow |
|---|---|---|
| `200` | OK | Successful retrieval, update, or deletion response. |
| `201` | Created | Resource successfully created (new user registered or new task created). |
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

### Health Check
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
- **Auth**: None (Rate limited: 10/min)
- **Request Body**:
```json
{
  "name": "Elena Rostova",
  "email": "elena@taskflow.dev",
  "password": "Password123!",
  "password_confirmation": "Password123!"
}
```
- **Response `201 Created`**:
```json
{
  "message": "Registration successful.",
  "user": {
    "id": 2,
    "name": "Elena Rostova",
    "email": "elena@taskflow.dev",
    "role": "user",
    "is_admin": false,
    "created_at": "2026-10-05T17:00:00.000000Z"
  },
  "token": "1|qXyZ89..."
}
```

#### Login
- **`POST /api/login`**
- **Auth**: None (Rate limited: 10/min)
- **Request Body**:
```json
{
  "email": "admin@taskflow.dev",
  "password": "Password123!"
}
```
- **Response `200 OK`**: Returns user profile and token.

#### Get Authenticated User
- **`GET /api/me`**
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "user": {
    "id": 1,
    "name": "Alexander Vance",
    "email": "admin@taskflow.dev",
    "role": "admin",
    "is_admin": true,
    "created_at": "2026-10-05T16:00:00.000000Z"
  }
}
```

#### Logout
- **`POST /api/logout`**
- **Auth**: Bearer Token
- **Response `200 OK`**: `{"message": "Logged out successfully."}`

---

### Tasks CRUD

#### List Tasks
- **`GET /api/tasks`**
- **Auth**: Bearer Token
- **Query Parameters**:
  - `status`: `todo`, `in-progress`, `done`
  - `priority`: `low`, `medium`, `high`
  - `due_date`: `YYYY-MM-DD`
  - `search`: Keyword string matching title or description
  - `sort_by`: `created_at` (default), `due_date`
  - `sort_order`: `desc` (default), `asc`
  - `user_id`: Filter by owner (Admin only)
  - `page`: Page number (default: 1)
  - `per_page`: Records per page (default: 10, max: 50)
- **Response `200 OK`**:
```json
{
  "data": [
    {
      "id": 14,
      "title": "Optimize MySQL Composite Indexes",
      "description": "Add (user_id, status, due_date) composite index.",
      "status": "in-progress",
      "status_label": "In Progress",
      "priority": "high",
      "priority_label": "High",
      "due_date": "2026-10-07",
      "is_overdue": false,
      "user_id": 2,
      "user": {
        "id": 2,
        "name": "Elena Rostova",
        "email": "elena@taskflow.dev"
      },
      "created_at": "2026-10-05T17:00:00.000000Z",
      "updated_at": "2026-10-05T17:00:00.000000Z"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/tasks?page=1",
    "last": "http://localhost:8000/api/tasks?page=3",
    "prev": null,
    "next": "http://localhost:8000/api/tasks?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 3,
    "per_page": 10,
    "to": 10,
    "total": 28
  }
}
```

#### Create Task
- **`POST /api/tasks`**
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "title": "Implement Webhook Verification",
  "description": "Add HMAC-SHA256 signature verification.",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-10-12"
}
```
- **Response `201 Created`**: Returns created `TaskResource`.

#### Get Single Task
- **`GET /api/tasks/{id}`**
- **Auth**: Bearer Token
- **Response `200 OK`** or **`403 Forbidden`** (if attempting to access another user's task as a regular user).

#### Update Task
- **`PUT /api/tasks/{id}`**
- **Auth**: Bearer Token
- **Response `200 OK`**: Returns updated `TaskResource`.

#### Quick Status Update
- **`PATCH /api/tasks/{id}/status`**
- **Auth**: Bearer Token
- **Request Body**: `{"status": "done"}`
- **Response `200 OK`**

#### Delete Task
- **`DELETE /api/tasks/{id}`**
- **Auth**: Bearer Token
- **Response `200 OK`**: `{"message": "Task deleted successfully."}`

#### Dashboard Aggregate Metrics
- **`GET /api/tasks/stats`**
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "stats": {
    "total": 12,
    "todo": 4,
    "in_progress": 5,
    "done": 3,
    "high_priority": 4,
    "overdue": 1
  }
}
```

---

### AI Assistant

#### Suggest Classification & Priority
- **`POST /api/ai/suggest`**
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "title": "Urgent security audit before Friday launch",
  "description": "Verify CSP headers and rate limiting"
}
```
- **Response `200 OK`**:
```json
{
  "suggestion": {
    "priority": "high",
    "category": "security",
    "estimated_urgency": "urgent",
    "suggested_tags": ["security", "compliance"],
    "summary": "Classified as security with high priority based on content analysis.",
    "source": "heuristic_engine"
  }
}
```

---

### Administration (Admin Only)

#### User Roster
- **`GET /api/admin/users`**
- **Auth**: Bearer Token (Admin Role)
- **Response `200 OK`**: List of all users with task counts.

#### Audit Trail
- **`GET /api/admin/audit-logs`**
- **Auth**: Bearer Token (Admin Role)
- **Parameters**: `page`, `per_page`, `action`, `user_id`
- **Response `200 OK`**: Paginated audit log records with actor identity and JSON change deltas.
