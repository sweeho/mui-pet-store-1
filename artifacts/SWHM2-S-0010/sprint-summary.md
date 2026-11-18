---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHM2-S-0010
capability brief: SWHM2-I-0009
branch: vortex/sprint/swhm2-s-0010-28ca48f8
upstream: [artifacts/SWHM2-S-0010/SPRINT-PLAN.md, artifacts/SWHM2-S-0010/qa-test-report.md, artifacts/SWHM2-S-0010/integration-defects-resolution.md]
---

# Sprint summary — SWHM2-S-0010

**Goal:** SWHM2-I-0009: Administration of orders. **Outcome: met.** The one FEATURE shipped and
integration QA passed all 15 scenarios of change `swhm2-i-0009-administration-of-orders` with
no defects. Four locked acceptance tests still fail; they are UAT warnings, recorded under Known
Issues.

## Tickets

| Ticket | Type | Title | Outcome |
| --- | --- | --- | --- |
| SWHM2-T-0049 | TASK | Sprint planning — SWHM2-S-0010 | DONE (`240afa6`, `7920d50`): design.md P1–P10 / SD1–SD6, PLAN.md, ten mockups, ARCHITECTURE.md and DESIGN.md updates |
| SWHM2-T-0050 | FEATURE | Administration of orders | DONE (`885662b`); see `SWHM2-T-0050/summary.md` |
| SWHM2-T-0051 | TASK | Integration QA report — SWHM2-S-0010 | DONE (`9701212`): proceed, no defects |
| SWHM2-T-0052 | TASK | Sprint close bundle — SWHM2-S-0010 | DONE: this file and `release-notes.md` |

## What shipped

- **Admin sign-in and home.** `/admin/login` signs an administrator in and lands on `/admin`,
  which offers **Launch Rich Client** and **Log out**. A failed sign-in shows `/admin/login/error`
  with a link back. `/admin`, `/admin/orders` and `/admin/reports` require an admin session.
- **Logout.** `/api/admin/logout` deletes the session row; the next request asks for sign-in.
- **Orders by status.** The existing Order-approval screen gained **Refresh**, which asks for
  confirmation before discarding uncommitted approve or deny changes. Each order appears once.
- **Sales reports.** `/admin/reports` totals revenue or quantity per category (with a grand total)
  or per item, as a bar or pie chart. Dates outside MM/dd/yyyy are rejected with a message.
- **Rich-client protocol.** `POST /api/admin/appl` answers GETORDERS, UPDATESTATUS, REVENUE and
  ORDERS in XML, and "Session Timed Out; Please exit and login as admin from the login page"
  without a session. `POST /api/admin/process` returns the launch descriptor for manage orders.

## Divergence from plan

- **D1** `src/proxy.ts` was added (not in PLAN.md). It redirects the three admin pages to sign-in
  with a 307 when the cookie is missing, because Chromium aborted `page.goto("/admin")` on the
  streamed redirect. ARCHITECTURE.md §Sessions and protected pages now records it.
- **D2** The orders screen keeps the Order-approval design plus Refresh; the mockup's title,
  counts and "Commit 2 changes" label were not built.
- **D3** Real-schema fixtures live in `src/admin/fixtures.test.ts`, because the locked harness
  writes catalog columns that do not exist (design SD2). An amendment dispute was filed.
- **D4** `e2e/home.spec.ts` and `e2e/approval.spec.ts` were updated: `/admin` is no longer a
  placeholder and sign-in now lands on `/admin`.

## Verification

From `qa-test-report.md` and `integration-test-result.md`, on the integrated sprint branch:
- `npm test -- --coverage`: 75 suites, 360 tests passed; 95.85% lines, 81.14% branches.
- `npm run test:e2e -- --project=chromium`: 25 passed, 0 failed, 0 skipped.
- Live checks against a production build covered sign-in, error, logout, the session-timeout
  message, GETORDERS, REVENUE (FISH 297, DOGS 148, Total 445), ORDERS, the date format and the
  launch descriptor.
- Locked acceptance (warning only): e2e 19 passed, 2 failed; jest 188 passed, 2 failed, plus 2
  suites that need later capabilities.
- Design: all ten mockups differ (3.9% to 25.2% of pixels), mainly because the built pages use the
  approved site shell rather than the mockups' own shell, and because of D2.

## Known Issues

- **SWHM2-C-0240, SWHM2-C-0243** — locked report tests fail in `harness.ts` `insertItem`, which
  uses catalog columns absent from the real schema; amendment dispute filed (finding 4f3e50f9).
- **SWHM2-C-0226** — locked site-shell test fails `page.goto /admin` with `net::ERR_ABORTED` in the
  acceptance run, even after `src/proxy.ts`.
- **SWHM2-C-0179** — locked inventory-rows test fails in `order-fulfilment.spec.ts`; not touched by
  this sprint.
- Orders and reports screens do not match their mockups (D2 and the shell difference above).

## Retrospective

**Went well**
- One FEATURE carried the whole change, and QA found no defects in its first round.
- QA checked every scenario live against a production build, not only by test, including the XML
  protocol and logout.
- The harness-schema problem was known at planning (SD2), so the engineer filed the dispute and
  covered both cases with real-schema tests instead of changing the schema.

**Could improve**
- The plan did not anticipate the streamed-redirect abort; the proxy was added as a deviation. A
  plan that adds a protected primary-area page should say how a browser `goto` reaches it.
- The mockups drew their own shell and renamed the orders screen, so every design verdict was
  "differs". Mockups should be drawn inside the approved shell and from the screen that will be
  reused.
- QA measured the admin screens with no held changes and no sales data, so the mockups' sample
  states were never compared. A plan should name the data state each mockup needs.
- The locked acceptance e2e suite is unstable under parallel dev-server load; C-0226 still fails.

## Compliance / Control Evidence

- Spec traceability: 15 scenarios of `swhm2-i-0009-administration-of-orders`, all PASS
  (`qa-test-report.md`); FEATURE AC 1–15 map to cases SWHM2-C-0230 to C-0244.
- `tasks.md`: stamped by the platform for SWHM2-T-0050 (`d0900c1`).
- Root docs at close: ARCHITECTURE.md §Sessions and protected pages records `src/proxy.ts`.
  Planning had already updated ARCHITECTURE.md and DESIGN.md (`240afa6`). PRODUCT.md already lists
  admin-order-management; AGENTS.md is human-authored and unchanged. No `## Changelog` entry: the
  commit carries the change, per the planning role's root-doc rule.
