import { decodeXml } from "@/fulfilment/documents";
import { escapeXml } from "@/approval/documents";

export type MailDoc = { address: string; subject: string; content: string; locale?: string };

/** `<Mail><Address/><Subject/><Content/></Mail>`; the locale is an optional attribute (SD1). */
export function buildMailDocument(d: MailDoc): string {
  const locale =
    d.locale === undefined ? "" : ` locale="${escapeXml(d.locale).replace(/"/g, "&quot;")}"`;
  return `<Mail${locale}><Address>${escapeXml(d.address)}</Address><Subject>${escapeXml(d.subject)}</Subject><Content>${escapeXml(d.content)}</Content></Mail>`;
}

const MAIL =
  /^\s*(?:<\?xml[^>]*\?>\s*)?<Mail((?:\s+locale="[^"]*")?)\s*>\s*<Address>([\s\S]*?)<\/Address>\s*<Subject>([\s\S]*?)<\/Subject>\s*<Content>([\s\S]*)<\/Content>\s*<\/Mail>\s*$/;

/** Throws unless the document is exactly Address, Subject, Content under `<Mail>`, in order. */
export function parseMailDocument(xml: string): MailDoc {
  const m = MAIL.exec(xml);
  if (!m) throw new Error("not a valid Mail document");
  const doc: MailDoc = {
    address: decodeXml(m[2].trim()),
    subject: decodeXml(m[3].trim()),
    content: decodeXml(m[4].trim()),
  };
  const locale = /locale="([^"]*)"/.exec(m[1]);
  if (locale) doc.locale = decodeXml(locale[1]);
  return doc;
}
