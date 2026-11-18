---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0005
capability brief: SWHM2-I-0005
branch: vortex/sprint/swhm2-s-0005-67d6dbe5
upstream: [artifacts/SWHM2-S-0005/SWHM2-T-0023/summary.md]
---

# Integration test result — SWHM2-S-0005

Command: `npm ci && npm run build && npm run test:e2e -- --project=chromium` on the integrated sprint branch.

Run summary (verbatim): `18 passed (17.1s)`

| Spec | Result |
| --- | --- |
| e2e/accounts-flow.spec.ts (2 tests) | 2 passed |
| e2e/accounts.spec.ts (5 tests) | 5 passed |
| e2e/cart.spec.ts (3 tests) | 3 passed |
| e2e/catalog.spec.ts (1 test) | 1 passed |
| e2e/checkout.spec.ts (1 test) | 1 passed |
| e2e/home.spec.ts (3 tests) | 3 passed |
| e2e/smoke.spec.ts (3 tests) | 3 passed |

No spec file was skipped. Failures: none. The locked acceptance E2E (`npm run test:acceptance:e2e`: 10 failed, 11 passed) is reported as warnings in `qa-test-report.md`; its failing specs belong to later capabilities.

E2E-RESULT: chromium 18 passed, 0 failed, 0 skipped
