# Agent-generated corrections to AGENTS.md

AGENTS.md is human-authored; agents record corrections here instead of rewriting it.

- 2026-11-17 (SWHM2-S-0001): `MENU_ITEMS` now lives in `src/shell/menu.ts` (grouped
  `{ group, items }[]`), re-exported from `src/shell/SidebarItems.tsx`. AGENTS.md §Conventions
  still says to add a page in `SidebarItems.tsx`; add the entry in `menu.ts` instead. The
  landing page's tiles read the same list.
- 2026-11-17 (SWHM2-S-0001): `tsconfig.json` excludes `tests/acceptance`, and ESLint and
  Prettier ignore it, so `npm run typecheck`, lint and format do not check the locked acceptance
  suite. Jest and Playwright still run it through their own configs.
