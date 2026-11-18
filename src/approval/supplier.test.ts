/** @jest-environment node */
import { sql } from "drizzle-orm";

import { makeEnv, seedOrder, type TestEnv } from "./helpers.test";
import { buildSupplierOrderXml } from "./supplier";

let t: TestEnv;
beforeEach(async () => {
  t = await makeEnv();
});

test("the supplier order holds the order id, date and one LineItem per line", async () => {
  await seedOrder(t.env, 400, "APPROVED", 2);
  const xml = await buildSupplierOrderXml(t.env, "400");
  expect(xml).toContain("<OrderId>400</OrderId>");
  expect(xml).toContain("<OrderDate>2026-11-18</OrderDate>");
  expect(xml.match(/<LineItem>/g)).toHaveLength(2);
  expect(xml).toContain("<ItemId>EST-2</ItemId>");
  expect(xml).toContain("<Quantity>2</Quantity>");
  expect(xml).toContain("<ShippingInfo></ShippingInfo>");
});

test("the shipping info comes from the checkout order of the same id", async () => {
  await seedOrder(t.env, 401, "APPROVED", 1);
  await t.env.db.run(
    sql`INSERT INTO checkout_order (order_id, user_id, email_address, order_date, locale, total_price,
          ship_to, bill_to, card_number, card_type, expiry_date)
        VALUES ('401', 'j2ee', '', 0, 'en_US', 1, ${JSON.stringify({ givenName: "Ana", familyName: "O", address: { street1: "1 Main <St>", city: "Town" } })}, '{}', '', '', '')`,
  );
  const xml = await buildSupplierOrderXml(t.env, "401");
  expect(xml).toContain("<Name>Ana O</Name>");
  expect(xml).toContain("<Street1>1 Main &lt;St&gt;</Street1>");
});
