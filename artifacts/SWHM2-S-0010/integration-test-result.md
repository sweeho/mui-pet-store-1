---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0010
capability brief: SWHM2-I-0009
branch: vortex/sprint/swhm2-s-0010-28ca48f8
downstream: [artifacts/SWHM2-S-0010/qa-test-report.md]
---

# Integration test result — SWHM2-S-0010

## Commands run

`npm ci` → `npm run build` (exit 0) → `npx playwright test --list` (25 tests, 10 files, project chromium only) → `npm run test:e2e -- --project=chromium`

Summary line: `25 passed (29.3s)`

## Results

| Spec | Result | Notes |
| --- | --- | --- |
| accounts-flow.spec.ts | 2 passed | |
| accounts.spec.ts | 5 passed | |
| admin.spec.ts | 4 passed | C-0234, C-0242, C-0233, C-0232 |
| approval.spec.ts | 2 passed | |
| cart.spec.ts | 3 passed | |
| catalog.spec.ts | 1 passed | |
| checkout.spec.ts | 1 passed | |
| home.spec.ts | 3 passed | |
| inventory.spec.ts | 1 passed | |
| smoke.spec.ts | 3 passed | |

No spec file skipped any test; 0 skipped.

## Locked acceptance suite (warning only: enforced at release UAT)

- `npm run test:acceptance:e2e`: 19 passed, 2 failed. Failed: C-0179 (inventory rows, `order-fulfilment.spec.ts:36`) and C-0226 (`site-shell.spec.ts:32`, `page.goto /admin` net::ERR_ABORTED). Both failed again when re-run alone (`site-shell order-fulfilment`: 4 passed, 2 failed). Not fixed, per the UAT-only rule.
- `npm run test:acceptance` (jest): 3 suites failed, 188 tests passed, 2 failed. Two suites cannot load (`src/batch/jobs`, `src/i18n/format` missing: later capabilities). C-0240 and C-0243 fail in `harness.ts:86 insertItem` (harness uses catalog columns absent from the real schema; dispute already filed by SWHM2-T-0050, finding 4f3e50f9).

E2E-RESULT: chromium 25 passed, 0 failed, 0 skipped
