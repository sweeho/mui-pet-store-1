---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0006
capability brief: SWHM2-I-0006
branch: vortex/sprint/swhm2-s-0006-d274d678
upstream: [artifacts/SWHM2-S-0006/SPRINT-PLAN.md]
downstream: [artifacts/SWHM2-S-0006/qa-test-report.md]
---

# Integration test result — SWHM2-S-0006

## Commands run

```
$ npm ci && npm run build            # exit 0
$ npm run test:e2e -- --project=chromium --reporter=list
```

The only Playwright project is `chromium`, which covers every spec under `e2e/`.

## Results

| Spec | Result | Notes |
| --- | --- | --- |
| e2e/accounts-flow.spec.ts | pass | 2 tests |
| e2e/accounts.spec.ts | pass | 5 tests |
| e2e/approval.spec.ts | pass | approve one order and Commit; session required |
| e2e/cart.spec.ts | pass | 3 tests |
| e2e/catalog.spec.ts | pass | 1 test |
| e2e/checkout.spec.ts | pass | 1 test |
| e2e/home.spec.ts | pass | 3 tests |
| e2e/smoke.spec.ts | pass | 3 tests |

Playwright summary: `20 passed (18.8s)`

No spec file was skipped. Locked acceptance E2E (`npm run test:acceptance:e2e`, warning only): `6 failed, 15 passed`, failures in admin-order-management and order-fulfilment specs of later capabilities (see qa-test-report.md).

E2E-RESULT: chromium 20 passed, 0 failed, 0 skipped
