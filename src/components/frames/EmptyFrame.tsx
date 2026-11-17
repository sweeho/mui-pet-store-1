import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { IconInbox } from "@tabler/icons-react";
import type { ReactNode } from "react";

/** The shared empty frame: a page with nothing to show says so, and offers a way forward. */
export function EmptyFrame({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <Box
      data-testid="empty-frame"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 1,
        py: 8,
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          mb: 1,
          bgcolor: "primary.light",
          color: "primary.main",
        }}
      >
        <IconInbox size={24} aria-hidden />
      </Box>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        {message}
      </Typography>
      {action ? <Box sx={{ display: "flex", gap: 1, mt: 2 }}>{action}</Box> : null}
    </Box>
  );
}
