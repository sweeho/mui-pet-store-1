/*
 * Adapted from Modernize Free (MIT, AdminMart), package/src/app/(DashboardLayout)/layout/sidebar/SidebarItems.tsx and MenuItems.tsx, at commit 948e484. See
 * src/shell/LICENSE.md. Trimmed to the layout shell (plan 118 B2).
 */

"use client";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAME } from "@/constants/app";
import { MENU_ITEMS } from "./menu";

export { MENU_ITEMS } from "./menu";

export function SidebarItems() {
  const pathname = usePathname();
  return (
    <Box sx={{ px: 3 }}>
      <Box sx={{ height: "70px", display: "flex", alignItems: "center" }}>
        <Typography component={Link} href="/" variant="h4" color="primary">
          {APP_NAME}
        </Typography>
      </Box>
      <List component="nav" aria-label="Primary" disablePadding>
        {MENU_ITEMS.map(({ group, items }) => (
          <Box key={group}>
            <ListSubheader
              disableSticky
              sx={{ px: 1, fontWeight: 600, lineHeight: "32px", bgcolor: "transparent" }}
            >
              {group}
            </ListSubheader>
            <List component="div" disablePadding>
              {items.map((item) => (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  selected={pathname === item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  sx={{
                    borderRadius: "8px",
                    mb: 0.5,
                    "&.Mui-selected, &.Mui-selected:hover": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                    <item.icon stroke={1.5} size="1.3rem" />
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        ))}
      </List>
    </Box>
  );
}
