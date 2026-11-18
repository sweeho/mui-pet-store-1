# Fix note — SWHM2-T-0010

**Root cause:** `src/shell/Breadcrumbs.tsx` made a crumb for every URL segment and linked every non-last crumb to its prefix path without knowing whether a page exists there. Catalog pages also render their own `CatalogCrumbs`, so two trails showed, and `/catalog/items|products|categories` and `/checkout/orders` were dead links.

**Fix (design.md D1):** return `null` when the first segment is `catalog`; render a non-last crumb as a link only if its path is in the exported `KNOWN_PAGE_ROUTES` or a `MENU_ITEMS` href, else plain `Typography`.

**Files:** `src/shell/Breadcrumbs.tsx` (modify), `src/shell/Breadcrumbs.test.tsx` (new, regression + on-disk route check).

CODE-REVIEW: self-review — small diff, reviewed against D1 and the four ACs; no findings.
