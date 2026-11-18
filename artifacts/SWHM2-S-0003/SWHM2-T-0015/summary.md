---
ticket: SWHM2-T-0015
type: FEATURE
---
# Summary: Customer accounts and sign-on

Built the account data model, registration, sign-on with the remember-name cookie, language at sign-on, the 15-minute
idle rule, `requireSignOn` page protection and the five screens (`/signon`, `/signon/error`, `/accounts/create`,
`/accounts/create-error`, `/account`), all 16 `tasks.md` lines.

## What changed
- Data: `sign_on`, `address`, `credit_card`, `contact`, `account`, `profile`, `customer`, `web_session` in
  `src/db/schema.ts`; migration `drizzle/0002_daily_donald_blake.sql`.
- Domain: `src/accounts/{store,signon,profile,customers,registration,session,web-session,limits}.ts`;
  `src/checkout/store.ts` (`storeAddress`, `storeCreditCard`).
- Routes: `POST /api/accounts/{users,signon,signoff}`.
- UI: `src/components/accounts/*`, the pages above, `/accounts` (redirects to `/account`, the breadcrumb target), layout/header/
  footer session state ("Sign off", footer note).
- Tests: `src/accounts/accounts.test.ts`, `web-session.test.ts`, `src/app/api/accounts/routes.test.ts`, component and shell
  tests, `e2e/accounts.spec.ts`, `e2e/accounts-flow.spec.ts`.

## AC coverage
AC-1 … AC-46 map to cases C-0098 … C-0143; all pass (see `tdd-test-result.md`).

## Decisions and deviations
- Design tokens changed to the mockups (`design/tokens.mui.json`: indigo primary, slate text, Inter at radius 4). Inter is
  loaded by the new pinned dependency `@fontsource-variable/inter@5.3.0`; the theme used to name Plus Jakarta Sans without
  loading it. This restyles the whole app, as the mockup-wins rule requires. See `design-check.md`.
- `src/db/client.ts`: libsql `timeout: 5000` so parallel workers wait for a lock instead of failing with SQLITE_BUSY (the new
  write-heavy tests exposed it in the catalog and users tests).
- A JSON registration with no preference fields gets the default profile; a form submission goes through `recordProfile`.
- Open-redirect guard: `returnTo` must be a same-site path (not `//…` or `/\…`).
- Passwords are stored as supplied (R-0161, D5). A header "Signed out · Sign on" label from the mockup's sidebar is not built.
- Not built here: language rendering and the switcher (D4).

## Verification
`node .vortex/check-versions.mjs`, `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test` (112 pass),
`npm run test:e2e` (14 pass), `npm run build`; platform red and green runs valid.

CODE-REVIEW: self-review — no sub-agent run; reviewed the diff against the acceptance criteria and mockups; fixed a `/\host` open-redirect gap in `safeReturnTo` and the dead `/accounts` breadcrumb target; rejected none.
