# SWHM2-T-0046 — QA rework: a test citing SWHM2-C-0169

Cause: no test in the official run cites SWHM2-C-0169. The locked test cites it but cannot run (needs `src/i18n/`, and seeds a nonexistent `item_detail` table; see SWHM2-T-0008).
Fix: add `src/i18n/catalog.ts` (`getCatalogItem(db, itemId, locale) => { name, description, image } | null`, the locked contract) over the real `item_details` / `product_details` tables, with `src/i18n/catalog.test.ts` citing the case.
Verify: `npx jest src/i18n`, then `npm run verify`.
