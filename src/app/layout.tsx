import "@fontsource-variable/inter";
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";

import { APP_NAME } from "@/constants/app";
import { Providers } from "./providers";
import "./global.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_NAME}: find a pet, fill your cart and check out.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
