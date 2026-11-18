/** @jest-environment node */
import { useIsolatedDatabase } from "@/db/isolated";
import type { Db } from "@/catalog/queries";
import { addCategory, addItem, addProduct, resetData } from "@/catalog/fixtures.test";

import { getCatalogItem } from "./catalog";

let db: Db;
beforeAll(async () => {
  db = await useIsolatedDatabase();
});
beforeEach(async () => {
  await resetData(db);
});

describe("getCatalogItem", () => {
  it("[SWHM2-C-0169] shows the zh_CN detail row, not the en_US one", async () => {
    for (const locale of ["en_US", "zh_CN"]) await addCategory(db, "C1", "Cats", locale);
    await addProduct(db, "P1", "C1", "Cat", "en_US");
    await addItem(db, "I18N-1", "P1", { descn: "English text", locale: "en_US" });
    // The zh_CN rows reuse the item and product rows, so insert only their detail rows.
    const { sql } = await import("drizzle-orm");
    await db.run(
      sql`INSERT INTO product_details(productid, locale, name, image, descn) VALUES ('P1', 'zh_CN', '猫', 'zhp.png', '猫')`,
    );
    await db.run(
      sql`INSERT INTO item_details(itemid, locale, list_price, unit_cost, image, descn, attr1, attr2, attr3, attr4, attr5) VALUES ('I18N-1', 'zh_CN', 1, 1, 'zh.png', '中文描述', 'a', 'b', 'c', 'd', 'e')`,
    );
    expect(await getCatalogItem(db, "I18N-1", "zh_CN")).toEqual({
      name: "猫",
      description: "中文描述",
      image: "zh.png",
    });
    expect((await getCatalogItem(db, "I18N-1", "en_US"))?.description).toBe("English text");
  });
});
