# Design check — SWHM2-T-0007

Each mockup was rendered with Playwright next to the built screen (same route, state and viewport; sample catalog loaded by `POST /api/catalog/populate`). Screenshots are in `design-check/`.

## SWHM2-MCK-17: category-list at 1440px

Route `/catalog`.

- Mockup: `design-check/category-list-mockup.png`
- Built: `design-check/category-list-built.png`
- Differences left: Grid of five categories; shell chrome differs; wrap width matched at 1104px; Tabler icons for the glyphs. See the list below for shell and token differences.

## SWHM2-MCK-18: category-list at 390px

Route `/catalog`.

- Mockup: `design-check/category-list-mobile-mockup.png`
- Built: `design-check/category-list-mobile-built.png`
- Differences left: same as the 1440 view; the layout stacks to one column at this width as the mobile mockup shows. See the list below for shell and token differences.

## SWHM2-MCK-19: products-in-a-category at 1440px

Route `/catalog/categories/DOGS`.

- Mockup: `design-check/products-in-a-category-mockup.png`
- Built: `design-check/products-in-a-category-built.png`
- Differences left: Built table has Product and Product ID columns only; the mockup's Description column is not in the products read contract (`ProductEntry`), so it is omitted. See the list below for shell and token differences.

## SWHM2-MCK-20: products-in-a-category at 390px

Route `/catalog/categories/DOGS`.

- Mockup: `design-check/products-in-a-category-mobile-mockup.png`
- Built: `design-check/products-in-a-category-mobile-built.png`
- Differences left: same as the 1440 view; the layout stacks to one column at this width as the mobile mockup shows. See the list below for shell and token differences.

## SWHM2-MCK-21: items-of-a-product at 1440px

Route `/catalog/products/K9-RT-02`.

- Mockup: `design-check/items-of-a-product-mockup.png`
- Built: `design-check/items-of-a-product-built.png`
- Differences left: Matches the table columns; description column shows the product description; sample data has attributes as chips. See the list below for shell and token differences.

## SWHM2-MCK-22: items-of-a-product at 390px

Route `/catalog/products/K9-RT-02`.

- Mockup: `design-check/items-of-a-product-mobile-mockup.png`
- Built: `design-check/items-of-a-product-mobile-built.png`
- Differences left: same as the 1440 view; the layout stacks to one column at this width as the mobile mockup shows. See the list below for shell and token differences.

## SWHM2-MCK-23: item-detail at 1440px

Route `/catalog/items/EST-24`.

- Mockup: `design-check/item-detail-mockup.png`
- Built: `design-check/item-detail-built.png`
- Differences left: Unit cost row added (D5); Add to cart not built (D6); shell breadcrumb appears above the page trail. See the list below for shell and token differences.

## SWHM2-MCK-24: item-detail at 390px

Route `/catalog/items/EST-24`.

- Mockup: `design-check/item-detail-mobile-mockup.png`
- Built: `design-check/item-detail-mobile-built.png`
- Differences left: same as the 1440 view; the layout stacks to one column at this width as the mobile mockup shows. See the list below for shell and token differences.

## SWHM2-MCK-25: search-results at 1440px

Route `/catalog/search?q=retriever`.

- Mockup: `design-check/search-results-mockup.png`
- Built: `design-check/search-results-built.png`
- Differences left: Description column omitted; blank query uses the empty frame. See the list below for shell and token differences.

## SWHM2-MCK-26: search-results at 390px

Route `/catalog/search?q=retriever`.

- Mockup: `design-check/search-results-mobile-mockup.png`
- Built: `design-check/search-results-mobile-built.png`
- Differences left: same as the 1440 view; the layout stacks to one column at this width as the mobile mockup shows. See the list below for shell and token differences.

## Differences left

- **Shell chrome** (sidebar labels and icons, header language switcher, sign-on buttons, footer links, cart count): the shell is `src/shell/**` and not this ticket's. The mockup's sidebar differs from the built shell (SWHM2-S-0001).
- **Duplicate breadcrumb on nested pages**: the shell draws its own path-derived trail above the page (for example `Home / Catalog & search / Items / EST-24`), so the catalog's trail from the mockup appears below it. The shell's `Items` crumb links to `/catalog/items`, which has no page. The shell is not owned here; follow-up raised.
- **Colour and type**: the mockups use indigo `#4f46e5` and Inter; the built screens use the theme tokens (`primary.main` `#5D87FF`, Plus Jakarta Sans). The token wins.
- **Category icons**: Tabler icons (feather, cat, dog, fish, bug) stand in for the mockup's hand-drawn glyphs; there are no image files.
- **Item detail** (D5, D6): a `Unit cost` row is added; `Add to cart` and its help text are not built (shopping-cart capability).
- **Search results**: the mockup's `Description` column is omitted. An item's description is its title in this data model, and the product description is not part of `CatalogItem`. The blank-query message is shown as the shared empty frame instead of an inline error.
- **Pager buttons**: MUI small outlined buttons; the disabled state follows the theme.
- **Sample data**: item names, prices and attributes come from `data/catalog/sample-catalog.xml`, which follows the mockup's dogs but is not identical (for example fewer items per product).
- **Mobile**: the 390px pair was rendered and saved for every screen. The category-list and item-detail desktop pairs were compared in detail; the others were checked for layout and copy at a lower level of detail.
