"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { EmptyFrame } from "@/components/frames/EmptyFrame";

/** A bordered table card whose rows are links: the first column's link is the row's target. */
export function CatalogTable({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <Card variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {head.map((h, i) => (
                <TableCell key={i} sx={{ fontWeight: 600, color: "text.secondary" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{children}</TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export const mono = { fontFamily: "monospace", fontSize: 12, color: "text.secondary" } as const;

export function RowChevron() {
  return (
    <TableCell width={40} sx={{ color: "text.secondary" }}>
      <IconChevronRight size={18} aria-hidden />
    </TableCell>
  );
}

/** The shared empty frame for a listing with nothing to show, with a way back. */
export function NothingHere({
  title,
  message,
  backHref,
  backLabel,
}: {
  title: string;
  message: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <Card variant="outlined">
      <EmptyFrame
        title={title}
        message={message}
        action={
          <Button
            variant="contained"
            sx={{ textTransform: "none" }}
            component={Link}
            href={backHref}
          >
            {backLabel}
          </Button>
        }
      />
    </Card>
  );
}

export const Spacer = () => <Box sx={{ flex: 1 }} />;
