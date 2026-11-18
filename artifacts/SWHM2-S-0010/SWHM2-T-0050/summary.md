---
ticket: SWHM2-T-0050
---
# Summary

Administration of orders (change swhm2-i-0009): sign-in lands on `/admin`, a failed sign-in shows `/admin/login/error`,
`/admin`, `/admin/orders` and `/admin/reports` need an admin session, **Log out** ends it, the home offers **Launch Rich
Client**, Orders has a **Refresh** that confirms before discarding held changes, and `/admin/reports` shows a bar or pie
chart. `POST /api/admin/appl` (GETORDERS, UPDATESTATUS, REVENUE, ORDERS, unknown type, session timeout message) and
`POST /api/admin/process` (JNLP descriptor) answer as the spec states.

## Files
- New: `src/admin/{orders,reports,launch,protocol}.ts`, `src/app/api/admin/{appl,process,logout}/route.ts`,
  `src/app/(DashboardLayout)/admin/{login/error,reports}/page.tsx`, `src/components/admin/{AdminHomeView,SalesReportView,SalesChart}.tsx`,
  `src/proxy.ts`, `src/admin/fixtures.test.ts`, `e2e/admin.spec.ts`, tests beside each.
- Modified: `src/admin/session.ts` (`endAdminSession`), login route, `/admin` and `/admin/login` pages, `OrderApprovalView` (Refresh),
  `Breadcrumbs.tsx` (`/admin/login`), `routes.test.ts`, `e2e/approval.spec.ts` (landing URL).

## AC coverage
AC 1-15 map to C-0241, C-0242, C-0244, C-0243, C-0240, C-0230, C-0231, C-0232, C-0233, C-0234, C-0235, C-0236, C-0237, C-0238, C-0239.

## Deviations
- D1 `src/proxy.ts` (not in PLAN.md): gives a 307 to `/admin/login` for `/admin`, `/admin/orders`, `/admin/reports` without the cookie. Without
  it the streamed client redirect made Chromium abort `page.goto("/admin")` in the locked site-shell test C-0226. The pages still call `requireAdmin()`.
- D2 `src/admin/fixtures.test.ts` holds the real-schema fixtures, because the harness's catalog columns do not exist (SD2). Dispute filed:
  finding 4f3e50f9 (C-0240, C-0243 `harness.ts:81`); my own `reports.test.ts` covers both cases.
- D3 `AdminHomeView` and the error page are client components: MUI `component={Link}` cannot be passed from a server component.
- D5 `e2e/home.spec.ts`: its placeholder-area test visited `/admin`, which is no longer a placeholder; it now checks the sign-in redirect.
- D4 The orders screen keeps the Order-approval design plus Refresh; the mockup's renamed title, counts and Approve/Deny labels are not built (see design-check.md).
- Tokens changed: none.

## Verification
- `npm run typecheck`, `npm run lint`, `npm run format:check`, `node .vortex/check-versions.mjs`: pass.
- `node .vortex/check-versions.mjs && npm run verify:full`: pass (lint, format, typecheck, 75 suites / 360 unit tests, 23 e2e). `npx playwright test e2e/admin.spec.ts e2e/approval.spec.ts`: 4 passed.
- Locked e2e (`npm run test:acceptance:e2e`) is flaky under parallel dev-server load: the admin-order-management file passes alone; C-0179 and C-0211 (inventory, not touched) failed in full runs.

CODE-REVIEW: sub-agent — fixed: duplicate OrderId in UPDATESTATUS acted on twice (deduped, tested); rejected: malformed-cookie 500 (shared accounts helper, out of scope), session expiry (design SD6 not adopted), proxy matcher for deeper paths (no such pages; pages still guard), GETORDERS without Status (spec lists no default), JNLP host from request URL (spec P9), constant-time compare and Secure cookie (existing sign-in behaviour)
