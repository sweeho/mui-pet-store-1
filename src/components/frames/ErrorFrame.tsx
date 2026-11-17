"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import Link from "next/link";

/** The shared error frame: what went wrong, a Retry button and a way back home. */
export function ErrorFrame({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Box
      data-testid="error-frame"
      role="alert"
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
          bgcolor: "error.light",
          color: "error.main",
        }}
      >
        <IconAlertTriangle size={24} aria-hidden />
      </Box>
      <Typography variant="h6" component="h2">
        We couldn’t load this page
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        {message}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        <Button
          variant="contained"
          sx={{ textTransform: "none" }}
          startIcon={<IconRefresh size={18} />}
          onClick={onRetry}
        >
          Retry
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          sx={{ textTransform: "none" }}
          component={Link}
          href="/"
        >
          Go to Home
        </Button>
      </Box>
    </Box>
  );
}
