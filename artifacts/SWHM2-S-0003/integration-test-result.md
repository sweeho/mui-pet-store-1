---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0003
capability brief: SWHM2-I-0003
branch: vortex/sprint/swhm2-s-0003-472ab98e
---

# Integration test result — SWHM2-S-0003

Command (after `npm ci` and `npm run build`, both exit 0): `npm run test:e2e` (`playwright test`, project chromium; `npx playwright test --list` shows 14 tests in 5 files, all under chromium).

Summary line: `14 passed (11.9s)`

| Spec | Result |
| --- | --- |
| e2e/accounts-flow.spec.ts (create account, sign on, /account, sign off; duplicate user ID) | 2 passed |
| e2e/accounts.spec.ts (C-0134 to C-0137, C-0140) | 5 passed |
| e2e/catalog.spec.ts | 1 passed |
| e2e/home.spec.ts | 3 passed |
| e2e/smoke.spec.ts | 3 passed |

No spec file ran zero tests; 0 skipped.

## Locked acceptance suite (warning only: enforced at release UAT)

`npm run test:acceptance`: 8 suites failed, 3 passed (62 tests passed, 0 failed at test level; the failing suites did not load, since their modules are not built yet; they are in order-fulfilment, batch-operations, checkout-and-payment, order-notifications, internationalisation, admin-order-management, order-approval, shopping-cart). customer-accounts passed.
`npm run test:acceptance:e2e`: `12 failed`, `9 passed` (failures in order-approval, order-fulfilment, shopping-cart and admin-order-management specs; customer-accounts specs not among them). Not fixed; triaged at UAT.

E2E-RESULT: chromium 14 passed, 0 failed, 0 skipped
