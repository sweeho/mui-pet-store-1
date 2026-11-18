---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHM2-S-0010
capability brief: SWHM2-I-0009
branch: vortex/sprint/swhm2-s-0010-28ca48f8
upstream: [artifacts/SWHM2-S-0010/qa-test-report.md]
---

# Release notes — SWHM2-S-0010

## Added

- **Admin sign-in.** Administrators sign in at `/admin/login` with a user ID and password. A
  failed sign-in shows an error page with a link back to sign-in. (SWHM2-T-0050)
- **Admin home.** `/admin` offers **Launch Rich Client** and **Log out**. Logging out ends the
  session, and the next request asks for sign-in again. (SWHM2-T-0050)
- **Sales reports.** `/admin/reports` shows revenue or quantity sold per category with a grand
  total, or per item for one category, as a bar or pie chart. Dates must be MM/dd/yyyy.
  (SWHM2-T-0050)
- **Rich-client requests.** `POST /api/admin/appl` answers order listing, status updates and
  sales reports in XML; `POST /api/admin/process` returns the launch descriptor. A request
  without an admin session gets "Session Timed Out; Please exit and login as admin from the login
  page" and is not processed. (SWHM2-T-0050)

## Changed

- **Admin pages require sign-in.** `/admin`, `/admin/orders` and `/admin/reports` send a visitor
  without an admin session to `/admin/login`. `/admin` is no longer a placeholder.
- **Sign-in lands on the admin home** (`/admin`) instead of the orders screen.
- **Orders screen has Refresh.** It asks for confirmation before discarding approve or deny
  changes that have not been committed.

## Fixed

- Nothing.

## Upgrade notes

- No database migration and no new settings.

## Not included

- Admin sessions have no idle timeout of their own (design SD6 not adopted).
- The orders screen keeps the Order-approval layout; the mockup's renamed title and change count
  are not built.
- Four locked acceptance tests still fail (SWHM2-C-0240, C-0243, C-0226, C-0179); see
  `sprint-summary.md` Known Issues.

## Verification

- Integration QA passed all 15 scenarios with no defects: 360 unit tests and 25 E2E tests passed
  (`qa-test-report.md`).

## Compliance / Control Evidence

- Change `swhm2-i-0009-administration-of-orders`; tickets SWHM2-T-0049, SWHM2-T-0050,
  SWHM2-T-0051, SWHM2-T-0052.
