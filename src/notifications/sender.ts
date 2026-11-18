import type { Tx } from "./broker";
import type { NotifEnv } from "./env";

/**
 * Place one text message on a queue. With `tx` it goes out only when the transaction commits and
 * is dropped on rollback; without, at once.
 */
export async function sendMessage(
  env: NotifEnv,
  queueName: string,
  text: string,
  tx?: Tx,
): Promise<void> {
  env.broker.deliver(queueName, text, tx);
}
