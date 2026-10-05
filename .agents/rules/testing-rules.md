# Testing Rules

These rules govern ALL test code. The audit engine is the product — tests are non-negotiable.

---

## Framework

- **PHPUnit** (already in project). Do NOT switch to Pest unless explicitly asked.
- Feature tests use `RefreshDatabase` trait.
- Database: **MySQL only**. Never SQLite — JSON and decimal behavior differ.
- `phpunit.xml` must set: `AI_PROVIDER=fake`, `QUEUE_CONNECTION=sync`, `MAIL_MAILER=array`.

---

## Golden Case: Apex HVAC (MANDATORY)

This test MUST exist and MUST pass at all times. If ANY change breaks it, fix before merging.

### Fixture data

| Record | Key Values |
|---|---|
| Organization | currency `USD`, tolerance `0.00` |
| Vendor | name: `Apex HVAC & Facility Services` |
| Contract | number: `MSA-APEX-2024`, effective: `2024-01-01`, expiry: `2026-12-31`, cap: `3.00%` |
| Contract Rate | service_code: `HVAC_MAINT`, UOM: `Hour`, base_rate: `450.00`, page: `12`, clause: `Section 4.2 (Schedule B)` |
| Purchase Order | number: `PO-99120`, total: `10000.00`, line: 20h @ `450.00` |
| Invoice | number: `INV-2026-8819`, date: `2026-08-15`, subtotal: `5200.00`, tax: `416.00`, total: `5616.00` |
| Invoice Line | qty: `10.00`, unit_price: `520.00`, line_total: `5200.00`, description: contains "chiller maintenance" |

### Expected results

- `audit_runs.status` = `exception`
- `audit_issues` includes `rule_code = BR-301`
- `audit_issues.overcharge_amount` = `700.00`
- `audit_issues.source_citation` contains `12` and `4.2`
- `invoices.status` = `exception`
- `purchase_orders.billed_to_date` = `0.00` (NOT incremented on exception)

### Test file: `tests/Feature/Audit/ApexHvacAuditTest.php`

---

## Required P0 Test Cases

| Test Name | Setup | Expected |
|---|---|---|
| clean_pass | 10h @ $450 | status `passed`, overcharge `0.00` |
| duplicate_invoice | same INV-2026-8819 twice | BR-101 critical |
| math_break | line_total 5200, header total 5000 | BR-102 |
| qty_over_po | 25h on 20h PO, rate 450 | BR-202 |
| missing_po | empty po_reference | BR-201b warning, L3 still runs |
| within_cap | year+ on contract, rate 450 × 1.03 | passed |
| over_cap | $520 with 3% cap inside year 0 | BR-301/302 |
| unmatched_line | nonsense description | BR-UNMATCHED warning |
| override_flow | POST override with reason | invoice `approved_with_override`, PO billed increments |
| last_admin_guard | demote self when only admin | 403 |
| currency_mismatch | invoice EUR on USD org | 422 |
| tenant_leak | user A GET invoice of org B | 404 |

---

## Test Structure

```
tests/
├── Feature/
│   ├── Audit/
│   │   ├── ApexHvacAuditTest.php       # Golden case
│   │   ├── AuditRulesTest.php          # Individual BR-code tests
│   │   └── AuditRerunTest.php          # is_current flip, idempotency
│   ├── Auth/
│   │   ├── RegistrationTest.php
│   │   └── InvitationTest.php
│   ├── Vendor/
│   ├── Contract/
│   ├── Invoice/
│   └── Review/
│       └── OverrideTest.php
├── Unit/
│   ├── Audit/
│   │   └── EscalationMathTest.php      # Pure math, no DB
│   └── Matching/
│       └── LineMatcherTest.php         # Deterministic matching
└── Fixtures/
    └── extraction/
        └── apex-invoice.json           # AI fake responses
```

---

## Testing Patterns

### Tenant isolation test pattern

```php
public function test_user_cannot_access_other_org_invoice(): void
{
    $orgA = Organization::factory()->create();
    $orgB = Organization::factory()->create();
    $userA = User::factory()->create(['current_organization_id' => $orgA->id]);
    $invoiceB = Invoice::factory()->for($orgB)->create();

    $this->actingAs($userA)
         ->get("/invoices/{$invoiceB->id}")
         ->assertNotFound();  // 404, not 403
}
```

### Queue dispatch assertion

```php
Queue::fake();

// ... create invoice ...

Queue::assertPushed(RunInvoiceAuditJob::class, function ($job) use ($invoice) {
    return $job->invoiceId === $invoice->id;
});
```

### Money assertion

```php
$this->assertSame('700.00', $issue->overcharge_amount);
// NOT: $this->assertEquals(700, $issue->overcharge_amount);
```

---

## Rules

1. **Every new feature must have a test.** No exceptions.
2. **Run `php artisan test` before declaring work done.**
3. **Never mock the audit engine in audit tests.** Test the real calculation.
4. **Mock external services** (AI, mail) with fakes.
5. **Factories** for all models. Use `->for()` chaining for relationships.
6. **Assertions are specific.** Assert exact values, not just "not null."
7. **Test status transitions.** Verify both the happy path and forbidden transitions.
8. **Reproducibility:** same input + same rules = same findings. Always.
