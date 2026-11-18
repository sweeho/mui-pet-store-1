import { getDb } from "@/db/client";
import { newFulfilEnv } from "@/fulfilment/env";
import { getSupplierOrder } from "@/fulfilment/orders";

/** GET /api/supplier/purchase-orders/[id]: `{orderId, status}`, or 404. No sign-in (R-0187). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  try {
    const { orderId, status } = await getSupplierOrder(newFulfilEnv(await getDb()), id);
    return Response.json({ orderId, status });
  } catch {
    return Response.json({ error: `no supplier order ${id}` }, { status: 404 });
  }
}
