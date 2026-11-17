"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Link from "next/link";

import { EmptyFrame } from "./EmptyFrame";
import { PageHeading } from "./PageHeading";

/** A page a later capability will build: the shared empty frame saying it is not available yet. */
export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeading title={title} description={description} />
      <Card variant="outlined">
        <EmptyFrame
          title={`${title} is not available yet`}
          message="This area is coming in a later release. Head back to the home page in the meantime."
          action={
            <Button variant="contained" sx={{ textTransform: "none" }} component={Link} href="/">
              Go to Home
            </Button>
          }
        />
      </Card>
    </Box>
  );
}
