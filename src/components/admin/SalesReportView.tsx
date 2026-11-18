"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import OutlinedInput from "@mui/material/OutlinedInput";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { FieldLabel } from "@/components/accounts/parts";
import { PageHeading } from "@/components/frames/PageHeading";
import { withBasePath } from "@/lib/paths";

import { SalesChart } from "./SalesChart";

export type SalesReportProps = {
  query: { start: string; end: string; type: string; category: string };
  categories: string[];
  result: { rows: { name: string; value: number }[]; total: number } | { error: string } | null;
};

const mono = { fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace" };
const DATE = /^\d{2}\/\d{2}\/\d{4}$/;
const HINT = "Enter the date as MM/dd/yyyy, for example 10/31/2026.";

/** `/admin/reports`: a GET form, the table and a bar or pie chart (design.md P7). */
export function SalesReportView({ query, categories, result }: SalesReportProps) {
  const [kind, setKind] = useState<"bar" | "pie">("bar");
  const [type, setType] = useState(query.type === "REVENUE" ? "REVENUE" : "QUANTITY");
  const revenue = query.type === "REVENUE";
  const error = result && "error" in result ? result.error : null;
  const fmt = (n: number) =>
    revenue
      ? n.toLocaleString("en-US", { style: "currency", currency: "USD" })
      : n.toLocaleString("en-US");
  const dateField = (id: "start" | "end", text: string) => {
    const bad = error !== null && !DATE.test(query[id]);
    return (
      <Box sx={{ flex: 1, minWidth: 160 }}>
        <FieldLabel htmlFor={id}>{text}</FieldLabel>
        <OutlinedInput
          id={id}
          name={id}
          size="small"
          fullWidth
          defaultValue={query[id]}
          placeholder="MM/dd/yyyy"
          error={bad}
          inputProps={{ "aria-invalid": bad, "aria-describedby": `${id}-hint`, style: mono }}
        />
        <Typography
          id={`${id}-hint`}
          sx={{ fontSize: 12, mt: 0.5, color: bad ? "error.main" : "text.secondary" }}
        >
          {bad ? HINT : "MM/dd/yyyy"}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 1104 }}>
      <PageHeading
        title="Sales reports"
        description="Revenue or quantity sold between two dates, by category or by item."
      />
      <Card variant="outlined" sx={{ p: 2 }}>
        <form method="get" action={withBasePath("/admin/reports")}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start" }}>
            {dateField("start", "Start date")}
            {dateField("end", "End date")}
            <Box sx={{ minWidth: 160 }}>
              <FieldLabel htmlFor="report-type">Report</FieldLabel>
              <input type="hidden" name="type" value={type} />
              <ToggleButtonGroup
                id="report-type"
                exclusive
                size="small"
                value={type}
                aria-label="Report"
                onChange={(_e, v: string | null) => v && setType(v)}
              >
                <ToggleButton value="REVENUE">Revenue</ToggleButton>
                <ToggleButton value="QUANTITY">Quantity</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ minWidth: 180 }}>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <Box
                component="select"
                id="category"
                name="category"
                defaultValue={query.category}
                sx={{
                  width: "100%",
                  height: 40,
                  px: 1,
                  font: "inherit",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                }}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Box>
              <Typography sx={{ fontSize: 12, mt: 0.5, color: "text.secondary" }}>
                Pick one to see its items
              </Typography>
            </Box>
            <Button type="submit" variant="contained" sx={{ mt: 3.5 }}>
              Run report
            </Button>
          </Box>
        </form>
      </Card>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {result && !("error" in result) ? (
        <Card variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 600 }}>
                {revenue ? "Revenue" : "Quantity"} by{" "}
                {query.category ? `item in ${query.category}` : "category"}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                {query.start} – {query.end}
              </Typography>
            </Box>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={kind}
              aria-label="Chart type"
              onChange={(_e, v: "bar" | "pie" | null) => v && setKind(v)}
            >
              <ToggleButton value="bar">Bar</ToggleButton>
              <ToggleButton value="pie">Pie</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          {result.rows.length === 0 ? (
            <Typography color="text.secondary">No sales in this period.</Typography>
          ) : (
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
              <Box sx={{ flex: "1 1 320px", maxWidth: 480 }}>
                <SalesChart rows={result.rows} kind={kind} />
              </Box>
              <Box
                component="table"
                sx={{
                  flex: "1 1 320px",
                  borderCollapse: "collapse",
                  "& th, & td": { px: 1.5, height: 40, borderBottom: 1, borderColor: "divider" },
                  "& th": { fontSize: 12, color: "text.secondary", textAlign: "left" },
                  "& .r": { textAlign: "right" },
                }}
              >
                <thead>
                  <tr>
                    <th>{query.category ? "Item" : "Category"}</th>
                    <th className="r">{revenue ? "Revenue" : "Quantity"}</th>
                    <th className="r">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r) => (
                    <tr key={r.name}>
                      <td>{r.name}</td>
                      <td className="r" style={mono}>
                        {fmt(r.value)}
                      </td>
                      <td className="r" style={mono}>
                        {result.total > 0 ? ((r.value / result.total) * 100).toFixed(1) : "0.0"}%
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <b>Grand total</b>
                    </td>
                    <td className="r" style={mono}>
                      <b>{fmt(result.total)}</b>
                    </td>
                    <td className="r" style={mono}>
                      100%
                    </td>
                  </tr>
                </tbody>
              </Box>
            </Box>
          )}
        </Card>
      ) : null}
    </Box>
  );
}
