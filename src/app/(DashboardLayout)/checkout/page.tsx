import { requireSignOn } from "@/accounts/web-session";
import { PlaceholderPage } from "@/components/frames/PlaceholderPage";

export const dynamic = "force-dynamic";

/** Sign-on protected; checkout itself is built by SWHM2-I-0005, which replaces this page. */
export default async function Page() {
  await requireSignOn("/checkout");
  return <PlaceholderPage title="Checkout" description="Shipping, contact and payment details." />;
}
