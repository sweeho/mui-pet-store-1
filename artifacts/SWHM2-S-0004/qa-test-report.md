---
ticket: SWHM2-T-0020
sprint: SWHM2-S-0004
role: validation
---
# QA test report — SWHM2-S-0004

## Executive Summary
SWHM2-I-0004 (Shopping cart) passes. Build, lint, format, typecheck, unit tests and the project's
Playwright suite are green on the integrated sprint branch. No defects found. Locked acceptance
failures in 7 other, not-yet-built capabilities are listed as warnings only.

## E2E Test Status
`npx playwright test --project=chromium`: `17 passed (14.2s)`, 0 failed, 0 skipped, including
`e2e/cart.spec.ts` (3 cart tests listed). Details in `integration-test-result.md`.

Warnings (locked acceptance, enforced only at UAT, not fixed here):
- `npm run test:acceptance`: `Test Suites: 7 failed, 4 passed`; `Tests: 75 passed, 75 total`. Failing
  suites: order-fulfilment, batch-operations, checkout-and-payment, order-notifications,
  internationalisation, admin-order-management, order-approval (capabilities not built yet).
- `npm run test:acceptance:e2e`: `11 failed, 10 passed`; all 11 failures are in admin-order-management,
  checkout-and-payment, order-approval and order-fulfilment specs. The shopping-cart acceptance suite does not fail.

## Unit Test Results
`npm run verify` (exit 0): lint, prettier, typecheck clean; `Test Suites: 26 passed, 26 total`,
`Tests: 149 passed, 149 total`. `npm run build` exit 0.

## Code Review
Not re-reviewed per ticket; T-0019's summary records a self-review. Inspection of the spec scenarios
against `src/cart/*` was via their unit tests and the cart E2E, not a separate line-by-line review.

## Coverage Summary
`npx jest --coverage`: Statements 92.76% (911/982), Branches 76.03% (311/409), Functions 86.54%
(193/223), Lines 94.21% (830/881). No baseline was available to compare for regression.

## Design fidelity
I ran `design-measure.mjs` (from the artifact-design-check skill, plus a cookie option to seed a 3-line cart) against `next start` on :3300 for all four mockups; output is in `qa/design/`. Pixel difference: MCK-35 6.7%, MCK-36 17.5%, MCK-37 3.3%, MCK-38 10.8%. Remaining differences are shell-wide (header language links and idle notice, brand mark size/colour, nav weight and radius, JetBrains Mono not loaded) or sample data in the mockup; I made no in-place fix because they need a design decision on the shared shell, not a cart fix. Mobile line layout and sticky checkout bar of MCK-36 are not built.
DESIGN-VERDICT: SWHM2-MCK-35 differs — 6.7% pixel diff, mostly sample data and MUI control sizes
- RESIDUAL: SWHM2-MCK-35 Update cart / Remove buttons — mockup: 0.45-opacity, 32px; built: MUI disabled style, 34px
DESIGN-VERDICT: SWHM2-MCK-36 differs — mobile line layout and sticky checkout bar not built
- RESIDUAL: SWHM2-MCK-36 line meta and bottom bar — mockup: separate meta lines, sticky Subtotal/Proceed bar; built: stacked rows, checkout button in heading
DESIGN-VERDICT: SWHM2-MCK-37 differs — 3.3% or 10.8% pixel diff, shell header and nav differences
- RESIDUAL: SWHM2-MCK-37 shell header — mockup: no language links/idle notice; built: shell shows them
DESIGN-VERDICT: SWHM2-MCK-38 differs — 3.3% or 10.8% pixel diff, shell header and nav differences
- RESIDUAL: SWHM2-MCK-38 shell header — mockup: no language links/idle notice; built: shell shows them

## Issues Found
No defects. Design residuals above are recorded, not failures.

SCENARIO-VERDICT: Cart per shopper session / Same item added twice — pass
SCENARIO-VERDICT: Cart holds one quantity per item / Re-adding replaces quantity — pass
SCENARIO-VERDICT: Cart holds one quantity per item / Add without quantity — pass
SCENARIO-VERDICT: Quantity update / Update to zero — pass
SCENARIO-VERDICT: Quantity update / Update to positive — pass
SCENARIO-VERDICT: Invalid quantity treated as zero / Non-numeric quantity — pass
SCENARIO-VERDICT: Remove, empty and count / Remove one item — pass
SCENARIO-VERDICT: Remove, empty and count / Empty the cart — pass
SCENARIO-VERDICT: Item count is distinct lines / Count with multiple quantities — pass
SCENARIO-VERDICT: Cart line presentation / Line shown with catalog data — pass
SCENARIO-VERDICT: Cart line presentation / No locale given — pass
SCENARIO-VERDICT: Line total and subtotal / Subtotal computed — pass
SCENARIO-VERDICT: Unavailable catalog item omitted / Lookup failure — pass
SCENARIO-VERDICT: Add to cart and proceed to checkout / Add then check out — pass

Verdicts are backed by T-0019's cases C-0064 to C-0077 (unit/route tests in the 149 passing) and the
passing locked shopping-cart acceptance suite; I did not hand-exercise each scenario on a staging deploy.

## Recommendation
Pass the sprint (`validation.all_acs_passed`). Follow-up for the next sprint: mobile cart layout and
sticky checkout bar from the mockups.
