import { handleApplRequest } from "@/admin/protocol";

export async function POST(request: Request): Promise<Response> {
  return handleApplRequest(request);
}
