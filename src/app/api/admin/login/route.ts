import { ADMIN_COOKIE, adminCredentials, createAdminSession } from "@/admin/session";

import { seeOther } from "../../accounts/redirects";

const field = (form: FormData, name: string) => {
  const v = form.get(name);
  return typeof v === "string" ? v : "";
};

/** POST /api/admin/login (design.md P5): 303 to the orders screen, or back with an error. */
export async function POST(request: Request): Promise<Response> {
  const form = await request.formData().catch(() => null);
  const { user, password } = adminCredentials();
  if (!form || field(form, "userId") !== user || field(form, "password") !== password) {
    return seeOther("/admin/login?error=1");
  }
  const id = await createAdminSession(user);
  return seeOther("/admin/orders", [`${ADMIN_COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax`]);
}
