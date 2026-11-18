import Box from "@mui/material/Box";

import { APP_NAME } from "@/constants/app";

/** The page footer, after the page content on every page. */
export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        px: 3,
        py: 2,
        borderTop: 1,
        borderColor: "divider",
        typography: "body2",
        color: "text.secondary",
      }}
    >
      <Box component="span" sx={{ flex: 1 }}>
        © 2026 {APP_NAME}
      </Box>
      <span>Sessions end after 15 minutes of inactivity</span>
    </Box>
  );
}
