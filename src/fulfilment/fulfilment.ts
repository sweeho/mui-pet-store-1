import type { FulfilEnv } from "./env";

const todo = (): never => {
  throw new Error("VortexNotImplemented");
};

export async function fulfilLine(
  _env: FulfilEnv,
  _orderId: string,
  _lineNum: number,
): Promise<{ shipped: boolean }> {
  return todo();
}
export async function processOrder(
  _env: FulfilEnv,
  _orderId: string,
): Promise<{ invoice: string | null; status: string }> {
  return todo();
}
export async function processInvoice(
  _env: FulfilEnv,
  _invoice: { orderId: string; lines: { lineNum: number; shipped: number }[] },
): Promise<void> {
  return todo();
}
export async function receiveSupplierOrder(_env: FulfilEnv, _xml: string): Promise<string> {
  return todo();
}
export async function processApproval(
  _env: FulfilEnv,
  _decisions: { orderId: string; approved: boolean }[],
): Promise<void> {
  return todo();
}
