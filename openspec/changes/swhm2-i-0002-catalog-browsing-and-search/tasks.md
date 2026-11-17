## 1. Data model

- [x] 1.1 Define category and per-locale category details with 10-character ids (SWHM2-T-0007; SWHM2-R-0019)
- [x] 1.2 Define product and per-locale product details with category foreign key (SWHM2-T-0007; SWHM2-R-0021, SWHM2-R-0022)
- [x] 1.3 Define item and per-locale item details with prices and five attributes (SWHM2-T-0007; SWHM2-R-0020, SWHM2-R-0001, SWHM2-R-0148)
- [x] 1.4 Add indexes on product.catid and item.productid (SWHM2-T-0007; SWHM2-R-0007, SWHM2-R-0008)

## 2. Catalog queries

- [x] 2.1 Implement paged category listing ordered by name per locale (SWHM2-T-0007; SWHM2-R-0054)
- [x] 2.2 Implement paged product listing by category ordered by name (SWHM2-T-0007; SWHM2-R-0122)
- [x] 2.3 Implement paged item listing by product (SWHM2-T-0007; SWHM2-R-0055, SWHM2-R-0149)
- [x] 2.4 Implement single category, product and item lookup returning null on miss (SWHM2-T-0007; SWHM2-R-0056)
- [x] 2.5 Implement paging rules for negative and out-of-range offsets (SWHM2-T-0007; SWHM2-R-0052)

## 3. Search

- [x] 3.1 Implement keyword tokenising and de-duplication (SWHM2-T-0007; SWHM2-R-0058)
- [x] 3.2 Implement any-keyword case-insensitive match over name, category id and description (SWHM2-T-0007; SWHM2-R-0123)
- [x] 3.3 Return an empty page for blank queries without querying (SWHM2-T-0007; SWHM2-R-0057)

## 4. Configuration and errors

- [x] 4.1 Select SQL dialect by configured database identifier (SWHM2-T-0007; SWHM2-R-0009)
- [x] 4.2 Surface data-store failures as system errors with the underlying message (SWHM2-T-0007; SWHM2-R-0053)

## 5. Storefront

- [x] 5.1 Build category, product, item and search pages with paging (SWHM2-T-0007; SWHM2-R-0147)
- [x] 5.2 Build the sample-data populate tool (SWHM2-T-0007; SWHM2-R-0147)
