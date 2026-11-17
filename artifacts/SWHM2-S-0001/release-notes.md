---
artifact: release-notes
sprint: SWHM2-S-0001
ticket: SWHM2-T-0005
author: planning
---

# Release notes — SWHM2-S-0001

## Pet Store gets its front door

The application now opens on the **Pet Store landing page** instead of the template's "Hello, world". Every page sits in the same frame.

### New

- **Landing page** (`/`): a title, a one-line description, and one tile for each area: Catalog & search, Cart, Sign on, Order fulfilment and invoicing, and Administration of orders.
- **Global navigation** on every page, grouped into Shop, Account, Operations and Admin. The current page is highlighted. On small screens the navigation folds behind a menu button.
- **Header** with a language control (English / 日本語 / 中文) and **Sign on** / **Create account** buttons.
- **Footer** reading "© 2026 Pet Store".
- **Breadcrumbs** on pages that are two or more levels deep.
- **Shared page states.** Every page shows the same frames:
  - "nothing here" (empty)
  - "this failed", with a **Retry** button (error)
  - "loading"

### Not available yet

- Catalog, Cart, Sign on, the Inventory screen and Administration each open a page saying the area is "not available yet". Each one fills in when its capability ships.
- The language control and the Sign on / Create account buttons are shown but do nothing yet.

### For developers

- Navigation entries and landing tiles share one list, `MENU_ITEMS` in `src/shell/menu.ts`. Shared frames are in `src/components/frames/`.
- Typecheck, lint and format no longer check the locked acceptance suite under `tests/acceptance/`. Jest and Playwright still run it.

### Known issues

None.
