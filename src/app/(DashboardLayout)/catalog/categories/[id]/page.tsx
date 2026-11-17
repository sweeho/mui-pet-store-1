import { getDb } from "@/db/client";
import { getCategory, listProducts } from "@/catalog/queries";
import { STOREFRONT_LOCALE, pageRequest } from "@/catalog/screen";
import { NotFoundView } from "@/components/catalog/NotFoundView";
import { ProductListView } from "@/components/catalog/ProductListView";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { pageNumber, offset, request } = pageRequest((await searchParams).page);
  const db = await getDb();
  const category = await getCategory(db, id, STOREFRONT_LOCALE);
  if (!category) return <NotFoundView what="category" />;
  const page = await listProducts(db, id, request);
  return (
    <ProductListView category={category} page={page} pageNumber={pageNumber} offset={offset} />
  );
}
