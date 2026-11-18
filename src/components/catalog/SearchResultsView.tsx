"use client";

import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { EmptyFrame } from "@/components/frames/EmptyFrame";
import type { CatalogItem, Page } from "@/catalog/types";

import { CatalogCrumbs, CatalogHeader, Pager, SearchBox, Thumb, formatPrice } from "./parts";
import { CatalogTable, NothingHere, mono } from "./tables";

/** `/catalog/search?q=`: the search box and the items matching any keyword. */
export function SearchResultsView({
  query,
  page,
  pageNumber,
  offset,
}: {
  query: string;
  page: Page<CatalogItem>;
  pageNumber: number;
  offset: number;
}) {
  const blank = query.trim() === "";
  const description = blank
    ? "Search by product, category or description."
    : `${page.entries.length} ${page.entries.length === 1 ? "item" : "items"} on this page for “${query.trim()}”.`;
  return (
    <Box sx={{ maxWidth: 1104 }}>
      <CatalogCrumbs trail={[{ label: "Catalog", href: "/catalog" }, { label: "Search" }]} />
      <CatalogHeader title="Search results" description={description} />
      <Box sx={{ maxWidth: 560, mb: 2 }}>
        <SearchBox value={query} width={440} />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Matches any word in the product name, category or item description.
        </Typography>
      </Box>
      {blank ? (
        <EmptyFrame
          title="Type at least one word to search"
          message="Enter a word above and press Search."
        />
      ) : page.entries.length === 0 ? (
        <NothingHere
          title="No items match"
          message={
            pageNumber > 1
              ? "There are no results on this page."
              : `Nothing matched “${query.trim()}”. Try a different word.`
          }
          backHref="/catalog"
          backLabel="Browse categories"
        />
      ) : (
        <>
          <CatalogTable head={["Item", "Product", "Category", "Item ID", "List price"]}>
            {page.entries.map((i) => (
              <TableRow key={i.itemId} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Thumb size={40} categoryId={i.categoryId} />
                    <Typography
                      component={Link}
                      href={`/catalog/items/${encodeURIComponent(i.itemId)}`}
                      sx={{
                        fontWeight: 600,
                        color: "inherit",
                        textDecoration: "none",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {i.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{i.productName}</TableCell>
                <TableCell sx={mono}>{i.categoryId}</TableCell>
                <TableCell sx={mono}>{i.itemId}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatPrice(i.listPrice)}
                </TableCell>
              </TableRow>
            ))}
          </CatalogTable>
          <Pager
            noun="Results"
            offset={offset}
            shown={page.entries.length}
            page={pageNumber}
            hasNext={page.hasNext}
            path="/catalog/search"
            query={{ q: query }}
          />
        </>
      )}
    </Box>
  );
}
