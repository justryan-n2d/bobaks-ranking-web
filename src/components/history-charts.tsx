"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import type { HistoryPoint, RankHistoryPoint } from "@/lib/api";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.max(0, value));
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(Math.max(0, value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

function useCompactChartLabels() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const update = () => setCompact(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return compact;
}

const axisTick = {
  fill: "var(--muted-foreground)",
  fontSize: 12,
};

const axisLine = {
  stroke: "var(--border)",
};

const gridStyle = {
  stroke: "var(--border)",
  strokeDasharray: "3 3",
};

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  color: "var(--card-foreground)",
  boxShadow: "var(--shadow-soft)",
};

const tooltipLabelStyle = {
  color: "var(--card-foreground)",
  fontWeight: 700,
};

const tooltipItemStyle = {
  color: "var(--card-foreground)",
};

export function PlayerHistoryChart({
  data,
}: {
  data: HistoryPoint[];
}) {
  const compactLabels = useCompactChartLabels();
  const chartData = data
    .filter((point) => Number.isFinite(point.playerCount) && point.timestamp)
    .map((point) => ({
      date: point.timestamp,
      players: Math.max(0, point.playerCount),
    }));

  if (!chartData.length) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground sm:h-72">No player history available.</div>;
  }

  const playerTickFormatter = (value: number) =>
    compactLabels ? formatCompactNumber(value) : formatNumber(value);

  return (
    <div className="bobaks-chart h-64 min-w-0 w-full p-2 sm:h-72" role="img" aria-label="Player history chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid {...gridStyle} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            minTickGap={compactLabels ? 28 : 36}
            tick={{ ...axisTick, fontSize: compactLabels ? 11 : 12 }}
            tickLine={axisLine}
            axisLine={axisLine}
          />
          <YAxis
            tickFormatter={playerTickFormatter}
            width={compactLabels ? 42 : 56}
            tick={{ ...axisTick, fontSize: compactLabels ? 11 : 12 }}
            tickLine={axisLine}
            axisLine={axisLine}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
            labelFormatter={(value) => formatDate(String(value))}
            formatter={(value) => [formatNumber(Number(value)), "Players"]}
          />
          <Line
            type="monotone"
            dataKey="players"
            dot={false}
            activeDot={{ r: 4, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }}
            stroke="var(--primary)"
            strokeWidth={2.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RankHistoryChart({
  data,
}: {
  data: RankHistoryPoint[];
}) {
  const compactLabels = useCompactChartLabels();
  const chartData = data
    .filter((point) => Number.isFinite(point.rank) && point.date)
    .map((point) => ({
      date: point.date,
      rank: point.rank,
    }));

  if (!chartData.length) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground sm:h-72">No rank history available.</div>;
  }

  return (
    <div className="h-64 min-w-0 w-full sm:h-72" role="img" aria-label="Rank history chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid {...gridStyle} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            minTickGap={compactLabels ? 28 : 36}
            tick={{ ...axisTick, fontSize: compactLabels ? 11 : 12 }}
            tickLine={axisLine}
            axisLine={axisLine}
          />
          <YAxis
            reversed
            allowDecimals={false}
            width={compactLabels ? 34 : 42}
            tick={{ ...axisTick, fontSize: compactLabels ? 11 : 12 }}
            tickLine={axisLine}
            axisLine={axisLine}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
            labelFormatter={(value) => formatDate(String(value))}
            formatter={(value) => [`#${Number(value)}`, "Rank"]}
          />
          <Line
            type="monotone"
            dataKey="rank"
            dot={false}
            activeDot={{ r: 4, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }}
            stroke="var(--primary)"
            strokeWidth={2.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
