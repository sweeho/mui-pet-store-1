"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import { IconAlertTriangle, IconEye, IconEyeOff } from "@tabler/icons-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

/** The label above a field, in the mockup's 12px semibold style. */
export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <Typography
      component="label"
      htmlFor={htmlFor}
      sx={{ display: "block", fontSize: 12, fontWeight: 600, mb: 0.75 }}
    >
      {children}
    </Typography>
  );
}

/** A password input with a show/hide button. */
export function PasswordInput({
  id,
  name,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  name: string;
  autoComplete: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  const [shown, setShown] = useState(false);
  return (
    <OutlinedInput
      id={id}
      name={name}
      type={shown ? "text" : "password"}
      autoComplete={autoComplete}
      size="small"
      fullWidth
      required
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      inputProps={{ maxLength: 50 }}
      endAdornment={
        <IconButton
          size="small"
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          onClick={() => setShown((s) => !s)}
          edge="end"
          sx={{ color: "text.secondary", borderRadius: 1, width: 40, height: 36, mr: -0.5 }}
        >
          {shown ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </IconButton>
      }
    />
  );
}

/** A failure card (sign-on error, creation error): icon, badge, message, two actions and tips. */
export function FailureCard({
  badge,
  message,
  primary,
  secondary,
  tipsTitle,
  tips,
}: {
  badge: string;
  message: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  tipsTitle: string;
  tips: string[];
}) {
  return (
    <Box sx={{ maxWidth: 624 }}>
      <Card variant="outlined" role="alert" sx={{ p: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              flex: "none",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              border: 1,
              borderColor: "error.main",
              color: "error.main",
              bgcolor: "background.paper",
            }}
          >
            <IconAlertTriangle size={20} aria-hidden />
          </Box>
          <Box>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                mb: 1,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Box
                component="i"
                sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "error.main" }}
              />
              {badge}
            </Box>
            <Typography sx={{ mb: 2 }}>{message}</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                component={Link}
                href={primary.href}
                sx={{ textTransform: "none" }}
              >
                {primary.label}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                component={Link}
                href={secondary.href}
                sx={{ textTransform: "none" }}
              >
                {secondary.label}
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>
      <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
        <Typography component="h2" sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>
          {tipsTitle}
        </Typography>
        <Box
          component="ul"
          sx={{ m: 0, pl: 2.25, color: "text.secondary", lineHeight: 1.7, fontSize: 14 }}
        >
          {tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
