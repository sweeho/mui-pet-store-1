import { getWebSession } from "@/accounts/web-session";
import { getItemCount } from "@/cart/cart";
import { listCart } from "@/cart/listing";
import { getRequestCart } from "@/cart/store";
import { getCategory, getItem } from "@/catalog/queries";
import { STOREFRONT_LOCALE } from "@/catalog/screen";
import { CartView } from "@/components/cart/CartView";
import { getDb } from "@/db/client";

export const dynamic = "force-dynamic";

/** `/cart`: the visit's cart listed from the catalog; an unavailable item is left out (P5). */
export default async function Page() {
  const [cart, session, db] = await Promise.all([getRequestCart(), getWebSession(), getDb()]);
  const { lines, subtotal } = await listCart(cart, {
    locale: STOREFRONT_LOCALE,
    // The catalog's list price is the cart's unit cost (SD1); a missing item rejects (R-0191).
    catalog: async (itemId, locale) => {
      const item = await getItem(db, itemId, locale);
      if (!item) throw new Error(`no catalog item ${itemId}`);
      return {
        productId: item.productId,
        categoryId: item.categoryId,
        name: item.productName,
        attribute: item.attr1 ?? "",
        listCost: item.listPrice,
      };
    },
  });
  const categoryNames: Record<string, string> = {};
  for (const id of new Set(lines.map((l) => l.categoryId))) {
    categoryNames[id] = (await getCategory(db, id, STOREFRONT_LOCALE))?.name ?? id;
  }
  return (
    <CartView
      lines={lines}
      subtotal={subtotal}
      itemCount={getItemCount(cart)}
      signedOn={session !== null}
      categoryNames={categoryNames}
    />
  );
}
