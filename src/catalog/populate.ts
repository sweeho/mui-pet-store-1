import { readFile } from "node:fs/promises";
import path from "node:path";

import { sql } from "drizzle-orm";

import type { Db } from "./queries";

export type CatalogSample = {
  locale: string;
  categories: { id: string; name: string }[];
  products: { id: string; categoryId: string; name: string; image: string; descn: string }[];
  items: {
    id: string;
    productId: string;
    listPrice: number;
    unitCost: number;
    image: string;
    descn: string;
    attrs: (string | null)[];
  }[];
};

export type PopulateCounts = { categories: number; products: number; items: number };

const decode = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

function attributes(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    out[m[1]] = decode(m[2] ?? m[3] ?? "");
  }
  return out;
}

/**
 * Parse the sample file. It has one fixed shape (catalog > category > product > item, data in
 * attributes), so a small scanner is enough and no XML dependency is needed.
 */
export function parseSample(xml: string): CatalogSample {
  const sample: CatalogSample = { locale: "en_US", categories: [], products: [], items: [] };
  let categoryId = "";
  let productId = "";
  for (const m of xml.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<(\/?)(\w+)([^>]*?)(\/?)>/g)) {
    const [, closing, name, rest] = m;
    if (closing) continue;
    const a = attributes(rest);
    if (name === "catalog") sample.locale = a.locale ?? sample.locale;
    else if (name === "category") {
      categoryId = a.id;
      sample.categories.push({ id: a.id, name: a.name });
    } else if (name === "product") {
      productId = a.id;
      sample.products.push({
        id: a.id,
        categoryId,
        name: a.name,
        image: a.image ?? "",
        descn: a.descn ?? "",
      });
    } else if (name === "item") {
      sample.items.push({
        id: a.id,
        productId,
        listPrice: Number(a.listPrice),
        unitCost: Number(a.unitCost),
        image: a.image ?? "",
        descn: a.descn ?? "",
        attrs: [1, 2, 3, 4, 5].map((n) => a[`attr${n}`] ?? null),
      });
    }
  }
  return sample;
}

export async function readSample(): Promise<CatalogSample> {
  const file = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "data/catalog/sample-catalog.xml",
  );
  return parseSample(await readFile(file, "utf8"));
}

/** Load the sample into the catalog tables in one transaction; loading it again changes nothing. */
export async function populateCatalog(db: Db): Promise<PopulateCounts> {
  const s = await readSample();
  await db.transaction(async (tx) => {
    for (const c of s.categories) {
      await tx.run(sql`INSERT OR IGNORE INTO category(catid) VALUES (${c.id})`);
      await tx.run(sql`INSERT INTO category_details(catid, locale, name)
        VALUES (${c.id}, ${s.locale}, ${c.name})
        ON CONFLICT(catid, locale) DO UPDATE SET name = excluded.name`);
    }
    for (const p of s.products) {
      await tx.run(
        sql`INSERT OR IGNORE INTO product(productid, catid) VALUES (${p.id}, ${p.categoryId})`,
      );
      await tx.run(sql`INSERT INTO product_details(productid, locale, name, image, descn)
        VALUES (${p.id}, ${s.locale}, ${p.name}, ${p.image}, ${p.descn})
        ON CONFLICT(productid, locale) DO UPDATE SET name = excluded.name,
          image = excluded.image, descn = excluded.descn`);
    }
    for (const i of s.items) {
      const [a1, a2, a3, a4, a5] = i.attrs;
      await tx.run(
        sql`INSERT OR IGNORE INTO item(itemid, productid) VALUES (${i.id}, ${i.productId})`,
      );
      await tx.run(sql`INSERT INTO item_details(itemid, locale, list_price, unit_cost, image, descn,
          attr1, attr2, attr3, attr4, attr5)
        VALUES (${i.id}, ${s.locale}, ${i.listPrice}, ${i.unitCost}, ${i.image}, ${i.descn},
          ${a1}, ${a2}, ${a3}, ${a4}, ${a5})
        ON CONFLICT(itemid, locale) DO UPDATE SET list_price = excluded.list_price,
          unit_cost = excluded.unit_cost, image = excluded.image, descn = excluded.descn,
          attr1 = excluded.attr1, attr2 = excluded.attr2, attr3 = excluded.attr3,
          attr4 = excluded.attr4, attr5 = excluded.attr5`);
    }
  });
  return { categories: s.categories.length, products: s.products.length, items: s.items.length };
}
