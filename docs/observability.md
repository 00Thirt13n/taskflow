# TaskFlow Observability & Monitoring Specification

## 1. Observability Overview

TaskFlow is designed for high observability in production environments, adhering to the three pillars: **Metrics**, **Structured Logs**, and **Health Diagnostics**.

---

## 2. Structured Application Logging

TaskFlow employs structured JSON logging via Monolog in Laravel 11.

### Configuration (`config/logging.php`)
- Production log channel: `daily` or `stderr` (in Docker / Kubernetes environments).
- Log retention: 14 days rotating logs.

### Log Entry Structure
```json
{
  "timestamp": "2026-10-05T17:30:15.120Z",
  "level": "INFO",
  "message": "Task status updated",
  "context": {
    "task_id": 102,
    "task_key": "WEB-102",
    "project_id": 1,
    "user_id": 2,
    "old_status": "todo",
    "new_status": "in-progress",
    "ip_address": "127.0.0.1",
    "request_id": "req-9a8b7c6d-e5f4"
  }
}
```

### Sensitive Data Masking Policy
Under no circumstances are the following logged:
- Plaintext passwords or password reset tokens.
- Personal Access Tokens (Sanctum bearer tokens).
- API keys (e.g. `GEMINI_API_KEY`).
- Session cookies or credit card data.

---

## 3. Health Checks & Diagnostics

### Public Health Check (`/api/health`)
- Returns `200 OK` when core services are operational.
- Measures live database latency using lightweight `SELECT 1;` ping.
- Reports memory usage and application uptime.
- Compatible with AWS ALB target group health checks, Kubernetes liveness/readiness probes, and Uptime Kuma.

### Internal System Health (`/api/admin/system-health`)
- Restricted strictly to users with the `admin` role via `AdminPolicy`.
- Reports:
  - PHP version & loaded extensions.
  - Laravel framework version and application environment (`APP_ENV`).
  - MySQL database connection latency, active database name, and table counts.
  - Queue driver configuration (`sync`, `redis`, `database`).
  - Cache driver status (`file`, `redis`).
  - System memory usage.

---

## 4. Production Error Investigation Workflow

1. **Alert Trigger**: Sentry / Monolog captures an uncaught exception (`500 Internal Server Error`).
2. **Correlation ID**: The client receives a sanitized error message with a unique `request_id` or timestamp.
3. **Log Traversal**: The engineer searches the rotating log using ripgrep or ELK / Datadog:
   ```bash
   grep "req-9a8b7c6d-e5f4" storage/logs/laravel-*.log
   ```
4. **Audit Trail Cross-Reference**: Check `audit_logs` table for the user and entity to determine the preceding state transitions.
