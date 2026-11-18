---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0009
ticket: SWHM2-T-0045
capability brief: swhm2-s-0009-bugfix-improvement-swhm2-t
branch: vortex/sprint/swhm2-s-0009-6b270918
upstream: [artifacts/SWHM2-S-0009/SPRINT-PLAN.md]
downstream: [artifacts/SWHM2-S-0009/qa-test-report.md]
---

# QA test report — SWHM2-S-0009

## Executive Summary

All three sprint scenarios groups (SWHM2-R-0147 populate guard, SWHM2-R-0198 breadcrumb trail, i18n reconciliation T-0008) were verified on the integrated sprint branch. Build, unit suite (326 passed) and the project e2e (20 of 21 passed) ran. One project e2e test, `catalog.spec.ts` "browse from categories", failed once and passed twice on re-run: a flake, filed as future-sprint DEFECT SWHM2-T-0047. The sprint's own behaviour showed no defect. Verdict: escalate for the filed flake (non-blocking in nature; a human decides).

## E2E Test Status

Command `npm run test:e2e -- --project=chromium`: `1 failed`, `20 passed (52.6s)`, 0 skipped. Per-spec table and failure detail: `artifacts/SWHM2-S-0009/integration-test-result.md`.

Locked acceptance suite (enforced only at UAT, so warnings, not fixed):
- WARNING `npm run test:acceptance`: 3 suites failed to run (batch-operations, internationalisation, admin-order-management); 179 tests passed. Internationalisation is expected: it needs `src/i18n/` (SWHM2-T-0008 notes).
- WARNING `npm run test:acceptance:e2e`: 5 failed, 16 passed: SWHM2-C-0232, C-0234, C-0242 (admin-order-management), C-0179 (order-fulfilment), C-0226 (site-shell).

Browser check by a throwaway Playwright spec on the dev server (not committed): `/catalog/items/EST-1` and `/catalog/search?q=angel` each show one "Catalog path" navigation and zero "Breadcrumb" navigations; `/catalog` shows no shell trail. `/checkout/orders/1` and `/admin/orders` redirected before a trail could be read, so scenarios .03 and .04 rest on `src/shell/Breadcrumbs.test.tsx` (jsdom) only. Production build (`NODE_ENV=production next start`): `POST /api/catalog/populate` without a session returned `401 {"error":"administrator sign-in required"}`.

SCENARIO-VERDICT: Storefront screens and populate tool / Storefront screens and populate tool — pass
SCENARIO-VERDICT: Storefront screens and populate tool / An anonymous caller is refused in production — pass
SCENARIO-VERDICT: Storefront screens and populate tool / An administrator loads the sample data in production — pass (unit test C-0246 only; no admin login driven in browser)
SCENARIO-VERDICT: Storefront screens and populate tool / Any caller loads the sample data outside production — pass
SCENARIO-VERDICT: Storefront screens and populate tool / The empty catalog does not advertise the endpoint — pass (source inspection of CategoryListView.tsx; catalog was populated so the empty frame was not rendered in browser)
SCENARIO-VERDICT: Shell breadcrumb trail / A catalog detail page shows one trail — pass
SCENARIO-VERDICT: Shell breadcrumb trail / Catalog search shows one trail — pass
SCENARIO-VERDICT: Shell breadcrumb trail / A path segment with no page is not a link — pass (unit test only; route redirected in browser)
SCENARIO-VERDICT: Shell breadcrumb trail / Other multi-level pages keep their shell trail — pass (unit test only; route redirected in browser)

### Regression guards

- SWHM2-C-0252 (admin trail keeps link to /admin): working; Breadcrumbs.test.tsx passes in the 326-test run.
- SWHM2-C-0246 (administrator loads in production) and SWHM2-C-0247 (anonymous loads outside production): working; both pass in route.test.ts, and the locked-style e2e populate call succeeds against `next dev` (20 e2e passed incl. cart/checkout that populate).

### Uncovered at level

SWHM2-C-0249, C-0250, C-0251, C-0252: no browser test cites them. C-0249 and C-0250 (one trail on detail and search) were exercised in a browser by the throwaway spec above: pass. C-0251 and C-0252 are listed here as uncovered at e2e level: only unit tests cover them (routes redirected in my browser check).

## Unit Test Results

`npm test`: `Test Suites: 65 passed, 65 total`, `Tests: 326 passed, 326 total`, exit 0.

## Code Review

No notable concerns. `Breadcrumbs.tsx` keeps a hard-coded `KNOWN_PAGE_ROUTES` list, guarded by a unit test that checks the paths exist on disk. The populate guard checks `NODE_ENV` at request time. Design fidelity: no design reference on this capability brief (no mockups in this bugfix sprint).

## Coverage Summary

`npx jest --coverage` scoped to the changed files: `Breadcrumbs.tsx` 100% stmts / 93.75% branch; `populate/route.ts` 90% stmts / 66.67% branch (uncovered line 16, the 500 error path). No whole-repo coverage run, no baseline to compare for regression.

## Issues Found

DEFECT-1 (minor): flaky `catalog.spec.ts` browse e2e, passed 2 of 2 on re-run; future-sprint DEFECT SWHM2-T-0047. See `integration-defects-resolution.md`. No SPEC-GAP found.

## Recommendation

Escalate with `validation.unfixable_defects_found`: one future-sprint DEFECT (SWHM2-T-0047, flaky unrelated e2e) filed. Every sprint scenario passed and no sprint-introduced regression was seen; a human may conditionally approve.
