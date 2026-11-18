import { requireSignOn } from "@/accounts/web-session";
import { listCart } from "@/cart/listing";
import { getRequestCart } from "@/cart/store";
import { getItem } from "@/catalog/queries";
import { STOREFRONT_LOCALE } from "@/catalog/screen";
import { CheckoutView } from "@/components/checkout/CheckoutView";
import { getDb } from "@/db/client";

export const dynamic = "force-dynamic";

/** `/checkout`: sign-on protected; the visit's cart priced from the catalog, then the two steps. */
export default async function Page() {
  await requireSignOn("/checkout");
  const [cart, db] = await Promise.all([getRequestCart(), getDb()]);
  const { lines, subtotal } = await listCart(cart, {
    locale: STOREFRONT_LOCALE,
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
  return <CheckoutView lines={lines} subtotal={subtotal} />;
}
