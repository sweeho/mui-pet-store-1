---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0005
capability brief: SWHM2-I-0005
branch: vortex/sprint/swhm2-s-0005-67d6dbe5
upstream: [artifacts/SWHM2-S-0005/SWHM2-T-0023/summary.md]
---

# QA test report — SWHM2-S-0005

## Executive Summary

Verdict: proceed. Sprint SWHM2-S-0005 (SWHM2-I-0005, Checkout and payment details) delivered one ticket, SWHM2-T-0023. On the integrated sprint branch `npm ci`, `npm run build`, `npm test` (191 passed), the project's Playwright suite (18 passed, 0 skipped) and the checkout acceptance suite (26 passed) all succeed. All 27 scenarios of the change have a pass verdict. No defects were found. Acceptance failures in other capabilities are listed as warnings below (enforced only at release UAT).

## E2E Test Status

Project E2E: `npm run test:e2e -- --project=chromium` gave `18 passed (17.1s)`, no skips; `e2e/checkout.spec.ts` (sign on, cart, two-step checkout, confirmation with placeholder card) passes. Detail: `integration-test-result.md`.

Warnings (locked acceptance suite, enforced only at UAT, not fixed here):
- `npm run test:acceptance`: `Test Suites: 6 failed, 5 passed, 11 total; Tests: 101 passed, 101 total`. The six failing suites (admin-order-management, order-approval, order-fulfilment, batch-operations, order-notifications, internationalisation) fail with `Cannot find module` on source modules of later capabilities (`src/admin/launch`, `src/approval/orders`, `src/fulfilment/orders`, `src/batch/jobs`, `src/notifications/sender`, `src/i18n/format`). Checkout-and-payment, customer-accounts, shopping-cart, catalog-browsing and one other suite pass (`npx jest --config jest.acceptance.config.mjs tests/acceptance/checkout-and-payment`: 26 passed).
- `npm run test:acceptance:e2e`: `10 failed, 11 passed`. Failures are SWHM2-C-0232, 0234, 0241, 0242 (admin), 0027, 0028, 0029 (approval), 0179, 0195, 0211 (fulfilment): pages of later capabilities do not exist yet. `SWHM2-C-0054` (checkout placeholder card), SWHM2-C-0077, 0135-0137, 0140, 0018, 0225-0227 pass.

## Unit Test Results

Command: `npm test -- --coverage`. Output: `Test Suites: 35 passed, 35 total`, `Tests: 191 passed, 191 total`.

SCENARIO-VERDICT lines (each exercised by the checkout acceptance suite, the unit tests under `src/checkout/` and `e2e/checkout.spec.ts`):

SCENARIO-VERDICT: : Address storage /  Address storage case (SWHM2-R-0023.01) — pass
SCENARIO-VERDICT: : Address storage /  Address storage case (SWHM2-R-0023.02) — pass
SCENARIO-VERDICT: : Placeholder payment card on order submission /  Placeholder payment card on order submission case (SWHM2-R-0152.01) — pass
SCENARIO-VERDICT: : Credit card expiry defaults /  Credit card expiry defaults case (SWHM2-R-0150.01) — pass
SCENARIO-VERDICT: : No validation of contact name, telephone and email /  No validation of contact name, telephone and email case (SWHM2-R-0151.01) — pass
SCENARIO-VERDICT: : Order record /  Order record case (SWHM2-R-0153.01) — pass
SCENARIO-VERDICT: : Order record /  Order record case (SWHM2-R-0153.02) — pass
SCENARIO-VERDICT: : Card expiry month/year text /  Card expiry month/year text case (SWHM2-R-0154.01) — pass
SCENARIO-VERDICT: : Credit card attributes /  Credit card attributes case (SWHM2-R-0027.01) — pass
SCENARIO-VERDICT: : Credit card creation /  Credit card creation case (SWHM2-R-0155.01) — pass
SCENARIO-VERDICT: : Credit card creation /  Credit card creation case (SWHM2-R-0155.02) — pass
SCENARIO-VERDICT: : Credit card operation access and removal transaction /  Credit card operation access and removal transaction case (SWHM2-R-0156.01) — pass
SCENARIO-VERDICT: : Credit card operation access and removal transaction /  Credit card operation access and removal transaction case (SWHM2-R-0156.02) — pass
SCENARIO-VERDICT: : Purchase order document /  Purchase order document case (SWHM2-R-0157.01) — pass
SCENARIO-VERDICT: : Stored credit card /  Stored credit card case (SWHM2-R-0028.01) — pass
SCENARIO-VERDICT: : Stored credit card /  Stored credit card case (SWHM2-R-0028.02) — pass
SCENARIO-VERDICT: : Payment card storage /  Payment card storage case (SWHM2-R-0158.01) — pass
SCENARIO-VERDICT: : Identifier sequence storage /  Identifier sequence storage case (SWHM2-R-0059.01) — pass
SCENARIO-VERDICT: : Contact information document /  Contact information document case (SWHM2-R-0060.01) — pass
SCENARIO-VERDICT: : Contact information document /  Contact information document case (SWHM2-R-0060.02) — pass
SCENARIO-VERDICT: : Contact created with empty address /  Contact created with empty address case (SWHM2-R-0061.01) — pass
SCENARIO-VERDICT: : Address document reading /  Address document reading case (SWHM2-R-0062.01) — pass
SCENARIO-VERDICT: : Address document reading /  Address document reading case (SWHM2-R-0062.02) — pass
SCENARIO-VERDICT: : Credit card document /  Credit card document case (SWHM2-R-0063.01) — pass
SCENARIO-VERDICT: : Credit card document /  Credit card document case (SWHM2-R-0063.02) — pass
SCENARIO-VERDICT: : Unique identifier generation /  Unique identifier generation case (SWHM2-R-0124.01) — pass
SCENARIO-VERDICT: : First identifier for new sequence /  First identifier for new sequence case (SWHM2-R-0125.01) — pass

