## 1. Cart model

- [ ] 1.1 Implement a per-session cart keyed by item id with one quantity per line
- [ ] 1.2 Implement add with replace semantics, defaulting quantity to 1
- [ ] 1.3 Implement quantity update (<= 0 removes, positive sets)
- [ ] 1.4 Implement remove-item, empty-cart and distinct-line item count

## 2. Cart listing

- [ ] 2.1 Build cart lines from the catalog in the shopper's locale (default US English)
- [ ] 2.2 Compute line totals and unrounded subtotal
- [ ] 2.3 Omit items whose catalog lookup fails from lines and subtotal

## 3. Input handling and flow

- [ ] 3.1 Treat non-integer submitted quantities as 0
- [ ] 3.2 Support add-from-catalog and proceed to checkout
- [ ] 3.3 Add tests covering each scenario in the spec
