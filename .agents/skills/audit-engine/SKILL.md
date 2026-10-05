---
name: audit-engine
description: >
  Deep reference for implementing, modifying, or debugging the invoice audit engine
  (Services/Audit). Use when working on business rules (BR-codes), the RunInvoiceAuditJob,
  escalation math, overcharge calculations, status rollup, or adding new audit rules.
---

# Audit Engine Skill

## When to use this skill

- Implementing or modifying any `BR-*` business rule
- Working on `RunInvoiceAuditJob`
- Changing escalation/cap math
- Adding a new audit rule to the catalog
- Debugging why a finding is wrong
- Modifying status rollup logic

---

## Architecture Overview

```
app/Services/Audit/
├── AuditEngine.php              # Orchestrator — runs all levels
├── Rules/
│   ├── RuleInterface.php        # Contract for all rules
│   ├── L1/
│   │   ├── DuplicateInvoiceRule.php      # BR-101
│   │   ├── InvoiceTotalRule.php          # BR-102
│   │   ├── LineMathRule.php              # BR-102b
│   │   └── InvoiceDateRule.php           # BR-104
│   ├── L2/
│   │   ├── PoReferenceRule.php           # BR-201
│   │   ├── MissingPoRule.php             # BR-201b
│   │   ├── PoQuantityRule.php            # BR-202
│   │   ├── PoPriceRule.php               # BR-203
│   │   ├── PoTotalRule.php               # BR-204
│   │   └── UnmatchedLineRule.php         # BR-UNMATCHED (L2)
│   └── L3/
│       ├── ContractRateRule.php          # BR-301
│       ├── EscalationCapRule.php         # BR-302
│       ├── EmergencyWeekendRateRule.php  # BR-303
│       ├── UnmatchedRateRule.php         # BR-UNMATCHED (L3)
│       ├── CitationMissingRule.php       # BR-CITE-MISSING
│       └── LowConfidenceMatchRule.php    # BR-MATCH-LOW
├── EscalationCalculator.php     # Isolated escalation math
├── StatusRollup.php             # Derive run/invoice status from issues
└── FindingBuilder.php           # Create audit_issues rows
```

---

## RuleInterface

Every rule implements this interface:

```php
namespace App\Services\Audit\Rules;

use App\Models\AuditRun;
use App\Models\Invoice;
use Illuminate\Support\Collection;

interface RuleInterface
{
    /**
     * Unique rule code (e.g., 'BR-101').
     */
    public function code(): string;

    /**
     * Which level this rule belongs to (1, 2, or 3).
     */
    public function level(): int;

    /**
     * Run the rule and return a collection of Finding DTOs.
     * Empty collection = rule passed.
     *
     * @param Invoice $invoice Fully loaded with items, matched PO/contract
     * @param AuditRun $run The current run being built
     * @param array $context ['contract' => ?Contract, 'purchaseOrder' => ?PurchaseOrder, 'orgSettings' => array]
     * @return Collection<Finding>
     */
    public function evaluate(Invoice $invoice, AuditRun $run, array $context): Collection;
}
```

---

## Finding DTO

```php
namespace App\Services\Audit;

final readonly class Finding
{
    public function __construct(
        public string $ruleCode,
        public string $severity,          // From audit_rules or default
        public ?int $invoiceItemId,
        public ?int $lineNumber,
        public ?string $expectedValue,
        public ?string $actualValue,
        public string $overchargeAmount,   // DECIMAL string, default '0.00'
        public ?string $sourceCitation,
        public ?string $aiExplanation,
    ) {}
}
```

---

## Escalation Math (CRITICAL — get this right)

**Simple escalation, NOT compound.**

```php
class EscalationCalculator
{
    /**
     * Calculate the maximum allowed rate after escalation.
     *
     * @param string $baseRate      DECIMAL string, e.g. '450.00'
     * @param string $capPct        DECIMAL string, e.g. '3.00' (means 3%)
     * @param string $effectiveDate Y-m-d
     * @param string $invoiceDate   Y-m-d
     * @return string               DECIMAL string, the max allowed rate
     */
    public function maxAllowedRate(
        string $baseRate,
        string $capPct,
        string $effectiveDate,
        string $invoiceDate,
    ): string {
        $days = Carbon::parse($effectiveDate)->diffInDays(Carbon::parse($invoiceDate));
        $years = intdiv((int) $days, 365);

        if ($years < 1) {
            return $baseRate;
        }

        // Simple: base × (1 + cap% × years / 100)
        // NOT compound: base × (1 + cap%)^years
        $multiplier = bcadd('1', bcmul(bcdiv($capPct, '100', 6), (string) $years, 6), 6);
        return bcmul($baseRate, $multiplier, 2);
    }
}
```

**Example:** base $450, cap 3%, year 0 → max $450.00. Year 1 → max $463.50. Year 2 → max $477.00.

