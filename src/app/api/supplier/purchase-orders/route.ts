import { getDb } from "@/db/client";
import { dispatchFulfilment } from "@/fulfilment/dispatch";
import { newFulfilEnv } from "@/fulfilment/env";
import { getSupplierOrder, parseSupplierOrderMessage } from "@/fulfilment/orders";

/**
 * POST /api/supplier/purchase-orders (design.md P9, SD3): a SupplierOrder document. It is stored
 * and fulfilled from stock. No sign-in (R-0187). 201 `{orderId, status}`; 400 for an invalid
 * document; 409 when the order id is already stored.
 */
export async function POST(request: Request): Promise<Response> {
  const xml = await request.text();
  let orderId: string;
  try {
    orderId = parseSupplierOrderMessage(xml).orderId;
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "invalid order" },
      { status: 400 },
    );
  }
  const env = newFulfilEnv(await getDb());
  if (
    await getSupplierOrder(env, orderId).then(
      () => true,
      () => false,
    )
  ) {
    return Response.json({ error: `order ${orderId} already exists` }, { status: 409 });
  }
  env.supplierQueue.push(xml);
  await dispatchFulfilment(env);
  const { status } = await getSupplierOrder(env, orderId);
  return Response.json({ orderId, status }, { status: 201 });
}
