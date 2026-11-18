"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { IconCircleCheck } from "@tabler/icons-react";
import { useState } from "react";

import { PageHeading } from "@/components/frames/PageHeading";
import { withBasePath } from "@/lib/paths";

export type InventoryRow = { itemId: string; quantity: number };

export type InventoryViewProps = {
  items: InventoryRow[];
  /** How many items the last submit changed; shows the "Stock updated" alert. */
  updated?: number;
};

const FORM_ID = "inventory-form";
const mono = { fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace" };
const plural = (n: number) => (n === 1 ? "1 item" : `${n} items`);

type Hint = { tone: "error" | "warning"; text: string } | null;

/** Whether a row will change (design.md P9): ticked, and a whole number of 0 or more. */
const isValid = (v: string) => /^\d+$/.test(v.trim());

function hintFor(value: string, ticked: boolean): Hint {
  const v = value.trim();
  if (v !== "" && !ticked) return { tone: "warning", text: "Not ticked — this row won’t change" };
  if (v === "" && ticked)
    return { tone: "warning", text: "No new quantity — this row won’t change" };
  if (v !== "" && ticked && !isValid(v)) {
    return { tone: "error", text: "Must be a whole number, 0 or more — this row won’t change" };
  }
  return null;
}

function OutOfStock() {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        height: 22,
        px: 1,
        ml: 1,
        borderRadius: 999,
        border: 1,
        borderColor: "divider",
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
        verticalAlign: "middle",
      }}
    >
      <Box component="i" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "error.main" }} />
      Out of stock
    </Box>
  );
}

const headCell = {
  height: 40,
  px: 2,
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: "text.secondary",
  bgcolor: "action.hover",
  borderBottom: 1,
  borderColor: "divider",
} as const;

