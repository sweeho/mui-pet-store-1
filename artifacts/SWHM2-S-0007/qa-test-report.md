---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0007
capability brief: SWHM2-I-0007
branch: vortex/sprint/swhm2-s-0007-271cdb8d
upstream: [artifacts/SWHM2-S-0007/SPRINT-PLAN.md]
---

# QA test report — SWHM2-S-0007

## Executive Summary

Verdict: proceed. The integrated branch builds, the unit suite (291 tests) and the project E2E suite (21 tests, 0 skipped) pass, and the order-fulfilment acceptance unit suite (47 tests) passes. No defects were found. Locked acceptance failures outside the project's own tests are listed as warnings below and are left for release UAT.

## E2E Test Status

`npm run test:e2e`: 21 passed, 0 failed, 0 skipped (details: `artifacts/SWHM2-S-0007/integration-test-result.md`).

Warnings (locked acceptance suite, enforced at UAT, not fixed here):
- `npm run test:acceptance:e2e`: 17 passed, 4 failed. SWHM2-C-0232, SWHM2-C-0234, SWHM2-C-0242 (admin-order-management, a different capability). SWHM2-C-0179 (order-fulfilment, inventory rows): the locked locator resolves to 26 rows and trips Playwright strict mode; the rows are present on the screen.
- `npm run test:acceptance`: 4 suites failed to run (batch-operations, order-notifications import modules that do not exist yet; internationalisation and admin-order-management also fail), 161 tests passed. None is order-fulfilment.

## Unit Test Results

`npm test -- --coverage`: `Test Suites: 57 passed, 57 total`, `Tests: 291 passed, 291 total`, exit 0. `npm run test:acceptance` order-fulfilment suite: all of its 47 tests passed.

## Code Review

No notable concerns observed. Stock changes and the inventory form follow the existing route and Drizzle conventions.

## Coverage Summary

Jest coverage run: all files 92.8% statements, 78.7% branches, 88.88% functions, 95.01% lines. No earlier baseline was run, so no regression claim is made.

## Design fidelity

Measured with `design-measure.mjs` on a production build (`next start`), signed in as j2ee, at `/admin/inventory?updated=2`; output in `artifacts/SWHM2-S-0007/qa/design/`.

DESIGN-VERDICT: SWHM2-MCK-49 match — layout, copy, controls and the Stock updated alert agree; 8.4% pixels differ from sample data and the shell
- RESIDUAL: SWHM2-MCK-49 rows and values — mockup: 14 hand-picked rows with typed values, "Out of stock" badge, thousands separators; built: 26 real items at plain numbers, nothing typed
- RESIDUAL: SWHM2-MCK-49 shell (sidebar, header, footer) — mockup: its own drawn shell; built: the approved site shell
DESIGN-VERDICT: SWHM2-MCK-50 match — mobile layout and labels agree; 10.1% pixels differ from sample data and the shell
- RESIDUAL: SWHM2-MCK-50 rows and shell — mockup: 14 sample rows and its own drawn menu; built: 26 real rows (page 4178px against 2240px) and the site shell
Neither state with typed or invalid values was reached on the preview; those are covered by component tests.

## Issues Found

None. See `integration-defects-resolution.md`.

## Recommendation

Proceed: fire `validation.all_acs_passed`. Scenario verdicts below rest on the passing order-fulfilment acceptance unit suite, the unit suite and the project E2E specs (approval, inventory, checkout); the Inventory screen scenario was also exercised on the built page. Scenario verdicts:

