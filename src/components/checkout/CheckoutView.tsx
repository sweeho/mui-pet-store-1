"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { IconArrowLeft, IconArrowRight, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";
import { type ChangeEvent, useState } from "react";

import type { CartLine } from "@/cart/listing";
import { EmptyFrame } from "@/components/frames/EmptyFrame";
import { withBasePath } from "@/lib/paths";

import { formatPrice } from "../catalog/parts";
import { Block, CheckoutHeading, KeyValues, Steps, mono } from "./parts";

export type CheckoutViewProps = { lines: CartLine[]; subtotal: number };

const noLink = { color: "inherit", textDecoration: "none" };
const plural = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;

type FieldDef = { name: string; label: string; optional?: boolean; mono?: boolean; auto?: string };
const addressFields = (prefix: "ship" | "bill"): FieldDef[] => [
  {
    name: `${prefix}Street1`,
    label: "Street line 1",
    auto: `${prefix === "ship" ? "shipping" : "billing"} address-line1`,
  },
  { name: `${prefix}Street2`, label: "Street line 2", optional: true },
  { name: `${prefix}City`, label: "City" },
  { name: `${prefix}State`, label: "State" },
  { name: `${prefix}Zip`, label: "Zip code", mono: true },
  { name: `${prefix}Country`, label: "Country" },
];
const SHIP = addressFields("ship");
const BILL = addressFields("bill");
const CONTACT: FieldDef[] = [
  { name: "givenName", label: "Given name", optional: true, auto: "given-name" },
  { name: "familyName", label: "Family name", optional: true, auto: "family-name" },
  { name: "email", label: "Email", optional: true, auto: "email" },
  { name: "telephone", label: "Phone", optional: true, auto: "tel" },
];
const CARD: FieldDef[] = [
  { name: "cardNumber", label: "Card number", mono: true, auto: "cc-number" },
  { name: "cardType", label: "Card type", auto: "cc-type" },
  { name: "expiryDate", label: "Expiry date", mono: true, auto: "cc-exp" },
];
const required = (fields: FieldDef[]) => fields.filter((f) => !f.optional).map((f) => f.name);

/**
 * `/checkout`: shipping and contact, then billing and payment, in one form that is posted once by
 * Place order (design.md P8). Both steps stay in the form, so one post carries every field.
 */