## Code Review

No notable concerns observed. Incidental notes: no "Checkout" entry in the left navigation (documented deviation in SWHM2-T-0023 summary: it made locked SWHM2-C-0226 flaky; entry is via the cart's "Proceed to checkout"), whereas the capability brief says checkout lives under Checkout in the shared navigation. The checkout writes (card, sequence id, order) are not one transaction; the ticket's review accepted this as legacy behaviour.

## Coverage Summary

`npm test -- --coverage` (Jest, whole repo): All files 93.56% statements, 79.77% branches, 88.59% functions, 94.87% lines. No baseline was compared; regression versus the previous sprint was not measured.

## Design fidelity

Reference: `artifacts/SWHM2-S-0005/design/*.html` (6 approved mockups). Method: production build (`npm run start`) on :3000, a freshly created signed-on user with a cart of EST-6, EST-14, EST-20 (one each), `design-measure.mjs` per mockup; output in `artifacts/SWHM2-S-0005/qa/design/`. All three screens and both viewports were reached.

DESIGN-VERDICT: SWHM2-MCK-39 differs — 9.3% of pixels differ; shell, field-label style and sample data differ, form content and copy match
- RESIDUAL: SWHM2-MCK-39 header, sidebar, footer — mockup: its own shell (Pet Store logo, cart count, Signed on as); built: the app's Modernize shell
- RESIDUAL: SWHM2-MCK-39 form fields — mockup: label above input; built: MUI outlined label on the border
- RESIDUAL: SWHM2-MCK-39 figures — mockup: JetBrains Mono; built: generic monospace
- RESIDUAL: SWHM2-MCK-39 order summary — mockup: item thumbnails; built: none
DESIGN-VERDICT: SWHM2-MCK-40 differs — 8.9% of pixels differ; same shell, field and note-style differences as MCK-39
- RESIDUAL: SWHM2-MCK-40 shell, fields, notes — mockup: coloured left border on info notes, own shell; built: theme divider, Modernize shell
DESIGN-VERDICT: SWHM2-MCK-41 differs — 8.3% of pixels differ; status reads "Submitted — awaiting approval" (design decision SD4) instead of "Approved"
- RESIDUAL: SWHM2-MCK-41 status chip — mockup: "Approved"; built: "Submitted — awaiting approval"
- RESIDUAL: SWHM2-MCK-41 items — mockup: names like "Male Adult Bulldog" with thumbnails; built: item id, description columns in a table, no thumbnails
DESIGN-VERDICT: SWHM2-MCK-42 differs — 16.2% of pixels differ; page 1572px vs mockup 1487px, same shell and field differences
- RESIDUAL: SWHM2-MCK-42 layout — mockup: its own mobile header with menu, cart; built: Modernize header with menu button
DESIGN-VERDICT: SWHM2-MCK-43 differs — 15.0% of pixels differ; page 1749px vs mockup 1565px, same differences
- RESIDUAL: SWHM2-MCK-43 layout — mockup: compact fields; built: taller MUI fields
DESIGN-VERDICT: SWHM2-MCK-44 differs — 14.5% of pixels differ; page 1784px vs mockup 1288px
- RESIDUAL: SWHM2-MCK-44 items — mockup: card list of items; built: a four-column table that wraps header cells
- RESIDUAL: SWHM2-MCK-44 header — mockup: steps row at top, centred title; built: left-aligned title with the "Continue shopping" button beside it, step row "Confirmation" label touching the right edge
Not fixed in place: no clear small difference was found that does not belong to the app's shell. `a2a_propose_design_conformance` answered `disabled: true`, so nothing was recorded.

## Issues Found

None. No defect was filed. See `integration-defects-resolution.md` (empty Summary table).

## Recommendation

Proceed: fire `validation.all_acs_passed`. Every scenario passes and the project's own E2E and unit gates are green; the locked-acceptance failures are later-capability suites reserved for UAT.

## Regression guards

Cases accepted because their tests passed at the [tdd:red] commit; each is shown working in this run by `npm test` (35 suites passed) and `npx jest --config jest.acceptance.config.mjs tests/acceptance/checkout-and-payment` (26 passed):
- SWHM2-T-0023: SWHM2-C-0044 (document whose root is not ContactInfo is rejected) — working
- SWHM2-T-0023: SWHM2-C-0047 (element not named Address is rejected) — working
- SWHM2-T-0023: SWHM2-C-0049 (document whose root is not CreditCard is rejected) — working
