---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0002
capability brief: SWHM2-I-0002
branch: vortex/sprint/swhm2-s-0002-1d338e37
downstream: [artifacts/SWHM2-S-0002/qa-test-report.md]
---

# Integration test result — SWHM2-S-0002

## Commands run
```
npm ci && npm run build
npm run test:e2e -- --project=chromium --reporter=list
```
Summary line: `7 passed (12.6s)`. `playwright.config.ts` defines only the `chromium` project.

## Results
| Spec | Result | Notes |
| --- | --- | --- |
| e2e/home.spec.ts › welcome title and a tile for every primary area | pass | |
| e2e/home.spec.ts › navigation opens from the menu button on a small screen | pass | |
| e2e/home.spec.ts › placeholder area shows the shared empty frame | pass | |
| e2e/smoke.spec.ts › home page loads with no console errors | pass | |
| e2e/smoke.spec.ts › the API responds | pass | |
| e2e/smoke.spec.ts › a database-backed route responds | pass | |
| e2e/catalog.spec.ts › [SWHM2-C-0018] browse from categories to an item, then search | pass | |

No spec file was skipped.

E2E-RESULT: chromium 7 passed, 0 failed, 0 skipped
