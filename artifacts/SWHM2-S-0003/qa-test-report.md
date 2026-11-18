---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0003
capability brief: SWHM2-I-0003
branch: vortex/sprint/swhm2-s-0003-472ab98e
upstream: [artifacts/SWHM2-S-0003/SPRINT-PLAN.md]
downstream: [artifacts/SWHM2-S-0003/sprint-summary.md]
---

# QA test report — SWHM2-S-0003

## Executive Summary

Verdict: pass. The integrated branch for SWHM2-I-0003 (customer accounts and sign-on) built, passed lint, format, typecheck and version checks, passed 112 unit tests and 14 Playwright E2E tests (0 failed, 0 skipped). I also exercised sign-on, registration, remember-name and protected-page behaviour against a production build with curl. No defects were found. Design differences from the mockups are recorded under Design fidelity and do not affect the verdict.

## E2E Test Status

`npm run test:e2e`: `14 passed (11.9s)`, 0 failed, 0 skipped. Details in `artifacts/SWHM2-S-0003/integration-test-result.md`.

Warnings (locked acceptance suite, enforced at release UAT, not fixed): `npm run test:acceptance` reports 8 suites failed to run (order-fulfilment, batch-operations, checkout-and-payment, order-notifications, internationalisation, admin-order-management, order-approval, shopping-cart; later capabilities) with 62 tests passed. `npm run test:acceptance:e2e` reports 12 failed, 9 passed, the failures all in other capabilities' specs (order-approval, order-fulfilment, shopping-cart, admin-order-management). The customer-accounts acceptance specs (C-0134, C-0135, C-0136 among them) passed.

## Unit Test Results

Command: `npm test -- --coverage`. Output: `Test Suites: 21 passed, 21 total`, `Tests: 112 passed, 112 total`.
Also exit 0: `node .vortex/check-versions.mjs`, `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm ci`, `npm run build`.

Live checks on `next start` (production build, fresh SQLite), by curl:
- anonymous `GET /account` answers 307 to `/signon?returnTo=%2Faccount`.
- `POST /api/accounts/users` with a new name answers 201; the same name again, a name containing `*`, and a 26-character name each answer 303 to `/accounts/create-error`.
- `POST /api/accounts/signon` with correct credentials and remember ticked answers 303 to `/account` and sets `remember_user=qa1; Max-Age=2678400`; a wrong password (also a different case), and an unknown name answer 303 to `/signon/error`; signing on without remember while a `remember_user` cookie is sent sets `remember_user=; Max-Age=0`; the session cookie then serves `/account` with 200.
- The 15-minute idle rule and the language (ja_JP) application are verified by unit tests only (`web-session.test.ts`, `accounts.test.ts`), not in a browser.

## Code Review

No notable concerns observed incidentally. The open-redirect guard on `returnTo` is present. Passwords are stored as supplied, as requirement SWHM2-R-0161 states.

## Coverage Summary

Jest coverage from the run above: statements 92.68%, branches 74.4%, functions 87.43%, lines 94.25% (All files). No baseline was available to compare for regression. Mutation testing was not run.

## Design fidelity

Reference: `artifacts/SWHM2-S-0003/design/` (MANIFEST.md); measured with `design-measure.mjs` against a production build on :3200, output in `artifacts/SWHM2-S-0003/qa/design/`. Not fixed in place: the differences below are the shared shell (sidebar, header, nav labels) and layout structure, which need a design decision rather than a small fix.

