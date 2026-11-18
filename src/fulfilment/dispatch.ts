import type { FulfilEnv } from "./env";

export async function dispatchFulfilment(_env: FulfilEnv): Promise<void> {
  throw new Error("VortexNotImplemented");
}
