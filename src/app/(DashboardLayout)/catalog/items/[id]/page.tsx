import { getDb } from "@/db/client";
import { getCategory, getItem } from "@/catalog/queries";
import { STOREFRONT_LOCALE } from "@/catalog/screen";
import { ItemDetailView } from "@/components/catalog/ItemDetailView";
import { NotFoundView } from "@/components/catalog/NotFoundView";

export const dynamic = "force-dynamic";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const item = await getItem(db, id, STOREFRONT_LOCALE);
  if (!item) return <NotFoundView what="item" />;
  const category = await getCategory(db, item.categoryId, STOREFRONT_LOCALE);
  return <ItemDetailView item={item} categoryName={category?.name ?? item.categoryId} />;
}
