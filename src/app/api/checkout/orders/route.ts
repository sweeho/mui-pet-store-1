import { loadSession, SESSION_COOKIE } from "@/accounts/web-session";
import { DEFAULT_LANGUAGE } from "@/accounts/session";
import { getItemIds, getQuantity } from "@/cart/cart";
import { CART_COOKIE, loadCart, saveCart } from "@/cart/store";
import { getItem } from "@/catalog/queries";
import { STOREFRONT_LOCALE } from "@/catalog/screen";
import { type Address, createContact } from "@/checkout/contact";
import { nextIdentifier } from "@/checkout/ids";
import { recordOrder, storePaymentCard } from "@/checkout/store";
import { ANONYMOUS, ORDER_SEQUENCE, type SubmitLine, buildOrder } from "@/checkout/submit";
import { getDb } from "@/db/client";

import { parseCookies, seeOther } from "../../accounts/redirects";

const field = (form: FormData, name: string) => {
  const v = form.get(name);
  return typeof v === "string" ? v : "";
};
const bad = (message: string) => Response.json({ error: message }, { status: 400 });

const ADDRESS_FIELDS = ["street1", "city", "state", "zip", "country"] as const;
const addressOf = (form: FormData, prefix: string) => ({
  street1: field(form, `${prefix}Street1`).trim(),
  street2: field(form, `${prefix}Street2`).trim(),
  city: field(form, `${prefix}City`).trim(),
  state: field(form, `${prefix}State`).trim(),
  zip: field(form, `${prefix}Zip`).trim(),
  country: field(form, `${prefix}Country`).trim(),
});

/**
 * POST /api/checkout/orders (design.md P6). JSON `{ items }` is the locked contract: each item at
 * quantity 1. A form post is the checkout page: the visit's cart, the contact, addresses and card.
 * Either way the order carries the placeholder card and is recorded under the signed-on user, or
 * "anonymous" without a session (SD2).
 */
export async function POST(request: Request): Promise<Response> {
  const db = await getDb();
  const cookies = parseCookies(request.headers.get("cookie"));
  const sessionId = cookies[SESSION_COOKIE];
  const session = sessionId ? await loadSession(db, sessionId, Date.now()) : null;
  const signedOn = session?.signedOn ? session : null;
  const userId = signedOn?.username ?? ANONYMOUS;
  const locale = signedOn?.language ?? DEFAULT_LANGUAGE;

  const isForm = !(request.headers.get("content-type") ?? "").includes("json");
  const form = isForm ? await request.formData().catch(() => null) : null;
  if (isForm && !form) return bad("the request body is not a form");
  let items: Record<string, number> = {};
  if (form) {
    const cartId = cookies[CART_COOKIE];
    const cart = cartId ? await loadCart(db, cartId, Date.now()) : new Map<string, number>();
    items = Object.fromEntries(getItemIds(cart).map((id) => [id, getQuantity(cart, id) ?? 0]));
  } else {
    const body = (await request.json().catch(() => null)) as { items?: unknown } | null;
    if (!Array.isArray(body?.items) || !body.items.every((i) => typeof i === "string")) {
      return bad("items must be a list of item ids");
    }
    for (const id of body.items as string[]) items[id] = (items[id] ?? 0) + 1;
  }

  const lines: SubmitLine[] = [];
  for (const [itemId, quantity] of Object.entries(items)) {
    const item = await getItem(db, itemId, STOREFRONT_LOCALE);
    if (item && quantity > 0) lines.push({ itemId, quantity, unitPrice: item.listPrice });
  }
  if (lines.length === 0) return bad("an order needs at least one item");

  let contact = createContact();
  let billTo: Address | undefined;
  let enteredCardId: number | null = null;
  if (form) {
    const shipTo = addressOf(form, "ship");
    const same = form.get("sameAsShipping") !== null;
    billTo = same ? shipTo : addressOf(form, "bill");
    const card = {
      cardNumber: field(form, "cardNumber").trim(),
      cardType: field(form, "cardType").trim(),
      expiryDate: field(form, "expiryDate").trim(),
    };
    const missing = [
      ...ADDRESS_FIELDS.filter((f) => !shipTo[f]),
      ...ADDRESS_FIELDS.filter((f) => !billTo?.[f]),
      ...Object.values(card).filter((v) => !v),
    ];
    if (missing.length > 0) return bad("required address and card fields are missing");
    // Name, telephone and e-mail are not validated (R-0151).
    contact = createContact({
      givenName: field(form, "givenName").trim(),
      familyName: field(form, "familyName").trim(),
      telephone: field(form, "telephone").trim(),
      email: field(form, "email").trim(),
      address: shipTo,
    });
    enteredCardId = await storePaymentCard(db, card);
  }

  const orderId = await nextIdentifier(db, ORDER_SEQUENCE);
  await recordOrder(
    db,
    buildOrder({ orderId, userId, locale, contact, billTo, lines, now: Date.now(), enteredCardId }),
  );

  if (!form) return Response.json({ orderId });
  const cartId = cookies[CART_COOKIE];
  if (cartId) await saveCart(db, cartId, new Map(), Date.now());
  return seeOther(`/checkout/orders/${orderId}`);
}
