"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  IconArrowLeft,
  IconArrowRight,
  IconInfoCircle,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import type { CartLine } from "@/cart/listing";
import { EmptyFrame } from "@/components/frames/EmptyFrame";
import { withBasePath } from "@/lib/paths";

import { formatPrice } from "../catalog/parts";

export type CartViewProps = {
  lines: CartLine[];
  subtotal: number;
  itemCount: number;
  signedOn: boolean;
  /** Category names by id; a line falls back to its category id. */
  categoryNames?: Record<string, string>;
};

const CART_ACTION = "/api/cart";
const mono = { fontFamily: "monospace" };
const noLink = { color: "inherit", textDecoration: "none" };
const plural = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;

/** Sign on first when signed out, then on to checkout (design.md P6). */
const checkoutHref = (signedOn: boolean) => (signedOn ? "/checkout" : "/signon?returnTo=/checkout");

function CheckoutButton({ signedOn, full }: { signedOn: boolean; full?: boolean }) {
  return (
    <Button
      variant="contained"
      component={Link}
      href={checkoutHref(signedOn)}
      endIcon={full ? undefined : <IconArrowRight size={16} />}
      sx={{ textTransform: "none", whiteSpace: "nowrap", width: full ? "100%" : undefined }}
    >
      Proceed to checkout
    </Button>
  );
}

