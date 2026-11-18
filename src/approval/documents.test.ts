import { buildApprovalXml, parseApprovalXml } from "./documents";

test("an approval message round-trips its entries and escapes the order id", () => {
  const xml = buildApprovalXml([
    { orderId: 1, status: "APPROVED" },
    { orderId: "A&B", status: "DENIED" },
  ]);
  expect(xml).toContain("<OrderApproval>");
  expect(parseApprovalXml(xml)).toEqual([
    { orderId: "1", status: "APPROVED" },
    { orderId: "A&B", status: "DENIED" },
  ]);
});

test("an entry without a status is skipped", () => {
  expect(
    parseApprovalXml("<OrderApproval><Order><OrderId>1</OrderId></Order></OrderApproval>"),
  ).toEqual([]);
});
