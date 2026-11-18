/*
 * Adapted from Modernize Free (MIT, AdminMart), package/src/app/(DashboardLayout)/layout.tsx, at commit 948e484. See
 * src/shell/LICENSE.md. Trimmed to the layout shell (plan 118 B2).
 */

"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import { useState } from "react";

import { Breadcrumbs } from "./Breadcrumbs";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
}));

/** The sidebar, the header and the page between them. */
export function DashboardShell({
  children,
  username = null,
  cartCount = 0,
}: {
  children: React.ReactNode;
  username?: string | null;
  cartCount?: number;
}) {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  return (
    <MainWrapper>
      <Sidebar
        cartCount={cartCount}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
      />
      <PageWrapper>
        <Header toggleMobileSidebar={() => setMobileSidebarOpen(true)} username={username} />
        <Container
          sx={{ paddingTop: "24px", paddingBottom: "24px", maxWidth: "1200px", flexGrow: 1 }}
        >
          <Box component="main">
            <Breadcrumbs />
            {children}
          </Box>
        </Container>
        <Footer />
      </PageWrapper>
    </MainWrapper>
  );
}
