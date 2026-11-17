"use client";

import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  IconBug,
  IconCat,
  IconChevronLeft,
  IconChevronRight,
  IconDog,
  IconFeather,
  IconFish,
  IconPaw,
  IconPhoto,
  IconSearch,
} from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { withBasePath } from "@/lib/paths";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const formatPrice = (n: number) => usd.format(n);

export type Crumb = { label: string; href?: string };

/** Home / Catalog / … trail; the last crumb is the current page. */
export function CatalogCrumbs({ trail }: { trail: Crumb[] }) {
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...trail];
  return (
    <Breadcrumbs aria-label="Catalog path" sx={{ fontSize: 12, mb: 1 }}>
      {all.map((c, i) =>
        c.href && i < all.length - 1 ? (
          <Typography
            key={c.label + i}
            component={Link}
            href={c.href}
            sx={{ fontSize: 12, color: "text.secondary", textDecoration: "none" }}
          >
            {c.label}
          </Typography>
        ) : (
          <Typography key={c.label + i} sx={{ fontSize: 12 }} aria-current="page">
            {c.label}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  );
}

/** Heading block: title, one-line description and an optional action on the right. */
export function CatalogHeader({
  title,
  description,
  action,
  lead,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3, flexWrap: "wrap" }}>
      {lead}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h1" sx={{ fontSize: 24, lineHeight: "32px", fontWeight: 600 }}>
          {title}
        </Typography>
        {description ? (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Box>
  );
}

const ICONS: Record<string, typeof IconPaw> = {
  BIRDS: IconFeather,
  CATS: IconCat,
  DOGS: IconDog,
  FISH: IconFish,
  REPTILES: IconBug,
};

/** The image slot: the catalog has no picture files, so it shows a category or photo icon. */
export function Thumb({
  size,
  categoryId,
  label,
}: {
  size: number;
  categoryId?: string;
  label?: string;
}) {
  const Icon = categoryId ? (ICONS[categoryId.toUpperCase()] ?? IconPaw) : IconPhoto;
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flex: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        bgcolor: "grey.100",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        color: "text.secondary",
      }}
    >
      <Icon size={size >= 100 ? 32 : 20} stroke={1.5} aria-hidden />
      {label ? <Typography variant="caption">{label}</Typography> : null}
    </Box>
  );
}

/** Range text and Previous / Next links for a 1-based `?page=` listing. */
export function Pager({
  noun,
  offset,
  shown,
  page,
  hasNext,
  path,
  query = {},
}: {
  noun: string;
  offset: number;
  shown: number;
  page: number;
  hasNext: boolean;
  path: string;
  query?: Record<string, string>;
}) {
  const href = (p: number) => {
    const params = new URLSearchParams({ ...query, page: String(p) });
    return `${path}?${params.toString()}`;
  };
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5, color: "text.secondary" }}>
      <Typography variant="caption" sx={{ flex: 1 }}>
        {`${noun} ${offset + 1}–${offset + shown}`}
      </Typography>
      <Button
        variant="outlined"
        color="inherit"
        size="small"
        sx={{ textTransform: "none" }}
        startIcon={<IconChevronLeft size={16} />}
        {...(page > 1 ? { component: Link, href: href(page - 1) } : { disabled: true })}
      >
        Previous
      </Button>
      <Button
        variant="outlined"
        color="inherit"
        size="small"
        sx={{ textTransform: "none" }}
        endIcon={<IconChevronRight size={16} />}
        {...(hasNext ? { component: Link, href: href(page + 1) } : { disabled: true })}
      >
        Next
      </Button>
    </Box>
  );
}

/** A plain GET form, so searching works without client-side script. */
export function SearchBox({ value = "", width = 360 }: { value?: string; width?: number }) {
  return (
    <Box
      component="form"
      method="get"
      action={withBasePath("/catalog/search")}
      sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
    >
      <TextField
        name="q"
        defaultValue={value}
        size="small"
        placeholder="Search by product, category or description"
        slotProps={{
          htmlInput: { "aria-label": "Search the catalog" },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={16} aria-hidden />
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: { xs: "100%", sm: width } }}
      />
      <Button type="submit" variant="contained" sx={{ textTransform: "none" }}>
        Search
      </Button>
    </Box>
  );
}
