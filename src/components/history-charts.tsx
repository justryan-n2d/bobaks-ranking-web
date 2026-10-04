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
import type { HistoryPoint, RankHistoryPoint } from "@/lib/api";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.max(0, value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

export function PlayerHistoryChart({
  data,
}: {
  data: HistoryPoint[];
}) {
  const chartData = data
    .filter((point) => Number.isFinite(point.playerCount) && point.timestamp)
    .map((point) => ({
      date: point.timestamp,
      players: Math.max(0, point.playerCount),
    }));

  if (!chartData.length) {
    return <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">No player history available.</div>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDate} minTickGap={36} />
          <YAxis tickFormatter={formatNumber} width={52} />
          <Tooltip
            labelFormatter={(value) => formatDate(String(value))}
            formatter={(value) => [formatNumber(Number(value)), "Players"]}
          />
          <Line type="monotone" dataKey="players" dot={false} stroke="currentColor" strokeWidth={2} />
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
  const chartData = data
    .filter((point) => Number.isFinite(point.rank) && point.date)
    .map((point) => ({
      date: point.date,
      rank: point.rank,
    }));

  if (!chartData.length) {
    return <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">No rank history available.</div>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDate} minTickGap={36} />
          <YAxis reversed allowDecimals={false} width={42} />
          <Tooltip
            labelFormatter={(value) => formatDate(String(value))}
            formatter={(value) => [`#${Number(value)}`, "Rank"]}
          />
          <Line type="monotone" dataKey="rank" dot={false} stroke="currentColor" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
