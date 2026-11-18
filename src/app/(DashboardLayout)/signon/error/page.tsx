import { SignOnErrorView } from "@/components/accounts/SignOnErrorView";

export default async function SignOnErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  return <SignOnErrorView returnTo={(await searchParams).returnTo} />;
}
