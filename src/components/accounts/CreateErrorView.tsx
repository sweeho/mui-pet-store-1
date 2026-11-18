import Box from "@mui/material/Box";

import { PageHeading } from "@/components/frames/PageHeading";

import { FailureCard } from "./parts";

/** Shown when an account could not be created (R-0165). */
export function CreateErrorView() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeading
        title="We couldn’t create your account"
        description="Pick another user ID and try again, or sign on if you already have an account."
      />
      <FailureCard
        badge="Account not created"
        message="That user ID may already belong to someone, or we couldn’t save your account just now. No account was created."
        primary={{ label: "Try a different user ID", href: "/accounts/create" }}
        secondary={{ label: "Sign on instead", href: "/signon" }}
        tipsTitle="Choosing a user ID"
        tips={[
          "Each user ID belongs to one account only.",
          "Use up to 25 characters, without % or *.",
          "If this is your user ID, sign on instead.",
        ]}
      />
    </Box>
  );
}
