# Coding Standards

These rules apply to ALL code generated for this project. No exceptions.

---

## PHP Version & Features

- Target **PHP 8.3+**. Use modern features:
  - Backed enums for all status/type fields
  - `readonly` properties on value objects and DTOs
  - `match` expressions instead of switch when appropriate
  - Named arguments for readability on complex constructors
  - First-class callable syntax `$this->method(...)` for callbacks
  - Typed properties and return types on everything

---

## Enums

- All status and type columns are **backed string enums** stored as VARCHAR in MySQL.
- Enum file location: `app/Enums/`
- Naming: `InvoiceStatus`, `ContractStatus`, `UserRole`, `MatchMethod`, `RateType`, `Severity`
- Cast in Eloquent model: `'status' => InvoiceStatus::class`
- Never compare status strings directly. Use `$model->status === InvoiceStatus::Exception`.

```php
// ✅ Correct
enum InvoiceStatus: string
{
    case PendingAudit = 'pending_audit';
    case Passed = 'passed';
    case Exception = 'exception';
    case ApprovedWithOverride = 'approved_with_override';
    case Disputed = 'disputed';
}

// ❌ Wrong — no raw strings
if ($invoice->status === 'exception') { ... }
```

---

## Money

- Store as `DECIMAL(12,2)` in MySQL, cast to `string` in PHP (not `float`).
- All money arithmetic uses BC Math: `bcadd()`, `bcsub()`, `bcmul()`, `bcdiv()`, `bccomp()`.
- Scale parameter: always `2` for money, `4` for rates/percentages.
- Never use `==`, `>`, `<` operators on money values.
- Tolerance comparisons: `abs(bccomp($a, $b, 2)) <= tolerance` pattern.

```php
// ✅ Correct
$overcharge = bcmul(bcsub($actual, $expected, 2), $quantity, 2);
if (bccomp($overcharge, '0.00', 2) > 0) { ... }

// ❌ Wrong
$overcharge = ($actual - $expected) * $quantity;
if ($overcharge > 0) { ... }
```

---

## Models

- Location: `app/Models/`
- Every model with `organization_id` uses the `BelongsToOrganization` trait.
- Use `$fillable` (not `$guarded = []`).
- Cast JSON columns to `array`: `'settings_json' => 'array'`, `'metadata_json' => 'array'`.
- Cast money columns to `string` via custom cast or accessor — never `float`/`decimal`.
- Cast date columns: `'effective_date' => 'date'`, `'created_at' => 'datetime'`.
- Cast enums: `'status' => InvoiceStatus::class`.
- Soft deletes via `SoftDeletes` trait where schema has `deleted_at`.
- Relationship methods: `belongsTo`, `hasMany`, `hasOne` — always type-hinted.

```php
class Invoice extends Model
{
    use SoftDeletes, BelongsToOrganization;

    protected $fillable = [
        'organization_id', 'vendor_id', 'document_id',
        'invoice_number', 'invoice_date', 'due_date',
        'currency', 'subtotal', 'tax_amount', 'total_amount',
        'po_reference', 'contract_reference', 'location_text',
        'status', 'extraction_confidence', 'extracted_data_json',
    ];

    protected function casts(): array
    {
        return [
            'status' => InvoiceStatus::class,
            'invoice_date' => 'date',
            'due_date' => 'date',
            'extracted_data_json' => 'array',
        ];
    }

    public function vendor(): BelongsTo { ... }
    public function items(): HasMany { ... }
    public function auditRuns(): HasMany { ... }
}
```

---

## Services

- Business logic belongs in **service classes** under `app/Services/`, NOT in controllers or Livewire components.
- Controllers/Livewire call services. Services call models and other services.
- Service methods should be focused: one public method per business operation.
- Inject dependencies via constructor.

---

## Policies

- Every tenant model has a Policy in `app/Policies/`.
- Authorization via `$this->authorize()` in controllers or `#[Can]` attribute on Livewire.
- **Never** inline role checks: `if ($user->role === 'admin')`.
- Check role via the pivot: `$user->organizations()->where('organizations.id', $orgId)->first()->pivot->role`.

---

## Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Database columns | `snake_case` | `invoice_date`, `total_amount` |
| PHP variables/methods | `camelCase` | `$totalAmount`, `calculateOvercharge()` |
| PHP classes | `PascalCase` | `InvoiceStatus`, `RunInvoiceAuditJob` |
| Enum cases | `PascalCase` | `PendingAudit`, `ApprovedWithOverride` |
| Blade views | `kebab-case` | `invoice-review.blade.php` |
| Livewire components | `PascalCase` class, `kebab-case` tag | `InvoiceCreate` → `<livewire:invoice-create />` |
| Routes | `kebab-case` paths | `/invoices/{invoice}/audit` |
| Config keys | `snake_case` | `config('audit.default_tolerance')` |
| Migration files | Laravel default timestamp prefix | `2024_01_01_000000_create_invoices_table.php` |

---

## General Rules

1. **No `dd()` or `dump()` in committed code.** Use `Log::debug()` if needed.
2. **No `env()` outside config files.** Always `config('key')`.
3. **No raw SQL concatenation.** Use query builder with bindings or Eloquent.
4. **Return early** to reduce nesting. Guard clauses first.
5. **Type everything.** Parameters, return types, properties.
6. **DocBlocks** only when they add information beyond the type signature.
7. **PSR-12** formatting. Run `./vendor/bin/pint` before committing.
8. **No `@`-suppressed errors.**
9. **No `compact()`** — use explicit arrays for readability.
