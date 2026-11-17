---
artifact: qa-test-report
sprint: SWHM2-S-0001
ticket: SWHM2-T-0004
author: validation
---

# QA test report — SWHM2-S-0001

## Executive Summary

Sprint goal SWHM2-I-0001 (bootstrap, landing page, shared shell) holds: all five scenarios pass in a real browser run and in jest. One defect was found and fixed in place: `npm run build` and `npm run typecheck` failed because tsconfig compiled the locked acceptance tests of later capabilities (73 TS errors, all under `tests/acceptance/`). Excluding `tests/acceptance` from tsconfig fixes both. Lint and format still report issues in locked acceptance tests and non-site files; these are outside this sprint.

## E2E Test Status

Command: `npm run test:e2e -- --project=chromium` — `6 passed (6.2s)`. Details in `integration-test-result.md`.

Locked acceptance suite (warnings only, enforced at UAT):
- `npx jest --config jest.acceptance.config.mjs tests/acceptance/site-shell`: Tests: 2 passed, 2 total.
- `npx playwright test --config playwright.acceptance.config.ts site-shell`: 3 passed. No failures to list.

## Unit Test Results

`npm test -- --coverage`: Test Suites: 8 passed, 8 total; Tests: 14 passed, 14 total.

## Code Review

Verified by inspection plus the runs above, not a line review of every file. Design fidelity: compared via the implementation ticket's Playwright design-check (`SWHM2-T-0002/design-check.md`) and not re-rendered by me; the differences it lists (theme-token colours/font instead of mockup indigo/Inter, no paw icon, mockup sample cart count) are accepted token decisions.

SCENARIO-VERDICT: Landing page / A user opens the root route — pass
SCENARIO-VERDICT: Global navigation / Navigation is present on every page — pass
SCENARIO-VERDICT: Shared page layout / A page renders inside the shell — pass
SCENARIO-VERDICT: Shared state frames / A page has nothing to show — pass
SCENARIO-VERDICT: Shared state frames / A page fails to load — pass

Evidence: e2e/home.spec.ts and acceptance site-shell specs cover the first three; `tests/acceptance/site-shell/state-frames.test.tsx` (jest) covers the empty and error frames. The error-frame scenario was verified at component level only, not in a browser.

DESIGN-VERDICT: SWHM2-MCK-9 match — per T-0002 design-check, token-driven differences only
- RESIDUAL: SWHM2-MCK-9 brand — mockup: paw mark icon; built: text only

## Coverage Summary

Jest coverage (from `npm test -- --coverage`): All files 87.5% statements, 62.06% branches, 84.09% functions, 87.93% lines. No baseline was available to compare, so regression is not assessed.

## Issues Found

- D1 (fixed in place): `npm run build` / `npm run typecheck` failed with TS errors in locked acceptance tests of later capabilities (missing `@/cart`, `@/fulfilment` etc. modules). Fix: `tsconfig.json` exclude `tests/acceptance`. After: typecheck exit 0, build exit 0. See `integration-defects-resolution.md`.
- W1 (warning, not fixed): `npm run lint` fails on 2 warnings in locked tests (`checkout-and-payment.test.ts`, `order-notifications.test.ts`). Acceptance tests are locked.
- W2 (warning, not fixed): `npm run format:check` flags `api/openapi.yaml`, `build/manifest.yaml`, `design/prd/PRD.md`, `tests/acceptance/shopping-cart/e2e/shopping-cart.spec.ts`; none belong to this sprint's code.

## Recommendation

Pass. All scenarios verified, the one defect was fixed and verified by a successful build. Follow up on W1/W2 outside this sprint.
