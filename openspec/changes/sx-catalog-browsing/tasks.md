## 1. Data model

- [ ] 1.1 Define category and per-locale category details with 10-character ids
- [ ] 1.2 Define product and per-locale product details with category foreign key
- [ ] 1.3 Define item and per-locale item details with prices and five attributes
- [ ] 1.4 Add indexes on product.catid and item.productid

## 2. Catalog queries

- [ ] 2.1 Implement paged category listing ordered by name per locale
- [ ] 2.2 Implement paged product listing by category ordered by name
- [ ] 2.3 Implement paged item listing by product
- [ ] 2.4 Implement single category, product and item lookup returning null on miss
- [ ] 2.5 Implement paging rules for negative and out-of-range offsets

## 3. Search

- [ ] 3.1 Implement keyword tokenising and de-duplication
- [ ] 3.2 Implement any-keyword case-insensitive match over name, category id and description
- [ ] 3.3 Return an empty page for blank queries without querying

## 4. Configuration and errors

- [ ] 4.1 Select SQL dialect by configured database identifier
- [ ] 4.2 Surface data-store failures as system errors with the underlying message

## 5. Storefront

- [ ] 5.1 Build category, product, item and search pages with paging
- [ ] 5.2 Build the sample-data populate tool