/** `/admin/inventory`: set stock per item; only ticked rows with a valid quantity change. */
export function InventoryView({ items, updated }: InventoryViewProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(false);

  const count = items.filter(
    (i) => ticks[i.itemId] && (values[i.itemId] ?? "") !== "" && isValid(values[i.itemId] ?? ""),
  ).length;

  const submit = (
    <Button
      type="submit"
      variant="contained"
      sx={{ textTransform: "none", height: { xs: 44, md: 36 } }}
    >
      Update inventory
    </Button>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 1104 }}>
      <PageHeading
        title="Inventory"
        description="Enter a new quantity and tick Update for each item you want to change. Pending orders are reprocessed when you submit."
        action={
          <Button
            type="submit"
            form={FORM_ID}
            variant="contained"
            sx={{ textTransform: "none", display: { xs: "none", md: "inline-flex" } }}
          >
            Update inventory
          </Button>
        }
      />

      {updated !== undefined && !dismissed ? (
        <Box
          role="status"
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            border: 1,
            borderColor: "divider",
            borderLeft: 4,
            borderLeftColor: "success.main",
            borderRadius: 2,
            px: 2,
            py: 1.5,
            bgcolor: "action.hover",
          }}
        >
          <Box sx={{ color: "success.main", mt: "1px", display: "flex" }}>
            <IconCircleCheck size={20} aria-hidden />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography component="b" sx={{ display: "block", fontWeight: 600, mb: 0.25 }}>
              Stock updated for {plural(updated)}
            </Typography>
            <Typography component="span" color="text.secondary">
              Pending orders were reprocessed against the new stock. Lines with enough stock have
              shipped.
            </Typography>
          </Box>
          <Button
            type="button"
            aria-label="Dismiss"
            onClick={() => setDismissed(true)}
            sx={{ textTransform: "none", height: 28, px: 1, minWidth: 0 }}
          >
            Dismiss
          </Button>
        </Box>
      ) : null}

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <form id={FORM_ID} method="post" action={withBasePath("/api/admin/inventory")}>
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: { md: "fixed" },
              "@media (max-width: 767px)": {
                "& thead": { display: "none" },
                "& tbody": { display: "block" },
                "& tbody tr": {
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridTemplateAreas: '"id upd" "ex qty"',
                  columnGap: 1.5,
                  px: 2,
                  py: 1.5,
                },
              },
            }}
          >
            <colgroup>
              <col style={{ width: "22%" }} />
              <col style={{ width: "26%" }} />
              <col />
              <col style={{ width: 110 }} />
            </colgroup>
            <thead>
              <tr>
                <Box component="th" sx={headCell}>
                  Item id
                </Box>
                <Box component="th" sx={headCell}>
                  Existing quantity
                </Box>
                <Box component="th" sx={headCell}>
                  New quantity
                </Box>
                <Box component="th" sx={{ ...headCell, textAlign: "center" }}>
                  Update
                </Box>
              </tr>
            </thead>
            <Box
              component="tbody"
              sx={{
                "& td": {
                  px: 2,
                  py: 0.5,
                  borderBottom: 1,
                  borderColor: "divider",
                  verticalAlign: "top",
                  lineHeight: "32px",
                },
                "& tr:hover": { bgcolor: "action.hover" },
                "& tr:last-of-type td": { borderBottom: 0 },
                "@media (max-width: 767px)": {
                  "& td": { p: 0, border: 0, lineHeight: "44px" },
                  "& tr": { borderBottom: 1, borderColor: "divider" },
                  "& tr:last-of-type": { borderBottom: 0 },
                },
              }}
            >
              {items.map(({ itemId, quantity }) => {
                const value = values[itemId] ?? "";
                const ticked = ticks[itemId] ?? false;
                const hint = hintFor(value, ticked);
                return (
                  <tr key={itemId}>
                    <Box component="td" sx={{ ...mono, fontWeight: 500, gridArea: "id" }}>
                      {itemId}
                    </Box>
                    <Box component="td" sx={{ gridArea: "ex" }}>
                      <span style={mono}>{quantity}</span>
                      {quantity === 0 ? <OutOfStock /> : null}
                    </Box>
                    <Box component="td" sx={{ gridArea: "qty" }}>
                      <Box
                        component="input"
                        name={`qty_${itemId}`}
                        value={value}
                        inputMode="numeric"
                        placeholder="—"
                        aria-label={`New quantity for ${itemId}`}
                        aria-invalid={hint?.tone === "error" || undefined}
                        onChange={(e) => setValues((v) => ({ ...v, [itemId]: e.target.value }))}
                        sx={{
                          ...mono,
                          width: { xs: "100%", md: 120 },
                          height: { xs: 44, md: 32 },
                          fontSize: { xs: 16, md: 14 },
                          border: 1,
                          borderColor: hint?.tone === "error" ? "error.main" : "divider",
                          borderRadius: 1,
                          px: 1.25,
                          textAlign: "right",
                          color: "text.primary",
                          bgcolor: "background.paper",
                          boxSizing: "border-box",
                          "&:focus": {
                            outline: 2,
                            outlineColor: "primary.main",
                            outlineOffset: -1,
                          },
                        }}
                      />
                      {hint ? (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            lineHeight: "16px",
                            mt: 0.5,
                            mb: 0.5,
                            color: hint.tone === "error" ? "error.main" : "warning.main",
                          }}
                        >
                          {hint.text}
                        </Typography>
                      ) : null}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        textAlign: "center",
                        gridArea: "upd",
                        "@media (max-width: 767px)": { textAlign: "right" },
                      }}
                    >
                      <Box
                        component="input"
                        type="checkbox"
                        name={`item_${itemId}`}
                        checked={ticked}
                        aria-label={`Update ${itemId}`}
                        onChange={(e) => setTicks((t) => ({ ...t, [itemId]: e.target.checked }))}
                        sx={{
                          width: { xs: 22, md: 18 },
                          height: { xs: 22, md: 18 },
                          m: 0,
                          mt: { xs: "11px", md: "7px" },
                          accentColor: "primary.main",
                          cursor: "pointer",
                        }}
                      />
                    </Box>
                  </tr>
                );
              })}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
              px: 2,
              py: 1.5,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "action.hover",
              borderRadius: "0 0 8px 8px",
              position: "sticky",
              bottom: 0,
            }}
          >
            <Typography color="text.secondary" component="span">
              {count === 1 ? "1 item will change" : `${count} items will change`}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Blank or negative quantities are ignored.
            </Typography>
            {submit}
          </Box>
        </form>
      </Card>
    </Box>
  );
}
