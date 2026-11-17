"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

import type { CategoryEntry, Page, ProductEntry } from "@/catalog/types";

import { CatalogCrumbs, CatalogHeader, Pager, Thumb } from "./parts";
import { CatalogTable, NothingHere, RowChevron, mono } from "./tables";

/** `/catalog/categories/[id]`: the products of one category, by name. */
export function ProductListView({
  category,
  page,
  pageNumber,
  offset,
}: {
  category: CategoryEntry;
  page: Page<ProductEntry>;
  pageNumber: number;
  offset: number;
}) {
  const path = `/catalog/categories/${encodeURIComponent(category.id)}`;
  return (
    <Box sx={{ maxWidth: 1104 }}>
      <CatalogCrumbs trail={[{ label: "Catalog", href: "/catalog" }, { label: category.name }]} />
      <CatalogHeader
        title={category.name}
        description="Products in this category, by name."
        action={
          <Button
            variant="outlined"
            color="inherit"
            sx={{ textTransform: "none" }}
            startIcon={<IconArrowLeft size={16} />}
            component={Link}
            href="/catalog"
          >
            All categories
          </Button>
        }
      />
      {page.entries.length === 0 ? (
        <NothingHere
          title="No products here"
          message="There are no products on this page."
          backHref="/catalog"
          backLabel="Back to categories"
        />
      ) : (
        <>
          <CatalogTable head={["", "Product", "Product ID", ""]}>
            {page.entries.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell width={60}>
                  <Thumb size={40} categoryId={category.id} />
                </TableCell>
                <TableCell>
                  <Typography
                    component={Link}
                    href={`/catalog/products/${encodeURIComponent(p.id)}`}
                    sx={{
                      fontWeight: 600,
                      color: "inherit",
                      textDecoration: "none",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    {p.name}
                  </Typography>
                </TableCell>
                <TableCell sx={mono}>{p.id}</TableCell>
                <RowChevron />
              </TableRow>
            ))}
          </CatalogTable>
          <Pager
            noun="Products"
            offset={offset}
            shown={page.entries.length}
            page={pageNumber}
            hasNext={page.hasNext}
            path={path}
          />
        </>
      )}
    </Box>
  );
}