**Compounding** is a future P1 feature controlled by `contracts.terms_json.compounding = true`. Default is simple. Do NOT implement compound unless the flag is set.

---

## Overcharge Calculation

```php
$overcharge = bcmul(
    bcsub($actualUnitPrice, $expectedUnitPrice, 2),
    $quantity,
    2
);
```

Where `expectedUnitPrice` = `maxAllowedRate()` from the escalation calculator (for BR-301/302) or `authorized_unit_price` from PO line (for BR-203).

---

## Status Rollup

After all rules have run:

```php
class StatusRollup
{
    public function rollup(Collection $findings): array
    {
        $totalOvercharge = $findings->reduce(
            fn (string $carry, Finding $f) => bcadd($carry, $f->overchargeAmount, 2),
            '0.00'
        );

        $hasCritical = $findings->contains(fn (Finding $f) => $f->severity === 'critical');
        $hasHigh = $findings->contains(fn (Finding $f) => $f->severity === 'high');
        $hasWarning = $findings->contains(fn (Finding $f) => $f->severity === 'warning');

        // Risk level
        $riskLevel = match (true) {
            $hasCritical, $hasHigh => 'high',
            $hasWarning => 'medium',
            default => 'low',
        };

        // Run status: blocking = critical or high
        $hasBlocking = $hasCritical || $hasHigh;
        $runStatus = match (true) {
            $hasBlocking => 'exception',
            $hasWarning => 'warning',
            default => 'passed',
        };

        // Invoice status follows run
        $invoiceStatus = match ($runStatus) {
            'exception' => InvoiceStatus::Exception,
            'warning', 'passed' => InvoiceStatus::Passed,
        };

        return [
            'run_status' => $runStatus,
            'risk_level' => $riskLevel,
            'total_potential_overcharge' => $totalOvercharge,
            'invoice_status' => $invoiceStatus,
        ];
    }
}
```

**Warning-only** → invoice `passed`, run `warning`. Warnings don't block payment.

---

## RunInvoiceAuditJob

```php
class RunInvoiceAuditJob implements ShouldQueue, ShouldBeUnique
{
    public function __construct(
        public readonly int $invoiceId,
        public readonly int $organizationId,
    ) {}

    public function uniqueId(): string
    {
        return (string) $this->invoiceId;
    }

    public function handle(AuditEngine $engine): void
    {
        // 1. Bind tenant context
        // 2. Flip previous is_current to 0
        // 3. Create new audit_run (status = running)
        // 4. Load invoice with items, matched PO, contract
        // 5. Run engine->audit($invoice, $run)
        // 6. Persist findings as audit_issues
        // 7. Rollup → update run status, risk, overcharge
        // 8. Update invoice status
    }

    public function failed(Throwable $e): void
    {
        // Set run status = failed
        // Invoice stays pending_audit
        // Log the error
    }
}
```

---

## Adding a New Rule

1. Create a class in the appropriate level directory implementing `RuleInterface`.
2. Add the `rule_code` to the `audit_rules` seeder (with default severity).
3. Register the rule in `AuditEngine::rules()` collection.
4. Add a test case in `tests/Feature/Audit/AuditRulesTest.php`.
5. Update the BR-code table in `AGENTS.md` section 7.
6. The rule MUST:
   - Return an empty collection if it passes
   - Compute `overcharge_amount` as a DECIMAL string (or `'0.00'` for non-monetary findings)
   - Include `source_citation` when contract rate is involved
   - Check `audit_rules.is_active` before evaluating
   - Respect `tolerance_amount` for math comparisons

---

## Emergency/Weekend Rate Logic (BR-303)

```
If invoice_item.rate_type = 'emergency':
    If contract has explicit emergency_rate for the matched rate:
        expected = emergency_rate
    Else if contract.emergency_multiplier:
        expected = base_rate × emergency_multiplier
    Else:
        Emit BR-303 as warning ("line classified emergency but no rate defined")
        Skip price comparison

Same pattern for 'weekend' with weekend_rate / weekend_holiday_multiplier.
```

---

## Debugging Findings

`audit_runs.findings_json` stores a debug dump of all rule evaluations. Shape:

```json
{
  "status": "exception",
  "risk_level": "high",
  "potential_overcharge": "700.00",
  "currency": "USD",
  "issues": [
    {
      "rule_code": "BR-301",
      "severity": "high",
      "line_number": 1,
      "expected_unit_rate": "450.00",
      "actual_unit_rate": "520.00",
      "quantity": "10.00",
      "potential_overcharge": "700.00",
      "source_citation": "MSA-APEX-2024 p.12 Section 4.2 (Schedule B)",
      "explanation": "Schedule B standard maintenance is 450.00/hr with 3% annual cap. 520.00 exceeds max allowed rate."
    }
  ]
}
```
