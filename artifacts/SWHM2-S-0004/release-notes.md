---
artifact: release-notes
sprint: SWHM2-S-0004
ticket: SWHM2-T-0021
author: planning
---

# Release notes — SWHM2-S-0004

## Shoppers can fill a cart

**Cart** is now a working area. Shoppers can collect several pets and head for checkout, whether
or not they are signed on.

### New

- **Add to cart** from any item page. The item goes in with a quantity of 1. Adding an item that
  is already in the cart replaces its quantity; it never adds a second line.
- **The cart** (`/cart`) lists each item with its product, category, name, attribute, quantity,
  unit cost and line total, plus a subtotal. The unit cost is the catalog list price. Totals are
  not rounded along the way.
- **Change quantities** and press Update cart:
  - A quantity of zero or less removes the line.
  - Anything that is not a whole number, such as "abc", counts as zero and also removes the line.
- **Remove** one line, or **Empty cart** after a confirmation.
- **Item count** in the summary and next to Cart in the navigation. It counts different items,
  not total quantity.
- **Proceed to checkout** goes straight to checkout when you are signed on. Otherwise it goes to
  sign-on first, then on to checkout.
- **An empty cart** says "Your cart is empty" and links to the catalog.
- **Items the catalog can no longer find** are left out of the cart and the subtotal. The rest of
  the cart still shows.
- **The cart lasts for your visit.** It is kept across sign-on and cleared after 15 minutes of
  inactivity.

### Not available yet

- Checkout itself: `/checkout` is a placeholder until Checkout and payment ships.
- Catalog text in the cart is US English until Localisation ships.
- The mobile cart does not yet have the mockup's line layout or sticky checkout bar.

### For developers

- **Cart code:**
  - The rules live in `src/cart/cart.ts`, a pure model.
  - The listing is `src/cart/listing.ts`: `listCart(cart, { catalog, locale? })`, with an injected
    catalog lookup.
  - Storage is `src/cart/store.ts`.
- **API:** `POST /api/cart` takes the form field `action` = `add` | `update` | `remove` | `empty`
  and answers 303 to `/cart`. The first write sets the HttpOnly `pet_cart` cookie, which holds
  only the cart's id.
- **New migration:** `drizzle/0003_*` adds `shopping_cart` (`cart_id`, `contents` JSON,
  `last_access`).
- **Shell:** `SidebarItems` takes a `cartCount` prop, and the layout reads it on the server.
- **Unit cost:** the cart uses `CatalogItem.listPrice`, not `CatalogItem.unitCost`, which is the
  supplier cost.

### Known issues

None open. Some screens differ from the mockups in shell chrome, button styling and the mobile
layout; see `qa-test-report.md` § Design fidelity.

The evidence comes from `qa-test-report.md`:
- Unit suite: 26 suites and 149 tests passed.
- E2E: 17 tests passed.
- The locked shopping-cart acceptance tests pass.
