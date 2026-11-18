import { cookies } from "next/headers";

import { REMEMBER_COOKIE } from "@/accounts/session";
import { SignOnView } from "@/components/accounts/SignOnView";

// The remembered user name comes from a cookie, so this page is read on every request.
export const dynamic = "force-dynamic";

export default async function SignOnPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const remembered = (await cookies()).get(REMEMBER_COOKIE)?.value;
  return <SignOnView returnTo={returnTo} rememberedUser={remembered} />;
}
