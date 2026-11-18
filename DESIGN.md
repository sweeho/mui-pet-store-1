# Design

## The theme

There is one MUI theme, `src/theme/theme.ts`. Its palette, typography and shape come from
`design/tokens.mui.json`, following the Modern SaaS design guide. To change the look, change the
tokens; a design system replaces that file. Components never carry their own colours: they use the
theme through MUI props (`color="primary"`, `sx={{ color: "text.secondary" }}`).

The tokens follow the approved mockups: an indigo primary, slate text, and the Inter typeface at a
4px corner radius. A typeface named in the tokens must also be loaded: Inter comes from the pinned
`@fontsource-variable/inter` package, imported once in `src/app/layout.tsx`.

- **Status colours.** Order and record states use the semantic palette, never a colour of their
  own: `success` (green) for an approved or completed state, `warning` (amber) for a state waiting
  on someone, `error` for a denied or failed one (first used for order status on `/admin/orders`).
- **Mono figures.** Identifiers, dates and money totals in tables are set in JetBrains Mono, from
  the pinned `@fontsource-variable/jetbrains-mono` package, loaded beside Inter in
  `src/app/layout.tsx`. All other text is Inter.

## Layout grid

- Global navigation: 240px wide.
- Gutter: 24px around and between content blocks.
- Page title: 24px, semibold, with an optional one-line description under it.
- Breadcrumbs sit above the page title, and only on pages more than one level deep. A crumb links
  only to a path that has a page; any other segment is plain secondary text. Catalog pages draw
  their own "Catalog path" trail, so the shell trail is hidden there.

## The shell

`src/shell/` is the Modernize Free layout, adapted. Every page under `src/app/(DashboardLayout)/`
renders inside it:

- **Navigation** (left): entries grouped by job (Shop, Account, Operations, Admin), each area
  once, the current page filled in. Fixed on a large screen; on a small screen it folds behind a
  menu button in the header. Add an area by adding an entry to `MENU_ITEMS` in
  `src/shell/menu.ts`; the landing page's tiles are drawn from the same list. An entry may carry
  a small count at its right edge (Cart shows its number of distinct lines when above zero); the
  layout reads it on the server and passes it down, like the session.
- **Header** (top): controls on the right only. Signed out: the language control, a
  "Signed out" status, and Sign on / Create account. Signed on: the language control, the user
  name, and Sign off. The layout reads the session on the server and hands it to the header as a
  prop. Header controls stay visible on a small screen.
- **Footer** (bottom): the copyright line and standing notices for the whole site (the session
  timeout), nothing page-specific.

## Shared state frames

Every page shows "nothing here", "this failed" and "loading" the same way, using the frames in
`src/components/frames/`:

- **Empty**: what is missing and what to do next. Also used for an area that is not built yet
  ("not available yet").
- **Error**: what failed, and a **Retry** action. A route's `error.tsx` renders it.
- **Loading**: shown while a page's data is on its way. A route's `loading.tsx` renders it.

A page never draws its own empty, error or loading state.

## Forms and outcome pages

- A form is a plain HTML `POST` to a route handler that answers with a redirect, so it works
  without client JavaScript. Every field has a visible label; a hint under it states the limits
  (for example "Up to 25 characters. No % or \*.").
- A failed submission lands on its own **outcome page** (for example `/signon/error`): a short
  heading saying what did not happen, one sentence saying nothing was changed, a primary action
  to try again and a secondary way out. It never shows which field was wrong when that would
  reveal account data.
- Forms and outcome cards are a single column inside the page's content width, as each
  approved mockup draws them.
- **Held changes and Commit.** An administrator screen that changes many records at once holds
  each choice on the page until an explicit **Commit**. A changed row is marked and the change
  count is shown next to Commit, outside the button's name. Discard changes resets them. Rows
  that cannot change show their value as text, with no control. After Commit, a summary names
  what was sent. Only changed rows are sent.

## Components

Use MUI's components. A component of the app's own goes in `src/components/`, with a test beside
it, and takes its data as props: the page reads the data on the server.
