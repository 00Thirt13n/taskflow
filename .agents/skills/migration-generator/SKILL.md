---
name: migration-generator
description: >
  Skill for generating Laravel migrations that match docs/database/schema.md.
  Use when creating new migrations, modifying table structures, or verifying
  migration correctness against the schema source of truth.
---

# Migration Generator Skill

## When to use this skill

- Creating new database migrations
- Modifying existing tables
- Verifying migration output matches `docs/database/schema.md`
- Adding indexes, foreign keys, or constraints

---

## Source of Truth

**[`docs/database/schema.md`](../../docs/database/schema.md)** is the canonical schema definition. If a migration and the schema doc disagree, the schema doc wins.

---

## Column Type Mapping

| Schema Type | Laravel Migration Method |
|---|---|
| `BIGINT UNSIGNED PK AI` | `$table->id()` |
| `BIGINT UNSIGNED FK` | `$table->foreignId('x_id')` |
| `VARCHAR(N)` | `$table->string('name', N)` |
| `CHAR(N)` | `$table->char('currency', N)` |
| `TEXT` | `$table->text('body')` |
| `INT UNSIGNED` | `$table->unsignedInteger('line_number')` |
| `DECIMAL(M,N)` | `$table->decimal('amount', M, N)` |
| `BOOLEAN` | `$table->boolean('is_active')` |
| `JSON` | `$table->json('settings_json')` |
| `TIMESTAMP` | `$table->timestamp('x_at')` |
| `DATE` | `$table->date('effective_date')` |
| `TIMESTAMP NULL (soft delete)` | `$table->softDeletes()` |
| `created_at, updated_at` | `$table->timestamps()` |

---

## Modifier Mapping

| Schema Modifier | Laravel Method |
|---|---|
| `NOT NULL` | (default for most methods) |
| `NULL` | `->nullable()` |
| `DEFAULT 'value'` | `->default('value')` |
| `UNIQUE` | `->unique()` |
| `INDEX` | `->index()` |

---

## Foreign Key Conventions

```php
// CASCADE delete (child dies with parent)
$table->foreignId('contract_id')->constrained()->cascadeOnDelete();

// SET NULL (child survives, FK becomes null)
$table->foreignId('document_id')->nullable()->constrained()->nullOnDelete();

// Simple FK with index (no cascade specified = RESTRICT by default)
$table->foreignId('organization_id')->constrained()->cascadeOnDelete();

// FK to specific table
$table->foreignId('invited_by')->constrained('users');
```

### When to CASCADE vs SET NULL

From the schema:

| Child Table | FK Column | On Delete |
|---|---|---|
| `organization_user` | `organization_id`, `user_id` | CASCADE |
| `invitations` | `organization_id` | CASCADE |
| `vendor_aliases` | `vendor_id` | CASCADE |
| `contract_rates` | `contract_id` | CASCADE |
| `purchase_order_items` | `purchase_order_id` | CASCADE |
| `invoice_items` | `invoice_id` | CASCADE |
| `audit_issues` | `audit_run_id` | CASCADE |
| `dispute_messages` | `dispute_id` | CASCADE |
| `users` | `current_organization_id` | SET NULL |
| `invoices` | `document_id` | SET NULL (nullable FK) |
| `invoice_items` | `purchase_order_item_id`, `contract_rate_id` | SET NULL |

---

## Composite Unique Constraints

```php
// organization_user: unique(organization_id, user_id)
$table->unique(['organization_id', 'user_id']);

// invoices: unique(organization_id, vendor_id, invoice_number)
$table->unique(['organization_id', 'vendor_id', 'invoice_number']);

// vendor_aliases: unique(organization_id, alias)
$table->unique(['organization_id', 'alias']);

// purchase_orders: unique(organization_id, po_number)
$table->unique(['organization_id', 'po_number']);

// audit_rules: unique(organization_id, rule_code)
$table->unique(['organization_id', 'rule_code']);
```

**IMPORTANT:** Do NOT include `deleted_at` in unique constraints on financial records. Soft-deleted invoices should still occupy the unique key.

---

## Composite Indexes

```php
// Common pattern for tenant-scoped lookups
$table->index(['organization_id', 'name']);
$table->index(['organization_id', 'status']);
$table->index(['organization_id', 'email']);
$table->index(['organization_id', 'entity_type', 'entity_id']);
```

---

## Migration Template

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained();
            $table->foreignId('document_id')->nullable()->constrained()->nullOnDelete();

            $table->string('invoice_number', 100);
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->char('currency', 3);
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->string('po_reference', 100)->nullable();
            $table->string('contract_reference', 100)->nullable();
            $table->string('location_text', 255)->nullable();
            $table->string('status', 40)->default('pending_audit');
            $table->decimal('extraction_confidence', 5, 4)->nullable();
            $table->json('extracted_data_json')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->unique(['organization_id', 'vendor_id', 'invoice_number']);
            $table->index('organization_id');
            $table->index('vendor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
```

---

## Migration Order

Tables must be created in dependency order. Recommended sequence:

1. `organizations`
2. Modify `users` table (add `current_organization_id` FK)
3. `organization_user`
4. `invitations`
5. `vendors`
6. `vendor_aliases`
7. `documents`
8. `contracts`
9. `contract_rates`
10. `purchase_orders`
11. `purchase_order_items`
12. `invoices`
13. `invoice_items`
14. `audit_rules`
15. `audit_runs`
16. `audit_issues`
17. `approvals`
18. `audit_logs`
19. `disputes`
20. `dispute_messages`

---

## Validation After Creating Migrations

After generating migrations, verify:

1. Run `php artisan migrate:fresh` — must complete without errors.
2. Check column types with `php artisan db:table tablename` or `DESCRIBE tablename` in MySQL.
3. Verify foreign keys: `SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'invoice_audit_dev'`.
4. Confirm unique constraints prevent duplicates (try inserting a duplicate).
5. Confirm cascade deletes work (delete a parent, check children are gone).

---

## Common Mistakes to Avoid

1. ❌ Using `$table->integer()` for FKs — always `$table->foreignId()`.
2. ❌ Forgetting `->nullable()` on optional FKs.
3. ❌ Using `->float()` or `->double()` for money — always `->decimal(12, 2)`.
4. ❌ Adding `deleted_at` to unique constraints on financial records.
5. ❌ Creating tables out of dependency order.
6. ❌ Forgetting the `organization_id` index on tenant tables.
7. ❌ Using `onDelete('cascade')` when schema says SET NULL.
