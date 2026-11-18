import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

// Catalog (SWHM2-I-0002). Ids are short text keys; the per-locale detail tables are keyed by
// (id, locale). There is deliberately no check between list price and unit cost.
export const category = sqliteTable("category", {
  catid: text("catid", { length: 10 }).primaryKey(),
});

export const categoryDetails = sqliteTable(
  "category_details",
  {
    catid: text("catid", { length: 10 })
      .notNull()
      .references(() => category.catid),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
  },
  (t) => [primaryKey({ columns: [t.catid, t.locale] })],
);

export const product = sqliteTable(
  "product",
  {
    productid: text("productid", { length: 10 }).primaryKey(),
    catid: text("catid", { length: 10 })
      .notNull()
      .references(() => category.catid),
  },
  (t) => [index("product_catid_idx").on(t.catid)],
);

export const productDetails = sqliteTable(
  "product_details",
  {
    productid: text("productid", { length: 10 })
      .notNull()
      .references(() => product.productid),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    image: text("image"),
    descn: text("descn"),
  },
  (t) => [primaryKey({ columns: [t.productid, t.locale] })],
);

export const item = sqliteTable(
  "item",
  {
    itemid: text("itemid", { length: 10 }).primaryKey(),
    productid: text("productid", { length: 10 })
      .notNull()
      .references(() => product.productid),
  },
  (t) => [index("item_productid_idx").on(t.productid)],
);

export const itemDetails = sqliteTable(
  "item_details",
  {
    itemid: text("itemid", { length: 10 })
      .notNull()
      .references(() => item.itemid),
    locale: text("locale").notNull(),
    listPrice: real("list_price").notNull(),
    unitCost: real("unit_cost").notNull(),
    image: text("image").notNull(),
    descn: text("descn").notNull(),
    attr1: text("attr1"),
    attr2: text("attr2"),
    attr3: text("attr3"),
    attr4: text("attr4"),
    attr5: text("attr5"),
  },
  (t) => [primaryKey({ columns: [t.itemid, t.locale] })],
);

// Customer accounts (SWHM2-I-0003). Every column is NOT NULL except street2 and favorite_category;
// the constraints are what rejects an incomplete record (design.md P1, P2). Passwords are kept as
// supplied (R-0161, design.md D5).
export const signOn = sqliteTable(
  "sign_on",
  {
    username: text("username").primaryKey(),
    password: text("password").notNull(),
  },
  (t) => [
    check("sign_on_username_length", sql`length(${t.username}) BETWEEN 1 AND 50`),
    check("sign_on_password_length", sql`length(${t.password}) BETWEEN 1 AND 50`),
  ],
);

export const address = sqliteTable("address", {
  addressId: integer("address_id").primaryKey({ autoIncrement: true }),
  street1: text("street1").notNull(),
  street2: text("street2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  country: text("country").notNull(),
});

export const creditCard = sqliteTable("credit_card", {
  cardId: integer("card_id").primaryKey({ autoIncrement: true }),
  cardNumber: text("card_number").notNull(),
  cardType: text("card_type").notNull(),
  expiryDate: text("expiry_date").notNull(),
});

export const contact = sqliteTable("contact", {
  contactId: integer("contact_id").primaryKey({ autoIncrement: true }),
  familyName: text("family_name").notNull(),
  givenName: text("given_name").notNull(),
  telephone: text("telephone").notNull(),
  email: text("email").notNull(),
  addressId: integer("address_id")
    .notNull()
    .references(() => address.addressId),
});

export const account = sqliteTable(
  "account",
  {
    accountId: integer("account_id").primaryKey({ autoIncrement: true }),
    status: text("status").notNull(),
    contactId: integer("contact_id")
      .notNull()
      .references(() => contact.contactId),
    cardId: integer("card_id")
      .notNull()
      .references(() => creditCard.cardId),
  },
  (t) => [check("account_status", sql`${t.status} IN ('active', 'disabled')`)],
);

export const profile = sqliteTable("profile", {
  profileId: integer("profile_id").primaryKey({ autoIncrement: true }),
  language: text("language").notNull(),
  favoriteCategory: text("favorite_category"),
  myList: integer("my_list", { mode: "boolean" }).notNull(),
  banner: integer("banner", { mode: "boolean" }).notNull(),
});

export const customer = sqliteTable("customer", {
  userId: text("user_id")
    .primaryKey()
    .references(() => signOn.username),
  accountId: integer("account_id")
    .notNull()
    .references(() => account.accountId),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profile.profileId),
});

// One row per browser session (design.md P6): the 15-minute idle rule is applied on every page.
export const webSession = sqliteTable("web_session", {
  sessionId: text("session_id").primaryKey(),
  username: text("username"),
  signedOn: integer("signed_on", { mode: "boolean" }).notNull(),
  language: text("language").notNull(),
  cartLanguage: text("cart_language").notNull(),
  lastAccess: integer("last_access").notNull(),
});

// One row per shopper visit (design.md P2, P3): the item id to quantity map as JSON. The browser
// holds only the random cart id; the 15-minute idle rule is applied on read.
export const shoppingCart = sqliteTable("shopping_cart", {
  cartId: text("cart_id").primaryKey(),
  contents: text("contents").notNull(),
  lastAccess: integer("last_access").notNull(),
});

// Checkout (SWHM2-I-0005, design.md P2). An order keeps a snapshot of its contact, addresses and
// card and has no foreign keys into address, contact or credit_card.
export const paymentCard = sqliteTable("payment_card", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardNumber: text("card_number").notNull(),
  cardType: text("card_type").notNull(),
  expiryDate: text("expiry_date").notNull(),
});

export const sequence = sqliteTable("sequence", {
  name: text("name").primaryKey(),
  counter: integer("counter").notNull(),
});

export const checkoutOrder = sqliteTable("checkout_order", {
  orderId: text("order_id").primaryKey(),
  userId: text("user_id").notNull(),
  emailAddress: text("email_address").notNull(),
  orderDate: integer("order_date").notNull(),
  locale: text("locale").notNull(),
  totalPrice: real("total_price").notNull(),
  shipTo: text("ship_to").notNull(),
  billTo: text("bill_to").notNull(),
  cardNumber: text("card_number").notNull(),
  cardType: text("card_type").notNull(),
  expiryDate: text("expiry_date").notNull(),
  enteredCardId: integer("entered_card_id").references(() => paymentCard.id),
});

export const checkoutOrderLine = sqliteTable(
  "checkout_order_line",
  {
    orderId: text("order_id")
      .notNull()
      .references(() => checkoutOrder.orderId, { onDelete: "cascade" }),
    lineNo: integer("line_no").notNull(),
    itemId: text("item_id").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: real("unit_price").notNull(),
  },
  (t) => [primaryKey({ columns: [t.orderId, t.lineNo] })],
);
