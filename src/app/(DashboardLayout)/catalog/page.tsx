import { getDb } from "@/db/client";
import { listCategories } from "@/catalog/queries";
import { pageRequest } from "@/catalog/screen";
import { CategoryListView } from "@/components/catalog/CategoryListView";

// Read on every request: the catalog changes when the sample data is loaded.
export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { pageNumber, offset, request } = pageRequest((await searchParams).page);
  const page = await listCategories(await getDb(), request);
  return <CategoryListView page={page} pageNumber={pageNumber} offset={offset} />;
}
