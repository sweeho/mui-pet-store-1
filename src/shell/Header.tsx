/*
 * Adapted from Modernize Free (MIT, AdminMart), package/src/app/(DashboardLayout)/layout/header/Header.tsx, at commit 948e484. See
 * src/shell/LICENSE.md. Trimmed to the layout shell (plan 118 B2).
 */

"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import { styled } from "@mui/material/styles";
import { IconLanguage, IconMenu, IconUser } from "@tabler/icons-react";
import Link from "next/link";

import { withBasePath } from "@/lib/paths";

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  justifyContent: "center",
  backdropFilter: "blur(4px)",
  [theme.breakpoints.up("lg")]: {
    minHeight: "70px",
  },
}));

const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  width: "100%",
  color: theme.palette.text.secondary,
}));

/** The top bar: the menu button that opens the sidebar on a small screen. */
export function Header({
  toggleMobileSidebar,
  username = null,
}: {
  toggleMobileSidebar: () => void;
  username?: string | null;
}) {
  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="Open the menu"
          onClick={toggleMobileSidebar}
          sx={{ display: { lg: "none", xs: "inline" } }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>
        <Box flexGrow={1} />
        {/* Inert: language switching belongs to a later capability (design.md D4). */}
        <Box
          role="group"
          aria-label="Language"
          sx={{ display: { xs: "none", sm: "inline-flex" }, alignItems: "center", gap: 0.5, mr: 1 }}
        >
          <IconLanguage size={16} aria-hidden />
          <ToggleButtonGroup size="small" exclusive value="en" aria-label="Language">
            <ToggleButton value="en" lang="en">
              English
            </ToggleButton>
            <ToggleButton value="ja" lang="ja">
              日本語
            </ToggleButton>
            <ToggleButton value="zh" lang="zh">
              中文
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {username ? (
          <>
            <Link href="/account" style={{ color: "inherit", marginRight: 12, fontWeight: 600 }}>
              {username}
            </Link>
            <form method="post" action={withBasePath("/api/accounts/signoff")}>
              <Button
                type="submit"
                variant="outlined"
                color="inherit"
                size="small"
                sx={{ textTransform: "none" }}
              >
                Sign off
              </Button>
            </form>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              component={Link}
              href="/accounts/create"
              sx={{
                textTransform: "none",
                mr: 1,
                color: "text.primary",
                display: { xs: "none", sm: "inline-flex" },
              }}
            >
              Create account
            </Button>
            <Button
              variant="contained"
              size="small"
              component={Link}
              href="/signon"
              startIcon={<IconUser size={16} />}
              sx={{ textTransform: "none" }}
            >
              Sign on
            </Button>
          </>
        )}
      </ToolbarStyled>
    </AppBarStyled>
  );
}
