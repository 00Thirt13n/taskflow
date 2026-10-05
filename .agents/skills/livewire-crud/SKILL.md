---
name: livewire-crud
description: >
  Checklist and patterns for scaffolding tenant-scoped Livewire 3 CRUD screens
  in this application. Use when creating or modifying Livewire components for
  vendors, contracts, POs, invoices, or any new entity.
---

# Livewire CRUD Skill

## When to use this skill

- Creating a new Livewire CRUD screen (list, create, edit, show)
- Adding a Livewire component for an existing entity
- Modifying form validation or workflow on a Livewire screen
- Building the exception review or dashboard screens

---

## Scaffolding Checklist

When creating a CRUD screen for entity `X`:

### 1. Model & Migration
- [ ] Model exists in `app/Models/X.php` with `BelongsToOrganization` trait
- [ ] Migration matches `docs/database/schema.md`
- [ ] Enum exists for status field (if applicable) in `app/Enums/`
- [ ] Factory exists in `database/factories/XFactory.php`

### 2. Policy
- [ ] `app/Policies/XPolicy.php` exists
- [ ] `viewAny`, `view`, `create`, `update`, `delete` methods defined
- [ ] Role matrix from `docs/02-user-roles.md` enforced:
  - Admin: full access to their org
  - Auditor: write access for documents, invoices, vendors, contracts, POs; read for audit logs
  - Viewer: read-only for everything

### 3. Livewire Components
- [ ] List component: `app/Livewire/X/XIndex.php`
- [ ] Create component: `app/Livewire/X/XCreate.php`
- [ ] Show/Edit component: `app/Livewire/X/XShow.php` or `XEdit.php`
- [ ] Components authorize in `mount()` or use `#[Can]` attribute

### 4. Views
- [ ] `resources/views/livewire/x/index.blade.php`
- [ ] `resources/views/livewire/x/create.blade.php`
- [ ] `resources/views/livewire/x/show.blade.php`
- [ ] Use `{{ }}` for escaping (never `{!! !!}` on user data)

### 5. Routes
- [ ] Routes defined in `routes/web.php`
- [ ] Follow URL conventions from workflow docs:
  - `GET /xs` — list
  - `GET /xs/create` — create form
  - `POST /xs` — store
  - `GET /xs/{x}` — show
  - `PUT /xs/{x}` — update
  - `DELETE /xs/{x}` — soft delete (where applicable)

