import { expect, test } from "@playwright/test";

// case: SWHM2-C-0054@v1
test("SWHM2-C-0054 order submission uses the placeholder card", async ({ page }) => {
  const submit = await page.request.post("/api/checkout/orders", {
    data: { items: ["EST-1"] },
  });
  expect(submit.ok()).toBe(true);
  const { orderId } = await submit.json();
  const res = await page.request.get(`/api/checkout/orders/${orderId}`);
  const order = await res.json();
  expect(order.paymentCard.cardNumber).toBe("1234-2334");
  expect(order.paymentCard.cardType).toBe("Duke Express");
  expect(order.paymentCard.expiryDate).toBe("10/2001");
});
