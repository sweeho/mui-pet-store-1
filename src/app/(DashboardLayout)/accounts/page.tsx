import { redirect } from "next/navigation";

/** The "Accounts" breadcrumb above the create-account pages leads to the account page. */
export default function AccountsPage() {
  return redirect("/account");
}