### 6. Tests
- [ ] Feature test for CRUD operations
- [ ] Tenant-leak test (user from org A → 404 on org B data)
- [ ] Role authorization tests (viewer can't write, auditor can write)

---

## Component Pattern

### List Component

```php
namespace App\Livewire\Vendor;

use App\Models\Vendor;
use Livewire\Attributes\Can;
use Livewire\Component;
use Livewire\WithPagination;

#[Can('viewAny', Vendor::class)]
class VendorIndex extends Component
{
    use WithPagination;

    public string $search = '';
    public string $statusFilter = '';

    public function updatingSearch(): void
    {
        $this->resetPage();
    }

    public function render()
    {
        // BelongsToOrganization scope is automatic
        $vendors = Vendor::query()
            ->when($this->search, fn ($q) => $q->where('name', 'like', "%{$this->search}%"))
            ->when($this->statusFilter, fn ($q) => $q->where('status', $this->statusFilter))
            ->orderBy('name')
            ->paginate(25);

        return view('livewire.vendor.index', compact('vendors'));
    }
}
```

### Create Component

```php
namespace App\Livewire\Vendor;

use App\Models\Vendor;
use App\Enums\VendorStatus;
use Livewire\Attributes\Can;
use Livewire\Component;

#[Can('create', Vendor::class)]
class VendorCreate extends Component
{
    // Form properties
    public string $name = '';
    public string $legal_name = '';
    public string $vendor_code = '';
    public string $email = '';
    public string $category = '';

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'legal_name' => ['nullable', 'string', 'max:255'],
            'vendor_code' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function save(): void
    {
        $validated = $this->validate();

        // organization_id is auto-filled by BelongsToOrganization
        $vendor = Vendor::create([
            ...$validated,
            'status' => VendorStatus::Active,
        ]);

        // Auto-create aliases for name and legal_name
        // (per docs/workflows/03-vendor-management.md)
        $vendor->createAliases();

        $this->redirect(route('vendors.show', $vendor));
    }

    public function render()
    {
        return view('livewire.vendor.create');
    }
}
```

---

## Key Patterns

### Currency Validation

All financial records must match the org currency:

```php
use Illuminate\Validation\Rule;

'currency' => [
    'required',
    'string',
    'size:3',
    Rule::in([auth()->user()->currentOrganization->currency]),
],
```

### Status Transitions

Validate that status transitions are legal per `docs/database/status-machines.md`:

```php
// In a service, not the component
public function transitionStatus(Invoice $invoice, InvoiceStatus $newStatus): void
{
    $allowed = match ($invoice->status) {
        InvoiceStatus::PendingAudit => [InvoiceStatus::Passed, InvoiceStatus::Exception],
        InvoiceStatus::Exception => [InvoiceStatus::ApprovedWithOverride, InvoiceStatus::Disputed],
        // ...
        default => [],
    };

    if (! in_array($newStatus, $allowed)) {
        throw new InvalidStatusTransitionException($invoice->status, $newStatus);
    }

    $invoice->update(['status' => $newStatus]);
}
```

### Audit Logging on Sensitive Actions

```php
// After an override, role change, rate edit, etc.
AuditLog::create([
    'organization_id' => $org->id,
    'user_id' => auth()->id(),
    'action' => 'OVERRIDE_APPROVED',
    'entity_type' => 'audit_issue',
    'entity_id' => $issue->id,
    'old_value' => ['status' => $issue->getOriginal('status')],
    'new_value' => ['status' => 'approved_override'],
    'ip_address' => request()->ip(),
]);
```

### Soft Delete Handling

```php
// List: by default Eloquent excludes soft-deleted
// Show with trashed (admin only):
$vendor = Vendor::withTrashed()->findOrFail($id);

// Restore:
$vendor->restore();

// Never force-delete financial records in P0
```

### Nested Items (Invoice Lines, PO Items, Contract Rates)

Handle parent + children in a single form. Use Livewire's array properties:

```php
public array $items = [
    ['description' => '', 'quantity' => '', 'unit_price' => '', 'line_total' => ''],
];

public function addItem(): void
{
    $this->items[] = ['description' => '', 'quantity' => '', 'unit_price' => '', 'line_total' => ''];
}

public function removeItem(int $index): void
{
    unset($this->items[$index]);
    $this->items = array_values($this->items);
}
```

---

## Route Conventions by Entity

| Entity | Routes | Reference |
|---|---|---|
| Organization | `/register`, `/settings/organization` | `docs/workflows/01-organization-onboarding.md` |
| Users/Invites | `/settings/users`, `/invitations/{token}` | `docs/workflows/02-user-management.md` |
| Vendors | `/vendors`, `/vendors/create`, `/vendors/{vendor}` | `docs/workflows/03-vendor-management.md` |
| Contracts | `/contracts`, `/contracts/create`, `/contracts/{contract}` | `docs/workflows/06-contract-processing.md` |
| POs | `/purchase-orders`, etc. | `docs/workflows/07-po-processing.md` |
| Invoices | `/invoices`, `/invoices/{invoice}/audit` | `docs/workflows/05-invoice-processing.md` |
| Reviews | `/reviews`, `/reviews/{auditRun}/override` | `docs/workflows/09-exception-review.md` |

---

## UI Notes

- P0 UI is **functional, not fancy**. Structured data display, not PDF rendering.
- Exception review uses a **split-pane** layout (invoice left, findings right).
- P1 adds PDF/image viewers.
- Dashboard: invoice counts, exception $, not full analytics.
