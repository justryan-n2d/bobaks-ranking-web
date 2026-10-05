"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Circle, RefreshCw } from "lucide-react";

import type { RankingGame, RankingResponse } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.max(0, value));
}

function formatAge(timestamp: string | null | undefined, now: number) {
  if (!timestamp) return "Freshness unavailable";
  const parsed = Date.parse(timestamp);
  if (!Number.isFinite(parsed)) return "Freshness unavailable";
  const seconds = Math.max(0, Math.floor((now - parsed) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function Movement({ value }: { value?: number | null }) {
  const numeric = Number(value ?? 0);
  if (!numeric) return <span className="text-[11px] text-muted-foreground">No move</span>;
  const rising = numeric > 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-bold", rising ? "text-[color:var(--signal-rise)]" : "text-[color:var(--signal-drop)]")}>
      {rising ? <ArrowUp className="size-3" aria-hidden="true" /> : <ArrowDown className="size-3" aria-hidden="true" />}
      {Math.abs(numeric)}
    </span>
  );
}

function GameRow({ game, changed }: { game: RankingGame; changed: boolean }) {
  return (
    <Link
      href={`/game/${encodeURIComponent(game.gameId)}`}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-all duration-500 hover:border-border hover:bg-accent/60",
        changed && "border-border bg-accent/70 shadow-sm",
      )}
    >
      <div className="w-8 shrink-0 text-center"><span className="bobaks-rank-pill" data-rank={game.rank <= 3 ? game.rank : undefined}>#{game.rank}</span></div>
      {game.game?.iconUrl ? (
        <img
          src={game.game.iconUrl}
          alt=""
          width={44}
          height={44}
          loading="lazy"
          decoding="async"
          className="size-11 shrink-0 rounded-2xl border border-border object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="size-11 shrink-0 rounded-2xl bg-muted" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold group-hover:underline">{game.game?.name || "Unknown experience"}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{game.game?.creatorName || "Unknown creator"}</span>
          <Movement value={game.rankChange} />
        </div>
      </div>
      <div className={cn(
        "min-w-[72px] rounded-xl px-2 py-1 text-right transition-all duration-500",
        changed && "bg-background ring-1 ring-border",
      )}>
        <div className="font-black tabular-nums">{formatNumber(game.score)}</div>
        <div className="text-[11px] text-muted-foreground">players</div>
      </div>
    </Link>
  );
}

function SpotCard({ game, changed }: { game: RankingGame; changed: boolean }) {
  return (
    <Card className={cn("bobaks-spotlight overflow-hidden transition-all duration-500", changed && "ring-2 ring-primary/20")} data-rank={game.rank}>
      <Link
        href={`/game/${encodeURIComponent(game.gameId)}`}
        className="group block p-4"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "bobaks-rank-pill",
            changed && "animate-pulse",
          )}>
            #{game.rank}
          </div>
          {game.game?.iconUrl ? (
            <img
              src={game.game.iconUrl}
              alt=""
              width={56}
              height={56}
              loading="lazy"
              decoding="async"
              className="size-14 shrink-0 rounded-2xl border border-border object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="size-14 shrink-0 rounded-2xl bg-muted" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold group-hover:underline">{game.game?.name || "Unknown experience"}</div>
            <div className="truncate text-xs text-muted-foreground">{game.game?.creatorName || "Unknown creator"}</div>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className={cn(
              "text-3xl font-black tabular-nums tracking-tight transition-transform duration-500",
              changed && "scale-105",
            )}>
              {formatNumber(game.score)}
            </div>
            <div className="text-xs text-muted-foreground">players right now</div>
          </div>
          <Movement value={game.rankChange} />
        </div>
      </Link>
    </Card>
  );
}

function HighlightCard({
  label,
  game,
  mode,
}: {
  label: string;
  game?: RankingGame;
  mode: "up" | "down" | "new";
}) {
  const numericMove = Number(game?.rankChange ?? 0);
  return (
    <Link
      data-signal={mode === "up" ? "rise" : mode === "down" ? "drop" : "new"}
      href={game ? `/game/${encodeURIComponent(game.gameId)}` : "/rankings/live"}
      className="bobaks-signal-card group rounded-2xl border border-border p-5"
    >
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-2 truncate text-lg font-black">{game?.game?.name || "No signal yet"}</div>
      <div className="mt-2 text-sm text-muted-foreground">
        {mode === "new" && game ? `Entered at #${game.rank}` : game ? `${Math.abs(numericMove)} ranks` : "Live movement will appear here."}
      </div>
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">
        {mode === "up" ? "Watch it rise" : mode === "down" ? "See the drop" : "Explore"}
        <ArrowRight className="size-4" aria-hidden="true" />
      </div>
    </Link>
  );
}

export function LiveHomeBoard({
  initialGames = [],
  initialUpdatedAt = null,
}: {
  initialGames?: RankingGame[];
  initialUpdatedAt?: string | null;
}) {
  const [games, setGames] = useState(initialGames);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt ?? null);
  const [now, setNow] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [changedIds, setChangedIds] = useState<string[]>([]);
  const [nextRefreshAt, setNextRefreshAt] = useState<number | null>(null);
  const refreshInFlight = useRef(false);
  const nextRefreshRef = useRef<number | null>(null);
  const previousScores = useRef(new Map(initialGames.map((game) => [game.gameId, Number(game.score)])));

  const sync = async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    setRefreshing(true);
    try {
      const response = await fetch("/api/rankings/live", {
        cache: "no-store",
        headers: { accept: "application/json" },
      });
      if (!response.ok) throw new Error("live sync failed");
      const payload = (await response.json()) as RankingResponse;
      if (!Array.isArray(payload.data)) throw new Error("invalid live payload");

      const nextChanged = payload.data
        .filter((game) => previousScores.current.get(game.gameId) !== Number(game.score))
        .map((game) => game.gameId);

      previousScores.current = new Map(
        payload.data.map((game) => [game.gameId, Number(game.score)]),
      );
      setGames(payload.data);
      setUpdatedAt(payload.updatedAt ?? null);
      const intervalMs = Math.max(
        5_000,
        Number(payload.refreshIntervalSeconds ?? 30) * 1_000,
      );
      const payloadNext = payload.nextRefreshAt ? Date.parse(payload.nextRefreshAt) : Number.NaN;
      const target = Number.isFinite(payloadNext)
        ? payloadNext
        : Date.now() + intervalMs;
      nextRefreshRef.current = target;
      setNextRefreshAt(target);
      setChangedIds(nextChanged);
      setError(false);

      window.setTimeout(() => setChangedIds([]), 1_500);
    } catch {
      setError(true);
    } finally {
      refreshInFlight.current = false;
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void sync();

    const clock = window.setInterval(() => {
      const current = Date.now();
      setNow(current);

      if (
        document.visibilityState === "visible" &&
        !refreshInFlight.current &&
        nextRefreshRef.current !== null &&
        current >= nextRefreshRef.current
      ) {
        void sync();
      }
    }, 1_000);

    const visibility = () => {
      if (document.visibilityState === "visible") void sync();
    };

    document.addEventListener("visibilitychange", visibility);

    return () => {
      window.clearInterval(clock);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  const liveTop = games.slice(0, 10);
  const spotlights = liveTop.slice(0, 3);
  const rising = useMemo(
    () => [...games].filter((game) => Number(game.rankChange ?? 0) > 0).sort((a, b) => Number(b.rankChange ?? 0) - Number(a.rankChange ?? 0)).slice(0, 1)[0],
    [games],
  );
  const drops = useMemo(
    () => [...games].filter((game) => Number(game.rankChange ?? 0) < 0).sort((a, b) => Number(a.rankChange ?? 0) - Number(b.rankChange ?? 0)).slice(0, 1)[0],
    [games],
  );
  const newEntry = useMemo(() => games.find((game) => game.previousRank == null), [games]);

  return (
    <div>
      <section aria-labelledby="live-heading">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="bobaks-live-dot" aria-hidden="true" />
              Live now
              <span className="text-[10px] font-normal tracking-normal">{formatAge(updatedAt, now)}</span>
            </div>
            <h2 id="live-heading" className="mt-1 text-2xl font-black tracking-tight">Top games right now</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Auto refresh</div>
              <div className="text-xs text-muted-foreground">Every 30 seconds</div>
            </div>
            <button
              type="button"
              onClick={sync}
              disabled={refreshing}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-card transition-colors hover:bg-accent disabled:opacity-60"
              aria-label="Refresh live rankings"
              title="Refresh live rankings"
            >
              <RefreshCw className={cn("size-4", refreshing && "animate-spin")} aria-hidden="true" />
            </button>
            <Link href="/rankings/live" className="hidden items-center gap-1 text-sm font-semibold hover:underline sm:inline-flex">
              View Top 100 <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="bobaks-live-strip mb-3" aria-hidden="true"><span style={{ width: refreshing ? "66%" : "100%" }} /></div>

        {error ? (
          <div className="mb-3 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Live refresh failed. Showing the last successful snapshot.
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-3">
          {spotlights.map((game) => (
            <SpotCard key={game.gameId} game={game} changed={changedIds.includes(game.gameId)} />
          ))}
        </div>

        {liveTop.length > 3 ? (
          <Card className="mt-3 overflow-hidden">
            <div className="divide-y divide-border">
              {liveTop.slice(3, 10).map((game) => (
                <GameRow key={game.gameId} game={game} changed={changedIds.includes(game.gameId)} />
              ))}
            </div>
          </Card>
        ) : null}
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-3" aria-label="Live movement">
        <HighlightCard label="Rising" game={rising} mode="up" />
        <HighlightCard label="New entry" game={newEntry} mode="new" />
        <HighlightCard label="Biggest drop" game={drops} mode="down" />
      </section>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground" aria-live="polite">
        <span className="inline-flex items-center gap-2">
          <Circle className="size-2 fill-current" aria-hidden="true" />
          {refreshing ? "Updating live rankings..." : "Live updates are automatic"}
        </span>
        {!refreshing && nextRefreshAt !== null ? (
          <span className="font-medium">
            Next refresh in {Math.max(0, Math.ceil((nextRefreshAt - now) / 1000))}s
          </span>
        ) : null}
      </div>
    </div>
  );
}
