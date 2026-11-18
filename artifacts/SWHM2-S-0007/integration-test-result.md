---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0007
capability brief: SWHM2-I-0007
branch: vortex/sprint/swhm2-s-0007-271cdb8d
upstream: [artifacts/SWHM2-S-0007/SWHM2-T-0033/summary.md]
downstream: [artifacts/SWHM2-S-0007/qa-test-report.md]
---

# Integration test result — SWHM2-S-0007

Command (after `npm ci` and `npm run build`, both exit 0): `npm run test:e2e` (`playwright test`, project chromium, 21 tests in 9 files; `--list` confirmed all specs are selected).

Summary line: `21 passed (20.1s)`

| Spec | Result |
| --- | --- |
| e2e/accounts.spec.ts (5 tests) | pass |
| e2e/accounts-flow.spec.ts (2) | pass |
| e2e/approval.spec.ts (2) | pass |
| e2e/cart.spec.ts (3) | pass |
| e2e/catalog.spec.ts (1) | pass |
| e2e/checkout.spec.ts (1) | pass |
| e2e/home.spec.ts (3) | pass |
| e2e/inventory.spec.ts (1) | pass |
| e2e/smoke.spec.ts (3) | pass |

No test skipped; no spec file ran zero tests.

Locked acceptance E2E (`npm run test:acceptance:e2e`): 17 passed, 4 failed. Warnings only (acceptance is enforced at release UAT): SWHM2-C-0232, C-0234, C-0242 (admin-order-management, another capability) and SWHM2-C-0179 (order-fulfilment: the locked test's locator `tr` filtered by `input[name^="qty_"]` resolves to 26 rows and violates Playwright strict mode; the screen has the rows).

E2E-RESULT: chromium 21 passed, 0 failed, 0 skipped
