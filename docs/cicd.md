# TaskFlow CI/CD Pipeline & Deployment Strategy

## 1. Continuous Integration Architecture

The TaskFlow CI pipeline runs on GitHub Actions on every push and pull request targeting the `main` branch.

```mermaid
flowchart LR
    GitPush([Git Push / PR]) --> BackendJob[Backend Job: PHP 8.3 & MySQL]
    GitPush --> FrontendJob[Frontend Job: Node 22 & Vitest]
    
    BackendJob --> CompAudit[composer audit]
    BackendJob --> PHPUnit[php artisan test (MySQL 8.0)]
    
    FrontendJob --> Vitest[npm test]
    FrontendJob --> ViteBuild[npm run build]
    
    PHPUnit --> AllPass{All Tests Pass?}
    ViteBuild --> AllPass
    AllPass -- Yes --> DeployReady[Green Build / Deployable Artifact]
    AllPass -- No --> BlockMerge[Block Merge & Alert Engineer]
```

---

## 2. GitHub Secrets Configuration

| Secret Name | Purpose | Example / Format |
|---|---|---|
| `SSH_HOST` | Production server IP or hostname | `203.0.113.10` |
| `SSH_USER` | Deployer user on host | `deployer` |
| `SSH_PRIVATE_KEY` | Ed25519 deployment private key | `-----BEGIN OPENSSH PRIVATE KEY-----` |
| `APP_KEY` | Laravel encryption key | `base64:...` |
| `DB_PASSWORD` | Production MySQL password | `[Managed Secret]` |
| `GEMINI_API_KEY` | Optional Google Gemini API key | `AIzaSy...` |

---

## 3. Zero-Downtime Deployment Strategy

For virtual private servers (VPS) or cloud VMs:
1. **Atomic Symlink Deployment**:
   - `releases/YYYYMMDDHHMMSS/`
   - `shared/.env`, `shared/storage/`
   - `current -> releases/YYYYMMDDHHMMSS/`
2. **Migration Execution**:
   - `php artisan migrate --force` runs before pointing symlink.
3. **OPcache & Cache Warmup**:
   - `php artisan config:cache`
   - `php artisan route:cache`
   - `php artisan view:cache`
   - Reload PHP-FPM: `sudo systemctl reload php8.3-fpm`.

---

## 4. Rollback Strategy

If a critical defect or runtime anomaly is detected post-deployment:
1. **Immediate Symlink Rollback**:
   - Point `current` symlink back to previous release directory:
     ```bash
     ln -sfn /var/www/taskflow/releases/PREVIOUS_RELEASE /var/www/taskflow/current
     sudo systemctl reload php8.3-fpm
     ```
2. **Database Rollback**:
   - If migrations were applied, run:
     ```bash
     php artisan migrate:rollback --step=1 --force
     ```
3. **Verification**:
   - Query `/api/health` to confirm database connectivity and HTTP 200 return code.
