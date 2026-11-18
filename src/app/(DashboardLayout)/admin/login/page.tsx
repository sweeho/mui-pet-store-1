import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import OutlinedInput from "@mui/material/OutlinedInput";

import { FieldLabel } from "@/components/accounts/parts";
import { PageHeading } from "@/components/frames/PageHeading";
import { withBasePath } from "@/lib/paths";

/** `/admin/login` (design.md P5): a plain form post, so it works without client script. */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 480 }}>
      <PageHeading
        title="Sign in to Pet Store Admin"
        description="Orders and sales reports are for administrators only."
      />
      {error ? <Alert severity="error">The user ID or password is not correct.</Alert> : null}
      <Card variant="outlined" sx={{ p: 3 }}>
        <form method="post" action={withBasePath("/api/admin/login")}>
          <Box sx={{ mb: 2 }}>
            <FieldLabel htmlFor="userId">User ID</FieldLabel>
            <OutlinedInput
              id="userId"
              name="userId"
              size="small"
              fullWidth
              required
              autoComplete="username"
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <OutlinedInput
              id="password"
              name="password"
              type="password"
              size="small"
              fullWidth
              required
              autoComplete="current-password"
            />
          </Box>
          <Button type="submit" variant="contained">
            Sign in
          </Button>
        </form>
      </Card>
    </Box>
  );
}
