import type { NotifEnv } from "./env";
import { parseMailDocument } from "./mail-document";

/**
 * Send one HTML mail for a Mail document (design.md P4). An invalid document throws. A transport
 * failure is logged and the request dropped: no retry, and nothing for the caller to handle.
 */
export async function processMailMessage(env: NotifEnv, xml: string): Promise<void> {
  const doc = parseMailDocument(xml);
  try {
    await env.transport.send({
      from: env.defaultSender,
      to: doc.address.split(/[\s,]+/).filter(Boolean),
      subject: doc.subject,
      html: doc.content,
      sentDate: env.now(),
      headers: { "X-Mailer": "JavaMailer" },
      ...(doc.locale === undefined ? {} : { locale: doc.locale }),
    });
  } catch (e) {
    env.log(`mail to ${doc.address} discarded: ${e instanceof Error ? e.message : String(e)}`);
  }
}
