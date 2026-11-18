"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Link from "next/link";

/** `/admin/login/error`: the failed sign-in outcome (design.md P2). */
export default function Page() {
  return (
    <Box sx={{ maxWidth: 480 }}>
      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h1" sx={{ fontSize: 22, lineHeight: "30px", fontWeight: 600, mb: 1 }}>
          We couldn’t sign you in
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.5 }}>
          The user ID or password is wrong, or the account doesn’t have the administrator role.
        </Typography>
        <Button component={Link} href="/admin/login" variant="contained">
          Back to sign in
        </Button>
        <Typography sx={{ mt: 2, fontSize: 12 }}>
          <Link href="/" style={{ color: "inherit" }}>
            Go to the store home page
          </Link>
        </Typography>
      </Card>
    </Box>
  );
}
