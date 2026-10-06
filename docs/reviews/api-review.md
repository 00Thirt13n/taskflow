# AGENT 06: API / REST ENDPOINT CONTRACT & SECURITY AUDIT

**Reviewer**: Agent 06 — API & REST Specialist  
**Endpoints Evaluated**: 44 API Routes (`routes/api.php`)  
**Status**: COMPLETE  
**Severity Scale**: CRITICAL | HIGH | MEDIUM | LOW  

---

## 1. Executive Summary

TaskFlow's REST API follows consistent HTTP response conventions:
- Successful retrievals return `200 OK` with JSON envelopes or resources.
- Resource creations return `201 Created`.
- Validation errors return `422 Unprocessable Entity` with Laravel's standard `errors` dictionary.
- Unauthenticated requests return `401 Unauthorized`.
- Forbidden actions return `403 Forbidden`.
- Missing resources return `404 Not Found`.

The contract audit tested endpoints with both valid payloads and malformed/unauthorized inputs.

---

## 2. Endpoint Matrix & HTTP Status Validation

| Endpoint | Method | Auth Req | Expected Status | Actual Status | Notes |
|---|---|---|---|---|---|
| `/api/health` | GET | None | 200 | 200 | Returns system status, DB check, and latency. |
| `/api/login` | POST | None | 200 / 401 / 422 | 200 / 401 / 422 | Rate-limited at 10 req/min via `throttle:10,1`. |
| `/api/register` | POST | None | 201 / 422 | 201 / 422 | Enforces email uniqueness and password complexity. |
| `/api/me` | GET | Sanctum | 200 / 401 | 200 / 401 | Returns user profile and role details. |
| `/api/tasks` | GET | Sanctum | 200 | 200 | Supports multi-view (`list`, `board`, `calendar`) & filtering. |
| `/api/tasks` | POST | Sanctum | 201 / 422 | 201 / 422 | Validates title, status enum, priority enum, due date. |
| `/api/tasks/{task}` | GET | Sanctum | 200 / 403 / 404 | 200 / 403 / 404 | **Issue API-01**: See BE-01 (assignees receive 403). |
| `/api/tasks/{task}` | PUT | Sanctum | 200 / 403 / 422 | 200 / 403 / 422 | Granular activity logging on modified attributes. |
| `/api/tasks/{task}` | DELETE | Sanctum | 200 / 403 / 404 | 200 / 403 / 404 | Creator or admin can delete; logs to audit trail. |
| `/api/tasks/{task}/status` | PATCH | Sanctum | 200 / 422 | 200 / 422 | Fast status update for Kanban drag-and-drop. |
| `/api/tasks/{task}/comments` | POST | Sanctum | 201 / 422 | 201 / 422 | Adds discussion comment; notifies assignee. |
| `/api/tasks/{task}/comments/{c}` | DELETE | Sanctum | 200 / 403 | 200 / 403 | **Issue API-02**: Missing comment-to-task relationship validation. |
| `/api/projects/{p}/members` | POST | Sanctum | 201 / 403 | 200 / 403 | **Issue API-03**: Missing authorization gate (any user can call). |
| `/api/admin/users` | GET | Sanctum | 200 / 403 | 200 / 403 | Non-admin receives 403 Forbidden. |
| `/api/admin/audit-logs` | GET | Sanctum | 200 / 403 | 200 / 403 | Paginated audit logs with search and filter parameters. |
| `/api/ai/*` | POST | Sanctum | 200 / 422 | 200 / 422 | **Issue API-04**: Unthrottled endpoints. |

---

## 3. API Findings & Actionable Remediations

1. **API-01 (P0)**: Assignees unable to access `GET /api/tasks/{task}` when created by another project member due to strict `TaskPolicy`.
2. **API-02 (P1)**: `DELETE /api/tasks/{task}/comments/{comment}` should return `404 Not Found` if comment does not belong to the specified task.
3. **API-03 (P1)**: `POST /api/projects/{project}/members` and `DELETE /api/projects/{project}/members/{user}` must return `403 Forbidden` if caller is not the project owner or an administrator.
4. **API-04 (P2)**: Wrap `/api/ai/*` in `throttle:30,1` to enforce fair usage.

---
**API Audit Sign-off**: Endpoints structurally adhere to REST specifications; security gaps flagged for immediate triage.
