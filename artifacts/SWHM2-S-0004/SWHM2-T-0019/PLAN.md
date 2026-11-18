# PLAN — SWHM2-T-0019 Shopping cart

Change `swhm2-i-0004-shopping-cart`. Read its `design.md` FIRST (sections "Sprint planning" P1–P7
and "Spec discrepancies"), then `specs/shopping-cart/spec.md` and `test-cases.md`.

## Objective

Every shopper gets one cart per visit, reached from **Cart** in the navigation: add from an item
page, change quantities, remove a line or empty the cart, see line totals and a subtotal, and
proceed to checkout through sign-on. All ten requirements of the change, all fourteen scenarios.

## Fixed interface contracts

Set by the locked suite `tests/acceptance/shopping-cart/harness.ts` (header comment). Do not change:

- `src/cart/cart.ts` — `createCart()`, `addItem(cart, itemId, quantity?)`,
  `updateQuantity(cart, itemId, quantity: number | string)`, `removeItem`, `emptyCart`,
  `getQuantity(cart, itemId): number | undefined`, `getItemIds(cart): string[]` (insertion order),
  `getItemCount(cart): number`.
- `src/cart/listing.ts` — `listCart(cart, { catalog, locale? }): Promise<{ lines, subtotal }>`;
  `catalog(itemId, locale)` resolves `{ productId, categoryId, name, attribute, listCost }` or
  rejects; line = `{ itemId, productId, categoryId, name, attribute, quantity, unitCost, total }`.
- E2E: "Add to cart" button on `/catalog/items/EST-1`; `/cart` shows the item id; a link in
  `main` named like "Proceed to checkout" whose destination URL contains `/checkout`.

## Steps (tasks.md order)

1. **1.1–1.4 Cart model** — `src/cart/cart.ts` (design.md P1) with `src/cart/cart.test.ts`.
   Then `shopping_cart` in `src/db/schema.ts`, the generated migration in `drizzle/`, and
   `src/cart/store.ts`: load / save / clear by cart id with the 15-minute idle rule (P2, P3).
2. **2.1–2.3 Cart listing** — `src/cart/listing.ts` with `src/cart/listing.test.ts`; a rejected
   lookup is caught per item; totals unrounded (P5).
3. **3.1–3.2 Input and flow** —
   - `src/app/api/cart/route.ts` + `route.test.ts` (`@jest-environment node`): `add` / `update` /
     `remove` / `empty`, 303 to `/cart`, sets `pet_cart` on first write (P4).
   - `ItemDetailView`: an "Add to cart" form posting `action=add`, `itemId` (no quantity).
   - `/cart` page (server): load cart, build the catalog lookup from `getItem` using `listPrice`
     (SD1) and `STOREFRONT_LOCALE` (SD3), render `src/components/cart/CartView.tsx` with lines,
     editable quantities + "Update cart", per-line Remove, "Empty cart" with confirm, summary
     (Items = `getItemCount`, Subtotal), "Proceed to checkout" (P6), `EmptyFrame` when no lines (P7).
   - `src/app/(DashboardLayout)/checkout/page.tsx`: `requireSignOn("/checkout")` + `PlaceholderPage`.
   - Component test `src/components/cart/CartView.test.tsx`; Playwright `e2e/cart.spec.ts`
     (add → cart → check out, signed out lands on sign-on with returnTo `/checkout`).
4. **3.3 Test harness** — the locked unit and E2E specs in `tests/acceptance/shopping-cart/` pass
   unedited; every case SWHM2-C-0064…0077 is green.
5. **CI** — no workflow change; new specs run in the existing tiers on `vortex/**`.

## Design reference

Approved mockups in `artifacts/SWHM2-S-0004/design/` (see `MANIFEST.md`):

| File | Route and state | Viewport |
| --- | --- | --- |
| `mockup-cart.html` | `/cart` with lines, signed out | 1440 |
| `mockup-cart-mobile.html` | same | 390 |
| `mockup-cart-empty.html` | `/cart` with no lines | 1440 |
| `mockup-cart-empty-mobile.html` | same | 390 |

Render each route beside its mockup. Colours, type and shape come from the theme only.

## File/module ownership

Create: `src/cart/cart.ts`, `src/cart/cart.test.ts`, `src/cart/listing.ts`,
`src/cart/listing.test.ts`, `src/cart/store.ts`, `src/cart/store.test.ts`,
`src/app/api/cart/route.ts`, `src/app/api/cart/route.test.ts`,
`src/components/cart/CartView.tsx`, `src/components/cart/CartView.test.tsx`,
`src/app/(DashboardLayout)/checkout/page.tsx`, `e2e/cart.spec.ts`, `drizzle/0003_*.sql` + `drizzle/meta/*`.
Modify: `src/app/(DashboardLayout)/cart/page.tsx`, `src/components/catalog/ItemDetailView.tsx`
`src/components/catalog/catalog-views.test.tsx` (its "without an add-to-cart" assertion at
line ~117 becomes the opposite), `e2e/home.spec.ts` (its placeholder test uses `/cart`; point it
at `/admin`, still a placeholder), `src/db/schema.ts`.
Never edit `tests/acceptance/**` or anything under `openspec/`.

## Definition of Done

AC-1 … AC-14 on the ticket (one per scenario) are met, each shown by its acceptance case
SWHM2-C-0064…0077 passing, with the project's own tests for the new modules, route and view.
