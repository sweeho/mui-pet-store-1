"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import { IconArrowRight, IconSearch } from "@tabler/icons-react";
import Link from "next/link";

import { EmptyFrame } from "@/components/frames/EmptyFrame";
import { PageHeading } from "@/components/frames/PageHeading";
import type { User } from "@/lib/users";
import { MENU_ITEMS } from "@/shell/menu";

/** The landing page: a welcome, and one tile per primary area, taken from the navigation. */
export function LandingView({ firstUser }: { firstUser: User | null }) {
  const areas = MENU_ITEMS.flatMap(({ group, items }) =>
    items.filter((item) => item.href !== "/").map((item) => ({ ...item, group })),
  );
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeading
        title="Welcome to Pet Store"
        description="Find a pet, fill your cart and check out in your own language."
        action={
          <Button
            variant="contained"
            component={Link}
            href="/catalog"
            startIcon={<IconSearch size={18} />}
          >
            Browse the catalog
          </Button>
        }
      />
      {firstUser ? (
        <Box
          component="section"
          aria-label="Primary areas"
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          }}
        >
          {areas.map(({ group, title, href, description, icon: Icon }) => (
            <Card key={href} variant="outlined">
              <CardActionArea
                component={Link}
                href={href}
                sx={{
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: 1.5,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "primary.light",
                    color: "primary.main",
                  }}
                >
                  <Icon size={22} aria-hidden />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {group}
                  </Typography>
                  <Typography variant="h6" component="h2">
                    {title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {description}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "primary.main",
                    fontWeight: 500,
                  }}
                >
                  Open <IconArrowRight size={16} aria-hidden />
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      ) : (
        <Card variant="outlined">
          <EmptyFrame
            title="Nothing to show yet"
            message="The store has no data yet. Use the navigation to look around."
          />
        </Card>
      )}
    </Box>
  );
}
