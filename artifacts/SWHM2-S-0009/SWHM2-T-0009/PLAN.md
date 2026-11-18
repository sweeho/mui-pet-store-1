# SWHM2-T-0009 — Restrict POST /api/catalog/populate to administrators

Change: `swhm2-s-0009-bugfix-improvement-swhm2-t`. Read `design.md` §D2 first.

## Objective

In a production configuration, an anonymous call to the populate endpoint is refused, while administrators and development/test callers can still load the sample data. Requirement: **Storefront screens and populate tool** (SWHM2-R-0147, catalog-browsing).

## Approach (confirmed against the code)

`src/app/api/catalog/populate/route.ts:7-17` calls `populateCatalog` without checking anything. `src/admin/session.ts` already exports `hasAdminSession(request)` and `unauthorized()`, which the admin API routes use. The locked catalog-browsing e2e calls the endpoint anonymously against `next dev`, so a check that is active only when `NODE_ENV === "production"` leaves the e2e passing without an amendment.

## Steps

1. Change the route to `POST(request: Request)` and add the guard from design.md §D2 before any database access.
2. Update `route.test.ts`: pass a `Request` to the existing C-0018 test, and add the production-anonymous (401, row counts unchanged), production-admin (200) and non-production-anonymous (200) cases (design.md §D2 says how to switch `NODE_ENV` and create a session).
3. Reword the empty-catalog message in `CategoryListView.tsx` (design.md §D2). The title stays "The catalog is empty".
4. Run the full gate, including the locked catalog-browsing e2e.

## File/module ownership

- `src/app/api/catalog/populate/route.ts` (modify)
- `src/app/api/catalog/populate/route.test.ts` (modify)
- `src/components/catalog/CategoryListView.tsx` (modify, message text only)

## Definition of Done

- AC-1 to AC-5 met; AC-1 to AC-4 are covered by the route test, and AC-5 by the catalog views test or a new assertion in it.
- The locked catalog-browsing acceptance e2e passes unchanged.
