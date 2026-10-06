# AGENT 05: BACKEND & LARAVEL CODE REVIEW

**Reviewer**: Agent 05 — Senior Laravel / PHP Engineer  
**Codebase**: `app/`, `routes/`, `config/`, `database/`  
**Framework**: Laravel 11.x on PHP 8.2+  
**Status**: COMPLETE  
**Severity Scale**: CRITICAL | HIGH | MEDIUM | LOW  

---

## 1. Executive Summary

The Laravel backend exhibits strong software engineering patterns typical of an experienced developer:
- Strong typing, PHP 8 constructor property promotion, and enums (`TaskStatus`, `TaskPriority`, `UserRole`).
- Form Requests for input validation (`StoreTaskRequest`, `UpdateTaskRequest`, `RegisterRequest`, `LoginRequest`).
- API Resources for JSON contract stabilization (`TaskResource`, `ProjectResource`, `UserResource`, `AuditLogResource`).
- Centralized `AuditLoggerService` capturing structured JSON audit trails for compliance.
- Eager loading (`with(['user', 'assignee', 'project', 'labels'])` and `withCount('subtasks')`) to prevent N+1 queries.

However, several critical authorization, scoping, and route rate-limiting oversights must be resolved.

---

## 2. Code Review Findings

### 1. Task Policy Restricts Assigned Collaborators (CRITICAL BUG)
- **Finding BE-01 (CRITICAL)**:
  - **File**: `app/Policies/TaskPolicy.php:21-40`
  - **Current Code**:
    ```php
    public function view(User $user, Task $task): bool
    {
        return $user->isAdmin() || $task->user_id === $user->id;
    }
    public function update(User $user, Task $task): bool
    {
        return $user->isAdmin() || $task->user_id === $user->id;
    }
    ```
  - **Issue**: A task may be created by User A and assigned to User B, or belong to a project where User B is a member. In `TaskController::index`, User B correctly sees the task in their task list. However, when User B calls `GET /api/tasks/{task}` (`show`) or `PUT /api/tasks/{task}` (`update` or `updateStatus`), `Gate::authorize()` fails with `403 Forbidden` because `TaskPolicy` strictly checks `$task->user_id === $user->id`.
  - **Impact**: Collaborative workflow is broken; assignees cannot view task details or complete their own assigned tasks.
  - **Recommended Fix**: Update `TaskPolicy::view` and `TaskPolicy::update` to authorize if `$user->isAdmin()`, `$task->user_id === $user->id`, `$task->assignee_id === $user->id`, or `$task->project?->members()->where('users.id', $user->id)->exists()`.

### 2. Missing Context Scoping in Comment Deletion (HIGH)
- **Finding BE-02 (HIGH)**:
  - **File**: `app/Http/Controllers/Api/TaskController.php:439-447`
  - **Current Code**:
    ```php
    public function deleteComment(Request $request, Task $task, Comment $comment): JsonResponse
    {
        if (!$request->user()->isAdmin() && $comment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You cannot delete another member’s comment.'], 403);
        }
        $comment->delete();
        return response()->json(['message' => 'Comment removed.']);
    }
    ```
  - **Issue**: The method fails to verify that `$comment->task_id === $task->id`, and does not authorize whether `$request->user()` has permission to view `$task`.
  - **Impact**: A user could delete their own comment by pointing to an unrelated, restricted task route, violating restful route integrity.
  - **Recommended Fix**: Enforce `Gate::authorize('view', $task);` and verify `$comment->task_id === $task->id` (or use implicit scoped route model binding).

### 3. Missing Authorization on Project Member Management (HIGH)
- **Finding BE-03 (HIGH)**:
  - **File**: `app/Http/Controllers/Api/ProjectController.php:178-196`
  - **Issue**: `addMember` and `removeMember` methods perform model operations without any authorization gate. Any authenticated user can add or remove members from any project by sending a POST/DELETE request.
  - **Impact**: Unauthorized team modification / privilege escalation at project level.
  - **Recommended Fix**: Implement authorization verifying that `$request->user()->isAdmin()` or `$project->owner_id === $request->user()->id` (or user is a manager of the project).

### 4. Unthrottled AI & Bulk Mutation Endpoints (MEDIUM)
- **Finding BE-04 (MEDIUM)**:
  - **File**: `routes/api.php:55, 82-87`
  - **Issue**: `/api/tasks/bulk` and `/api/ai/*` routes do not have throttling middleware.
  - **Impact**: Malicious or runaway scripts could spam AI endpoints, increasing inference costs and server CPU utilization.
  - **Recommended Fix**: Apply `throttle:30,1` middleware to AI and bulk operations.

---

## 3. Prioritized Fix Plan

1. **BE-01 (P0)**: Update `TaskPolicy.php` to include `assignee_id` and project membership in `view` and `update`.
2. **BE-02 (P1)**: Add `$comment->task_id === $task->id` and `Gate::authorize('view', $task)` in `TaskController::deleteComment`.
3. **BE-03 (P1)**: Add owner/admin authorization in `ProjectController::addMember` and `removeMember`.
4. **BE-04 (P2)**: Add `throttle:30,1` to AI and bulk endpoints in `routes/api.php`.

---
**Backend Sign-off**: Ready for Orchestrator Triage and implementation.
