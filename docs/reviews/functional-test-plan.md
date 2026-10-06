# AGENT 11: FUNCTIONAL QA TEST MATRIX & VERIFICATION PLAN

**Reviewer**: Agent 11 — Senior QA & Functional Test Engineer  
**Status**: COMPLETE  
**Coverage**: Full End-to-End Functional Capabilities  

---

## 1. Test Matrix Overview

This functional matrix maps critical product capabilities across happy paths, boundary conditions, and invalid inputs.

---

## 2. Functional Test Suites

### Suite 1: Authentication & Identity
| ID | Scenario | Input / Action | Expected Result | Pass / Fail |
|---|---|---|---|---|
| AUTH-01 | Normal Registration | Valid name, unique email, 8+ char password | 201 Created, token returned, user role = 'user' | PASS |
| AUTH-02 | Duplicate Registration | Existing email address | 422 Unprocessable Entity with error on email | PASS |
| AUTH-03 | Valid Login | Matching email and password | 200 OK, token issued, redirected to /app/home | PASS |
| AUTH-04 | Invalid Login | Incorrect password | 401 Unauthorized with credential error message | PASS |
| AUTH-05 | Rate Limit Enforcement | 11 failed attempts within 60s | 429 Too Many Requests | PASS |
| AUTH-06 | Logout | Click logout button | Token revoked server-side, redirected to /login | PASS |

### Suite 2: Task Work Management & CRUD
| ID | Scenario | Input / Action | Expected Result | Pass / Fail |
|---|---|---|---|---|
| TASK-01 | Create Task (Minimal) | Title: "Fix CSS" | 201 Created, default status: todo, priority: medium | PASS |
| TASK-02 | Create Task (Full) | Title, Project, Assignee, Priority, Dates | 201 Created, project key task_key generated (e.g. WEB-102) | PASS |
| TASK-03 | Edit Task Attributes | Update description, priority, due date | 200 OK, activity log records granular diffs | PASS |
| TASK-04 | Drag-and-Drop Status | Drag card from 'Todo' to 'Done' on Board | PATCH /api/tasks/{id}/status -> 200 OK, completed_at set | PASS |
| TASK-05 | Add Subtask | Click 'Add Subtask' in drawer | 201 Created, nested under parent_task_id | PASS |
| TASK-06 | Toggle Blocker | Toggle 'Blocked' with reason "Waiting for API" | Card displays blocked badge & reason across views | PASS |
| TASK-07 | Delete Task (Owner) | Owner clicks delete | 200 OK, task removed, audit log recorded | PASS |
| TASK-08 | Delete Task (Non-Owner)| Regular user attempts to delete colleague's task | 403 Forbidden | PASS |

### Suite 3: Projects & Multi-Tenant Collaboration
| ID | Scenario | Input / Action | Expected Result | Pass / Fail |
|---|---|---|---|---|
| PROJ-01 | Create Project | Name: "Billing Portal", Key: "BILL" | 201 Created, creator assigned 'owner' role | PASS |
| PROJ-02 | Duplicate Project Key | Key: "BILL" in same workspace | 422 Unprocessable Entity ("key already in use") | PASS |
| PROJ-03 | Assignee Collaboration | User A creates task, assigns to User B | User B can view and update task (Requires BE-01 fix) | **FAIL (BLOCKED)** |
| PROJ-04 | Project Member IDOR | Non-owner adds member to Project B | Should reject with 403 (Requires BE-03 fix) | **FAIL (BLOCKED)** |

### Suite 4: Planning Views (Board, Calendar, Timeline)
| ID | Scenario | Input / Action | Expected Result | Pass / Fail |
|---|---|---|---|---|
| PLAN-01 | Board Column Drag | Drag card to new column | Instant optimistic update, position stored | PASS |
| PLAN-02 | Calendar Month Switch | Click Next / Prev month | Tasks rendered on correct due dates | PASS |
| PLAN-03 | Timeline Schedule | Tasks with start/due dates | Bars visually render across chronological scale | PASS |

### Suite 5: Administrative Control & Governance
| ID | Scenario | Input / Action | Expected Result | Pass / Fail |
|---|---|---|---|---|
| ADMN-01 | Admin Center Access | Admin user navigates to /app/admin/* | Renders system health, users, and audit logs | PASS |
| ADMN-02 | Admin Center Guard | Standard user navigates to /app/admin/* | Redirects to /forbidden (403) | PASS |
| ADMN-03 | Audit Log Trail | Perform any task mutation | Audit entry visible in Admin Audit Logs | PASS |

### Suite 6: AI-Assisted Workflows
| ID | Scenario | Input / Action | Expected Result | Pass / Fail |
|---|---|---|---|---|
| AI-01 | Subtask Decomposition | Title: "Migrate Auth to OAuth2" | AI generates 3-5 structured subtasks | PASS |
| AI-02 | Description Refinement | Rough notes passed to AI | Returns objective and acceptance criteria | PASS |
| AI-03 | Natural Language Parse | "Deploy release v2 tomorrow high priority" | Sets title, due date, and high priority | PASS |

---

## 3. QA Conclusion & Actionable Items

All core functional modules pass with the exception of:
- **PROJ-03**: Cross-member collaboration on assigned tasks (fixed via `TaskPolicy` update).
- **PROJ-04**: Project member authorization gate (fixed via `ProjectController` guard).
Both must be verified after Phase 4 fixes.
