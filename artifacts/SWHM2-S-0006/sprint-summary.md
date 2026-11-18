---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHM2-S-0006
capability brief: SWHM2-I-0006
branch: vortex/sprint/swhm2-s-0006-d274d678
upstream: [artifacts/SWHM2-S-0006/SPRINT-PLAN.md, artifacts/SWHM2-S-0006/qa-test-report.md]
---

# Sprint summary — SWHM2-S-0006

**Goal:** SWHM2-I-0006: Order approval. **Outcome: met.** Integration QA gave PASS on all 16
scenarios of change `swhm2-i-0006-order-approval`. It found no defects, and no defect is left open.

## Tickets

| Ticket | Type | Title | Outcome |
| --- | --- | --- | --- |
| SWHM2-T-0028 | TASK | Sprint plan — SWHM2-S-0006 | DONE (`342b2a6`): design.md planning section P1–P9 and SD1–SD6, `tasks.md` tagged, 4 mockups exported, ARCHITECTURE.md and DESIGN.md updated |
| SWHM2-T-0029 | FEATURE | Order approval | DONE (`1cb0bc8`): every `tasks.md` line; see `SWHM2-T-0029/summary.md` |
| SWHM2-T-0030 | TASK | Integration QA report — SWHM2-S-0006 | DONE (`8ac13a2`): PASS, no defects |
| SWHM2-T-0031 | TASK | Sprint close bundle — SWHM2-S-0006 | DONE: this file and `release-notes.md` |

## What shipped

Against the goal, all of it:
- Orders are approved automatically when strictly under the regional limit: US under 500, Japan
  under 50,000. Every other order, and every order from another country, stays PENDING.
- Checkout hands each placed order to approval; the decision is processed in-process and recorded
  in `message_outbox` (P3, P4).
- An approved order produces a supplier purchase order with all its lines. Every changed order is
  queued for customer notification. A decision for a non-PENDING order is ignored.
- Administrators sign in at `/admin/login` and approve or deny PENDING orders on `/admin/orders`.
  Choices are held until **Commit**, and only changed orders are sent.
- Migration `drizzle/0005_*` adds `purchase_order`, `order_line`, `order_manager`,
  `message_outbox` and `admin_session`.

## Divergence from plan

- **Order id columns are NUMERIC, not text (P1).** The locked harnesses insert integer ids that
  the driver binds as REAL, so `304.0` and `"304"` must compare equal. Text ids such as `10011`
  stay text. Recorded in `SWHM2-T-0029/summary.md`.
- **Two tokens and one typeface outside the ownership map.** `success` and `warning` in
  `design/tokens.mui.json` now match the mockups, and JetBrains Mono is loaded in
  `src/app/layout.tsx`. DESIGN.md was updated at close to record both (see Compliance).
- Otherwise as planned: no navigation entry, `/admin` unchanged (P6).

## Verification

PASS. See `qa-test-report.md`:
- Unit: 48 suites, 232 tests passed. Line coverage 94.68%.
- Project E2E: 20 of 20 passed, including `e2e/approval.spec.ts`.
- Order-approval acceptance: 13 Jest and 3 Playwright tests passed (C-0027, C-0028, C-0029).
- Locked suites of later capabilities still fail, as expected. They are warnings, judged at UAT.

No defects were found, and no fix rounds were needed (`integration-defects-resolution.md`).

## Defects Raised

None. No DEFECT ticket was created between sprint start (2026-11-18 04:30 UTC) and close.
SWHM2-T-0026 (BACKLOG, filed by ideation at 04:18) belongs to SWHM2-S-0005, not this sprint.

## Open points carried forward

These need a decision, not a fix. None blocks this sprint.
- **SD1 Admin credentials.** Admin sign-in uses `ADMIN_USER` / `ADMIN_PASSWORD`, defaulting to
  `j2ee` / `j2ee`. There is no admin role in the data. The session has no expiry and the cookie
  is not marked `Secure`. Owner: SWHM2-I-0009 and the Business Owner.
- **Non-atomic receive and dispatch.** A failure between the status update and the outbox write
  returns 500 with no retry. Owner: SWHM2-I-0010 / I-0011.
- **SD5 Total currency.** Limits compare the stored total as-is, whatever the locale, as the
  legacy store did.
- **Design fidelity (SWHM2-MCK-45 to MCK-48)** differs by 9–25% of pixels:
  - the site shell is used instead of the mockups' admin shell
  - the default tab is All, not Pending (SD2)
  - the button reads "Commit" with the count beside it (SD3)
  - there are 5 demo orders, against 8 in the mockups

## Retrospective

**Went well**
- One FEATURE carried the whole change. It took 33 minutes from the plan commit (04:35) to the
  QA report (05:09), and QA fixed nothing in place.
- SD1–SD3 settled the clashes between the mockups and the locked cases before the build: admin
  sign-in, All vs Pending and the Commit label. The build followed them without rework.
- The self-review caught a race: two messages for one PENDING order could both change it. The
  handler now claims the order conditionally.

**Could improve**
- **A token change was not in the plan.** The implementer changed `success` and `warning` to match
  the mockups. That is correct, but it is a design-system change, so DESIGN.md was out of date
  until close. PLAN.md should name the tokens a mockup needs when they differ from the theme.
- **Shell residuals repeat for a sixth sprint.** Every QA report records the same shell
  difference. A decision on the shared shell, or mockups drawn inside the app shell, would remove
  it.
- **Admin security now has three open points** (default credentials, no session expiry, no
  `Secure` cookie). SWHM2-I-0009 must close them before release.

## Compliance / Control Evidence

| Control | Evidence | Location | Status | Exception |
| --- | --- | --- | --- | --- |
| Change planned before build | design.md P1–P9, SD1–SD6; ticket PLAN.md | `openspec/changes/swhm2-i-0006-order-approval/design.md`, `artifacts/SWHM2-S-0006/SWHM2-T-0029/PLAN.md` | Satisfied | — |
| Tests executed | TDD red/green record | `artifacts/SWHM2-S-0006/SWHM2-T-0029/tdd-test-result.md` | Satisfied | — |
| Change verified before release | QA report, PASS on 16 scenarios | `artifacts/SWHM2-S-0006/qa-test-report.md` | Satisfied | — |
| Defects dispositioned | 0 found | `artifacts/SWHM2-S-0006/integration-defects-resolution.md` | Satisfied | — |
| Design conformance reviewed | Design check and QA design verdicts | `artifacts/SWHM2-S-0006/SWHM2-T-0029/design-check.md`, `qa-test-report.md` § Design fidelity | Satisfied | Residuals accepted (shell, SD2, SD3) |
| Root docs match the delivered system | ARCHITECTURE.md (planning), DESIGN.md (planning + close) | `ARCHITECTURE.md`, `DESIGN.md` | Satisfied | — |
| Release acceptance | Sprint approval | Not Provided | Pending Verification | Awaiting the sprint→dev land |
