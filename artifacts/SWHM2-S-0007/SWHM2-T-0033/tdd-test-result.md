---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: SWHM2-S-0007
ticket: SWHM2-T-0033
branch: vortex/feat/SWHM2-T-0033-order-fulfilment-and-invoicing-c874e95b
upstream: [artifacts/SWHM2-S-0007/SWHM2-T-0033/PLAN.md]
---

# TDD result — SWHM2-T-0033

## Test cases

Every case SWHM2-C-0175 to C-0224 has a test whose title carries its key, in:
`src/fulfilment/{schema,orders,fulfilment,inventory,uidgen,documents}.test.ts`,
`src/components/fulfilment/InventoryView.test.tsx` (C-0179, C-0195),
`src/app/api/admin/inventory/route.test.ts` (C-0195, C-0211),
`src/app/api/supplier/purchase-orders/route.test.ts` (C-0210, C-0211) and `e2e/inventory.spec.ts`.

## Notes

- Red run id `ba47ac7a-9488-4015-8f6b-ebd845a01ccd` (commit 30a69e5): every case failed on an assertion or the stub.
- Green run id `1a853bf2-20df-4e70-a306-b8043ea37b0d`: all 50 cases pass.
- Tests changed after red (listed by the platform): an import and test-DB isolation (`useIsolatedDatabase`) added to the fulfilment tests, and the checkout route test's expectations updated for fulfilment. No assertion was weakened.
- Locked acceptance: C-0195 and C-0211 pass in the browser. C-0179's locked spec fails by strict-mode violation (`locator("tr", { has: quantities.nth(i) })` matches every row); disputed (finding 20b504f5).
- Full gate: `node .vortex/check-versions.mjs && npm run verify` passes (eslint --max-warnings 0, prettier, typecheck, jest 57 suites / 290 tests); `npm run test:e2e` 21 passed.
