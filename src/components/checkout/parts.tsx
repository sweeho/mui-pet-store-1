import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { IconCheck } from "@tabler/icons-react";
import type { ReactNode } from "react";

import { CatalogCrumbs } from "../catalog/parts";

export const mono = { fontFamily: "monospace" };

/** The three checkout steps; `current` is 1, 2 or 3 and earlier steps show as done. */
export function Steps({ current }: { current: 1 | 2 | 3 }) {
  const labels = ["Shipping and contact", "Billing and payment", "Confirmation"];
  return (
    <Box
      component="ol"
      aria-label="Checkout steps"
      sx={{ display: "flex", alignItems: "center", gap: 1.5, listStyle: "none", p: 0, m: 0, mb: 3 }}
    >
      {labels.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const on = n === current;
        return (
          <Box
            component="li"
            key={label}
            aria-current={on ? "step" : undefined}
            sx={{ display: "contents" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                component="span"
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  border: 1,
                  borderColor: on || done ? "primary.main" : "divider",
                  bgcolor: on || done ? "primary.main" : "background.paper",
                  color: on || done ? "primary.contrastText" : "text.secondary",
                }}
              >
                {done ? <IconCheck size={14} aria-hidden /> : n}
              </Box>
              <Typography
                component="span"
                sx={{
                  fontWeight: on ? 600 : 500,
                  color: on ? "text.primary" : "text.secondary",
                  display: { xs: on ? "inline" : "none", md: "inline" },
                }}
              >
                {label}
              </Typography>
            </Box>
            {n < labels.length ? (
              <Box
                component="span"
                aria-hidden
                sx={{
                  flex: 1,
                  height: 2,
                  bgcolor: done ? "primary.main" : "divider",
                  maxWidth: 80,
                }}
              />
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}

/** A heading block with a trail: Home / … / current. */
export function CheckoutHeading({
  trail,
  title,
  subtitle,
  action,
}: {
  trail?: { label: string; href?: string }[];
  title: string;
  subtitle: ReactNode;
  action?: ReactNode;
}) {
  return (
    <>
      {trail ? <CatalogCrumbs trail={trail} /> : null}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h1" sx={{ fontSize: 24, lineHeight: "32px", fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        </Box>
        {action}
      </Box>
    </>
  );
}

/** A titled card in the main column. */
export function Block({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 600 }}>
        {title}
      </Typography>
      {hint ? (
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1.5 }}>
          {hint}
        </Typography>
      ) : null}
      {children}
    </Card>
  );
}

/** Label and value pairs in a sidebar card. */
export function KeyValues({
  title,
  rows,
}: {
  title: string;
  rows: [string, ReactNode, boolean?][];
}) {
  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h3" sx={{ fontSize: 14, fontWeight: 600, mb: 1.5 }}>
        {title}
      </Typography>
      <Box component="dl" sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 1, m: 0 }}>
        {rows.map(([k, v, isMono]) => (
          <Box key={k} sx={{ display: "contents" }}>
            <Typography component="dt" color="text.secondary">
              {k}
            </Typography>
            <Typography
              component="dd"
              sx={{ m: 0, wordBreak: "break-all", ...(isMono ? mono : {}) }}
            >
              {v}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
