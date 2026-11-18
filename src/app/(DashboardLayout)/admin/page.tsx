import { requireAdmin } from "@/admin/session";
import { AdminHomeView } from "@/components/admin/AdminHomeView";

export const dynamic = "force-dynamic";

/** `/admin`: the administrator's home (design.md P1, P2). */
export default async function Page() {
  await requireAdmin();
  return <AdminHomeView />;
}
