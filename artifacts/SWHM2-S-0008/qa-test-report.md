---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0008
capability_brief: SWHM2-I-0008
branch: vortex/test/SWHM2-T-0039-integration-qa-report-swhm2-s-0008-19eff237
---

## Executive Summary

Sprint SWHM2-S-0008 (SWHM2-I-0008, Order notifications) verified on the integrated sprint branch. `npm ci`, `npm run build`, `npm test` (318 passed) and the Playwright E2E (21 passed, 0 skipped) all ran green. All 18 scenarios in the delta spec pass, backed by executing tests. No defects found. The locked acceptance suite shows 3 failing suites unrelated to this sprint (warnings only, see below).

## E2E Test Status

Executed `npm run test:e2e -- --project=chromium`: `21 passed (20.4s)`, 0 failed, 0 skipped. Details in `artifacts/SWHM2-S-0008/integration-test-result.md`.

Locked acceptance suite (`npm run test:acceptance`, enforced only at release UAT, so warnings, not fixed): `Test Suites: 3 failed, 8 passed, 11 total; Tests: 179 passed, 179 total`. Warnings:
- tests/acceptance/batch-operations: Cannot find module `src/batch/jobs`
- tests/acceptance/internationalisation: Cannot find module `src/i18n/format`
- tests/acceptance/admin-order-management: Cannot find module `src/admin/launch`
These are later-capability modules; the order-notifications acceptance suite passes.

Scenario verdicts (each backed by an executing Jest test, in `src/notifications/*.test.ts`, `src/**` and `tests/acceptance/order-notifications/`; the notifications have no UI so no browser run applies):

SCENARIO-VERDICT: Status e-mail gated by administrator / Notifications disabled — pass
SCENARIO-VERDICT: Mail XML document / Mail document built — pass
SCENARIO-VERDICT: Purchase order submission / Order submitted — pass
SCENARIO-VERDICT: Invoice publication / Invoice generated — pass
SCENARIO-VERDICT: Mail message format / Mail with several recipients — pass
SCENARIO-VERDICT: OrderApproval document validation / Wrong document type — pass
SCENARIO-VERDICT: Invalid mail request handling / Malformed mail request — pass
SCENARIO-VERDICT: OrderApproval exchange / Approval outcomes exchanged — pass
SCENARIO-VERDICT: Shared resource locator / Repeated lookup — pass
SCENARIO-VERDICT: Transactional message sending / Transaction rolls back — pass
SCENARIO-VERDICT: Async sender queue / Message queued — pass
SCENARIO-VERDICT: Completed-order mail trigger / Order completed — pass
SCENARIO-VERDICT: Completed-order mail trigger / Partial shipment — pass
SCENARIO-VERDICT: Order e-mail switches / Default configuration — pass
SCENARIO-VERDICT: Order e-mail addressing and subjects / Status change e-mail — pass
SCENARIO-VERDICT: Mail request structure / Wrong structure — pass
SCENARIO-VERDICT: Undeliverable mail discarded / Send failure — pass
SCENARIO-VERDICT: Locator error wrapping / Lookup fails — pass

## Unit Test Results

`npm test` (jest): `Test Suites: 64 passed, 64 total; Tests: 318 passed, 318 total`, exit 0.

## Code Review

Not a full line review. Verified by inspection that `src/notifications/` contains mail-document, mailer, broker, locator, sender, order-flow and order-approval modules matching the design's structure; test names cite the case keys SWHM2-C-0144 to C-0161. No design reference exists on this capability brief (no screens).

## Coverage Summary

`npx jest --coverage`: All files 93.37% statements, 79.69% branches, 89.86% functions, 95.37% lines. `src/notifications`: 97.87% statements, 92.06% branches, 100% functions, 100% lines. No prior baseline was compared (Not Provided).

## Issues Found

None. No defects, no spec gaps. Warnings: the three acceptance-suite failures above (UAT-triaged).

## Recommendation

Pass the sprint (`validation.all_acs_passed`). Evidence: the commands above, all exit 0 except the UAT-only acceptance warnings.
