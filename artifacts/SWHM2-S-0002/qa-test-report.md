---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0002
capability brief: SWHM2-I-0002
branch: vortex/sprint/swhm2-s-0002-1d338e37
upstream: [artifacts/SWHM2-S-0002/SPRINT-PLAN.md]
---

# QA test report — SWHM2-S-0002

## Executive Summary
**Verdict: PASS.** Catalog browsing and search (SWHM2-I-0002) works on the integrated sprint branch. `npm ci`, `npm run build`, the project E2E suite (7 passed, 0 failed, 0 skipped), and the unit suite (54 passed) all succeeded. All 24 scenarios in the delta spec were checked against the unit/route tests, the catalog E2E spec and the locked catalog acceptance spec. No defects found.

## E2E Test Status
`npm run test:e2e -- --project=chromium`: `7 passed (12.6s)`, 0 failed, 0 skipped. Per-spec table in `artifacts/SWHM2-S-0002/integration-test-result.md`.

Locked acceptance suite (enforced only at release UAT, so warnings, not failures, and not fixed here):
- `npm run test:acceptance:e2e`: `17 failed`, `4 passed`. Passing: `catalog-browsing` (SWHM2-C-0018) and 3 `site-shell` specs. Failing specs belong to other capabilities not built in this sprint (admin-order-management, customer-accounts, order-approval, order-fulfilment, shopping-cart, checkout and others).
- `npm run test:acceptance` (Jest): 9 of 11 suites failed (customer-accounts, order-fulfilment, batch-operations, checkout-and-payment, order-notifications, internationalisation, admin-order-management, order-approval, shopping-cart). 21 tests passed; the failing suites are other capabilities. `catalog-browsing` and `site-shell` pass.

## Unit Test Results
```
$ npm test -- --coverage
Test Suites: 17 passed, 17 total
Tests:       54 passed, 54 total
```

## Code Review
No notable concerns observed. Store failures are wrapped in `CatalogSystemError`, LIKE input is escaped, and `POST /api/catalog/populate` is idempotent (second call in the run returned the same counts: 5 categories, 16 products, 26 items).

Design fidelity (advisory; method: Playwright screenshots of each mockup and the built route at 1440 and 390 in `artifacts/SWHM2-S-0002/qa/design/`; I viewed the category-list pair directly and relied on the code and on `SWHM2-T-0007/design-check.md` for the others):
DESIGN-VERDICT: SWHM2-MCK-17 match — category cards, breadcrumb, title, search bar and pager match; shell chrome differs
- RESIDUAL: SWHM2-MCK-17 shell sidebar and top bar — mockup: Pet Store logo, Inventory/Orders items, English dropdown; built: shared shell from the bootstrap sprint with its own labels and language buttons
DESIGN-VERDICT: SWHM2-MCK-19 differs — products table has no Description column (not in the products read contract)
- RESIDUAL: SWHM2-MCK-19 Description column — mockup: shown; built: omitted
DESIGN-VERDICT: SWHM2-MCK-21 differs — item order and Add to cart not built (cart is a later capability)
- RESIDUAL: SWHM2-MCK-21 Add to cart action — mockup: shown; built: not present
DESIGN-VERDICT: SWHM2-MCK-23 match — item detail shows image, description, attributes, list price and unit cost
- RESIDUAL: none
DESIGN-VERDICT: SWHM2-MCK-25 differs — results omit the Description column
- RESIDUAL: SWHM2-MCK-25 Description column — mockup: shown; built: omitted
Mobile mockups (MCK-18, 20, 22, 24, 26) share the desktop findings; stacking at 390px was checked by screenshot capture only.

## Coverage Summary
`npm test -- --coverage` (Jest): All files 92.88% statements, 72.79% branches, 89.6% functions, 92.84% lines. No baseline from before the sprint was measured, so no regression claim is made. Mutation testing was not run.

## Issues Found
None. No entry in `integration-defects-resolution.md`; no DEFECT tickets filed. Warnings only: the locked acceptance failures listed under E2E Test Status (other capabilities, triaged at UAT) and the design residuals above.

Scenario verdicts (evidence: `src/**` unit and route tests in the 54-test run, `e2e/catalog.spec.ts` [SWHM2-C-0018], and the locked catalog-browsing acceptance specs which pass):
SCENARIO-VERDICT: Catalog entity hierarchy and categories / Catalog entity hierarchy and categories — pass
SCENARIO-VERDICT: Item identity / Item identity — pass
SCENARIO-VERDICT: Product identity and category / Product identity and category — pass
SCENARIO-VERDICT: Product localised details / Product localised details — pass
SCENARIO-VERDICT: Item localised details / Item localised details — pass
SCENARIO-VERDICT: Product category index / Product category index — pass
SCENARIO-VERDICT: Item product index / Item product index — pass
SCENARIO-VERDICT: Database dialect selection / Database dialect selection — pass
SCENARIO-VERDICT: Storefront screens and populate tool / Storefront screens and populate tool — pass
SCENARIO-VERDICT: Item localised record completeness / Item localised record completeness — pass
SCENARIO-VERDICT: Item exposure / Item exposure — pass
SCENARIO-VERDICT: Out-of-range paging / Out-of-range paging — pass
SCENARIO-VERDICT: Data store failure / Data store failure — pass
SCENARIO-VERDICT: Category listing / Category listing — pass
SCENARIO-VERDICT: Product listing / Product listing — pass
SCENARIO-VERDICT: Item listing / Item listing — pass
SCENARIO-VERDICT: Single entry lookup / Single entry lookup — pass
SCENARIO-VERDICT: Keyword search / Keyword search — pass
SCENARIO-VERDICT: Blank search / Blank search — pass
SCENARIO-VERDICT: Locale-aware keyword splitting / Locale-aware keyword splitting — pass

## Recommendation
Proceed: fire `validation.all_acs_passed`. No defects found, none escalated.
