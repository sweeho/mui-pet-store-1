import { type Address, type Contact, emptyAddress } from "./contact";
import type { CreditCard } from "./credit-card";

export type PurchaseOrderDocument = {
  orderId: string;
  userId: string;
  emailAddress: string;
  orderDate: number;
  locale: string;
  totalPrice: number;
  contact: Contact;
  paymentCard: CreditCard;
  lineItems: { itemId: string; quantity: number; unitPrice: number }[];
};

// A small reader and writer for the few flat elements involved (design.md P5); no XML dependency.
type Node = { name: string; text: string; children: Node[] };

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const escapeText = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const decodeText = (s: string) =>
  s.replace(/&(amp|lt|gt|quot|apos);/g, (_m, e: string) => ENTITIES[e]);

function parse(xml: string): Node {
  const root: Node = { name: "", text: "", children: [] };
  const stack = [root];
  let last = 0;
  const tag = /<(\/?)([A-Za-z][\w.-]*)[^>]*?(\/?)>|<\?[^>]*\?>/g;
  for (const m of xml.matchAll(tag)) {
    const top = stack[stack.length - 1];
    top.text += xml.slice(last, m.index);
    last = m.index + m[0].length;
    if (!m[2]) continue;
    if (m[1]) {
      if (stack.length > 1 && top.name === m[2]) stack.pop();
      else throw new Error(`unexpected </${m[2]}>`);
    } else {
      const node: Node = { name: m[2], text: "", children: [] };
      top.children.push(node);
      if (!m[3]) stack.push(node);
    }
  }
  if (stack.length !== 1 || root.children.length !== 1) throw new Error("not a single element");
  return root.children[0];
}

const rootNamed = (xml: string, name: string): Node => {
  const node = parse(xml);
  if (node.name !== name) throw new Error(`expected <${name}> but found <${node.name}>`);
  return node;
};
// Children are found by name, not position; an empty or absent element reads as "".
const textOf = (node: Node, name: string): string =>
  decodeText(node.children.find((c) => c.name === name)?.text.trim() ?? "");
const el = (name: string, value: string | number) =>
  `<${name}>${escapeText(String(value))}</${name}>`;

function addressFromNode(node: Node): Address {
  return {
    ...emptyAddress(),
    street1: textOf(node, "Street1"),
    street2: textOf(node, "Street2"),
    city: textOf(node, "City"),
    state: textOf(node, "State"),
    zip: textOf(node, "Zip"),
    country: textOf(node, "Country"),
  };
}

/** Read a ContactInfo document; throws when its root is another element. No field is validated. */
export function contactFromDocument(xml: string): Contact {
  const node = rootNamed(xml, "ContactInfo");
  const address = node.children.find((c) => c.name === "Address");
  return {
    givenName: textOf(node, "GivenName"),
    familyName: textOf(node, "FamilyName"),
    telephone: textOf(node, "Telephone"),
    email: textOf(node, "Email"),
    address: address ? addressFromNode(address) : emptyAddress(),
  };
}

/** Read an Address element; throws when it is another element. Street line 2 is optional. */
export function addressFromElement(xml: string): Address {
  return addressFromNode(rootNamed(xml, "Address"));
}

export function creditCardToDocument(card: CreditCard): string {
  return `<CreditCard>${el("CardNumber", card.cardNumber)}${el("CardType", card.cardType)}${el("ExpiryDate", card.expiryDate)}</CreditCard>`;
}

export function creditCardFromDocument(xml: string): CreditCard {
  const node = rootNamed(xml, "CreditCard");
  return {
    cardNumber: textOf(node, "CardNumber"),
    cardType: textOf(node, "CardType"),
    expiryDate: textOf(node, "ExpiryDate"),
  };
}

function contactToDocument(c: Contact): string {
  const a = c.address;
  return (
    "<ContactInfo>" +
    el("GivenName", c.givenName) +
    el("FamilyName", c.familyName) +
    el("Telephone", c.telephone) +
    el("Email", c.email) +
    "<Address>" +
    el("Street1", a.street1) +
    (a.street2 ? el("Street2", a.street2) : "") +
    el("City", a.city) +
    el("State", a.state) +
    el("Zip", a.zip) +
    el("Country", a.country) +
    "</Address></ContactInfo>"
  );
}

/** The purchase order document built at submission; nothing consumes it until order approval. */
export function purchaseOrderToDocument(po: PurchaseOrderDocument): string {
  const lines = po.lineItems
    .map(
      (l) =>
        `<LineItem>${el("ItemId", l.itemId)}${el("Quantity", l.quantity)}${el("UnitPrice", l.unitPrice)}</LineItem>`,
    )
    .join("");
  return (
    "<PurchaseOrder>" +
    el("OrderId", po.orderId) +
    el("UserId", po.userId) +
    el("EmailAddress", po.emailAddress) +
    el("OrderDate", new Date(po.orderDate).toISOString()) +
    el("Locale", po.locale) +
    el("TotalPrice", po.totalPrice) +
    `<ShippingInfo>${contactToDocument(po.contact)}</ShippingInfo>` +
    creditCardToDocument(po.paymentCard) +
    `<LineItems>${lines}</LineItems></PurchaseOrder>`
  );
}
