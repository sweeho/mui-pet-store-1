"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableFooter from "@mui/material/TableFooter";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { IconClockHour4, IconCreditCard } from "@tabler/icons-react";
import Link from "next/link";

import type { Address } from "@/checkout/contact";
import type { Order } from "@/checkout/store";

import { formatPrice } from "../catalog/parts";
import { CheckoutHeading, KeyValues, Steps, mono } from "./parts";

export type OrderConfirmationViewProps = {
  order: Order;
  /** Item descriptions by item id; a line falls back to its item id. */
  names?: Record<string, string>;
};

const placed = (ms: number, withTime: boolean) =>
  new Date(ms).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "UTC",
  });

function AddressCard({ title, name, a }: { title: string; name: string; a: Address }) {
  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h2" sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ lineHeight: "22px" }}>
        {name ? <div>{name}</div> : null}
        <div>{a.street1}</div>
        {a.street2 ? <div>{a.street2}</div> : null}
        <div>
          {a.city}, {a.state} <span style={mono}>{a.zip}</span>
        </div>
        <div>{a.country}</div>
      </Box>
    </Card>
  );
}

/** `/checkout/orders/{id}`: the placed order with its placeholder card. */
export function OrderConfirmationView({ order, names = {} }: OrderConfirmationViewProps) {
  const c = order.contact;
  const name = `${c.givenName} ${c.familyName}`.trim();
  const lines = order.lineItems ?? [];
  const cell = { px: 1.5, py: 1, borderColor: "divider", fontSize: 14 };
  return (
    <Box sx={{ maxWidth: 1104 }}>
      <CheckoutHeading
        title="Thank you, your order is placed"
        subtitle={
          <>
            Order <b style={mono}>{order.orderId}</b> · placed {placed(order.orderDate, true)}
          </>
        }
        action={
          <Button
            component={Link}
            href="/"
            variant="outlined"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Continue shopping
          </Button>
        }
      />
      <Steps current={3} />
      <Box
        sx={{
          display: "grid",
          gap: 3,
          alignItems: "start",
          gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
        }}
      >
        <Box>
          <Card
            variant="outlined"
            sx={{ p: 2, mb: 2, display: "flex", gap: 2, alignItems: "center" }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                border: 1,
                borderColor: "divider",
                color: "warning.main",
              }}
            >
              <IconClockHour4 size={20} aria-hidden />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>
                Order status: <span data-testid="order-status">Submitted — awaiting approval</span>
              </Typography>
              <Typography color="text.secondary">
                Your order has been recorded. You will be told when it is approved.
              </Typography>
            </Box>
          </Card>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 600, p: 2, pb: 1 }}>
              Items
            </Typography>
            <Table sx={{ "& .MuiTableCell-root": cell }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>Item ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Unit price</TableCell>
                  <TableCell align="right">Line total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map((l) => (
                  <TableRow key={l.itemId}>
                    <TableCell sx={{ ...mono, whiteSpace: "nowrap" }}>{l.itemId}</TableCell>
                    <TableCell>{names[l.itemId] ?? l.itemId}</TableCell>
                    <TableCell align="right" sx={mono}>
                      {l.quantity}
                    </TableCell>
                    <TableCell align="right" sx={mono}>
                      {formatPrice(l.unitPrice)}
                    </TableCell>
                    <TableCell align="right" sx={mono}>
                      {formatPrice(l.quantity * l.unitPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 600 }}>
                    Order total
                  </TableCell>
                  <TableCell align="right" sx={{ ...mono, fontWeight: 600 }}>
                    {formatPrice(order.totalPrice)} USD
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Card>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <AddressCard title="Ship to" name={name} a={c.address} />
            <AddressCard title="Bill to" name={name} a={order.billTo ?? c.address} />
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <KeyValues
            title="Order details"
            rows={[
              ["Order ID", order.orderId, true],
              ["User ID", order.userId, true],
              ["Date", placed(order.orderDate, false)],
              ["Locale", order.locale, true],
              ["Total", formatPrice(order.totalPrice), true],
            ]}
          />
          <KeyValues
            title="Contact"
            rows={[
              ["Name", name || "—"],
              ["Email", c.email || "—"],
              ["Phone", c.telephone || "—"],
            ]}
          />
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: 14,
                fontWeight: 600,
                mb: 1.5,
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <IconCreditCard size={16} aria-hidden />
              Payment card on order
            </Typography>
            <Box
              component="dl"
              sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 1, m: 0 }}
            >
              <Typography component="dt" color="text.secondary">
                Card
              </Typography>
              <Typography component="dd" sx={{ m: 0, ...mono }}>
                {order.paymentCard.cardNumber}
              </Typography>
              <Typography component="dt" color="text.secondary">
                Type
              </Typography>
              <Typography component="dd" sx={{ m: 0 }}>
                {order.paymentCard.cardType}
              </Typography>
              <Typography component="dt" color="text.secondary">
                Expiry
              </Typography>
              <Typography component="dd" sx={{ m: 0, ...mono }}>
                {order.paymentCard.expiryDate}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1.5 }}>
              Store placeholder card. Your own card was not charged.
            </Typography>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
