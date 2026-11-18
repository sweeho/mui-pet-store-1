import { getDb } from "@/db/client";
import { getCategory, getProduct, listItems } from "@/catalog/queries";
import { STOREFRONT_LOCALE, pageRequest } from "@/catalog/screen";
import { ItemListView } from "@/components/catalog/ItemListView";
import { NotFoundView } from "@/components/catalog/NotFoundView";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { pageNumber, offset, request } = pageRequest((await searchParams).page);
  const db = await getDb();
  const product = await getProduct(db, id, STOREFRONT_LOCALE);
  if (!product) return <NotFoundView what="product" />;
  const [category, page] = await Promise.all([
    getCategory(db, product.categoryId, STOREFRONT_LOCALE),
    listItems(db, id, request),
  ]);
  return (
    <ItemListView
      category={category}
      product={product}
      page={page}
      pageNumber={pageNumber}
      offset={offset}
    />
  );
}
