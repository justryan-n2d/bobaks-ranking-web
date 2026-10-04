import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";

import {
  getErrorStatus,
  getGame,
  getGameHistory,
  getGamePeak,
  getGameRankHistory,
} from "@/lib/api";
import { PlayerHistoryChart, RankHistoryChart } from "@/components/history-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function formatPlayers(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.max(0, Number(value) || 0));
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Unavailable";
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp)) : "Unavailable";
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const game = await getGame(id);
    const name = game.name || `Experience ${id}`;
    return {
      title: name,
      description: `Current players, Bobaks rank, peak, and historical trends for ${name}.`,
    };
  } catch {
    return { title: `Experience ${id}` };
  }
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let game;
  try {
    game = await getGame(id);
  } catch (error) {
    if (getErrorStatus(error) === 404) notFound();
    return (
      <div className="mx-auto max-w-2xl py-20">
        <h1 className="text-2xl font-black">Game data unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">Bobaks could not load this experience right now.</p>
      </div>
    );
  }

  const [historyResult, peakResult, rankHistoryResult] = await Promise.allSettled([
    getGameHistory(id, 365),
    getGamePeak(id),
    getGameRankHistory(id, 31),
  ]);

  const history = historyResult.status === "fulfilled" ? historyResult.value : null;
  const peak = peakResult.status === "fulfilled" ? peakResult.value : null;
  const rankHistory = rankHistoryResult.status === "fulfilled" ? rankHistoryResult.value : [];

  const live = game.rankings?.live;
  const weekly = game.rankings?.week || game.rankings?.weekly;
  const monthly = game.rankings?.month || game.rankings?.monthly;
  const yearly = game.rankings?.year || game.rankings?.yearly;

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Home
      </Link>

      <header className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:p-8">
          {game.iconUrl ? (
            <img src={game.iconUrl} alt="" width={96} height={96} className="size-24 shrink-0 rounded-3xl border border-border object-cover" />
          ) : (
            <div className="size-24 shrink-0 rounded-3xl bg-muted" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Game profile</div>
            <h1 className="mt-1 truncate text-3xl font-black tracking-tight sm:text-4xl">{game.name || `Experience ${id}`}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              By {game.creatorName || "Unknown creator"}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={`https://www.roblox.com/games/${encodeURIComponent(String(game.placeId || id))}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background hover:opacity-90"
              >
                Open on Roblox
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
              <div className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm text-muted-foreground">
                {game.isActive === false ? "Inactive" : "Active"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Current game statistics">
        {[
          ["Current players", formatPlayers(game.currentPlayers), formatDate(game.currentSnapshotAt)],
          ["Live rank", live?.rank ? `#${live.rank}` : "Not ranked", live?.calculatedAt ? formatDate(live.calculatedAt) : "No live rank"],
          ["Recorded Peak", peak ? formatPlayers(peak.peakPlayers) : "Unavailable", peak ? formatDate(peak.peakAt) : "Peak data unavailable"],
          ["Weekly rank", weekly?.rank ? `#${weekly.rank}` : "Not ranked", weekly?.calculatedAt ? formatDate(weekly.calculatedAt) : "No weekly rank"],
        ].map(([label, value, note]) => (
          <Card key={label} className="p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-black tabular-nums">{value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{note}</div>
          </Card>
        ))}
      </section>

      {game.description ? (
        <Card>
          <CardHeader><CardTitle>About this experience</CardTitle></CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {game.description}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Player history</CardTitle>
          <p className="text-sm text-muted-foreground">
            {history ? `365-day history · ${history.resolution} resolution` : "Historical player data is unavailable right now."}
          </p>
        </CardHeader>
        <CardContent>{history ? <PlayerHistoryChart data={history.data} /> : null}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent rank history</CardTitle>
          <p className="text-sm text-muted-foreground">Last 31 days of Bobaks rank history.</p>
        </CardHeader>
        <CardContent><RankHistoryChart data={rankHistory} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Rankings</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[
            ["This Month", monthly?.rank ? `#${monthly.rank}` : "Not ranked"],
            ["This Year", yearly?.rank ? `#${yearly.rank}` : "Not ranked"],
            ["Data since", game.createdAt ? formatDate(game.createdAt) : "Unavailable"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-background p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
              <div className="mt-1 text-xl font-black">{value}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs leading-5 text-muted-foreground">
        Peak labeling follows Bobaks' tracking policy. A Recorded Peak may reflect the period since Bobaks began recording the experience.
      </p>
    </div>
  );
}