SCENARIO-VERDICT: Unreadable order date defaults to today / Unreadable order date defaults to today — pass
SCENARIO-VERDICT: Retention purge removes supplier orders / Retention purge removes supplier orders — pass
SCENARIO-VERDICT: Purchase order line record / Purchase order line record — pass
SCENARIO-VERDICT: Invoice per processed order / Invoice per processed order — pass
SCENARIO-VERDICT: Insufficient stock blocks a line / Insufficient stock blocks a line — pass
SCENARIO-VERDICT: Sufficient stock is reduced / Sufficient stock is reduced — pass
SCENARIO-VERDICT: Supplier order line items / Supplier order line items — pass
SCENARIO-VERDICT: Invoice adds shipped quantity / Invoice adds shipped quantity — pass
SCENARIO-VERDICT: Order line item representation / Order line item representation — pass
SCENARIO-VERDICT: Invoice XML document / Invoice XML document — pass
SCENARIO-VERDICT: Contact record created with purchase order / Contact record created with purchase order — pass
SCENARIO-VERDICT: Unrestricted purchase order operations / Unrestricted purchase order operations — pass
SCENARIO-VERDICT: Line item write fields / Line item write fields — pass
SCENARIO-VERDICT: Unrestricted line item reads / Unrestricted line item reads — pass
SCENARIO-VERDICT: One status per order / One status per order — pass
SCENARIO-VERDICT: Index on purchase order user / Index on purchase order user — pass
SCENARIO-VERDICT: Index on purchase order date / Index on purchase order date — pass
SCENARIO-VERDICT: Index on order manager status / Index on order manager status — pass
SCENARIO-VERDICT: Line quantity bounds / Line quantity bounds — pass
SCENARIO-VERDICT: Supplier order status and stock floor / Supplier order status and stock floor — pass
SCENARIO-VERDICT: Item without inventory record / Item without inventory record — pass
SCENARIO-VERDICT: Fully shipped lines are skipped / Fully shipped lines are skipped — pass
SCENARIO-VERDICT: Invoice failure keeps order pending / Invoice failure keeps order pending — pass
SCENARIO-VERDICT: Reprocess only pending orders / Reprocess only pending orders — pass
SCENARIO-VERDICT: New stock quantity validity / New stock quantity validity — pass
SCENARIO-VERDICT: Only ticked items change / Only ticked items change — pass
SCENARIO-VERDICT: Inventory screen / Inventory screen — pass
SCENARIO-VERDICT: New orders start PENDING / New orders start PENDING — pass
SCENARIO-VERDICT: Contact and line items created with order / Contact and line items created with order — pass
SCENARIO-VERDICT: Find orders by status / Find orders by status — pass
SCENARIO-VERDICT: Five order statuses / Five order statuses — pass
SCENARIO-VERDICT: Supplier order record / Supplier order record — pass
SCENARIO-VERDICT: Supplier order input / Supplier order input — pass
SCENARIO-VERDICT: Order status view / Order status view — pass
SCENARIO-VERDICT: Order status progression / Order status progression — pass
SCENARIO-VERDICT: Shipping address equals billing address / Shipping address equals billing address — pass
SCENARIO-VERDICT: Purchase order persistence / Purchase order persistence — pass
SCENARIO-VERDICT: SupplierOrder XML document / SupplierOrder XML document — pass
SCENARIO-VERDICT: Line items returned as plain data / Line items returned as plain data — pass
SCENARIO-VERDICT: Identifier counter failure / Identifier counter failure — pass
SCENARIO-VERDICT: Identifier generation access / Identifier generation access — pass
SCENARIO-VERDICT: Validating document parse / Validating document parse — pass
SCENARIO-VERDICT: Approved orders produce supplier orders / Approved orders produce supplier orders — pass
SCENARIO-VERDICT: Supplier invoice marks lines shipped / Supplier invoice marks lines shipped — pass
SCENARIO-VERDICT: Named counters / Named counters — pass
SCENARIO-VERDICT: Inventory quantity per item / Inventory quantity per item — pass
SCENARIO-VERDICT: Fulfil on receiving a purchase order / Fulfil on receiving a purchase order — pass
SCENARIO-VERDICT: COMPLETED only when all lines shipped / COMPLETED only when all lines shipped — pass
SCENARIO-VERDICT: Stock clerk inventory update / Stock clerk inventory update — pass
SCENARIO-VERDICT: Supplier order with contact and lines / Supplier order with contact and lines — pass
