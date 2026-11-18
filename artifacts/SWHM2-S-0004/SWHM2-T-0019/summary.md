---
ticket: SWHM2-T-0019
---
# Summary: Shopping cart

CODE-REVIEW: self-review — read the diff with the code-review skill; fixed a ref read during render
(lint) and a pre-hydration click race on Update cart / Empty cart; rejected none.

Built the cart per `design.md` P1–P7: pure model `src/cart/cart.ts`, listing with injected catalog
lookup `src/cart/listing.ts`, `shopping_cart` table (migration `drizzle/0003_*`) with a 15-minute idle
rule in `src/cart/store.ts`, `POST /api/cart` (add/update/remove/empty, 303 to `/cart`, `pet_cart`
cookie), the `/cart` page and `CartView`, "Add to cart" on the item page, a sign-on-protected
`/checkout` placeholder, and a cart count in the sidebar (layout reads the cart).

## Files
- New: `src/cart/*`, `src/app/api/cart/route.ts`, `src/components/cart/CartView.tsx`,
  `src/app/(DashboardLayout)/checkout/page.tsx`, `e2e/cart.spec.ts`, `drizzle/0003_*`, tests.
- Changed: `cart/page.tsx`, `ItemDetailView.tsx`, `catalog-views.test.tsx`, `e2e/home.spec.ts`
  (placeholder test now uses `/admin`), `src/db/schema.ts`, `layout.tsx`, `DashboardShell.tsx`,
  `Sidebar.tsx`, `SidebarItems.tsx` (cart count).

## AC coverage
All 14 scenarios map to cases C-0064 to C-0077, all green (see `tdd-test-result.md`).

## Decisions and deviations
- Unit cost is the catalog `listPrice` (SD1); the cart page reads `STOREFRONT_LOCALE` (SD3).
- Line `name` is the product name and `attribute` is `attr1`, as the mockup shows ("Angelfish", "Large").
- "Update cart" is disabled only after hydration, so the form works without scripts.
- Mockup gaps left (see `design-check.md`): mobile line layout, sticky mobile checkout bar,
  mobile bottom-sheet confirm, JetBrains Mono not loaded. Not fixed here.
- Abandoned cart rows are removed only when read after idling; there is no sweep job.

## Verification
`npm run lint`, `format:check`, `typecheck`, `node .vortex/check-versions.mjs`: pass.
`npm test`: 26 suites, 149 tests pass. `npm run test:e2e`: 17 passed. `npm run build`: pass.
`npm run test:acceptance`: shopping-cart suite passes; the 7 other suites fail because their
capabilities are not built yet.
