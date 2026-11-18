---
ticket: SWHM2-T-0019
---
# TDD result

## Notes

Cases SWHM2-C-0064 to SWHM2-C-0077 are recorded by the platform.

- Red run: `b456ae69-f76f-4f53-823b-dd5df7d29b94` at `bb91d94`, valid. Stubs threw `VortexNotImplemented`;
  the item-page test failed on an assertion. (A first red, `76779e2b`, was invalid: that test errored on a
  missing button instead of asserting. Fixed in a new `[tdd:red]` commit.)
- Green run: `52fddc00-5ce5-4c59-bfea-03668f2ec82c` at `b2ef60a`, valid, all 14 cases pass. The platform
  could not read the unit acceptance report (no JUnit file); the locked `tests/acceptance/shopping-cart/`
  unit suite passes locally and its E2E case (C-0077) passed in the platform run.
- Own tests: `src/cart/{cart,listing,store}.test.ts`, `src/app/api/cart/route.test.ts`,
  `src/components/cart/CartView.test.tsx`, `src/components/catalog/catalog-views.test.tsx`, `e2e/cart.spec.ts`.
- `CartView.test.tsx` was edited after red to match the mockup's empty-state button ("Catalog & search").

- Return 1 (CI): the e2e specs timed out on a fresh database because the sample catalog was not loaded
  (item page said not found). `getDb()` now loads the sample catalog when it prepares a new database file.
