import { getWebSession } from "@/accounts/web-session";
import { getItemCount } from "@/cart/cart";
import { getRequestCart } from "@/cart/store";
import { DashboardShell } from "@/shell/DashboardShell";

/** Every page inside the Modernize shell: sidebar, header and content. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getWebSession();
  const cartCount = getItemCount(await getRequestCart());
  return (
    <DashboardShell username={session?.username ?? null} cartCount={cartCount}>
      {children}
    </DashboardShell>
  );
}
