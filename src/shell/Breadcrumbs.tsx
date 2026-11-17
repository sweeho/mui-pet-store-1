"use client";

import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

import { MENU_ITEMS } from "./menu";

const TITLES = new Map(MENU_ITEMS.flatMap(({ items }) => items.map((i) => [i.href, i.title])));

/** Breadcrumbs above the page title, only on pages more than one level deep. */
export function Breadcrumbs() {
  const segments = (usePathname() ?? "/").split("/").filter(Boolean);
  if (segments.length < 2) return null;
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
        index === crumbs.length - 1 ? (
          <Typography key={href} variant="body2" color="text.primary" aria-current="page">
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
