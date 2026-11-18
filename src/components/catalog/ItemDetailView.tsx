"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { CatalogItem } from "@/catalog/types";

import { attributesOf } from "./ItemListView";
import { CatalogCrumbs, CatalogHeader, Thumb, formatPrice } from "./parts";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        py: 1.25,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Typography color="text.secondary">{label}</Typography>
      <Typography component="div" sx={{ textAlign: "right" }}>
        {children}
      </Typography>
    </Box>
  );
}

const link = { color: "inherit", textDecoration: "none", "&:hover": { color: "primary.main" } };
const mono = { fontFamily: "monospace", fontSize: 12, color: "text.secondary" };

/** `/catalog/items/[id]`: one item with its price, cost and attributes. No cart yet (D6). */
export function ItemDetailView({
  item,
  categoryName,
}: {
  item: CatalogItem;
  categoryName: string;
}) {
  const productHref = `/catalog/products/${encodeURIComponent(item.productId)}`;
  const catHref = `/catalog/categories/${encodeURIComponent(item.categoryId)}`;
  const attrs = [item.attr1, item.attr2, item.attr3, item.attr4, item.attr5];
  return (
    <Box sx={{ maxWidth: 1104 }}>
      <CatalogCrumbs
        trail={[
          { label: "Catalog", href: "/catalog" },
          { label: categoryName, href: catHref },
          { label: item.productName, href: productHref },
          { label: item.itemId },
        ]}
      />
      <CatalogHeader
        title={item.description}
        description={item.productName}
        action={
          <Button
            variant="outlined"
            color="inherit"
            sx={{ textTransform: "none" }}
            startIcon={<IconArrowLeft size={16} />}
            component={Link}
            href={productHref}
          >
            {`Back to ${item.productName}`}
          </Button>
        }
      />
      <Box
        sx={{
          display: "grid",
          gap: 4,
          alignItems: "start",
          gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
        }}
      >
        <Box sx={{ "& > div": { width: "100%", height: { xs: 240, md: 420 } } }}>
          <Thumb size={420} categoryId={item.categoryId} label="Item image" />
        </Box>
        <Box>
          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
            {attributesOf(item).map((a) => (
              <Chip key={a} label={a} size="small" />
            ))}
          </Box>
          <Card variant="outlined" sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="caption" color="text.secondary">
              List price
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 700 }}>
              {formatPrice(item.listPrice)}
            </Typography>
          </Card>
          <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
            Details
          </Typography>
          <Row label="Item ID">
            <Box component="span" sx={mono}>
              {item.itemId}
            </Box>
          </Row>
          <Row label="Product">
            <Typography component={Link} href={productHref} sx={link}>
              {item.productName}{" "}
              <Box component="span" sx={mono}>
                {item.productId}
              </Box>
            </Typography>
          </Row>
          <Row label="Category">
            <Typography component={Link} href={catHref} sx={link}>
              {categoryName}{" "}
              <Box component="span" sx={mono}>
                {item.categoryId}
              </Box>
            </Typography>
          </Row>
          {attrs.map((a, n) =>
            a ? (
              <Row key={n} label={`Attribute ${n + 1}`}>
                <b>{a}</b>
              </Row>
            ) : null,
          )}
          <Row label="Unit cost">{formatPrice(item.unitCost)}</Row>
        </Box>
      </Box>
    </Box>
  );
}
