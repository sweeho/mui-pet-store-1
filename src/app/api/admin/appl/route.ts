import { handleApplRequest } from "@/admin/protocol";

/** POST /api/admin/appl (design.md P8): the rich-client XML endpoint. */
export async function POST(request: Request): Promise<Response> {
  return handleApplRequest(request);
}
