# Changelog

All notable changes to the **TaskFlow** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-10-05

### Major Transformation: Enterprise Work Management Platform

#### Added
- **Multi-Tier Domain Architecture**:
  - Introduced Workspaces (`workspaces`) and Projects (`projects`) with computed health scores (`healthy`, `at_risk`, `delayed`).
  - Added Project Memberships (`project_members`) with granular role assignments (`owner`, `manager`, `developer`, `viewer`).
  - Upgraded Tasks with human-readable keys (`WEB-101`), Kanban ordering `position`, `parent_task_id` for checklist subtasks, and explicit blocker flags (`is_blocked`, `blocker_reason`).
- **Interactive Multi-View Task Suite**:
  - Interactive Table View with sorting, bulk selection, and column filtering.
  - Kanban Board with HTML5 drag-and-drop and instant status persistence.
  - Monthly Calendar View visualizing task due dates and project milestones.
  - Gantt-style Timeline Schedule displaying start/target dates and delivery ranges.
- **Enterprise Collaboration & Detail Drawer**:
  - Slide-over Task Detail Drawer with live status/priority pickers, subtasks checklist, blocker toggling, and rich discussion comments feed with author deletion rights.
  - Chronological Activity Timeline capturing every status shift, assignment, and comment with before/after state diffs.
- **AI Task Assistant & Natural Language Parser**:
  - Natural language task creation parser (e.g. "Deploy Nginx security patches by Friday, high priority, assign to Michael").
  - Automated checklist subtask generator from task descriptions.
  - AI description enhancer with structured acceptance criteria.
  - Smart priority and label classifier with heuristic fallback protection.
- **Executive Analytics & Reporting**:
  - Comprehensive KPI dashboard with 7-day velocity net completion trends.
  - Team workload distribution chart with high priority and overdue indicators.
  - Memory-efficient streaming CSV export endpoint (`/api/reports/export`).
- **Admin Center & Diagnostics**:
  - Admin user management with 1-click role toggles.
  - Comprehensive Audit Log inspector with JSON state diff modal.
  - Live System Health diagnostics dashboard reporting PHP, Laravel, MySQL tables, and cache/queue drivers.
- **Productivity & Shell Upgrades**:
  - Global Command Palette (`Ctrl+K` or `/`) with multi-entity fuzzy search across tasks, projects, and users.
  - Dedicated "My Work" page with Overdue, Due Today, Upcoming, and Completed sections.
  - Notification Center (`🔔`) with unread badge count and mark-read actions.
  - Centralized design system with CSS custom properties supporting seamless light and dark mode toggling.

---

## [1.0.0] - 2026-10-05

### Initial Release: Core Task Manager Foundation
- Basic Task CRUD with title, description, status, priority, and due date.
- Laravel Sanctum token-based authentication (register, login, logout, me).
- Role-based authorization (`admin`, `user`) with TaskPolicy.
- MySQL 8.0 schema with composite indexes and query optimization documentation.
- Docker environment (Nginx, PHP-FPM, MySQL).
- GitHub Actions CI/CD workflows for backend and frontend tests.
