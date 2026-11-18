import { sql } from "drizzle-orm";

import { requireSignOn } from "@/accounts/web-session";
import { AccountView, type AccountSummary } from "@/components/accounts/AccountView";
import { getDb } from "@/db/client";

// Per-user and session-dependent: read on every request.
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireSignOn("/account");
  const username = session.username ?? "";
  const rows = (await (
    await getDb()
  ).all(
    sql`SELECT a.status, p.language, p.favorite_category, p.my_list, p.banner
        FROM customer c
        JOIN account a ON a.account_id = c.account_id
        JOIN profile p ON p.profile_id = c.profile_id
        WHERE c.user_id = ${username}`,
  )) as {
    status: string;
    language: string;
    favorite_category: string | null;
    my_list: number;
    banner: number;
  }[];
  const r = rows[0];
  const summary: AccountSummary | null = r
    ? {
        status: r.status,
        language: r.language,
        favoriteCategory: r.favorite_category,
        myList: Boolean(r.my_list),
        banner: Boolean(r.banner),
      }
    : null;
  return <AccountView username={username} summary={summary} />;
}
