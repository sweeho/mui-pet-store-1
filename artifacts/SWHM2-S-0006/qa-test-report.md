---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0006
capability brief: SWHM2-I-0006
branch: vortex/sprint/swhm2-s-0006-d274d678
upstream: [artifacts/SWHM2-S-0006/SPRINT-PLAN.md]
---

# QA test report — SWHM2-S-0006

## Executive Summary

**Verdict: PASS.** SWHM2-I-0006 (Order approval) holds on the integrated sprint branch: build succeeds, 232 unit tests pass, the project E2E suite passes 20 of 20, and the order-approval acceptance suites pass (13 Jest, 3 Playwright). No defects found. Locked acceptance failures in other capabilities are listed as warnings below, per the UAT-only enforcement setting.

## E2E Test Status

Project E2E: `npm run test:e2e -- --project=chromium` gave `20 passed (18.8s)`, 0 failed, 0 skipped, including `e2e/approval.spec.ts` (2 tests). Full table: `artifacts/SWHM2-S-0006/integration-test-result.md`.

Warnings (locked acceptance, not fixed, triaged at UAT). `npm run test:acceptance`: 5 suites fail to run because modules of later capabilities do not exist yet (`src/admin/launch`, `src/batch/jobs`, `src/fulfilment/orders`, `src/i18n/format`, `src/notifications/sender`); 114 tests passed. `npm run test:acceptance:e2e`: `6 failed, 15 passed`; the failures are SWHM2-C-0232, C-0234, C-0242 (admin-order-management) and C-0179, C-0195, C-0211 (order-fulfilment). The order-approval acceptance suites pass: Jest 13 passed; Playwright `3 passed (5.1s)` (C-0027, C-0028, C-0029).

## Unit Test Results

```
$ npm test -- --coverage
Test Suites: 48 passed, 48 total
Tests:       232 passed, 232 total
```

```
$ npx jest -c jest.acceptance.config.mjs tests/acceptance/order-approval
Tests:       13 passed, 13 total
```

SCENARIO-VERDICT: Automatic approval limits / US order under the limit — pass
SCENARIO-VERDICT: Automatic approval limits / US order at the limit — pass
SCENARIO-VERDICT: Other locales are not auto-approved / Unsupported locale — pass
SCENARIO-VERDICT: Orders held for an administrator / Japan order at the limit — pass
SCENARIO-VERDICT: Receive purchase order workflow / Qualifying order — pass
SCENARIO-VERDICT: Receive purchase order workflow / Non-qualifying order — pass
SCENARIO-VERDICT: Automatic decision follows the approval queue / Auto decision queued — pass
SCENARIO-VERDICT: Approval message processing / Approved order — pass
SCENARIO-VERDICT: Approval message processing / Denied order — pass
SCENARIO-VERDICT: Status update and customer notification / Changed order notified — pass
SCENARIO-VERDICT: Ignore non-PENDING orders in messages / Already approved order — pass
SCENARIO-VERDICT: Ignore non-PENDING status changes / Completed order — pass
SCENARIO-VERDICT: Order status values / Valid status — pass
SCENARIO-VERDICT: Administrator commit workflow / Bulk commit — pass
SCENARIO-VERDICT: Only PENDING orders are changeable / Non-pending order — pass
SCENARIO-VERDICT: Only PENDING orders are changeable / Changes held until Commit — pass

Basis for the verdicts: the passing runs above (unit, order-approval acceptance, `e2e/approval.spec.ts`), which T-0029's `tdd-test-result.md` maps to cases C-0021 to C-0036. I did not re-derive a per-scenario mapping beyond that; the Commit, Denied-held and non-PENDING UI scenarios are covered by acceptance specs C-0027, C-0028, C-0029.

## Code Review

No notable concerns observed. T-0029's summary records its own review fixes (conditional claim of PENDING orders in the handler).

### Design fidelity

Reference: `artifacts/SWHM2-S-0006/design/` (4 approved mockups). Method: `next start` on a fresh database, signed in, three rows chosen (and Commit pressed for the after-Commit states), measured with `design-measure.mjs`; output in `artifacts/SWHM2-S-0006/qa/design/`. The design-conformance decision is disabled for this project (tool answered `disabled: true`).

DESIGN-VERDICT: SWHM2-MCK-45 differs — 1440 uncommitted state; page controls, copy, colours and fonts match, shell and sample data differ
- RESIDUAL: SWHM2-MCK-45 app shell — mockup: admin shell with left navigation; built: the site shell (the approved shell decides)
- RESIDUAL: SWHM2-MCK-45 status tabs — mockup: Pending tab by default; built: All tab by default (acceptance suite expects an APPROVED row without interaction)
- RESIDUAL: SWHM2-MCK-45 table rows — mockup: 8 sample orders; built: 4 PENDING and 1 APPROVED demo orders

DESIGN-VERDICT: SWHM2-MCK-46 differs — 1440 after Commit (9.3% pixels differ, 137 differences); shell, All tab and sample data
- RESIDUAL: SWHM2-MCK-46 app shell and tabs — as MCK-45
- RESIDUAL: SWHM2-MCK-46 committed rows — mockup: dropped from the Pending tab; built: stay in the All list as APPROVED/DENIED without controls

DESIGN-VERDICT: SWHM2-MCK-47 differs — 390 uncommitted state (24.6% pixels differ); site shell and fewer rows (page 1035px vs 1736px)
- RESIDUAL: SWHM2-MCK-47 mobile header — mockup: admin mobile header; built: site shell menu button, brand and icons
- RESIDUAL: SWHM2-MCK-47 table rows — mockup: 8 rows; built: 5 rows

DESIGN-VERDICT: SWHM2-MCK-48 differs — 390 after Commit (16.5% pixels differ); site shell and sample data (1143px vs 1269px)
- RESIDUAL: SWHM2-MCK-48 mobile header and rows — as MCK-47

The shell differences were already accepted in T-0029's `design-check.md`; the shell is shared and the approved shell decides, so I did not change it. Not reached: none of the four states. Design differences do not affect the verdict.

## Coverage Summary

`npm test -- --coverage` (Jest, whole repo): All files 93.19% statements, 80.05% branches, 87.23% functions, 94.68% lines. No baseline from before the sprint was measured, so regression is Pending Verification. Mutation testing (`npx stryker run`) was not run.

## Issues Found

None. No defects were filed and no fix rounds were needed; see `artifacts/SWHM2-S-0006/integration-defects-resolution.md`. No SPEC-GAP found.

## Recommendation

Proceed: fire `validation.all_acs_passed`. The acceptance warnings above belong to later capabilities and are triaged at UAT.
