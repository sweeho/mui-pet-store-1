/** @jest-environment node */
import { buildInvoiceXml, buildSupplierOrderXml, parseDocument, toLineItem } from "./documents";

import { NOW, SHIPPING, line } from "../../tests/acceptance/order-fulfilment/harness";

describe("documents", () => {
  it("[SWHM2-C-0204] SupplierOrder XML has order id, yyyy-MM-dd date, shipping and lines", () => {
    const xml = buildSupplierOrderXml({
      orderId: "S1",
      date: NOW,
      shipping: SHIPPING,
      lines: [line(1, "EST-1", 2)],
    });
    expect(xml).toMatch(/<SupplierOrder[\s>]/);
    expect(xml).toMatch(/<OrderId>S1<\/OrderId>/);
    expect(xml).toMatch(/<OrderDate>2026-11-18<\/OrderDate>/);
    expect(xml).toMatch(/<ShippingInfo[\s>]/);
    expect(xml.match(/<LineItem[\s>]/g)).toHaveLength(1);
  });

  it("[SWHM2-C-0208] a document failing DTD validation is rejected", () => {
    const bad = `<?xml version="1.0"?><!DOCTYPE Doc [<!ELEMENT Doc (A)><!ELEMENT A (#PCDATA)>]><Doc><B/></Doc>`;
    const good = `<?xml version="1.0"?><!DOCTYPE Doc [<!ELEMENT Doc (A)><!ELEMENT A (#PCDATA)>]><Doc><A>x</A></Doc>`;
    expect(() => parseDocument(bad, { validate: true })).toThrow();
    expect(() => parseDocument(good, { validate: true })).not.toThrow();
  });

  it("[SWHM2-C-0220] a line item carries category, product, item, line number, quantity and price", () => {
    const item = toLineItem({ ...line(2, "EST-1", 4, 5.5), quantityShipped: 0 });
    expect(item).toEqual({
      categoryId: "FISH",
      productId: "FI-SW",
      itemId: "EST-1",
      lineNum: 2,
      quantity: 4,
      unitPrice: 5.5,
    });
  });

  it("[SWHM2-C-0221] Invoice XML holds order id, user id, order date, shipping date and a line", () => {
    const xml = buildInvoiceXml({
      orderId: "S1",
      userId: "j2ee",
      orderDate: NOW,
      shippingDate: NOW,
      lines: [line(1, "EST-1", 1)],
    });
    expect(xml).toMatch(/<Invoice[\s>]/);
    expect(xml).toMatch(/<OrderId>S1<\/OrderId>/);
    expect(xml).toMatch(/<UserId>j2ee<\/UserId>/);
    expect(xml).toMatch(/<OrderDate>[^<]+<\/OrderDate>/);
    expect(xml).toMatch(/<ShippingDate>[^<]+<\/ShippingDate>/);
    expect(xml.match(/<LineItem[\s>]/g)!.length).toBeGreaterThanOrEqual(1);
  });
});
