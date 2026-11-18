import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

import { PageHeading } from "@/components/frames/PageHeading";

export type AccountSummary = {
  status: string;
  language: string;
  favoriteCategory: string | null;
  myList: boolean;
  banner: boolean;
};

const onOff = (v: boolean) => (v ? "On" : "Off");

/** The signed-on user's account: user name, status and profile preferences. */
export function AccountView({
  username,
  summary,
}: {
  username: string;
  summary: AccountSummary | null;
}) {
  const rows: [string, string][] = [
    ["User name", username],
    ...(summary
      ? ([
          ["Account status", summary.status],
          ["Preferred language", summary.language],
          ["Favourite category", summary.favoriteCategory ?? "None"],
          ["My List", onOff(summary.myList)],
          ["Banners", onOff(summary.banner)],
        ] as [string, string][])
      : []),
  ];
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeading title="Account" description="Your sign-on details and preferences." />
      <Card variant="outlined" sx={{ p: 3, maxWidth: 624 }}>
        <Box
          component="dl"
          sx={{ m: 0, display: "grid", gridTemplateColumns: "180px 1fr", rowGap: 1.5 }}
        >
          {rows.map(([k, v]) => (
            <Box key={k} sx={{ display: "contents" }}>
              <Typography component="dt" color="text.secondary">
                {k}
              </Typography>
              <Typography component="dd" sx={{ m: 0, fontWeight: 500 }}>
                {v}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
