# AGENT 08: AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) AUDIT

**Reviewer**: Agent 08 — Authentication & RBAC Specialist  
**Authentication Standard**: Bearer Token (Laravel Sanctum)  
**Roles Defined**: `admin`, `user` (Enums: `UserRole`)  
**Status**: COMPLETE  

---

## 1. Authentication Lifecycle Audit

1. **Registration (`POST /api/register`)**:
   - New accounts are strictly provisioned with role `user` (Role ID dynamically resolved via `UserRole::User->value`).
   - Plaintext passwords hashed using Bcrypt.
   - Issues a scoped personal access token upon successful registration.
2. **Login (`POST /api/login`)**:
   - Authenticates against hashed credentials.
   - Protected by IP-based rate limiter (`throttle:10,1`).
   - Revokes or provisions Sanctum tokens cleanly.
3. **Session & Profile (`GET /api/me`)**:
   - Returns user profile including `role: { id, name }`.
   - Returns `401 Unauthorized` if Bearer token is missing, corrupted, or revoked.
4. **Logout (`POST /api/logout`)**:
   - Revokes `$user->currentAccessToken()->delete()`.

---

## 2. RBAC Permission Matrix

| Protected Resource / Action | Anonymous | Regular User | Admin | Policy / Enforcement Mechanism |
|---|---|---|---|---|
| **Public Health Check** (`GET /api/health`) | 200 OK | 200 OK | 200 OK | Public route |
| **List Own Tasks** (`GET /api/tasks`) | 401 | 200 (Own + Assigned + Projects) | 200 (All) | Scoped SQL Query |
| **Create Task** (`POST /api/tasks`) | 401 | 201 (Self as Creator) | 201 (Self/Assigned Creator) | `TaskPolicy::create` |
| **View Task (Creator)** | 401 | 200 OK | 200 OK | `TaskPolicy::view` |
| **View Task (Assignee / Project Member)** | 401 | **403 Forbidden (BUG)** | 200 OK | **FIX REQUIRED: Expand Policy** |
| **Update Task (Creator)** | 401 | 200 OK | 200 OK | `TaskPolicy::update` |
| **Update Task (Assignee / Status Drag)** | 401 | **403 Forbidden (BUG)** | 200 OK | **FIX REQUIRED: Expand Policy** |
| **Delete Task** | 401 | 200 (Owner only) | 200 (Any) | `TaskPolicy::delete` |
| **Manage Project Members** | 401 | **200 OK (SECURITY LEAK)** | 200 OK | **FIX REQUIRED: Add Owner Guard** |
| **List Admin Users** (`GET /api/admin/users`) | 401 | 403 Forbidden | 200 OK | `AuditLogPolicy::viewAny` |
| **Change User Role** (`PATCH /api/admin/users/{u}/role`) | 401 | 403 Forbidden | 200 OK | `AuditLogPolicy::viewAny` |
| **View Audit Logs** (`GET /api/admin/audit-logs`) | 401 | 403 Forbidden | 200 OK | `AuditLogPolicy::viewAny` |
| **View System Health** (`GET /api/admin/system-health`) | 401 | 403 Forbidden | 200 OK | `AuditLogPolicy::viewAny` |

---

## 3. Findings & Required RBAC Adjustments

1. **RBAC-01**: Expand `TaskPolicy::view` and `TaskPolicy::update` to allow task assignees and project members access to their assigned work.
2. **RBAC-02**: Enforce project owner / admin restrictions on `ProjectController::addMember` and `removeMember`.
3. **RBAC-03**: Verify that regular users cannot demote or promote roles (already verified: returns 403).

---
**RBAC Sign-off**: Remediations scheduled in Phase 4.
