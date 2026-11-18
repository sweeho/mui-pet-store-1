"use client";

import { useTheme } from "@mui/material/styles";

export type ChartRow = { name: string; value: number };

/** A bar or pie chart drawn as SVG in the theme's palette colours (design.md P7). */
export function SalesChart({ rows, kind }: { rows: ChartRow[]; kind: "bar" | "pie" }) {
  const { palette } = useTheme();
  const colours = [
    palette.primary.main,
    palette.secondary.main,
    palette.success.main,
    palette.warning.main,
    palette.error.main,
    palette.info.main,
  ];
  const colour = (i: number) => colours[i % colours.length];
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const label = `${kind === "bar" ? "Bar" : "Pie"} chart of ${rows.map((r) => r.name).join(", ")}`;

  if (kind === "pie") {
    const R = 90;
    const ends = rows.reduce<number[]>((acc, r) => {
      const prev = acc.length ? acc[acc.length - 1] : -Math.PI / 2;
      return [...acc, prev + (total > 0 ? (r.value / total) * 2 * Math.PI : 0)];
    }, []);
    const slices = rows.map((r, i) => {
      const from = i === 0 ? -Math.PI / 2 : ends[i - 1];
      const sweep = ends[i] - from;
      const [x0, y0] = [100 + R * Math.cos(from), 100 + R * Math.sin(from)];
      const [x1, y1] = [100 + R * Math.cos(ends[i]), 100 + R * Math.sin(ends[i])];
      const d =
        sweep >= 2 * Math.PI - 1e-6
          ? `M100 ${100 - R}A${R} ${R} 0 1 1 100 ${100 + R}A${R} ${R} 0 1 1 100 ${100 - R}Z`
          : `M100 100L${x0} ${y0}A${R} ${R} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x1} ${y1}Z`;
      return <path key={r.name} data-mark d={d} fill={colour(i)} stroke="#fff" strokeWidth={1} />;
    });
    return (
      <svg
        role="img"
        aria-label={label}
        viewBox="0 0 200 200"
        width="100%"
        style={{ maxWidth: 240 }}
      >
        {slices}
      </svg>
    );
  }

  const max = Math.max(1, ...rows.map((r) => r.value));
  const slot = 360 / Math.max(rows.length, 1);
  const barWidth = Math.min(48, slot * 0.6);
  return (
    <svg role="img" aria-label={label} viewBox="0 0 400 220" width="100%">
      <line x1="20" y1="190" x2="390" y2="190" stroke={palette.divider} />
      {rows.map((r, i) => {
        const h = (r.value / max) * 170;
        const x = 30 + i * slot + (slot - barWidth) / 2;
        return (
          <g key={r.name}>
            <rect data-mark x={x} y={190 - h} width={barWidth} height={h} rx={2} fill={colour(i)} />
            <text
              x={x + barWidth / 2}
              y={206}
              fontSize="10"
              textAnchor="middle"
              fill={palette.text.secondary}
            >
              {r.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
