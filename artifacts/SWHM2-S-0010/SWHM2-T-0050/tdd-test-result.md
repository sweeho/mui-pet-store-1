---
ticket: SWHM2-T-0050
---
# TDD result

## Test cases
SWHM2-C-0230 to SWHM2-C-0244 (15 cases). Tests cite the key in their title: `src/admin/{orders,reports,launch,session}.test.ts`,
`src/app/api/admin/{appl,process,logout}/route.test.ts`, `src/app/api/admin/routes.test.ts`,
`src/components/admin/{AdminHomeView,SalesReportView,SalesChart,OrderApprovalView}.test.tsx`, `e2e/admin.spec.ts`.

## Red run
Platform run `d6c8ad4d-2733-4dd9-b2bb-618db1821307` at `f92509c`: valid; every linked case failed on an assertion or the
`VortexNotImplemented` stub. The first attempt (`90ec7c64`) was invalid (a non-stub fixture file, a real route handler, an
erroring Refresh query) and was fixed before this one.

## Green run
Platform run `9850fb26-960c-4a06-b7d4-3996e6e3d696` at `9c18f5b`: valid; every linked case passes. Locked acceptance run
`ea286cf6`: e2e cases C-0232, C-0234, C-0241, C-0242 pass; the unit-level locked tests were not judged (no JUnit report).
Locally: `npm run test:acceptance` passes except C-0240 and C-0243 (harness catalog columns; disputed, finding 4f3e50f9)
and two suites for other capabilities that import modules that do not exist (batch-operations, internationalisation).

## Notes
Full gate on the final tree: see summary.md.
