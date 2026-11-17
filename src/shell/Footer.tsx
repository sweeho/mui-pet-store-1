import Box from "@mui/material/Box";

import { APP_NAME } from "@/constants/app";

/** The page footer, after the page content on every page. */
export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        px: 3,
        py: 2,
        borderTop: 1,
        borderColor: "divider",
        typography: "body2",
        color: "text.secondary",
      }}
    >
      © 2026 {APP_NAME}
    </Box>
  );
}
