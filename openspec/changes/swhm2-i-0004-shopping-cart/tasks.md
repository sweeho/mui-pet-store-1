## 1. Cart model

- [x] 1.1 Implement a per-session cart keyed by item id with one quantity per line (SWHM2-T-0019; SWHM2-R-0114, SWHM2-R-0118)
- [x] 1.2 Implement add with replace semantics, defaulting quantity to 1 (SWHM2-T-0019; SWHM2-R-0118)
- [x] 1.3 Implement quantity update (<= 0 removes, positive sets) (SWHM2-T-0019; SWHM2-R-0117)
- [x] 1.4 Implement remove-item, empty-cart and distinct-line item count (SWHM2-T-0019; SWHM2-R-0119, SWHM2-R-0116)

## 2. Cart listing

- [x] 2.1 Build cart lines from the catalog in the shopper's locale (default US English) (SWHM2-T-0019; SWHM2-R-0192)
- [x] 2.2 Compute line totals and unrounded subtotal (SWHM2-T-0019; SWHM2-R-0032)
- [x] 2.3 Omit items whose catalog lookup fails from lines and subtotal (SWHM2-T-0019; SWHM2-R-0191)

## 3. Input handling and flow

- [x] 3.1 Treat non-integer submitted quantities as 0 (SWHM2-T-0019; SWHM2-R-0115)
- [x] 3.2 Support add-from-catalog and proceed to checkout (SWHM2-T-0019; SWHM2-R-0193)
- [x] 3.3 Add tests covering each scenario in the spec (SWHM2-T-0019; SWHM2-R-0114, SWHM2-R-0118, SWHM2-R-0117, SWHM2-R-0115, SWHM2-R-0119, SWHM2-R-0116, SWHM2-R-0192, SWHM2-R-0032, SWHM2-R-0191, SWHM2-R-0193)