/** `/cart`: the lines with editable quantities, the summary and the way to checkout. */
export function CartView({
  lines,
  subtotal,
  itemCount,
  signedOn,
  categoryNames = {},
}: CartViewProps) {
  const [dirty, setDirty] = useState(false);
  // Update cart is disabled until a quantity changes, but only once the page is interactive, so
  // the form still works before (or without) scripts.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [confirming, setConfirming] = useState(false);
  const [emptyAnchor, setEmptyAnchor] = useState<HTMLElement | null>(null);
  const action = withBasePath(CART_ACTION);
  const heading = (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3, flexWrap: "wrap" }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h1" sx={{ fontSize: 24, lineHeight: "32px", fontWeight: 600 }}>
          Cart
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {lines.length === 0
            ? `${plural(itemCount)} in your cart.`
            : `${plural(itemCount)} in your cart. Change a quantity and choose Update cart, or set it to 0 to remove the item.`}
        </Typography>
      </Box>
      {lines.length > 0 ? <CheckoutButton signedOn={signedOn} /> : null}
    </Box>
  );

  if (lines.length === 0) {
    return (
      <Box sx={{ maxWidth: 1104 }}>
        {heading}
        <Card variant="outlined">
          <EmptyFrame
            title="Your cart is empty"
            message="Find a pet in the catalog and add it to your cart. Items you add stay here for this visit."
            action={
              <>
                <Button
                  variant="contained"
                  component={Link}
                  href="/catalog"
                  startIcon={<IconSearch size={16} />}
                  sx={{ textTransform: "none" }}
                >
                  Catalog &amp; search
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  component={Link}
                  href="/"
                  sx={{ textTransform: "none" }}
                >
                  Back to home
                </Button>
              </>
            }
          />
        </Card>
      </Box>
    );
  }

  const cell = { px: 1.5, py: 1, borderColor: "divider" };
  return (
    <Box sx={{ maxWidth: 1104 }}>
      {heading}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          alignItems: "start",
          gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
        }}
      >
        <Box>
          {lines.map((l) => (
            <form key={l.itemId} id={`remove-${l.itemId}`} method="post" action={action}>
              <input type="hidden" name="action" value="remove" />
              <input type="hidden" name="itemId" value={l.itemId} />
            </form>
          ))}
          <form method="post" action={action} id="cart-update">
            <input type="hidden" name="action" value="update" />
            <Card variant="outlined" sx={{ overflow: "visible" }}>
              <Table
                sx={{
                  "& .MuiTableCell-root": cell,
                  display: { xs: "block", md: "table" },
                  "& tbody, & tr": { display: { xs: "block", md: "table-row-group" } },
                  "& tr": { display: { xs: "flex", md: "table-row" }, flexWrap: "wrap" },
                }}
              >
                <TableHead sx={{ display: { xs: "none", md: "table-header-group" } }}>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell>Item</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">List price</TableCell>
                    <TableCell align="right">Line total</TableCell>
                    <TableCell>
                      <Box component="span" sx={{ position: "absolute", left: -9999 }}>
                        Actions
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((l) => {
                    const label = `${l.name}, ${l.attribute}`;
                    return (
                      <TableRow key={l.itemId} hover>
                        <TableCell sx={{ flex: "1 1 100%" }}>
                          <Typography
                            component={Link}
                            href={`/catalog/items/${encodeURIComponent(l.itemId)}`}
                            sx={{
                              ...noLink,
                              fontWeight: 600,
                              "&:hover": { color: "primary.main" },
                            }}
                          >
                            {l.name}
                          </Typography>
                          <Typography variant="caption" component="div" color="text.secondary">
                            {l.attribute} · <span style={mono}>{l.itemId}</span>
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                          <Typography
                            component={Link}
                            href={`/catalog/products/${encodeURIComponent(l.productId)}`}
                            variant="caption"
                            color="text.secondary"
                            sx={{ ...noLink, ...mono }}
                          >
                            {l.productId}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                          {categoryNames[l.categoryId] ?? l.categoryId}
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            name={`qty:${l.itemId}`}
                            defaultValue={String(l.quantity)}
                            onChange={() => setDirty(true)}
                            slotProps={{
                              htmlInput: {
                                inputMode: "numeric",
                                "aria-label": `Quantity of ${label}`,
                                style: { textAlign: "right", ...mono },
                              },
                            }}
                            sx={{ width: 72 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={mono}>
                          <Box component="span" sx={{ display: { xs: "inline", md: "none" } }}>
                            ×{" "}
                          </Box>
                          {formatPrice(l.unitCost)}
                        </TableCell>
                        <TableCell align="right" sx={{ ...mono, fontWeight: 600 }}>
                          {formatPrice(l.total)}
                        </TableCell>
                        <TableCell align="right" sx={{ width: 48 }}>
                          <IconButton
                            type="submit"
                            form={`remove-${l.itemId}`}
                            size="small"
                            aria-label={`Remove ${label} from cart`}
                            sx={{ "&:hover": { color: "error.main" } }}
                          >
                            <IconTrash size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, flexWrap: "wrap" }}>
                <Button
                  type="submit"
                  variant="outlined"
                  color="inherit"
                  disabled={hydrated && !dirty}
                  startIcon={<IconRefresh size={16} />}
                  sx={{ textTransform: "none" }}
                >
                  Update cart
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                >
                  <IconInfoCircle size={14} aria-hidden />A quantity that isn&apos;t a whole number
                  counts as 0.
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Button
                  ref={setEmptyAnchor}
                  color="error"
                  startIcon={<IconTrash size={16} />}
                  onClick={() => setConfirming((v) => !v)}
                  sx={{ textTransform: "none" }}
                >
                  Empty cart
                </Button>
              </Box>
            </Card>
          </form>
          <Popper
            open={confirming}
            anchorEl={emptyAnchor}
            placement="top-end"
            sx={{ zIndex: "modal" }}
          >
            <Paper
              role="dialog"
              aria-label="Empty cart"
              variant="outlined"
              sx={{ p: 2, width: 280, boxShadow: 3, mb: 1 }}
            >
              <Typography sx={{ fontWeight: 600 }}>Empty cart</Typography>
              <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1.5 }}>
                All {itemCount} items will be removed from your cart.
              </Typography>
              <form method="post" action={action}>
                <input type="hidden" name="action" value="empty" />
                <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => setConfirming(false)}
                    sx={{ textTransform: "none" }}
                  >
                    Keep items
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="error"
                    sx={{ textTransform: "none" }}
                  >
                    Empty cart
                  </Button>
                </Box>
              </form>
            </Paper>
          </Popper>
          <Button
            component={Link}
            href="/catalog"
            color="inherit"
            startIcon={<IconArrowLeft size={16} />}
            sx={{ mt: 1.5, textTransform: "none" }}
          >
            Continue shopping
          </Button>
        </Box>
        <Card variant="outlined" sx={{ p: 2, position: { md: "sticky" }, top: { md: 88 } }}>
          <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 600, mb: 1.5 }}>
            Summary
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              height: 32,
              alignItems: "center",
            }}
          >
            <Typography color="text.secondary">Items</Typography>
            <Typography sx={mono}>{itemCount}</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: 1,
              borderColor: "divider",
              mt: 1,
              pt: 1.5,
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>Subtotal</Typography>
            <Typography sx={{ ...mono, fontSize: 20, fontWeight: 600 }}>
              {formatPrice(subtotal)}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ display: "flex", gap: 1, lineHeight: 1.5, my: 1.5 }}
          >
            <IconInfoCircle size={14} aria-hidden style={{ flex: "none", marginTop: 1 }} />
            <span>
              You&apos;ll sign on before checkout. Your cart is kept for this visit — it ends after
              15 minutes of inactivity.
            </span>
          </Typography>
          <CheckoutButton signedOn={signedOn} full />
        </Card>
      </Box>
    </Box>
  );
}
