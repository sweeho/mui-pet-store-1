"use client";

import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

import { MENU_ITEMS } from "./menu";

const TITLES = new Map(MENU_ITEMS.flatMap(({ items }) => items.map((i) => [i.href, i.title])));

/** Intermediate paths that have a page.tsx (design.md D1); a unit test checks them on disk. */
export const KNOWN_PAGE_ROUTES = [
  "/account",
  "/accounts",
  "/admin",
  "/admin/login",
  "/cart",
  "/catalog",
  "/checkout",
  "/signon",
];

const LINKABLE = new Set<string>([...KNOWN_PAGE_ROUTES, ...TITLES.keys()]);

/** Breadcrumbs above the page title, only on pages more than one level deep. */
export function Breadcrumbs() {
  const segments = (usePathname() ?? "/").split("/").filter(Boolean);
  // Catalog pages draw their own "Catalog path" trail.
  if (segments.length < 2 || segments[0] === "catalog") return null;
  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const fallback = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { href, title: TITLES.get(href) ?? fallback };
  });
  return (
    <MuiBreadcrumbs aria-label="Breadcrumb" sx={{ mb: 1, typography: "body2" }}>
      <Link component={NextLink} href="/" underline="hover" color="text.secondary">
        Home
      </Link>
      {crumbs.map(({ href, title }, index) =>
        index === crumbs.length - 1 || !LINKABLE.has(href) ? (
          <Typography
            key={href}
            variant="body2"
            color={index === crumbs.length - 1 ? "text.primary" : "text.secondary"}
            aria-current={index === crumbs.length - 1 ? "page" : undefined}
          >
            {title}
          </Typography>
        ) : (
          <Link
            key={href}
            component={NextLink}
            href={href}
            underline="hover"
            color="text.secondary"
          >
            {title}
          </Link>
        ),
      )}
    </MuiBreadcrumbs>
  );
}
