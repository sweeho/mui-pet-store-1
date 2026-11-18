import { listCategories } from "@/catalog/queries";
import { STOREFRONT_LOCALE } from "@/catalog/screen";
import { CreateAccountView } from "@/components/accounts/CreateAccountView";
import { getDb } from "@/db/client";

// The favourite-category choices come from the catalog.
export const dynamic = "force-dynamic";

export default async function CreateAccountPage() {
  const page = await listCategories(await getDb(), {
    locale: STOREFRONT_LOCALE,
    offset: 0,
    size: 100,
  });
  return <CreateAccountView categories={page.entries} />;
}
