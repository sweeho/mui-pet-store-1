"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { IconChartLine, IconClipboardCheck, IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";

import { PageHeading } from "@/components/frames/PageHeading";
import { withBasePath } from "@/lib/paths";

const CARDS = [
  {
    href: "/admin/orders",
    title: "Orders by status",
    text: "Pending, approved, denied and completed orders. Approve or deny pending ones on Commit.",
    icon: <IconClipboardCheck size={20} />,
  },
  {
    href: "/admin/reports",
    title: "Sales reports",
    text: "Revenue or quantity between two dates, by category or by item, as a pie or bar chart.",
    icon: <IconChartLine size={20} />,
  },
];

/** `/admin`: Launch Rich Client, the two work areas and Log out (design.md P2, P3). */
export function AdminHomeView() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 1104 }}>
      <PageHeading
        title="Admin"
        description="Manage orders and read sales reports in the rich client."
        action={
          <form method="post" action={withBasePath("/api/admin/logout")}>
            <Button type="submit" variant="outlined" color="inherit">
              Log out
            </Button>
          </form>
        }
      />
      <Card
        variant="outlined"
        sx={{ display: "flex", alignItems: "center", gap: 2, p: 3, flexWrap: "wrap" }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: "primary.main",
            color: "common.white",
            display: "grid",
            placeItems: "center",
          }}
        >
          <IconExternalLink size={22} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>
            Pet Store Admin rich client
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.5 }}>
            Opens against this server with your current session. List orders by status, approve or
            deny pending orders, and chart sales.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/orders"
          variant="contained"
          startIcon={<IconExternalLink size={16} />}
          sx={{ height: 40 }}
        >
          Launch Rich Client
        </Button>
      </Card>
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", mb: 1 }}>
          In the rich client
        </Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          {CARDS.map((c) => (
            <Card
              key={c.href}
              variant="outlined"
              component={Link}
              href={c.href}
              sx={{
                display: "flex",
                gap: 1.5,
                p: 2,
                color: "inherit",
                textDecoration: "none",
                "&:hover": { boxShadow: "0 4px 12px rgba(15,23,42,.08)" },
              }}
            >
              <Box sx={{ color: "primary.main" }}>{c.icon}</Box>
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{c.title}</Typography>
                <Typography color="text.secondary">{c.text}</Typography>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
