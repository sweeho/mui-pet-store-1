---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0008
capability_brief: SWHM2-I-0008
branch: vortex/test/SWHM2-T-0039-integration-qa-report-swhm2-s-0008-19eff237
---

# Integration test result

Command (on the merged sprint branch, after `npm ci` and `npm run build`, both exit 0):
`npm run test:e2e -- --project=chromium` (exit 0). Full output: /tmp/e2e.log (not committed).

Playwright summary line: `21 passed (20.4s)` (no skipped, no failed; no spec file ran zero tests).

| Spec | Tests | Result |
| --- | --- | --- |
| e2e/accounts-flow.spec.ts | 2 | pass |
| e2e/accounts.spec.ts | 5 | pass |
| e2e/approval.spec.ts | 2 | pass |
| e2e/cart.spec.ts | 3 | pass |
| e2e/catalog.spec.ts | 1 | pass |
| e2e/checkout.spec.ts | 1 | pass |
| e2e/home.spec.ts | 3 | pass |
| e2e/inventory.spec.ts | 1 | pass |
| e2e/smoke.spec.ts | 3 | pass |

This sprint has no screens (design: Notifications opens the shared empty frame), so no notification-specific browser spec exists; the checkout spec exercises order placement, which now hands off to the notification flow, and passes.

E2E-RESULT: chromium 21 passed, 0 failed, 0 skipped
