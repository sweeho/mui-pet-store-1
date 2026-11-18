/** @jest-environment node */
import { buildOrderApproval, parseOrderApproval } from "./order-approval";

test("[SWHM2-C-0147] wrong document type is rejected by the OrderApproval parser", () => {
  expect(() =>
    parseOrderApproval("<Mail><Address>a</Address></Mail>", { validate: true }),
  ).toThrow();
  const ok = buildOrderApproval([{ orderId: "1", approved: true }]);
  expect(() => parseOrderApproval(ok, { validate: true })).not.toThrow();
});

test("[SWHM2-C-0149] approval outcomes produce one document with an entry per order", () => {
  const entries = [
    { orderId: "1", approved: true },
    { orderId: "2", approved: false },
    { orderId: "3", approved: true },
  ];
  const xml = buildOrderApproval(entries);
  expect(xml.match(/<OrderApproval[\s>]/g)).toHaveLength(1);
  expect(xml.match(/<Order[\s>]/g)).toHaveLength(3);
  expect(parseOrderApproval(xml, { validate: true })).toEqual(entries);
});

test("a malformed document is rejected", () => {
  expect(() => parseOrderApproval("<OrderApproval>", { validate: true })).toThrow();
});