export function CheckoutView({ lines, subtotal }: CheckoutViewProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [same, setSame] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const v = (name: string) => values[name] ?? "";
  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const missing = (names: string[]) => names.filter((n) => !v(n).trim());

  if (lines.length === 0) {
    return (
      <Box sx={{ maxWidth: 1104 }}>
        <CheckoutHeading
          trail={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]}
          title="Checkout"
          subtitle="Your cart is empty."
        />
        <Card variant="outlined">
          <EmptyFrame
            title="Your cart is empty"
            message="Add a pet to your cart before you check out."
            action={
              <Button
                variant="contained"
                component={Link}
                href="/cart"
                sx={{ textTransform: "none" }}
              >
                Back to cart
              </Button>
            }
          />
        </Card>
      </Box>
    );
  }

  const field = (f: FieldDef, extra: { hint?: string; placeholder?: string } = {}) => {
    // Only the visible step names its missing fields.
    const onStep = f.name.startsWith("ship") ? step === 1 : step === 2;
    const bad = showErrors && onStep && !f.optional && !v(f.name).trim();
    return (
      <TextField
        key={f.name}
        name={f.name}
        label={f.optional && f.name.includes("Street2") ? `${f.label} (optional)` : f.label}
        value={v(f.name)}
        onChange={onChange}
        size="small"
        required={false}
        error={bad}
        placeholder={extra.placeholder}
        helperText={bad ? `${f.label} is required` : extra.hint}
        sx={{
          gridColumn:
            f.name.endsWith("Street1") || f.name.endsWith("Street2") || f.name === "cardNumber"
              ? { sm: "1 / -1" }
              : undefined,
        }}
        slotProps={{
          htmlInput: {
            "aria-label": f.label,
            autoComplete: f.auto,
            style: f.mono ? mono : undefined,
          },
          inputLabel: {
            shrink: true,
          },
        }}
      />
    );
  };
  const grid = { display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } };

  const toBilling = () => {
    const bad = missing(required(SHIP));
    setShowErrors(bad.length > 0);
    if (bad.length === 0) setStep(2);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const bad = missing([...required(CARD), ...(same ? [] : required(BILL))]);
    if (bad.length > 0) {
      e.preventDefault();
      setShowErrors(true);
    }
  };

  const shipLine = [
    v("shipStreet1"),
    v("shipStreet2"),
    v("shipCity"),
    `${v("shipState")} ${v("shipZip")}`.trim(),
    v("shipCountry"),
  ]
    .filter(Boolean)
    .join(", ");
  const fullName = `${v("givenName")} ${v("familyName")}`.trim();

  return (
    <Box sx={{ maxWidth: 1104 }}>
      <CheckoutHeading
        trail={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]}
        title="Checkout"
        subtitle={
          step === 1
            ? "Where should we send your pets, and how can we reach you?"
            : "Add a billing address and payment card, then place your order."
        }
        action={
          step === 1 ? (
            <Button
              component={Link}
              href="/cart"
              color="inherit"
              startIcon={<IconArrowLeft size={16} />}
              sx={{ textTransform: "none" }}
            >
              Back to cart
            </Button>
          ) : undefined
        }
      />
      <Steps current={step} />
      <Box
        sx={{
          display: "grid",
          gap: 3,
          alignItems: "start",
          gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
        }}
      >
        <form
          method="post"
          action={withBasePath("/api/checkout/orders")}
          onSubmit={onSubmit}
          noValidate
        >
          <Box hidden={step !== 1}>
            <Block title="Contact" hint="Used for order e-mails and delivery questions.">
              <Box sx={grid}>{CONTACT.map((f) => field(f))}</Box>
            </Block>
            <Block
              title="Shipping address"
              hint="Street line 1, city, state, zip code and country are required."
            >
              <Box sx={grid}>
                {SHIP.map((f) =>
                  field(f, f.optional ? { placeholder: "Apartment, suite, unit" } : {}),
                )}
              </Box>
            </Block>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                component={Link}
                href="/cart"
                variant="outlined"
                color="inherit"
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                type="button"
                variant="contained"
                onClick={toBilling}
                endIcon={<IconArrowRight size={16} />}
                sx={{ textTransform: "none" }}
              >
                Continue to billing and payment
              </Button>
            </Box>
          </Box>
          <Box hidden={step !== 2}>
            <Block title="Billing address" hint={`Shipping to ${shipLine}.`}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="sameAsShipping"
                    checked={same}
                    onChange={(e) => setSame(e.target.checked)}
                  />
                }
                label="Same as shipping address"
              />
              <Box sx={{ ...grid, mt: 1, display: same ? "none" : "grid" }}>
                {BILL.map((f) =>
                  field(f, f.optional ? { placeholder: "Apartment, suite, unit" } : {}),
                )}
              </Box>
            </Block>
            <Block title="Payment card" hint="All three fields are required.">
              <Box sx={grid}>
                {field(CARD[0])}
                {field(CARD[1], { hint: "As printed on the card, e.g. Visa" })}
                {field(CARD[2], { hint: "Month and year as MM/YYYY", placeholder: "MM/YYYY" })}
              </Box>
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  display: "flex",
                  gap: 1,
                  borderLeft: 3,
                  borderColor: "warning.main",
                  bgcolor: "action.hover",
                  borderRadius: 1,
                }}
              >
                <IconInfoCircle size={16} aria-hidden style={{ flex: "none", marginTop: 3 }} />
                <Typography variant="body2">
                  <b>Your card is not charged yet.</b> While the store moves to its new payment
                  provider, every order is submitted with the store&apos;s placeholder card (
                  <span style={mono}>Duke Express · 1234-2334 · 10/2001</span>). The card you enter
                  here is saved to your order details.
                </Typography>
              </Box>
            </Block>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                onClick={() => setStep(1)}
                startIcon={<IconArrowLeft size={16} />}
                sx={{ textTransform: "none" }}
              >
                Back
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button type="submit" variant="contained" sx={{ textTransform: "none" }}>
                Place order · <span style={mono}>&nbsp;{formatPrice(subtotal)}</span>
              </Button>
            </Box>
          </Box>
        </form>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="h3" sx={{ fontSize: 14, fontWeight: 600 }}>
                Order summary
              </Typography>
              <Typography
                component={Link}
                href="/cart"
                variant="caption"
                sx={{ ...noLink, color: "primary.main", fontWeight: 600 }}
              >
                Edit cart
              </Typography>
            </Box>
            {lines.map((l) => (
              <Box key={l.itemId} sx={{ display: "flex", gap: 1, py: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>{l.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    <span style={mono}>{l.itemId}</span> · {l.attribute} · Qty{" "}
                    <span style={mono}>{l.quantity}</span> ×{" "}
                    <span style={mono}>{formatPrice(l.unitCost)}</span>
                  </Typography>
                </Box>
                <Typography sx={mono}>{formatPrice(l.total)}</Typography>
              </Box>
            ))}
            <Box sx={{ borderTop: 1, borderColor: "divider", mt: 1, pt: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">
                  Subtotal · {plural(lines.reduce((n, l) => n + l.quantity, 0))}
                </Typography>
                <Typography sx={mono}>{formatPrice(subtotal)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>Order total</Typography>
                <Typography sx={{ ...mono, fontWeight: 600, fontSize: 18 }}>
                  {formatPrice(subtotal)} USD
                </Typography>
              </Box>
            </Box>
          </Card>
          {step === 2 ? (
            <KeyValues
              title="Contact"
              rows={[
                ["Name", fullName || "—"],
                ["Email", v("email") || "—"],
                ["Phone", v("telephone") || "—"],
              ]}
            />
          ) : (
            <Card variant="outlined" sx={{ p: 2, display: "flex", gap: 1 }}>
              <IconInfoCircle size={16} aria-hidden style={{ flex: "none", marginTop: 3 }} />
              <Typography variant="body2" color="text.secondary">
                Your order total decides approval. US orders under <span style={mono}>$500.00</span>{" "}
                are approved straight away; larger orders wait for an administrator.
              </Typography>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}
