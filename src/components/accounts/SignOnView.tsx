"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import { IconLanguage, IconLock } from "@tabler/icons-react";
import Link from "next/link";

import { PageHeading } from "@/components/frames/PageHeading";
import { withBasePath } from "@/lib/paths";

import { FieldLabel, PasswordInput } from "./parts";

const DESTINATIONS: Record<string, string> = {
  "/account": "your account",
  "/checkout": "Checkout",
};

/** The sign-on form: a plain POST, so it works without client script (design.md P8). */
export function SignOnView({
  returnTo,
  rememberedUser,
}: {
  returnTo?: string;
  rememberedUser?: string;
}) {
  const target = returnTo && returnTo !== "/" ? returnTo : undefined;
  const destination = target ? (DESTINATIONS[target] ?? "the page you asked for") : undefined;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeading
        title="Sign on"
        description="Sign on with your Pet Store user name and password."
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "480px 320px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Box>
          {destination ? (
            <Alert
              severity="info"
              icon={<IconLock size={20} />}
              sx={{ mb: 3, border: 1, borderColor: "divider" }}
            >
              <Typography component="b" sx={{ display: "block", fontWeight: 600 }}>
                Sign on to continue to {destination}
              </Typography>
              We’ll take you straight back there once you’re signed on.
            </Alert>
          ) : null}
          <Card variant="outlined" sx={{ p: 3 }}>
            <form method="post" action={withBasePath("/api/accounts/signon")}>
              {target ? <input type="hidden" name="returnTo" value={target} /> : null}
              <Box sx={{ mb: 2 }}>
                <FieldLabel htmlFor="username">User name</FieldLabel>
                <OutlinedInput
                  id="username"
                  name="username"
                  size="small"
                  fullWidth
                  required
                  autoComplete="username"
                  defaultValue={rememberedUser ?? ""}
                  inputProps={{ maxLength: 50 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <PasswordInput id="password" name="password" autoComplete="current-password" />
              </Box>
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="remember"
                      defaultChecked={Boolean(rememberedUser)}
                      size="small"
                    />
                  }
                  label={
                    <span>
                      Remember my user name
                      <Typography
                        component="span"
                        sx={{ display: "block", fontSize: 12 }}
                        color="text.secondary"
                      >
                        Saved on this device for 31 days.
                      </Typography>
                    </span>
                  }
                  sx={{ alignItems: "flex-start", m: 0 }}
                />
              </Box>
              <Button type="submit" variant="contained" fullWidth sx={{ textTransform: "none" }}>
                Sign on
              </Button>
              <Typography
                color="text.secondary"
                sx={{ mt: 2, fontSize: 12, display: "flex", gap: 0.75, alignItems: "center" }}
              >
                <IconLanguage size={14} aria-hidden /> Your preferred language is applied when you
                sign on.
              </Typography>
            </form>
          </Card>
        </Box>
        <Card variant="outlined" sx={{ p: 2, bgcolor: "action.hover" }}>
          <Typography component="h2" sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>
            New to Pet Store?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Create an account to check out and keep your language and favourite category.
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            component={Link}
            href="/accounts/create"
            sx={{ textTransform: "none" }}
          >
            Create account
          </Button>
        </Card>
      </Box>
    </Box>
  );
}