DESIGN-VERDICT: SWHM2-MCK-27 differs — 6.4% of pixels differ; shell nav, heading copy and layout differ.
- RESIDUAL: SWHM2-MCK-27 page heading — mockup: "Sign on to continue to Checkout" with return-page name; built: "Sign on to continue to your account"
- RESIDUAL: SWHM2-MCK-27 shell — mockup: sidebar with Catalog, Search, Cart, Inventory, Orders, Sales reports and "Signed out · Sign on"; built: different nav labels (Catalog & search, Order fulfilment, Administration of orders), 日本語 and 中文 language items, wider sidebar and different logo size, colour and weight
- RESIDUAL: SWHM2-MCK-27 "Show password" — mockup: Inter 14px; built: Arial 18px
DESIGN-VERDICT: SWHM2-MCK-28 differs — 15.8% of pixels differ; mobile top bar and menu labels differ.
- RESIDUAL: SWHM2-MCK-28 top bar — mockup: "Pet Store", "Open menu" and "Language: English" controls; built: "Open the menu" and no language control
- RESIDUAL: SWHM2-MCK-28 "Show password" and sign-on button — mockup: 44x44 and 256x48; built: 40x36 and 88x31
DESIGN-VERDICT: SWHM2-MCK-29 differs — 4.8% of pixels differ; shell and button styling differ.
- RESIDUAL: SWHM2-MCK-29 "Sign on" nav item — mockup: white text on indigo; built: dark text on white
- RESIDUAL: SWHM2-MCK-29 shell — same sidebar and header differences as MCK-27
DESIGN-VERDICT: SWHM2-MCK-30 differs — 13.3% of pixels differ; mobile top bar and error layout differ.
- RESIDUAL: SWHM2-MCK-30 error copy — mockup: "Nothing was changed. Try again or create an account."; built: "Nothing was changed. You can try again or create an account."
- RESIDUAL: SWHM2-MCK-30 top bar — mockup: Pet Store, Open menu, Language controls; built: "Open the menu", an extra "Error" breadcrumb, no language control
DESIGN-VERDICT: SWHM2-MCK-31 differs — 6.2% of pixels differ; shell differs, counters and favourite-category control differ.
- RESIDUAL: SWHM2-MCK-31 counters — mockup: "6 / 25" and "8 / 50" for the sample values; built: "0 / 25" and "0 / 50" (sample data, same format)
- RESIDUAL: SWHM2-MCK-31 favourite-category — mockup: select listing No favourite, Fish, Dogs, Reptiles, Cats, Birds; built: select showing "No favourite" (options not reached)
- RESIDUAL: SWHM2-MCK-31 shell — same sidebar and header differences as MCK-27
DESIGN-VERDICT: SWHM2-MCK-32 differs — 15.8% of pixels differ; page height 1097px mockup vs 1106px built.
- RESIDUAL: SWHM2-MCK-32 heading and intro — mockup: "Choose a user ID and password, then set your preferences."; built: "…set your shopping preferences."
- RESIDUAL: SWHM2-MCK-32 top bar — mockup: Pet Store, Open menu, Language controls; built: "Open the menu", breadcrumb "Accounts / Create", no language control
DESIGN-VERDICT: SWHM2-MCK-33 differs — 5.1% of pixels differ; shell differs.
- RESIDUAL: SWHM2-MCK-33 shell — same sidebar and header differences as MCK-27; built adds a breadcrumb "Accounts / Create-error"
DESIGN-VERDICT: SWHM2-MCK-34 differs — 16.2% of pixels differ; mobile top bar, copy and button sizes differ.
- RESIDUAL: SWHM2-MCK-34 copy — mockup: "Pick another user ID, or sign on if the account is yours."; built: "Pick another user ID and try again, or sign on if you already have an account."
- RESIDUAL: SWHM2-MCK-34 buttons — mockup: 268x44 full width; built: 181x37 and 140x37
- RESIDUAL: SWHM2-MCK-34 top bar — same as MCK-30

Mockup states not reached: the sign-on page was measured with `returnTo=/account`, so the heading differs from the mockup's checkout return. The favourite-category options list was not opened.

## Issues Found

None. No entries in `integration-defects-resolution.md`; no future-sprint DEFECT tickets filed. The locked acceptance failures above are warnings for UAT.

SPEC-GAP: the mockups show a language switcher and a "Signed out · Sign on" header label that no scenario covers (the implementation summary notes both were not built) — no scenario covers this behaviour

## Recommendation

