import { CREATE_ERROR_PAGE, registerUser, type Registration } from "@/accounts/registration";
import { getDb } from "@/db/client";

import { seeOther } from "../redirects";

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : undefined);

/** A registration from the create-account form (a checkbox is present only when ticked). */
function fromForm(form: FormData): Registration {
  return {
    userId: text(form.get("userId")) ?? "",
    password: text(form.get("password")) ?? "",
    language: text(form.get("language")),
    favoriteCategory: text(form.get("favoriteCategory")),
    myList: text(form.get("myList")),
    banner: text(form.get("banner")),
  };
}

/** POST /api/accounts/users: 201 for JSON, a redirect to sign-on for the form, or to the error page. */
export async function POST(request: Request): Promise<Response> {
  const isJson = (request.headers.get("content-type") ?? "").includes("application/json");
  let input: Registration;
  try {
    if (isJson) {
      const body = (await request.json()) as Partial<Registration>;
      input = {
        ...body,
        userId: typeof body.userId === "string" ? body.userId : "",
        password: typeof body.password === "string" ? body.password : "",
      };
    } else {
      input = fromForm(await request.formData());
    }
  } catch {
    return seeOther(CREATE_ERROR_PAGE);
  }
  const result = await registerUser(await getDb(), input);
  if (!result.ok) return seeOther(result.redirect);
  return isJson ? Response.json({ userId: result.userId }, { status: 201 }) : seeOther("/signon");
}
