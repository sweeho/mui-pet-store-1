# Proposal: shopping-cart

## Why
Recover the behaviour of the legacy Pet Store shopping cart (per-session cart, quantity rules, line/subtotal computation, add-from-catalog) so it can be rebuilt and verified.

## What changes
- Adds a `shopping-cart` capability spec with 10 requirements, one per extracted record.

## Impact
Feeds checkout-and-payment (cart contents are the checkout input) and catalog-browsing (add-to-cart, line details come from the catalog).
