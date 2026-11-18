export async function forwardDecision(
  _env: unknown,
  _orderId: string | number,
  _status: "APPROVED" | "DENIED",
): Promise<void> {
  throw new Error("VortexNotImplemented");
}
