# Design

## The theme

There is one MUI theme, `src/theme/theme.ts`. Its palette, typography and shape come from
`design/tokens.mui.json`, which starts as Modernize Free's look. To change the look, change the
tokens; a design system replaces that file. Components never carry their own colours: they use the
theme through MUI props (`color="primary"`, `sx={{ color: "text.secondary" }}`).

## The shell

`src/shell/` is Modernize Free's layout: a 270px sidebar (fixed on a large screen, a drawer on a
small one), a header with the menu button, and the page frame. Pages inside it live under
`src/app/(DashboardLayout)/`. Add a page to the menu in `src/shell/SidebarItems.tsx`.

## Components

Use MUI's components. A component of the app's own goes in `src/components/`, with a test beside
it, and takes its data as props: the page reads the data on the server.
