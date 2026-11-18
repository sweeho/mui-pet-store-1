"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

import { EmptyFrame } from "@/components/frames/EmptyFrame";
import type { CategoryEntry, Page } from "@/catalog/types";

import { CatalogCrumbs, CatalogHeader, Pager, SearchBox, Thumb } from "./parts";

/** `/catalog`: the categories as a grid of cards, with the search box. */
export function CategoryListView({
  page,
  pageNumber,
  offset,
}: {
  page: Page<CategoryEntry>;
  pageNumber: number;
  offset: number;
}) {
  return (
    <Box sx={{ maxWidth: 1104 }}>
      <CatalogCrumbs trail={[{ label: "Catalog" }]} />
      <CatalogHeader
        title="Catalog"
        description="Browse pets by category."
        action={<SearchBox />}
      />
      {page.entries.length === 0 ? (
        <Card variant="outlined">
          <EmptyFrame
            title={pageNumber > 1 ? "No more categories" : "The catalog is empty"}
            message={
              pageNumber > 1
                ? "There are no categories on this page."
                : "No categories have been loaded yet. An administrator can load the sample data."
            }
            action={
              pageNumber > 1 ? (
                <Button
                  variant="contained"
                  sx={{ textTransform: "none" }}
                  component={Link}
                  href="/catalog"
                >
                  Back to categories
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            }}
          >
            {page.entries.map((c) => (
              <Card
                key={c.id}
                variant="outlined"
                component={Link}
                href={`/catalog/categories/${encodeURIComponent(c.id)}`}
                aria-label={c.name}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "inherit",
                  "&:hover": { boxShadow: 3 },
                }}
              >
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    "& > div": { width: "100%", border: 0, borderRadius: 0 },
                  }}
                >
                  <Thumb size={136} categoryId={c.id} />
                </Box>
                <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{c.name}</Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {c.id}
                    </Typography>
                  </Box>
                  <IconChevronRight size={18} aria-hidden />
                </Box>
              </Card>
            ))}
          </Box>
          <Pager
            noun="Categories"
            offset={offset}
            shown={page.entries.length}
            page={pageNumber}
            hasNext={page.hasNext}
            path="/catalog"
          />
        </>
      )}
    </Box>
  );
}
