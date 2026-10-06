# AGENT 04: FRONTEND CODE & REACT ARCHITECTURE REVIEW

**Reviewer**: Agent 04 — Senior React Engineer  
**Codebase**: `frontend/src/`  
**Status**: COMPLETE  
**Severity Scale**: CRITICAL | HIGH | MEDIUM | LOW  

---

## 1. Architecture Overview

The frontend application is constructed with modern React (18.3.1), Vite 5, React Router 6, and Axios. Architecture adheres to clean separation of concerns:
- `services/`: Axios HTTP clients with central token injection and standard response unwrapping.
- `context/`: Lightweight scoped React Contexts for `AuthContext`, `ThemeContext`, and `ToastContext`.
- `hooks/`: Reusable hooks (`useDebounce`, `useKeyboardShortcut`).
- `layouts/`: `AppLayout` (workspace shell with global header, sidebar, command palette) and `PublicLayout` (marketing website navigation and footer).
- `pages/` and `components/`: Modular presentation with custom CSS design tokens.

---

## 2. Code Review Findings

### 1. Silent 403 and Non-Admin Assignee Bug
- **Finding FE-01 (HIGH)**:
  - **File**: `frontend/src/components/TaskCreateModal.jsx:45`
  - **Issue**: `TaskCreateModal` calls `adminService.getUsers().catch(() => [])` unconditionally when opened.
  - **Impact**: When a standard user (role: `user`) creates a task, the browser console logs a `403 Forbidden` from `/api/admin/users`, and the user array is set to empty `[]`. Non-admin users are left unable to select assignees or assign tasks to colleagues.
  - **Root Cause**: Reliance on an admin-only endpoint for general collaborative team assignment.
  - **Recommended Fix**: Check `isAdmin`. If admin, provide full user list; if standard user, fetch project members from `/api/projects/{projectId}/members` or include the authenticated user.

### 2. Table Pagination Reset on Filter Mutation
- **Finding FE-02 (HIGH)**:
  - **File**: `frontend/src/pages/TasksPage.jsx:24-31`
  - **Issue**: When a user navigates to page 2 or 3 and then inputs a search query or selects a status filter, `currentPage` remains unchanged. If the filtered result set contains fewer pages than the current page number, the server returns an empty data array.
  - **Impact**: The user sees an empty table ("No tasks found") even though matching records exist on page 1.
  - **Recommended Fix**: Add state synchronization that resets `setCurrentPage(1)` whenever `debouncedSearch`, `statusFilter`, `priorityFilter`, or `projectFilter` changes.

### 3. Dead Code / Duplicate Component
- **Finding FE-03 (LOW)**:
  - **File**: `frontend/src/components/TaskFormModal.jsx`
  - **Issue**: `TaskFormModal.jsx` (370 lines) is an obsolete modal superseded by `TaskCreateModal.jsx`. It is not imported anywhere in the project.
  - **Impact**: Code bloat, confusion for future maintainers.
  - **Recommended Fix**: Safely remove `TaskFormModal.jsx` from the codebase.

### 4. Memory Leak / Unmounted Component State Updates
- **Finding FE-04 (MEDIUM)**:
  - **File**: `frontend/src/pages/ProjectsPage.jsx:32-40` & `ReportsPage.jsx`
  - **Issue**: Async fetch operations do not utilize an `isMounted` flag or `AbortController` cancellation token. If the user navigates away before the network request resolves, React logs an unmounted component warning in dev mode.
  - **Recommended Fix**: Incorporate standard cancellation via `AbortController` in `useEffect` cleanup.

### 5. Prop Drilling & Context Health
- **Status**: PASSED.
- **Review**: `AuthContext` cleanly exposes `user`, `token`, `login`, `register`, `logout`, and `isAdmin`. No excessive re-renders observed.

---

## 3. Prioritized Fix Assignments

1. **FE-01**: Scope assignee fetching to project members for standard users in `TaskCreateModal.jsx`.
2. **FE-02**: Reset pagination to 1 on filter/search change in `TasksPage.jsx`.
3. **FE-03**: Delete orphaned `TaskFormModal.jsx`.
4. **FE-04**: Add request abort cleanup in `ProjectsPage.jsx` and `ReportsPage.jsx`.

---
**Frontend Architecture Sign-off**: APPROVED pending triage and Phase 4 implementation.
