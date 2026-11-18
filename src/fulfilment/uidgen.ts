import type { FulfilEnv } from "./env";

export async function nextId(_env: FulfilEnv, _prefix: string): Promise<string> {
  throw new Error("VortexNotImplemented");
}
