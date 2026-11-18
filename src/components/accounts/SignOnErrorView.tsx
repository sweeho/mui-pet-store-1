import Box from "@mui/material/Box";

import { PageHeading } from "@/components/frames/PageHeading";

import { FailureCard } from "./parts";

/** Shown after a failed sign-on (R-0163). */
export function SignOnErrorView({ returnTo }: { returnTo?: string }) {
  const retry = returnTo ? `/signon?returnTo=${encodeURIComponent(returnTo)}` : "/signon";
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeading
        title="We couldn’t sign you on"
        description="Nothing was changed. You can try again or create an account."
      />
      <FailureCard
        badge="Sign-on failed"
        message="The user name or password you entered doesn’t match an account. Check both and try again — passwords are case-sensitive."
        primary={{ label: "Try again", href: retry }}
        secondary={{ label: "Create account", href: "/accounts/create" }}
        tipsTitle="Still stuck?"
        tips={[
          "Your user name is the user ID you chose when you created your account.",
          "If you were on your way to Checkout, you’ll go back there after you sign on.",
        ]}
      />
    </Box>
  );
}
