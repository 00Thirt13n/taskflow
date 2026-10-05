# TaskFlow Disaster Recovery & Backup Strategy

## 1. Objective & Recovery Targets

This document outlines the backup, retention, and disaster recovery procedures for TaskFlow.

- **RPO (Recovery Point Objective)**: 1 hour (maximum acceptable data loss).
- **RTO (Recovery Time Objective)**: 15 minutes (maximum acceptable downtime to restore service).

---

## 2. MySQL Database Backups

### Automated Daily Full Backups
TaskFlow utilizes `mysqldump` with transaction consistency for zero-downtime hot backups on InnoDB tables:

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/var/backups/taskflow/mysql"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/taskflow_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

# Run consistent hot backup using single-transaction flag
mysqldump \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --default-character-set=utf8mb4 \
  -u "${DB_USERNAME}" \
  -p"${DB_PASSWORD}" \
  "${DB_DATABASE}" | gzip -9 > "${BACKUP_FILE}"

# Enforce 30-day retention
find "${BACKUP_DIR}" -type f -name "taskflow_*.sql.gz" -mtime +30 -delete
```

### Point-in-Time Recovery (PITR)
To achieve an RPO under 1 hour, MySQL binary logging (`binlog`) is enabled:
```ini
[mysqld]
log_bin = /var/log/mysql/mysql-bin.log
expire_logs_days = 7
binlog_format = ROW
```

---

## 3. Storage & Artifact Backups

- **Application Code**: Version controlled via Git on GitHub/GitLab.
- **Environment Configuration**: Securely encrypted and stored in HashiCorp Vault, AWS Secrets Manager, or Doppler.
- **Uploaded Files / Attachments**: Stored in S3-compatible object storage with versioning and cross-region replication (CRR) enabled.

---

## 4. Disaster Recovery & Restoration Procedure

To restore TaskFlow on a fresh instance:

1. **Provision Environment**:
   ```bash
   git clone git@github.com:yourusername/task_manager.git /var/www/html/taskflow
   cd /var/www/html/taskflow
   cp .env.example .env # Inject production secrets
   composer install --no-dev --optimize-autoloader
   ```

2. **Restore MySQL Database**:
   ```bash
   # Uncompress and pipe backup into target MySQL server
   gunzip < /var/backups/taskflow/mysql/taskflow_latest.sql.gz | mysql -u root -p taskflow
   ```

3. **Replay Binlogs (for PITR if applicable)**:
   ```bash
   mysqlbinlog --start-datetime="2026-10-05 12:00:00" /var/log/mysql/mysql-bin.000042 | mysql -u root -p taskflow
   ```

4. **Verify Application & Database Consistency**:
   ```bash
   php artisan migrate --status
   curl -f http://127.0.0.1:8000/api/health
   ```
