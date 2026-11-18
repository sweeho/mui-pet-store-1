"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

import type { CatalogItem, CategoryEntry, Page, ProductDetail } from "@/catalog/types";

import { CatalogCrumbs, CatalogHeader, Pager, Thumb, formatPrice } from "./parts";
import { CatalogTable, NothingHere, RowChevron, mono } from "./tables";

export const attributesOf = (i: CatalogItem) =>
  [i.attr1, i.attr2, i.attr3, i.attr4, i.attr5].filter((a): a is string => !!a);

/** `/catalog/products/[id]`: the items of one product in a table. */
export function ItemListView({
  category,
  product,
  page,
  pageNumber,
  offset,
}: {
  category: CategoryEntry | null;
  product: ProductDetail;
  page: Page<CatalogItem>;
  pageNumber: number;
  offset: number;
}) {
  const path = `/catalog/products/${encodeURIComponent(product.id)}`;
  const catHref = `/catalog/categories/${encodeURIComponent(product.categoryId)}`;
  const catName = category?.name ?? product.categoryId;
  return (
    <Box sx={{ maxWidth: 1104 }}>
      <CatalogCrumbs
        trail={[
          { label: "Catalog", href: "/catalog" },
          { label: catName, href: catHref },
          { label: product.name },
        ]}
      />
      <CatalogHeader
        title={product.name}
        description={product.description ?? undefined}
        lead={<Thumb size={96} categoryId={product.categoryId} />}
        action={
          <Button
            variant="outlined"
            color="inherit"
            sx={{ textTransform: "none" }}
            startIcon={<IconArrowLeft size={16} />}
            component={Link}
            href={catHref}
          >
            {`Back to ${catName}`}
          </Button>
        }
      />
      <Typography
        sx={{ ...mono, mt: -2, mb: 3 }}
      >{`${product.id} · ${product.categoryId}`}</Typography>
      {page.entries.length === 0 ? (
        <NothingHere
          title="No items here"
          message="There are no items on this page."
          backHref={catHref}
          backLabel={`Back to ${catName}`}
        />
      ) : (
        <>
          <CatalogTable head={["Item ID", "Item", "Attributes", "Description", "List price", ""]}>
            {page.entries.map((i) => (
              <TableRow key={i.itemId} hover>
                <TableCell sx={mono}>{i.itemId}</TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {attributesOf(i).map((a) => (
                      <Chip key={a} label={a} size="small" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "text.secondary" }}>{product.description}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatPrice(i.listPrice)}
                </TableCell>
                <RowChevron />
              </TableRow>
            ))}
          </CatalogTable>
          <Pager
            noun="Items"
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
