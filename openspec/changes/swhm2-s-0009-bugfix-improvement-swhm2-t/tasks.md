## 1. Shell breadcrumb (SWHM2-T-0010)

- [ ] 1.1 Hide the shell trail on catalog pages, and render a non-last crumb as a link only when its path is a known page route (SWHM2-T-0010; Shell breadcrumb trail)
- [ ] 1.2 Add a component test covering the catalog detail, catalog search, `/checkout/orders/<id>` and `/admin/orders` trails, and a check that every known route has a page; existing shell tests keep passing (SWHM2-T-0010; Shell breadcrumb trail)

## 2. Populate endpoint access (SWHM2-T-0009)

- [ ] 2.1 Refuse an anonymous populate call with 401 in a production configuration; allow an administrator session, and any caller outside production (SWHM2-T-0009; SWHM2-R-0147)
- [ ] 2.2 Extend the populate route test with the refused, administrator and non-production cases; the locked catalog-browsing e2e still passes unchanged (SWHM2-T-0009; SWHM2-R-0147)
- [ ] 2.3 Reword the empty-catalog message so it no longer names the endpoint (SWHM2-T-0009; SWHM2-R-0147)

## 3. i18n item details (SWHM2-T-0008)

- [ ] 3.1 File the `target: "test"` amendment on SWHM2-C-0169 asking the Test Author to seed the catalog's real tables per design.md D3; add no table or view (SWHM2-T-0008; SWHM2-R-0001)
