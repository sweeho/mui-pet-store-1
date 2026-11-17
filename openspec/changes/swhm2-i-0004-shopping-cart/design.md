# Design notes: shopping-cart (legacy implementation)

## User interface
No screen records were extracted for this capability; its user interface is unspecified.

## Legacy implementation
- The cart is a stateful session bean (`ShoppingCartLocalEJB`) holding a HashMap of item id to Integer quantity. `addItem` uses `put`, so re-adding replaces the quantity. The quantity argument of `addItem(id, qty)` is not validated, so zero or negative values can be stored through that path; only the update path removes lines at quantity <= 0.
- `CartHTMLAction` (web tier) parses submitted quantities; `NumberFormatException` is caught and replaced with 0, which the bean then treats as removal.
- Cart lines for display are built by querying the catalog per item in the shopper's locale (default US English); a failed lookup skips the item silently, so it is also absent from the subtotal.
- Line total = quantity x list cost; subtotal = sum; no tax, shipping, discount or rounding.
- Item count is the map size (distinct lines).

## Open points
- Replace-vs-accumulate on re-add is inferred from `HashMap.put`; no test or document states it (confidence medium).
- Silent omission of unavailable items may be a defect for the Business Owner to confirm.
- Records `shopping-cart-REQ-0001`/`CART-REQ-0001`, `shopping-cart-REQ-0002` and `CART-REQ-0005` overlap; each is written as its own requirement.
