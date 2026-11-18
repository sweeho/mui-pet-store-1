---
ticket: SWHM2-T-0020
sprint: SWHM2-S-0004
---
# Integration test result

Command: `npm ci && npm run build && npx playwright test --project=chromium`
Summary: `17 passed (14.2s)`

| Spec | Result |
| --- | --- |
| e2e/accounts-flow.spec.ts, accounts.spec.ts | pass |
| e2e/cart.spec.ts (3 tests) | pass |
| e2e/catalog.spec.ts | pass |
| e2e/home.spec.ts | pass |
| e2e/smoke.spec.ts | pass |

No spec file was wholly skipped; 0 failed, 0 skipped. Per-file counts were not itemised from the
output beyond the 17-test total.

E2E-RESULT: chromium 17 passed, 0 failed, 0 skipped
