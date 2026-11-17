# Design check — SWHM2-T-0002

Each section pairs the mockup with the built screen (Playwright, same route, state and viewport).

## SWHM2-MCK-9 — Site shell

- Mockup file: `artifacts/SWHM2-S-0001/design/mockup-site-shell.html`
- Route / state / viewport: `/catalog`, signed out, 1440
- Screenshots: `design-check/shell-mockup.png` and `design-check/shell-built.png`
- Differences left:
  - Colours, font and radius come from the theme tokens (blue primary, Plus Jakarta Sans), not the mockup's indigo and Inter: the token wins.
  - Nav rows are Modernize list rows, a little taller than the mockup's 40px; the brand has no paw mark icon.
  - Cart nav badge '2' and the Cart tile's '2 items' text are mockup sample data; no cart exists yet.
  - Breadcrumbs only show on pages two levels deep, so `/catalog` has none (as designed).

## SWHM2-MCK-10 — Site shell · Mobile

- Mockup file: `artifacts/SWHM2-S-0001/design/mockup-site-shell-mobile.html`
- Route / state / viewport: `/catalog`, menu folded, 390
- Screenshots: `design-check/shell-mobile-mockup.png` and `design-check/shell-mobile-built.png`
- Differences left:
  - Colours, font and radius come from the theme tokens (blue primary, Plus Jakarta Sans), not the mockup's indigo and Inter: the token wins.
  - Nav rows are Modernize list rows, a little taller than the mockup's 40px; the brand has no paw mark icon.
  - Cart nav badge '2' and the Cart tile's '2 items' text are mockup sample data; no cart exists yet.
  - Menu folded behind the 'Open the menu' button, as in the mockup.

## SWHM2-MCK-11 — Landing page

- Mockup file: `artifacts/SWHM2-S-0001/design/mockup-landing-page.html`
- Route / state / viewport: `/`, 1440
- Screenshots: `design-check/landing-mockup.png` and `design-check/landing-built.png`
- Differences left:
  - Colours, font and radius come from the theme tokens (blue primary, Plus Jakarta Sans), not the mockup's indigo and Inter: the token wins.
  - Nav rows are Modernize list rows, a little taller than the mockup's 40px; the brand has no paw mark icon.
  - Cart nav badge '2' and the Cart tile's '2 items' text are mockup sample data; no cart exists yet.
  - Tile eyebrow, titles, descriptions and the 3-column grid match; the Cart tile description omits the item count.

## SWHM2-MCK-12 — Landing page · Mobile

- Mockup file: `artifacts/SWHM2-S-0001/design/mockup-landing-page-mobile.html`
- Route / state / viewport: `/`, 390
- Screenshots: `design-check/landing-mobile-mockup.png` and `design-check/landing-mobile-built.png`
- Differences left:
  - Colours, font and radius come from the theme tokens (blue primary, Plus Jakarta Sans), not the mockup's indigo and Inter: the token wins.
  - Nav rows are Modernize list rows, a little taller than the mockup's 40px; the brand has no paw mark icon.
  - Cart nav badge '2' and the Cart tile's '2 items' text are mockup sample data; no cart exists yet.
  - Single-column tiles; header hides the language control and Create account at this width.

## SWHM2-MCK-13 — Empty state

- Mockup file: `artifacts/SWHM2-S-0001/design/mockup-empty-state.html`
- Route / state / viewport: placeholder `/cart`, 1440
- Screenshots: `design-check/empty-mockup.png` and `design-check/empty-built.png`
- Differences left:
  - Colours, font and radius come from the theme tokens (blue primary, Plus Jakarta Sans), not the mockup's indigo and Inter: the token wins.
  - Nav rows are Modernize list rows, a little taller than the mockup's 40px; the brand has no paw mark icon.
  - Cart nav badge '2' and the Cart tile's '2 items' text are mockup sample data; no cart exists yet.
  - Copy reads '<Area> is not available yet' (design.md), not the mockup's cart-specific 'Your cart is empty'; the primary action is 'Go to Home'.

## SWHM2-MCK-14 — Empty state · Mobile

- Mockup file: `artifacts/SWHM2-S-0001/design/mockup-empty-state-mobile.html`
- Route / state / viewport: placeholder `/cart`, 390
- Screenshots: `design-check/empty-mobile-mockup.png` and `design-check/empty-mobile-built.png`
- Differences left:
  - Colours, font and radius come from the theme tokens (blue primary, Plus Jakarta Sans), not the mockup's indigo and Inter: the token wins.
  - Nav rows are Modernize list rows, a little taller than the mockup's 40px; the brand has no paw mark icon.
  - Cart nav badge '2' and the Cart tile's '2 items' text are mockup sample data; no cart exists yet.
  - Same copy difference as MCK-13.

## SWHM2-MCK-15 — Error state

- Mockup file: `artifacts/SWHM2-S-0001/design/mockup-error-state.html`
- Route / state / viewport: route error boundary (a page that throws), 1440
- Screenshots: `design-check/error-mockup.png` and `design-check/error-built.png`
- Differences left:
  - Colours, font and radius come from the theme tokens (blue primary, Plus Jakarta Sans), not the mockup's indigo and Inter: the token wins.
  - Nav rows are Modernize list rows, a little taller than the mockup's 40px; the brand has no paw mark icon.
  - Cart nav badge '2' and the Cart tile's '2 items' text are mockup sample data; no cart exists yet.
  - The mockup keeps the page title (Inventory) above the frame; the route error boundary replaces the whole page, so the title is absent and the copy is generic ('We couldn’t load this page').

## SWHM2-MCK-16 — Error state · Mobile

- Mockup file: `artifacts/SWHM2-S-0001/design/mockup-error-state-mobile.html`
- Route / state / viewport: route error boundary, 390
- Screenshots: `design-check/error-mobile-mockup.png` and `design-check/error-mobile-built.png`
- Differences left:
  - Colours, font and radius come from the theme tokens (blue primary, Plus Jakarta Sans), not the mockup's indigo and Inter: the token wins.
  - Nav rows are Modernize list rows, a little taller than the mockup's 40px; the brand has no paw mark icon.
  - Cart nav badge '2' and the Cart tile's '2 items' text are mockup sample data; no cart exists yet.
  - Same differences as MCK-15.
