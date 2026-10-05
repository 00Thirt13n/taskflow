# Security Rules

These security constraints are MANDATORY. Violations are critical bugs.

---

## Tenant Isolation

1. **Every model with `organization_id` MUST use `BelongsToOrganization` trait.**
   - This adds a global scope: `WHERE organization_id = {current_user.current_organization_id}`
   - Auto-fills `organization_id` on create.

2. **Never trust client-supplied organization_id.**
   - Do not accept `organization_id` from forms or URL parameters for authorization.
   - Load records through scoped queries that enforce the global scope.

3. **Never use `Model::find($id)` on tenant models.**
   - Always use scoped queries or `findOrFail` which respects the global scope.
   - A tenant-scoped `findOrFail` returns 404 (not 403) for records in another org.

4. **Queue jobs must bind tenant context before any DB query.**
   - Pass `organization_id` into the job constructor.
   - Set `Auth::onceUsingId()` or a dedicated `TenantContext` in the `handle()` method.
   - Never run tenant-scoped queries with no user/org context.

5. **Tenant-leak test is REQUIRED.**
   - User from org A trying to access org B's data → 404.
   - This test must exist for every resource endpoint.

---

## Authorization

1. **Laravel Policies on every tenant resource.** No exceptions.
   - `app/Policies/InvoicePolicy.php`, `VendorPolicy.php`, etc.
   - Register in `AuthServiceProvider` or use auto-discovery.

2. **No inline role checks.**
   ```php
   // ❌ NEVER do this
   if ($user->role === 'admin') { ... }

   // ✅ Use policies
   $this->authorize('update', $vendor);
   ```

3. **Last-admin protection.**
   - An admin cannot remove their own admin role or deactivate themselves unless another active admin exists in that org.
   - This is business rule BR-USER-03.

4. **Viewer role is read-only.** Cannot create, update, or trigger audits.

---

## Audit Logging

**Required for ALL of these actions — no exceptions:**

| Action | `audit_logs.action` value |
|---|---|
| Override approved | `OVERRIDE_APPROVED` |
| Dispute marked | `DISPUTE_MARKED` |
| Role changed | `ROLE_CHANGED` |
| User suspended/reactivated | `USER_STATUS_CHANGED` |
| Contract rate edited | `RATE_EDITED` |
| Audit re-run triggered | `AUDIT_RERUN` |
| Dispute sent (P2) | `DISPUTE_SENT` |

### Audit log requirements

- **Append-only.** No `updated_at` column. Never update or delete rows.
- Store `old_value` and `new_value` as JSON for change tracking.
- Include `user_id` and `ip_address`.
- Always scoped to `organization_id`.

```php
AuditLog::create([
    'organization_id' => $org->id,
    'user_id' => auth()->id(),
    'action' => 'OVERRIDE_APPROVED',
    'entity_type' => 'audit_issue',
    'entity_id' => $issue->id,
    'old_value' => ['status' => 'open'],
    'new_value' => ['status' => 'approved_override'],
    'ip_address' => request()->ip(),
]);
```

---

## Data Safety

1. **Override reason minimum 10 characters.** Validate server-side.

2. **Soft-delete financial records.** Never hard-delete invoices, contracts, vendors, POs.
   - Use `SoftDeletes` trait where schema has `deleted_at`.
   - Unique invoice numbers stay enforced even after soft-delete (do NOT include `deleted_at` in unique composite).

3. **Immutable audit history.**
   - Old `audit_runs` rows are never deleted — `is_current` is set to `0`.
   - Old `audit_issues` rows are never mutated — new run creates new issue rows.
   - `approvals` table is append-only.

4. **No customer data to LLM in P0.**
   - `AI_PROVIDER=fake` in P0.
   - When P1 enables real AI, use zero-retention / enterprise endpoints only.
   - Never log full document text to shared debug channels.

---

## Input Validation

1. **Currency validation.** Invoice/contract/PO currency must equal `organizations.currency`. Reject with 422 if mismatched.

2. **No raw SQL.** Always use Eloquent or Query Builder with parameter binding.
   ```php
   // ❌ NEVER
   DB::select("SELECT * FROM invoices WHERE id = $id");

   // ✅ Always
   DB::select("SELECT * FROM invoices WHERE id = ?", [$id]);
   // or
   Invoice::findOrFail($id);
   ```

3. **CSRF protection** on all Livewire and web POST routes (framework default — do not disable).

4. **Blade escaping.** Use `{{ }}` (escaped), never `{!! !!}` unless rendering trusted, sanitized HTML.

5. **File uploads (P1):**
   - Max 25 MB.
   - SHA-256 hash for deduplication.
   - Private disk only — no public document directory.
   - Signed URLs for downloads, 15-minute TTL.

---

## Session & Authentication

1. **Session-only auth.** No Sanctum tokens, no API tokens, no OAuth in P0.
2. **Passwords hashed** with framework default (bcrypt).
3. **Invite tokens:** 64-byte random, expire in 72 hours.
4. **Org switching** updates `users.current_organization_id` and regenerates session.
