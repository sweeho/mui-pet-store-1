import { notFound } from "next/navigation";

import { requireSignOn } from "@/accounts/web-session";
import { getItem } from "@/catalog/queries";
import { STOREFRONT_LOCALE } from "@/catalog/screen";
import { OrderConfirmationView } from "@/components/checkout/OrderConfirmationView";
import { getOrder } from "@/checkout/store";
import { getDb } from "@/db/client";

export const dynamic = "force-dynamic";

/** `/checkout/orders/{id}`: sign-on protected, and only for the order's own user. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSignOn(`/checkout/orders/${id}`);
  const db = await getDb();
  const order = await getOrder(db, id);
  if (!order || order.userId !== session.username) notFound();
  const names: Record<string, string> = {};
  for (const l of order.lineItems ?? []) {
    const item = await getItem(db, l.itemId, STOREFRONT_LOCALE);
    if (item) names[l.itemId] = `${item.productName}, ${item.attr1 ?? ""}`.replace(/, $/, "");
  }
  return <OrderConfirmationView order={order} names={names} />;
}
