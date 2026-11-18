import { getWebSession } from "@/accounts/web-session";
import { DashboardShell } from "@/shell/DashboardShell";

/** Every page inside the Modernize shell: sidebar, header and content. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getWebSession();
  return <DashboardShell username={session?.username ?? null}>{children}</DashboardShell>;
}
