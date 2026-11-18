import { sql } from "drizzle-orm";

import { hasAdminSession, unauthorized } from "@/admin/session";
import { parseApprovalXml } from "@/approval/documents";
import { QUEUES } from "@/approval/dispatch";
import { getDb } from "@/db/client";

/** GET /api/admin/approvals/sent: what Commit has sent, oldest first (design.md P6). */
export async function GET(request: Request): Promise<Response> {
  if (!(await hasAdminSession(request))) return unauthorized();
  const rows = (await (
    await getDb()
  ).all(
    sql`SELECT body FROM message_outbox WHERE queue = ${QUEUES.approval} AND origin = 'admin'
        ORDER BY id`,
  )) as { body: string }[];
  const messages = rows
    .flatMap((r) => parseApprovalXml(r.body))
    .map((e) => ({
      orderId: e.orderId,
      status: e.status,
    }));
  return Response.json({ messages });
}
