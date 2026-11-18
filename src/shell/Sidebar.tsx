/*
 * Adapted from Modernize Free (MIT, AdminMart), package/src/app/(DashboardLayout)/layout/sidebar/Sidebar.tsx, at commit 948e484. See
 * src/shell/LICENSE.md. Trimmed to the layout shell (plan 118 B2).
 */

"use client";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";

import { SidebarItems } from "./SidebarItems";

const SIDEBAR_WIDTH = "240px";

const scrollbarStyles = {
  "&::-webkit-scrollbar": { width: "7px" },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "#eff2f7", borderRadius: "15px" },
};

/** The sidebar: fixed on a large screen, a drawer the header opens on a small one. */
export function Sidebar({
  isMobileSidebarOpen,
  onSidebarClose,
  cartCount = 0,
}: {
  isMobileSidebarOpen: boolean;
  onSidebarClose: () => void;
  cartCount?: number;
}) {
  // Both are rendered by breakpoint in CSS, so the navigation is in the server's HTML.
  return (
    <>
      <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, display: { xs: "none", lg: "block" } }}>
        <Drawer
          anchor="left"
          open
          variant="permanent"
          slotProps={{
            paper: { sx: { boxSizing: "border-box", width: SIDEBAR_WIDTH, ...scrollbarStyles } },
          }}
        >
          <SidebarItems cartCount={cartCount} />
        </Drawer>
      </Box>
      <Drawer
        anchor="left"
        open={isMobileSidebarOpen}
        onClose={onSidebarClose}
        variant="temporary"
        sx={{ display: { xs: "block", lg: "none" } }}
        slotProps={{
          paper: {
            sx: {
              width: SIDEBAR_WIDTH,
              boxShadow: (theme) => theme.shadows[8],
              ...scrollbarStyles,
            },
          },
        }}
      >
        <SidebarItems cartCount={cartCount} />
      </Drawer>
    </>
  );
}
