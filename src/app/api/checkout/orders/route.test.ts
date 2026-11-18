/** @jest-environment node */
import { sql } from "drizzle-orm";

import { createCart, createSession } from "@/accounts/session";
import { SESSION_COOKIE, saveSession } from "@/accounts/web-session";
import { addItem, createCart as newCart, getItemIds } from "@/cart/cart";
import { CART_COOKIE, loadCart, saveCart } from "@/cart/store";
import { useIsolatedDatabase } from "@/db/isolated";

import { GET } from "./[id]/route";
import { POST } from "./route";

let db: Awaited<ReturnType<typeof useIsolatedDatabase>>;
beforeAll(async () => {
  db = await useIsolatedDatabase();
});

const postJson = (body: unknown, cookie?: string) =>
  POST(
    new Request("http://localhost/api/checkout/orders", {
      method: "POST",
      headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    }),
  );
const postForm = (fields: Record<string, string>, cookie: string) =>
  POST(
    new Request("http://localhost/api/checkout/orders", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", cookie },
      body: new URLSearchParams(fields),
    }),
  );
const read = (id: string, cookie?: string) =>
  GET(
    new Request(`http://localhost/api/checkout/orders/${id}`, {
      headers: cookie ? { cookie } : {},
    }),
    {
      params: Promise.resolve({ id }),
    },
  );

async function signOnAs(username: string) {
  const session = { ...createSession({ language: "en_US" }), signedOn: true, username };
  return `${SESSION_COOKIE}=${await saveSession(db, session, createCart({ language: "en_US" }))}`;
}

const FORM = {
  givenName: "Ana",
  familyName: "Okafor",
  email: "",
  telephone: "",
  shipStreet1: "1 Main St",
  shipCity: "Mountain View",
  shipState: "CA",
  shipZip: "94043",
  shipCountry: "USA",
  billStreet1: "500 Oracle Pkwy",
  billCity: "Redwood City",
  billState: "CA",
  billZip: "94065",
  billCountry: "USA",
  cardNumber: "4111 1111 1111 1111",
  cardType: "Visa",
  expiryDate: "04/2028",
};

describe("/api/checkout/orders", () => {
  it("[SWHM2-C-0054] an order is placed with the placeholder card and read back", async () => {
    const res = await postJson({ items: ["EST-1"] });
    expect(res.status).toBe(200);
    const { orderId } = (await res.json()) as { orderId: string };
    expect(orderId).toMatch(/^1001\d+$/);
    const order = (await (await read(orderId)).json()) as Record<string, unknown>;
    expect(order.paymentCard).toEqual({
      cardNumber: "1234-2334",
      cardType: "Duke Express",
      expiryDate: "10/2001",
    });
    expect(order.userId).toBe("anonymous");
    expect(order.totalPrice).toBe(16.5);
  });

  it("the same item listed twice is quantity 2, and an unreadable body is a 400", async () => {
    const { orderId } = (await (await postJson({ items: ["EST-1", "EST-1"] })).json()) as {
      orderId: string;
    };
    const order = (await (await read(orderId)).json()) as { totalPrice: number };
    expect(order.totalPrice).toBe(33);
    const res = await POST(
      new Request("http://localhost/api/checkout/orders", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "not a form",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("an order without items, or with an unknown item only, is a 400", async () => {
    expect((await postJson({ items: [] })).status).toBe(400);
    expect((await postJson({ items: ["NOPE-1"] })).status).toBe(400);
    expect((await postJson({})).status).toBe(400);
  });

  it("an order is readable only by the user who placed it", async () => {
    const jane = await signOnAs("jane");
    const { orderId } = (await (await postJson({ items: ["EST-1"] }, jane)).json()) as {
      orderId: string;
    };
    expect((await read(orderId, jane)).status).toBe(200);
    expect((await read(orderId, await signOnAs("joe"))).status).toBe(404);
    expect((await read(orderId)).status).toBe(404);
    expect((await read("nope", jane)).status).toBe(404);
  });

  it("the checkout form records the order, keeps the entered card aside and empties the cart", async () => {
    const cart = newCart();
    addItem(cart, "EST-1", 2);
    await saveCart(db, "cart-1", cart, Date.now());
    const cookie = `${await signOnAs("ana")}; ${CART_COOKIE}=cart-1`;
    const res = await postForm(FORM, cookie);
    expect(res.status).toBe(303);
    const orderId = /\/checkout\/orders\/(\d+)$/.exec(res.headers.get("location") ?? "")?.[1];
    expect(orderId).toBeDefined();
    const body = await (await read(orderId as string, cookie)).text();
    const order = JSON.parse(body) as Record<string, unknown>;
    expect(order.userId).toBe("ana");
    expect(order.totalPrice).toBe(33);
    expect(order.paymentCard).toMatchObject({ cardNumber: "1234-2334" });
    expect(order.emailAddress).toBe("");
    expect(body).not.toContain("4111");
    const stored = (await db.all(sql`SELECT card_number FROM payment_card`)) as {
      card_number: string;
    }[];
    expect(stored.map((r) => r.card_number)).toContain("4111 1111 1111 1111");
    expect(getItemIds(await loadCart(db, "cart-1", Date.now()))).toEqual([]);
  });

  it("the checkout form with a required address or card field missing is a 400", async () => {
    const cart = newCart();
    addItem(cart, "EST-1");
    await saveCart(db, "cart-2", cart, Date.now());
    const res = await postForm({ ...FORM, shipCity: "" }, `${CART_COOKIE}=cart-2`);
    expect(res.status).toBe(400);
    expect(getItemIds(await loadCart(db, "cart-2", Date.now()))).toEqual(["EST-1"]);
  });

  it("same as shipping address bills to the shipping address", async () => {
    const cart = newCart();
    addItem(cart, "EST-1");
    await saveCart(db, "cart-3", cart, Date.now());
    const cookie = `${CART_COOKIE}=cart-3`;
    const res = await postForm({ ...FORM, sameAsShipping: "on", billCity: "" }, cookie);
    const id = /(\d+)$/.exec(res.headers.get("location") ?? "")?.[1] as string;
    const order = (await (await read(id, cookie)).json()) as { billTo: { city: string } };
    expect(order.billTo.city).toBe("Mountain View");
  });
});
