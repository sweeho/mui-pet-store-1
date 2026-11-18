---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHM2-S-0009
capability brief: swhm2-s-0009-bugfix-improvement-swhm2-t
branch: vortex/sprint/swhm2-s-0009-6b270918
upstream: [artifacts/SWHM2-S-0009/qa-test-report.md]
---

# Release notes — SWHM2-S-0009

## Added

- Nothing new.

## Changed

- **Loading sample data needs an administrator in production.** `POST /api/catalog/populate`
  now refuses an anonymous call with 401 when the app runs in production. Development and test
  are unchanged. (SWHM2-T-0009)
- **Empty catalog message.** It now reads "No categories have been loaded yet. An administrator
  can load the sample data." and no longer names the endpoint. (SWHM2-T-0009)

## Fixed

- **One breadcrumb trail on catalog pages.** Item, product, category and search pages showed two
  trails; they now show only the catalog's own. (SWHM2-T-0010)
- **No breadcrumb links to missing pages.** "Items", "Products", "Categories" and "Orders" crumbs
  no longer link to pages that do not exist; they show as plain text. (SWHM2-T-0010)

## Upgrade notes

- A production deployment that scripted `POST /api/catalog/populate` must now send an
  administrator session cookie. A new database is still populated automatically on first use.
- No database migration and no new settings.

## Not included

- The i18n acceptance-test fix (SWHM2-T-0008) was deferred; it awaits the Test Author.
- Known flaky catalog browse e2e (SWHM2-T-0047), unrelated to this release.

## Verification

- Integration QA passed all 9 scenarios: 326 unit tests passed, 20 of 21 E2E passed (the one
  failure is the SWHM2-T-0047 flake) (`qa-test-report.md`).

## Compliance / Control Evidence

- Change `swhm2-s-0009-bugfix-improvement-swhm2-t`; tickets SWHM2-T-0041, SWHM2-T-0009,
  SWHM2-T-0010, SWHM2-T-0045, SWHM2-T-0048; SWHM2-T-0008 deferred.
