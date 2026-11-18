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

## Sprint planning (SWHM2-S-0004)

Planned on SWHM2-T-0018. The whole change is one FEATURE, **SWHM2-T-0019**, plan at
`artifacts/SWHM2-S-0004/SWHM2-T-0019/PLAN.md`. Approved mockups: `artifacts/SWHM2-S-0004/design/`.

### Codebase findings

- `/cart` is the bootstrap placeholder (`src/app/(DashboardLayout)/cart/page.tsx` renders
  `PlaceholderPage`); `MENU_ITEMS` in `src/shell/menu.ts` already links it. No cart code exists.
- The locked suite `tests/acceptance/shopping-cart/` fixes the contract: `src/cart/cart.ts`
  (sync, mutable cart object) and `src/cart/listing.ts` (`listCart(cart, { catalog, locale? })`
  with an injected catalog lookup). Its `harness.ts` header is the interface; the E2E spec needs an
  "Add to cart" button on `/catalog/items/EST-1`, the item id on `/cart`, and a check-out link in
  `main` that ends on a URL containing `/checkout`.
- `src/accounts/session.ts` has a `Cart = { language }` stub used only by sign-on; it carries no
  lines. `web_session` rows exist only after sign-on (`saveSession` in the sign-on route), so an
  anonymous shopper has no server-side session to hang a cart on.
- `getItem(db, itemId, locale)` in `src/catalog/queries.ts` returns a `CatalogItem` with both
  `listPrice` and `unitCost`. The spec's "unit cost" is the catalog **list** price (`listPrice`);
  `CatalogItem.unitCost` is the supplier cost and must not be used.
- The sample catalog (`data/catalog/sample-catalog.xml`) has `en_US` rows only; the catalog pages
  read `STOREFRONT_LOCALE` (`src/catalog/screen.ts`).
- Forms post to route handlers that answer 303 via `seeOther()` (`src/app/api/accounts/redirects.ts`).
- `requireSignOn(path)` redirects to `/signon?returnTo=<encoded path>`; `SignOnView` already names
  `/checkout` as a destination. No `/checkout` page exists; checkout is SWHM2-I-0005.

### Decisions

- **P1 Pure model, persisted per visit.** `src/cart/cart.ts` holds every rule (replace on add,
  default 1, `<= 0` or non-whole removes, distinct-line count). Storage only loads and saves it.
- **P2 Storage.** A new `shopping_cart` table: `cart_id` (text, PK), `contents` (text, the
  item-id→quantity map as JSON), `last_access` (integer ms). The browser holds only the random id
  in an HttpOnly `pet_cart` cookie (Path=/, SameSite=Lax), set by the cart route the first time a
  line is written. This follows the session decision of change
  `swhm2-i-0003-customer-accounts-and-sign` (P6–P7): no state in the cookie, and a server
  component can refresh a row. The cart is independent of `web_session`, so it survives sign-on.
- **P3 Visit lifetime.** A cart idle for `IDLE_LIMIT_MS` (15 min, `src/accounts/session.ts`) is
  treated as empty and its row deleted on next read; every read or write refreshes `last_access`.
  This is the mockup's "kept for this visit — ends after 15 minutes of inactivity".
- **P4 Mutations.** One route, `POST /api/cart`, form field `action` = `add` | `update` |
  `remove` | `empty`, answering 303 to `/cart`. `add` takes `itemId` and an optional `quantity`;
  the item page sends no quantity. `update` takes one `qty:<itemId>` field per line and applies
  `updateQuantity` to each (so `"abc"` removes). Plain form posts, like sign-on.
- **P5 Listing.** The `/cart` page builds the `catalog` lookup from `getItem` with
  `unitCost`/`listCost` = `listPrice` and rejects when `getItem` returns null, so a missing item is
  omitted (R-0191). The page passes `STOREFRONT_LOCALE`; `listCart` defaults to `en_US`
  (R-0192.02). Following the signed-on profile language would hide every line today, since the
  catalog has only `en_US` rows; Localisation (SWHM2-I-0010) switches the page to the shopper's
  language.
- **P6 Check out.** The cart's "Proceed to checkout" link goes to `/checkout` when signed on and
  to `/signon?returnTo=/checkout` otherwise (the brief's "through sign-on"). A minimal
  `/checkout` page calls `requireSignOn("/checkout")` and renders `PlaceholderPage`; SWHM2-I-0005
  replaces the page at that path, never the path.
- **P7 States.** No lines → `EmptyFrame` ("Your cart is empty", link to `/catalog`). A load failure
  → the route's existing `error.tsx` (shared `ErrorFrame` with Retry). Nav count and summary
  "Items" use `getItemCount`.

### Phases (in `tasks.md` order)

1. Cart model — `src/cart/cart.ts` + unit tests; `shopping_cart` schema, generated migration and
   `src/cart/store.ts` (load/save/clear by cookie id, idle rule).
2. Cart listing — `src/cart/listing.ts` + unit tests.
3. Input handling and flow — `POST /api/cart` + route test; "Add to cart" on the item page;
   `/cart` page and `CartView` per the mockups; `/checkout` placeholder; a Playwright spec for
   add → cart → check out.
4. Test harness — the locked unit and E2E acceptance specs in `tests/acceptance/shopping-cart/`
   pass unedited, alongside the project's own unit, route, component and E2E tests.
5. CI — no workflow change is needed: the existing CI runs the unit, acceptance and E2E tiers on
   pushes and pull requests to `vortex/**`; the new specs join those tiers by location.

## Spec discrepancies

Recorded, not edited into the delta spec. Also posted on SWHM2-T-0018.

- **SD1 Unit cost naming.** Spec and brief say unit cost = catalog list cost. This repository's
  `CatalogItem` has a separate `unitCost` (supplier cost). The cart uses `listPrice` (P5).
- **SD2 Per-session storage.** Legacy kept the cart in a stateful session bean. Here a session row
  exists only after sign-on, so the cart gets its own row and cookie (P2). Behaviour is the same.
- **SD3 Shopper's locale.** The spec reads catalog text in the shopper's locale. The catalog holds
  only `en_US`, and catalog pages are fixed to `STOREFRONT_LOCALE` until Localisation; the cart page
  follows them (P5). `listCart` itself honours any locale passed.
- **SD4 Checkout target.** R-0193.01 "proceeds to checkout", but checkout is SWHM2-I-0005. This
  change adds a sign-on-protected `/checkout` placeholder (P6).
- **SD5 Add quantity unvalidated.** Legacy `addItem(id, qty)` stores zero or negative values; the
  spec is silent. The UI never sends a quantity on add, so the path is unreachable; `addItem` is
  left as the harness describes. Open point for the Business Owner, like the silent omission (R-0191).
