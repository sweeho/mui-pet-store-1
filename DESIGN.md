# Design

## The theme

There is one MUI theme, `src/theme/theme.ts`. Its palette, typography and shape come from
`design/tokens.mui.json`, following the Modern SaaS design guide. To change the look, change the
tokens; a design system replaces that file. Components never carry their own colours: they use the
theme through MUI props (`color="primary"`, `sx={{ color: "text.secondary" }}`).

## Layout grid

- Global navigation: 240px wide.
- Gutter: 24px around and between content blocks.
- Page title: 24px, semibold, with an optional one-line description under it.
- Breadcrumbs sit above the page title, and only on pages more than one level deep.

## The shell

`src/shell/` is the Modernize Free layout, adapted. Every page under `src/app/(DashboardLayout)/`
renders inside it:

- **Navigation** (left): entries grouped by job (Shop, Account, Operations, Admin), each area
  once, the current page filled in. Fixed on a large screen; on a small screen it folds behind a
  menu button in the header. Add an area by adding an entry to `MENU_ITEMS` in
  `src/shell/menu.ts`; the landing page's tiles are drawn from the same list.
- **Header** (top): controls on the right only (language, and Sign on / Create account when
  signed out). Header controls stay visible on a small screen.
- **Footer** (bottom): the copyright line and nothing else.

## Shared state frames

Every page shows "nothing here", "this failed" and "loading" the same way, using the frames in
`src/components/frames/`:

- **Empty**: what is missing and what to do next. Also used for an area that is not built yet
  ("not available yet").
- **Error**: what failed, and a **Retry** action. A route's `error.tsx` renders it.
- **Loading**: shown while a page's data is on its way. A route's `loading.tsx` renders it.

A page never draws its own empty, error or loading state.

## Components

Use MUI's components. A component of the app's own goes in `src/components/`, with a test beside
it, and takes its data as props: the page reads the data on the server.
