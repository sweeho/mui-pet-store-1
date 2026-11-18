# SWHM2-T-0009 summary

POST /api/catalog/populate now takes the `Request` and, when `NODE_ENV === "production"` without an admin session, returns `unauthorized()` (401) before touching the database. Development and test stay open. The empty-catalog message now reads "An administrator can load the sample data." with the title unchanged.

Files: `src/app/api/catalog/populate/route.ts`, `route.test.ts`, `src/components/catalog/CategoryListView.tsx`, `catalog-views.test.tsx`.

AC coverage: AC-1 (C-0245), AC-2 (C-0246), AC-3 (C-0247) in the route test; AC-4 (C-0248) in the views test. C-0246 and C-0247 already passed at red.

Verification: `node .vortex/check-versions.mjs && npm run verify:full` exit 0 (e2e 21 passed, locked catalog-browsing e2e unchanged).

CODE-REVIEW: self-review — change is a 4-line guard and a string; reviewed the diff against design.md D2, no findings.
