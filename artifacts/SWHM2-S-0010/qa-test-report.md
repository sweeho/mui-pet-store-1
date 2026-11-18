---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0010
capability brief: SWHM2-I-0009
branch: vortex/sprint/swhm2-s-0010-28ca48f8
upstream: [artifacts/SWHM2-S-0010/SPRINT-PLAN.md]
downstream: [artifacts/SWHM2-S-0010/sprint-summary.md]
---

# QA test report — SWHM2-S-0010

## Executive Summary

Verdict: proceed. The integrated branch builds, all 360 unit tests and all 25 chromium E2E tests pass, and every scenario of change swhm2-i-0009 was exercised (by test and by live requests against a production build). No defects were found. Locked acceptance failures (see below) are warnings for release UAT.

## E2E Test Status

`npm run test:e2e -- --project=chromium`: `25 passed (29.3s)`, 0 skipped. Details in `integration-test-result.md`.

Warnings (locked acceptance suite, enforced at UAT, not fixed): `npm run test:acceptance:e2e` 19 passed, 2 failed (C-0179 inventory rows; C-0226 `goto /admin` ERR_ABORTED, which reproduced on a solo re-run); `npm run test:acceptance` 188 passed, 2 failed (C-0240, C-0243: harness `insertItem` uses columns not in the real schema, dispute already filed) plus 2 suites that cannot load modules of later capabilities (`src/batch/jobs`, `src/i18n/format`).

Live checks on `next start` (curl, fresh DB, admin/admin defaults): `/admin` signed out → 307 to `/admin/login`; wrong password → 303 `/admin/login/error`; right password → 303 `/admin` with Launch Rich Client and Log out; `/api/admin/appl` without a session → 401 "Session Timed Out; Please exit and login as admin from the login page"; GETORDERS PENDING → orders plus Count; Type FOO → "Unknown request type: FOO" (400); REVENUE → FISH 297, DOGS 148, Total 445; ORDERS → 18, 8, Total 26 (quantities); Start `2020-01-31` → "Enter the date as MM/dd/yyyy…"; `process` with currentScreen=manageorders → Pet Store Admin JNLP with host, port and session id; logout → 303 to login, then `/admin` and `/api/admin/appl` refuse again.

SCENARIO-VERDICT: Admin endpoint access control / Admin endpoint access control — pass
SCENARIO-VERDICT: Logout / Logout — pass
SCENARIO-VERDICT: Rich-client session check / Rich-client session check — pass
SCENARIO-VERDICT: Sales reports / Sales reports — pass
SCENARIO-VERDICT: Chart data for admin client / Chart data for admin client — pass
SCENARIO-VERDICT: Order operations view / Order operations view — pass (covered by unit tests in src/admin; live GETORDERS lists only orders with a status row)
SCENARIO-VERDICT: Rich-client XML requests / Rich-client XML requests — pass
SCENARIO-VERDICT: Warn on uncommitted changes at refresh / Warn on uncommitted changes at refresh — pass (e2e C-0232)
SCENARIO-VERDICT: Report date format / Report date format — pass (live request and e2e C-0233)
SCENARIO-VERDICT: Admin login and home screens / Admin login and home screens — pass (e2e C-0234)
SCENARIO-VERDICT: Launch descriptor on manage orders / Launch descriptor on manage orders — pass
SCENARIO-VERDICT: Manage orders submission / Manage orders submission — pass
SCENARIO-VERDICT: Order listing by status for admin client / Order listing by status for admin client — pass
SCENARIO-VERDICT: GETORDERS request / GETORDERS request — pass
SCENARIO-VERDICT: Orders by status without duplicates / Orders by status without duplicates — pass (unit test; the live PENDING list showed no repeated ids)

## Unit Test Results

`npm test -- --coverage`, exit 0: `Test Suites: 75 passed, 75 total` / `Tests: 360 passed, 360 total`.

## Code Review

No notable concerns observed. Incidental: the XML GETORDERS date is unpadded month/day/year (`11/2/2026`) while the orders screen pads (`11/02/2026`); both satisfy the scenario's "month/day/year". `src/proxy.ts` was added beyond PLAN.md (recorded in the engineer's summary).

## Coverage Summary

Jest coverage from the run above: All files 93.92% statements, 81.14% branches, 90.47% functions, 95.85% lines. No baseline was compared, so "did not regress" is not asserted. Mutation testing was not run.

## Design fidelity

References: all ten mockups in `artifacts/SWHM2-S-0010/design/MANIFEST.md`. Method: `design-measure.mjs` against a production build (`next start`) on a fresh database, signed in where the route needs it; output in `artifacts/SWHM2-S-0010/qa/design/`. Admin screens were measured with no held changes and no sales data, so the mockups' sample states (two held changes, report rows) were not reached.

DESIGN-VERDICT: SWHM2-MCK-51 differs — 4.8% of pixels differ; form column built
- RESIDUAL: SWHM2-MCK-51 sidebar/header/breadcrumb — mockup: its own shell (Catalog, Search, Cart, Administrator badge, "Admin / Sign in"); built: the approved site shell with "Administration of orders / Login"
DESIGN-VERDICT: SWHM2-MCK-52 differs — 11.2% differ; same shell differences at 390
- RESIDUAL: SWHM2-MCK-52 shell and breadcrumb — as MCK-51
DESIGN-VERDICT: SWHM2-MCK-53 differs — 3.9% differ; error page and link built
- RESIDUAL: SWHM2-MCK-53 shell and breadcrumb — as MCK-51
DESIGN-VERDICT: SWHM2-MCK-54 differs — 11.3% differ
- RESIDUAL: SWHM2-MCK-54 shell and breadcrumb — as MCK-51
DESIGN-VERDICT: SWHM2-MCK-55 differs — 5.8% differ; Launch Rich Client and Log out present
- RESIDUAL: SWHM2-MCK-55 shell; "Signed in as jps_admin. Your session ends after 15 minutes of inactivity." paragraph — mockup: shown; built: not shown (session expiry not adopted)
DESIGN-VERDICT: SWHM2-MCK-56 differs — 18.4% differ
- RESIDUAL: SWHM2-MCK-56 same as MCK-55 at 390
DESIGN-VERDICT: SWHM2-MCK-57 differs — 10.3% differ
- RESIDUAL: SWHM2-MCK-57 title and controls — mockup: "Orders by status", "Approve or deny pending orders. Nothing is sent until you Commit.", "Commit 2 changes"; built: Order-approval screen design with Refresh, other titles and labels
DESIGN-VERDICT: SWHM2-MCK-58 differs — 25.2% differ
- RESIDUAL: SWHM2-MCK-58 as MCK-57 at 390
DESIGN-VERDICT: SWHM2-MCK-59 differs — 8.6% differ
- RESIDUAL: SWHM2-MCK-59 date inputs and result region — mockup: dates shown MM/dd/yyyy, inline format message, "last successful run" caption, Dogs row; built: ISO date inputs, no sample rows (no data in the measured state)
DESIGN-VERDICT: SWHM2-MCK-60 differs — 19.6% differ
- RESIDUAL: SWHM2-MCK-60 as MCK-59 at 390

Conformance proposals were not recorded: `a2a_propose_design_conformance` answered `disabled: true`.

## Issues Found

None in this sprint's scope (`integration-defects-resolution.md`: empty, COMPLETE). Warnings only: the four locked acceptance failures listed under E2E Test Status, triaged at UAT. No SPEC-GAP found.

## Recommendation

Proceed: fire `validation.all_acs_passed`.
