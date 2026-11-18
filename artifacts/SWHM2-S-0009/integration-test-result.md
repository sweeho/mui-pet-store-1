---
artifact: integration-test-result
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

# Integration test result — SWHM2-S-0009

## Commands run

```
npm ci && npm run build            # exit 0
npm run test:e2e -- --project=chromium
npx playwright test e2e/catalog.spec.ts --project=chromium   # re-run x2 of the one failing spec
```

Playwright summary (full run): `1 failed` / `20 passed (52.6s)`, 21 tests in 9 files, 0 skipped.

## Results

| Spec | Result | Notes |
| --- | --- | --- |
| e2e/accounts-flow.spec.ts | pass | |
| e2e/accounts.spec.ts | pass | |
| e2e/approval.spec.ts | pass | |
| e2e/cart.spec.ts | pass | |
| e2e/catalog.spec.ts | FAIL once, pass 2/2 on re-run | flaky, see Failures |
| e2e/checkout.spec.ts | pass | |
| e2e/home.spec.ts | pass | |
| e2e/inventory.spec.ts | pass | |
| e2e/smoke.spec.ts | pass | |

No spec file ran none of its tests; skipped count is 0.

## Failures

`e2e/catalog.spec.ts:4` `[SWHM2-C-0018] browse from categories to an item, then search`: after clicking the "Fish" link on `/catalog`, `toHaveURL(/\/catalog\/categories\//)` timed out at 5000ms with the URL still `http://localhost:3100/catalog`. Trace: `test-results/catalog-Catalog-SWHM2-C-00-159f8-ries-to-an-item-then-search-chromium/trace.zip`.

Re-run of that spec alone: pass (13.9s), pass (8.3s). Disagreement across runs means flaky; recorded and filed as future-sprint DEFECT SWHM2-T-0047 rather than re-run further.

E2E-RESULT: chromium 20 passed, 1 failed, 0 skipped
