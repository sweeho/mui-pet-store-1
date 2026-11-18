import { escapeXml } from "@/approval/documents";

// The SupplierOrder and Invoice documents (design.md P7). Hand-written XML, as in checkout and
// approval: flat elements, no parser dependency. All functions are synchronous and pure.

export type LineItem = {
  categoryId: string | null;
  productId: string | null;
  itemId: string;
  lineNum: number;
  quantity: number;
  unitPrice: number | null;
};
export type LineRow = LineItem & { quantityShipped: number };
export type Shipping = { name: string; address: string; email: string; phone: string };

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
export const decodeXml = (s: string) =>
  s.replace(/&(amp|lt|gt|quot|apos);/g, (_m, e: string) => ENTITIES[e]);

/** The text of the first `<name>` element in `xml`, decoded, or undefined when there is none. */
export function xmlText(xml: string, name: string): string | undefined {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(xml);
  return m ? decodeXml(m[1].trim()) : undefined;
}

const el = (name: string, value: string | number | null | undefined) =>
  `<${name}>${escapeXml(value === null || value === undefined ? "" : String(value))}</${name}>`;

const pad = (n: number) => String(n).padStart(2, "0");
/** yyyy-MM-dd in local time. */
export const formatDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** A line without its shipped quantity: what the documents carry. */
export function toLineItem(row: LineItem & { quantityShipped?: number }): LineItem {
  return {
    categoryId: row.categoryId,
    productId: row.productId,
    itemId: row.itemId,
    lineNum: row.lineNum,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
  };
}

const lineItemXml = (row: LineItem) => {
  const l = toLineItem(row);
  return `<LineItem>${el("CategoryId", l.categoryId)}${el("ProductId", l.productId)}${el("ItemId", l.itemId)}${el("LineNum", l.lineNum)}${el("Quantity", l.quantity)}${el("UnitPrice", l.unitPrice)}</LineItem>`;
};

export function buildSupplierOrderXml(order: {
  orderId: string;
  date: Date;
  shipping: Shipping;
  lines: LineItem[];
}): string {
  const s = order.shipping;
  return `<SupplierOrder>${el("OrderId", order.orderId)}${el("OrderDate", formatDate(order.date))}<ShippingInfo>${el("Name", s.name)}${el("Address", s.address)}${el("Email", s.email)}${el("Phone", s.phone)}</ShippingInfo>${order.lines.map(lineItemXml).join("")}</SupplierOrder>`;
}

export function buildInvoiceXml(invoice: {
  orderId: string;
  userId: string;
  orderDate: Date;
  shippingDate: Date;
  lines: LineItem[];
}): string {
  return `<Invoice>${el("OrderId", invoice.orderId)}${el("UserId", invoice.userId)}${el("OrderDate", formatDate(invoice.orderDate))}${el("ShippingDate", formatDate(invoice.shippingDate))}${invoice.lines.map(lineItemXml).join("")}</Invoice>`;
}

// --- Validating parse (SD4): the root and the content models of an internal DTD subset. ---

type Node = { name: string; children: Node[]; text: string };

function parseTree(xml: string): Node {
  const root: Node = { name: "#document", children: [], text: "" };
  const stack = [root];
  const token =
    /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[([\s\S]*?)\]\]>|<(\/?)([\w:.-]+)[^>]*?(\/?)>|([^<]+)/g;
  for (const m of xml.replace(/<!DOCTYPE[^[>]*(\[[\s\S]*?\]\s*)?>/, "").matchAll(token)) {
    const top = stack[stack.length - 1];
    if (m[5] !== undefined) top.text += m[5];
    else if (m[1] !== undefined) top.text += m[1];
    else if (m[3] !== undefined) {
      if (m[2]) {
        if (stack.length < 2 || top.name !== m[3]) throw new Error(`mismatched </${m[3]}>`);
        stack.pop();
      } else {
        const node: Node = { name: m[3], children: [], text: "" };
        top.children.push(node);
        if (!m[4]) stack.push(node);
      }
    }
  }
  if (stack.length !== 1) throw new Error("unclosed element");
  if (root.children.length !== 1) throw new Error("a document has exactly one root element");
  return root.children[0];
}

/** The `<!ELEMENT name model>` declarations of the DOCTYPE's internal subset. */
function elementDeclarations(subset: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of subset.matchAll(/<!ELEMENT\s+([\w:.-]+)\s+([^>]+?)\s*>/g)) out.set(m[1], m[2]);
  return out;
}

/** A content model as a regular expression over the child names, each written `name,`. */
function modelPattern(model: string): RegExp {
  const out = model
    .replace(/\s+/g, "")
    .replace(/([\w:.-]+)|,|\||[()?*+]/g, (tok, name?: string) => {
      if (name) return `(?:${name.replace(/[.\-]/g, "\\$&")},)`;
      return tok === "," ? "" : tok === "(" ? "(?:" : tok;
    });
  return new RegExp(`^${out}$`);
}

function validateNode(node: Node, decls: Map<string, string>): void {
  const model = decls.get(node.name);
  if (model === undefined) throw new Error(`element ${node.name} is not declared`);
  if (model === "ANY") return;
  const names = node.children.map((c) => c.name);
  if (model === "EMPTY") {
    if (names.length > 0 || node.text.trim()) throw new Error(`${node.name} must be empty`);
  } else if (model.includes("#PCDATA")) {
    const allowed = new Set(
      model
        .replace(/[()*#]|PCDATA/g, "")
        .split("|")
        .filter(Boolean),
    );
    for (const n of names) {
      if (!allowed.has(n)) throw new Error(`${n} is not allowed in ${node.name}`);
    }
  } else {
    if (node.text.trim()) throw new Error(`${node.name} does not allow text`);
    if (!modelPattern(model).test(names.map((n) => `${n},`).join(""))) {
      throw new Error(`the content of ${node.name} does not match ${model}`);
    }
  }
  for (const child of node.children) validateNode(child, decls);
}

/**
 * Parse a document. With `validate`, a document that declares a DOCTYPE must meet it: the root
 * name and the content model of every element. A document without a DOCTYPE gets no DTD check.
 * External DTDs are not resolved. Resolves to the root element's name.
 */
export function parseDocument(xml: string, options: { validate: boolean }): string {
  const root = parseTree(xml);
  if (!options.validate) return root.name;
  const doctype = /<!DOCTYPE\s+([\w:.-]+)\s*(?:\[([\s\S]*?)\]\s*)?>/.exec(xml);
  if (!doctype) return root.name;
  if (doctype[1] !== root.name) throw new Error(`the root must be ${doctype[1]}`);
  validateNode(root, elementDeclarations(doctype[2] ?? ""));
  return root.name;
}
