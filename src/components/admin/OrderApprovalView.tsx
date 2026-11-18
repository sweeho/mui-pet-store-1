"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { IconCheck, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { withBasePath } from "@/lib/paths";

export type ApprovalOrder = {
  orderId: string;
  userName: string;
  orderTime: number;
  total: number;
  status: string;
};

type Choice = "PENDING" | "APPROVED" | "DENIED";
type Summary = { sent: number; approved: string[]; denied: string[] };

export type OrderApprovalViewProps = {
  orders: ApprovalOrder[];
  /** The active status tab; "ALL" lists every order. */
  filter?: string;
  /** How many orders each status holds, for the tab labels and the pending count. */
  counts?: Record<string, number>;
};

const TABS = [
  ["ALL", "All"],
  ["PENDING", "Pending"],
  ["APPROVED", "Approved"],
  ["DENIED", "Denied"],
  ["COMPLETED", "Completed"],
] as const;

const mono = { fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace" };
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const date = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
const money = (n: number) =>
  `US$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_COLOR: Record<string, string> = {
  PENDING: "warning.main",
  APPROVED: "success.main",
  DENIED: "error.main",
  COMPLETED: "text.secondary",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        height: 22,
        px: 1,
        borderRadius: 999,
        border: 1,
        borderColor: "divider",
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <Box
        component="i"
        sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: STATUS_COLOR[status] }}
      />
      {label(status)}
    </Box>
  );
}

function IdList({ ids }: { ids: string[] }) {
  return ids.map((id, i) => (
    <span key={id}>
      {i > 0 ? " · " : ""}
      <span style={mono}>{id}</span>
    </span>
  ));
}

/** `/admin/orders`: approve or deny PENDING orders; nothing is sent until Commit (R-0169, R-0170). */
export function OrderApprovalView({ orders, filter = "ALL", counts = {} }: OrderApprovalViewProps) {
  const router = useRouter();
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const pending = orders.filter((o) => o.status === "PENDING");
  const changed = pending.filter((o) => (choices[o.orderId] ?? "PENDING") !== "PENDING");
  const choiceOf = (id: string): Choice => choices[id] ?? "PENDING";
  const pendingTotal = counts.PENDING ?? pending.length;

  const choose = (id: string, v: Choice) => setChoices((c) => ({ ...c, [id]: v }));
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const selectedPending = pending.filter((o) => selected.has(o.orderId));

  const bulk = (v: Choice) => {
    setChoices((c) => ({
      ...c,
      ...Object.fromEntries(selectedPending.map((o) => [o.orderId, v])),
    }));
    setSelected(new Set());
  };
  const discard = () => {
    setChoices({});
    setSelected(new Set());
  };

  const refreshData = () => {
    if (
      changed.length > 0 &&
      !window.confirm(
        `You have ${changed.length} uncommitted ${changed.length === 1 ? "change" : "changes"}. ` +
          "Refreshing discards them. Refresh anyway?",
      )
    ) {
      return;
    }
    discard();
    router.refresh();
  };

  const commit = async () => {
    if (changed.length === 0 || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch(withBasePath("/api/admin/approvals"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          decisions: changed.map((o) => ({ orderId: o.orderId, status: choiceOf(o.orderId) })),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSummary((await res.json()) as Summary);
      discard();
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const allSelected = pending.length > 0 && selectedPending.length === pending.length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 1104,
        pb: { xs: 9, md: 0 },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 0 } }}>
          <Typography variant="h1" sx={{ fontSize: 24, lineHeight: "32px", fontWeight: 600 }}>
            Approve orders
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
              Choose Approved or Denied for pending orders, singly or in bulk, then commit to send
              them.
            </Box>
            <Box component="span" sx={{ display: { xs: "inline", md: "none" } }}>
              Set each pending order to Approved or Denied, then commit.
            </Box>
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            "@media (max-width: 767px)": {
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              p: 1.5,
              bgcolor: "background.paper",
              borderTop: 1,
              borderColor: "divider",
              "& > button": { flex: 1 },
            },
          }}
        >
          <Button variant="outlined" color="inherit" onClick={refreshData}>
            Refresh
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            disabled={changed.length === 0}
            onClick={discard}
          >
            Discard changes
          </Button>
          <Button
            variant="contained"
            startIcon={<IconCheck size={16} />}
            disabled={changed.length === 0 || busy}
            onClick={commit}
          >
            Commit
          </Button>
          {changed.length > 0 ? (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`${changed.length} ${changed.length === 1 ? "change" : "changes"}`}
            />
          ) : null}
        </Box>
      </Box>

      {summary ? (
        <Alert
          severity="success"
          onClose={() => setSummary(null)}
          sx={{ border: 1, borderColor: "success.main", bgcolor: "background.paper" }}
        >
          <Typography component="b" sx={{ fontWeight: 600 }}>
            {summary.sent} {summary.sent === 1 ? "change" : "changes"} sent.
          </Typography>{" "}
          {summary.approved.length} {summary.approved.length === 1 ? "order" : "orders"} approved,{" "}
          {summary.denied.length} denied. Approved orders go to the supplier; customers are notified
          of the new status.
          <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
            {summary.approved.length > 0 ? (
              <span>
                <StatusBadge status="APPROVED" /> <IdList ids={summary.approved} />
              </span>
            ) : null}
            {summary.denied.length > 0 ? (
              <span>
                <StatusBadge status="DENIED" /> <IdList ids={summary.denied} />
              </span>
            ) : null}
            <Link
              href="/admin/orders?status=APPROVED"
              style={{ color: "inherit", fontWeight: 600, textDecoration: "none" }}
            >
              View approved orders
            </Link>
          </Box>
        </Alert>
      ) : null}
      {failed ? (
        <Alert severity="error">The changes could not be sent. Try Commit again.</Alert>
      ) : null}

      <Alert
        severity="info"
        icon={<IconInfoCircle size={18} />}
        sx={{ border: 1, borderColor: "divider", bgcolor: "grey.100", color: "text.primary" }}
      >
        <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
          <b style={{ fontWeight: 600 }}>Changes stay on this page until you press Commit.</b>{" "}
          Orders left as Pending are not sent. US orders under US$ 500 and Japan orders under
          ¥50,000 are approved automatically and never appear here.
        </Box>
        <Box component="span" sx={{ display: { xs: "inline", md: "none" } }}>
          <b style={{ fontWeight: 600 }}>Nothing is sent until you press Commit.</b> Orders left as
          Pending stay here.
        </Box>
      </Alert>

      <Tabs
        value={filter}
        aria-label="Order status"
        variant="scrollable"
        scrollButtons={false}
        sx={{
          width: 0,
          minWidth: "100%",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {TABS.map(([value, text]) => (
          <Tab
            key={value}
            value={value}
            label={text}
            component={Link}
            href={value === "ALL" ? "/admin/orders" : `/admin/orders?status=${value}`}
          />
        ))}
      </Tabs>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          color: "text.secondary",
          fontSize: 13,
        }}
      >
        <span>
          <b style={{ color: "inherit" }}>{pendingTotal}</b> pending orders
        </span>
        <Typography
          component="span"
          sx={{ fontSize: 12, fontWeight: 600, color: changed.length ? "primary.main" : undefined }}
        >
          {changed.length > 0
            ? `${changed.length} unsent ${changed.length === 1 ? "change" : "changes"}`
            : "No unsent changes"}
        </Typography>
      </Box>

      {selectedPending.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            px: 1.5,
            py: 1,
            bgcolor: "text.primary",
            color: "common.white",
            borderRadius: 2,
            fontSize: 13,
            "@media (max-width: 767px)": { "& .bulk-pending": { display: "none" } },
          }}
        >
          <b>{selectedPending.length} selected</b>
          <span>Set selected orders to</span>
          {(["APPROVED", "DENIED", "PENDING"] as const).map((v) => (
            <Button
              key={v}
              size="small"
              variant="outlined"
              color="inherit"
              onClick={() => bulk(v)}
              className={v === "PENDING" ? "bulk-pending" : undefined}
              sx={{ borderColor: "text.secondary" }}
            >
              {label(v)}
            </Button>
          ))}
        </Box>
      ) : null}

      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            "& th, & td": { px: 1.5, textAlign: "left", whiteSpace: "nowrap" },
            "& th": {
              height: 40,
              bgcolor: "grey.100",
              fontSize: 12,
              fontWeight: 600,
              color: "text.secondary",
              borderBottom: 1,
              borderColor: "divider",
            },
            "& td": { height: 44, borderBottom: 1, borderColor: "divider" },
            "& tbody tr:last-of-type td": { borderBottom: 0 },
            "& .num": { textAlign: "right" },
            "& tr.changed td": { bgcolor: "grey.100" },
            "& td.change": { width: 260 },
            "& tr.changed td:first-of-type": {
              boxShadow: (t) => `inset 3px 0 0 ${t.palette.primary.main}`,
            },
            "@media (max-width: 767px)": {
              display: "block",
              "& tbody": { display: "block" },
              "& thead": { display: "none" },
              "& tbody tr": {
                display: "grid",
                gridTemplateColumns: "28px auto 1fr auto",
                alignItems: "center",
                columnGap: 1.25,
                rowGap: 0.5,
                p: 1.5,
                borderBottom: 1,
                borderColor: "divider",
              },
              "& td": { display: "block", height: "auto", border: 0, p: 0, minWidth: 0 },
              "& td.cb": { gridColumn: 1, gridRow: 1 },
              "& td.id": { gridColumn: 2, gridRow: 1 },
              "& td.status": { gridColumn: 3, gridRow: 1 },
              "& td.num": { gridColumn: 4, gridRow: 1, textAlign: "right" },
              "& td.user": { gridColumn: "2 / 4", gridRow: 2, color: "text.secondary" },
              "& td.date": {
                gridColumn: 4,
                gridRow: 2,
                textAlign: "right",
                color: "text.secondary",
              },
              "& td.change": { gridColumn: "1 / -1", gridRow: 3, pt: 1, width: "100%" },
              "& td.change .MuiToggleButtonGroup-root": { width: "100%" },
              "& td.change .MuiToggleButton-root": { flex: 1 },
              "& tr.changed td": { bgcolor: "transparent" },
              "& tr.changed": { bgcolor: "grey.100" },
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <Checkbox
                  size="small"
                  checked={allSelected}
                  disabled={pending.length === 0}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? new Set(pending.map((o) => o.orderId)) : new Set(),
                    )
                  }
                  inputProps={{ "aria-label": "Select all" }}
                  sx={{ p: 0 }}
                />
              </th>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Order date</th>
              <th className="num">Total</th>
              <th>Current status</th>
              <th>Change to</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  No orders to show.
                </td>
              </tr>
            ) : null}
            {orders.map((o) => {
              const isPending = o.status === "PENDING";
              const v = choiceOf(o.orderId);
              return (
                <tr
                  key={o.orderId}
                  data-order-id={o.orderId}
                  data-status={o.status}
                  className={isPending && v !== "PENDING" ? "changed" : undefined}
                >
                  <td className="cb" style={{ width: 40 }}>
                    {isPending ? (
                      <Checkbox
                        size="small"
                        checked={selected.has(o.orderId)}
                        onChange={() => toggle(o.orderId)}
                        inputProps={{ "aria-label": `Select order ${o.orderId}` }}
                        sx={{ p: 0 }}
                      />
                    ) : null}
                  </td>
                  <td className="id" style={{ ...mono, fontWeight: 500 }}>
                    {o.orderId}
                  </td>
                  <td className="user" style={mono}>
                    {o.userName}
                  </td>
                  <td className="date" style={mono}>
                    {date(o.orderTime)}
                  </td>
                  <td className="num" style={mono}>
                    {money(o.total)}
                  </td>
                  <td className="status">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="change">
                    {isPending ? (
                      <ToggleButtonGroup
                        exclusive
                        size="small"
                        value={v}
                        aria-label="Decision"
                        onChange={(_e, next: Choice | null) => next && choose(o.orderId, next)}
                        sx={{
                          "& .MuiToggleButton-root": {
                            height: 28,
                            px: 1.25,
                            fontSize: 12,
                            fontWeight: 500,
                            textTransform: "none",
                          },
                          "& .Mui-selected[value=APPROVED]": {
                            bgcolor: "success.main",
                            color: "common.white",
                            fontWeight: 600,
                          },
                          "& .Mui-selected[value=APPROVED]:hover": { bgcolor: "success.dark" },
                          "& .Mui-selected[value=DENIED]": {
                            bgcolor: "error.main",
                            color: "common.white",
                            fontWeight: 600,
                          },
                          "& .Mui-selected[value=DENIED]:hover": { bgcolor: "error.dark" },
                        }}
                      >
                        <ToggleButton value="PENDING">Pending</ToggleButton>
                        <ToggleButton value="APPROVED">Approved</ToggleButton>
                        <ToggleButton value="DENIED">Denied</ToggleButton>
                      </ToggleButtonGroup>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Box>
      </Paper>
    </Box>
  );
}
