"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import OutlinedInput from "@mui/material/OutlinedInput";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useState, type ReactNode } from "react";

import { MAX_PASSWORD, MAX_USER_ID } from "@/accounts/limits";
import { PageHeading } from "@/components/frames/PageHeading";
import { withBasePath } from "@/lib/paths";

import { FieldLabel, PasswordInput } from "./parts";

export type CategoryOption = { id: string; name: string };

const LANGUAGES = [
  { value: "en_US", label: "English (en_US)" },
  { value: "ja_JP", label: "日本語 (ja_JP)" },
  { value: "zh_CN", label: "中文 (zh_CN)" },
];

function userIdProblem(v: string): string {
  if (/[%*]/.test(v)) return "User ID can't contain % or *.";
  if (v.length > MAX_USER_ID) return `User ID must be ${MAX_USER_ID} characters or fewer.`;
  return "";
}

function Section({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <Box component="section">
      <Typography component="h2" sx={{ fontSize: 16, fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {note}
      </Typography>
      {children}
    </Box>
  );
}

const twoColumns = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 };

/** The create-account form: a plain POST to the users route (design.md P10). */
export function CreateAccountView({ categories }: { categories: CategoryOption[] }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const problem = userIdProblem(userId);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeading
        title="Create account"
        description="Choose a user ID and password, then set your shopping preferences."
        action={
          <Typography color="text.secondary" sx={{ pb: 0.5 }}>
            Already have one?{" "}
            <Link component={NextLink} href="/signon" underline="none" sx={{ fontWeight: 600 }}>
              Sign on
            </Link>
          </Typography>
        }
      />
      <Card variant="outlined" sx={{ p: 3, maxWidth: 768 }}>
        <form method="post" action={withBasePath("/api/accounts/users")}>
          <Section title="Sign-on details" note="You’ll use these to sign on.">
            <Box sx={twoColumns}>
              <Box>
                <FieldLabel htmlFor="userId">User ID</FieldLabel>
                <OutlinedInput
                  id="userId"
                  name="userId"
                  size="small"
                  fullWidth
                  required
                  autoComplete="username"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  error={problem !== ""}
                  inputProps={{
                    "aria-describedby": "userId-hint",
                    "aria-invalid": problem !== "",
                  }}
                />
                <Box id="userId-hint" sx={{ display: "flex", mt: 0.5, fontSize: 12 }}>
                  <Typography
                    component="span"
                    sx={{ flex: 1, fontSize: 12 }}
                    color={problem ? "error" : "text.secondary"}
                    role={problem ? "alert" : undefined}
                  >
                    {problem || "Up to 25 characters. No % or *."}
                  </Typography>
                  <Typography component="span" color="text.secondary" sx={{ fontSize: 12 }}>
                    {userId.length} / {MAX_USER_ID}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={setPassword}
                />
                <Box sx={{ display: "flex", mt: 0.5, fontSize: 12 }}>
                  <Typography
                    component="span"
                    sx={{ flex: 1, fontSize: 12 }}
                    color="text.secondary"
                  >
                    Up to {MAX_PASSWORD} characters.
                  </Typography>
                  <Typography component="span" color="text.secondary" sx={{ fontSize: 12 }}>
                    {password.length} / {MAX_PASSWORD}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Section>
          <Divider sx={{ my: 3 }} />
          <Section title="Preferences" note="Your language is applied each time you sign on.">
            <Box sx={{ ...twoColumns, mb: 2 }}>
              <Box>
                <FieldLabel htmlFor="language">Preferred language</FieldLabel>
                <TextField
                  select
                  id="language"
                  name="language"
                  size="small"
                  fullWidth
                  defaultValue="en_US"
                  slotProps={{ select: { native: true } }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </TextField>
              </Box>
              <Box>
                <FieldLabel htmlFor="favoriteCategory">
                  Favourite category{" "}
                  <Typography component="span" color="text.secondary" sx={{ fontSize: 12 }}>
                    · optional
                  </Typography>
                </FieldLabel>
                <TextField
                  select
                  id="favoriteCategory"
                  name="favoriteCategory"
                  size="small"
                  fullWidth
                  defaultValue=""
                  slotProps={{ select: { native: true } }}
                >
                  <option value="">No favourite</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </TextField>
              </Box>
            </Box>
            <Box sx={{ ...twoColumns, gap: "12px 24px" }}>
              <FormControlLabel
                sx={{ alignItems: "flex-start", m: 0 }}
                control={
                  <Checkbox
                    name="myList"
                    defaultChecked
                    size="small"
                    sx={{ p: 0, mt: "2px", mr: 1.25 }}
                  />
                }
                label={
                  <span>
                    Show My List
                    <Typography
                      component="span"
                      color="text.secondary"
                      sx={{ display: "block", fontSize: 12 }}
                    >
                      Pets from your favourite category while you browse.
                    </Typography>
                  </span>
                }
              />
              <FormControlLabel
                sx={{ alignItems: "flex-start", m: 0 }}
                control={
                  <Checkbox
                    name="banner"
                    defaultChecked
                    size="small"
                    sx={{ p: 0, mt: "2px", mr: 1.25 }}
                  />
                }
                label={
                  <span>
                    Show banners
                    <Typography
                      component="span"
                      color="text.secondary"
                      sx={{ display: "block", fontSize: 12 }}
                    >
                      A banner for your favourite category.
                    </Typography>
                  </span>
                }
              />
            </Box>
          </Section>
          <Typography color="text.secondary" sx={{ mt: 3, fontSize: 12 }}>
            You’ll add your address, contact details and card when you check out.
          </Typography>
          <Divider sx={{ mt: 3, mb: 2 }} />
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button component={NextLink} href="/signon" sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={problem !== ""}
              sx={{ textTransform: "none" }}
            >
              Create account
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
}
