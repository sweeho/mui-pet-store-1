import { getDb } from "@/db/client";
import { pageRequest } from "@/catalog/screen";
import { searchItems } from "@/catalog/search";
import { SearchResultsView } from "@/components/catalog/SearchResultsView";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: rawPage } = await searchParams;
  const { pageNumber, offset, request } = pageRequest(rawPage);
  const page = await searchItems(await getDb(), q, request);
  return <SearchResultsView query={q} page={page} pageNumber={pageNumber} offset={offset} />;
}