Proceed: fire `validation.all_acs_passed`. Every scenario below passed, and the project's own E2E, unit, lint, format and type checks are green.

Basis for the scenario verdicts: the 112 passing unit and route tests, the 14 passing E2E tests (create account, sign on, duplicate name, failed sign-on, protected page, sign off), the passing customer-accounts acceptance specs and the curl checks above. Storage and chain scenarios are verified by the unit tests in `src/accounts/accounts.test.ts`, not in a browser.

SCENARIO-VERDICT: Contact information storage /  Primary case — pass
SCENARIO-VERDICT: Contact information storage /  Alternative case — pass
SCENARIO-VERDICT: Account storage /  Primary case — pass
SCENARIO-VERDICT: Account storage /  Alternative case — pass
SCENARIO-VERDICT: Customer record references /  Primary case — pass
SCENARIO-VERDICT: Customer record references /  Alternative case — pass
SCENARIO-VERDICT: Sign-on credential storage /  Primary case — pass
SCENARIO-VERDICT: Sign-on credential storage /  Alternative case — pass
SCENARIO-VERDICT: Profile storage /  Primary case — pass
SCENARIO-VERDICT: Profile storage /  Alternative case — pass
SCENARIO-VERDICT: Inactive session timeout /  Primary case — pass
SCENARIO-VERDICT: Inactive session timeout /  Alternative case — pass
SCENARIO-VERDICT: Contact and address required fields /  Primary case — pass
SCENARIO-VERDICT: Contact and address required fields /  Alternative case — pass
SCENARIO-VERDICT: Plain text sign-on passwords /  Primary case — pass
SCENARIO-VERDICT: Plain text sign-on passwords /  Alternative case — pass
SCENARIO-VERDICT: Protected page interception /  Primary case — pass
SCENARIO-VERDICT: Protected page interception /  Alternative case — pass
SCENARIO-VERDICT: Sign-on authentication /  Primary case — pass
SCENARIO-VERDICT: Sign-on authentication /  Alternative case — pass
SCENARIO-VERDICT: Sign-on outcome /  Primary case — pass
SCENARIO-VERDICT: Sign-on outcome /  Alternative case — pass
SCENARIO-VERDICT: New user validation /  Primary case — pass
SCENARIO-VERDICT: New user validation /  Alternative case — pass
SCENARIO-VERDICT: Failed user creation /  Primary case — pass
SCENARIO-VERDICT: Failed user creation /  Alternative case — pass
SCENARIO-VERDICT: Account contents /  Primary case — pass
SCENARIO-VERDICT: Account contents /  Alternative case — pass
SCENARIO-VERDICT: Customer, account and contact chain /  Primary case — pass
SCENARIO-VERDICT: Customer, account and contact chain /  Alternative case — pass
SCENARIO-VERDICT: Profile attributes /  Primary case — pass
SCENARIO-VERDICT: Profile attributes /  Alternative case — pass
SCENARIO-VERDICT: Profile preference recording /  Primary case — pass
SCENARIO-VERDICT: Profile preference recording /  Alternative case — pass
SCENARIO-VERDICT: Language applied at sign-on /  Primary case — pass
SCENARIO-VERDICT: Language applied at sign-on /  Alternative case — pass
SCENARIO-VERDICT: Remember user name cookie /  Primary case — pass
SCENARIO-VERDICT: Remember user name cookie /  Alternative case — pass
SCENARIO-VERDICT: Account statuses /  Primary case — pass
SCENARIO-VERDICT: Account statuses /  Alternative case — pass
SCENARIO-VERDICT: Customer identifier /  Primary case — pass
SCENARIO-VERDICT: Customer identifier /  Alternative case — pass
SCENARIO-VERDICT: Customer creation attaches account and profile /  Primary case — pass
SCENARIO-VERDICT: Customer creation attaches account and profile /  Alternative case — pass
SCENARIO-VERDICT: Default profile preferences /  Primary case — pass
SCENARIO-VERDICT: Default profile preferences /  Alternative case — pass
