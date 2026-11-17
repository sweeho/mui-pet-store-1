"use client";

import Box from "@mui/material/Box";

import { CatalogCrumbs, CatalogHeader } from "./parts";
import { NothingHere } from "./tables";

/** An id that does not exist in the catalog: the shared empty frame with a way back. */
export function NotFoundView({ what }: { what: "category" | "product" | "item" }) {
  return (
    <Box sx={{ maxWidth: 1104 }}>
      <CatalogCrumbs trail={[{ label: "Catalog", href: "/catalog" }, { label: "Not found" }]} />
      <CatalogHeader title="Catalog" />
      <NothingHere
        title={`That ${what} was not found`}
        message={`There is no ${what} with that id. It may have been removed, or the link may be wrong.`}
        backHref="/catalog"
        backLabel="Back to the catalog"
      />
    </Box>
  );
}
