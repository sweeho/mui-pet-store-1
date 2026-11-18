export async function GET(
  _request: Request,
  _ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  throw new Error("VortexNotImplemented");
}
