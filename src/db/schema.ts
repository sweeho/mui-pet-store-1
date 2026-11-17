import { index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
