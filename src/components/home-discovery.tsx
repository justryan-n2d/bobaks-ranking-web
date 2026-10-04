import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  Flame,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";

import type { RankingGame, SocialFeed } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { LiveHomeBoard } from "@/components/live-home-board";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.max(0, value));
}

function formatUpdated(value: string | null | undefined) {
  if (!value) return "Freshness unavailable";
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Freshness unavailable";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
}

function SocialItem({
  item,
  kind,
}: {
  item: SocialFeed["trending"]["items"][number];
  kind: "trending" | "peak";
}) {
  const href = `/game/${encodeURIComponent(item.gameId)}`;

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-colors hover:border-border hover:bg-accent/60"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {kind === "trending" ? (
          <ArrowUp className="size-4" aria-hidden="true" />
        ) : (
          <Trophy className="size-4" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold group-hover:underline">{item.name}</div>
        <div className="truncate text-xs text-muted-foreground">{item.creator || "Unknown creator"}</div>
      </div>
      <div className="text-right">
        {kind === "trending" ? (
          <>
            <div className="font-black text-emerald-600">+{item.rankChange || 0}</div>
            <div className="text-[11px] text-muted-foreground">ranks</div>
          </>
        ) : (
          <>
            <div className="font-black tabular-nums">{formatNumber(item.peakPlayers || 0)}</div>
            <div className="text-[11px] text-muted-foreground">peak</div>
          </>
        )}
      </div>
    </Link>
  );
}

export function HomeDiscovery({
  liveGames,
  liveUpdatedAt,
  feed,
}: {
  liveGames: RankingGame[];
  liveUpdatedAt?: string | null;
  feed: SocialFeed | null;
}) {
  const trending = feed?.trending.items.slice(0, 5) ?? [];
  const peaks = feed?.peaks.items.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      <section className="bobaks-hero rounded-[2rem] border p-5 shadow-sm sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100 backdrop-blur-sm">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Live Roblox experience rankings
          </div>
          <h1 className="relative z-[1] text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            See what gamers are playing right now.
          </h1>
          <p className="relative z-[1] mt-4 max-w-2xl text-base leading-7 text-sky-100/85 sm:text-lg">
            Find rising games, follow player-count trends, and explore the numbers behind Roblox experiences.
          </p>
        </div>

        <form action="/search" className="mt-7 flex max-w-3xl gap-2">
          <label className="sr-only" htmlFor="home-search">Search games or creators</label>
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="home-search"
              name="q"
              maxLength={100}
              placeholder="Search a game or creator..."
              className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="h-12 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-black/15 hover:brightness-105"
          >
            Search
          </button>
        </form>

        <div className="mt-7 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Link href="/rankings/live" className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-sky-100 transition-colors hover:bg-white/15">
            Live Top 100
          </Link>
          <Link href="/rankings/weekly" className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-sky-100 transition-colors hover:bg-white/15">
            This Week
          </Link>
          <Link href="/rankings/monthly" className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-sky-100 transition-colors hover:bg-white/15">
            This Month
          </Link>
          <Link href="/rankings/yearly" className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-sky-100 transition-colors hover:bg-white/15">
            This Year
          </Link>
        </div>
      </section>

      <LiveHomeBoard initialGames={liveGames} initialUpdatedAt={liveUpdatedAt} />

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="bobaks-signal-card overflow-hidden">
          <div className="border-b border-border p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Flame className="size-3.5" aria-hidden="true" />
              Trending
            </div>
            <h2 className="mt-1 text-xl font-black">Biggest positive movers</h2>
            <p className="mt-1 text-sm text-muted-foreground">Games moving up the live ranking.</p>
          </div>
          <div className="divide-y divide-border p-2">
            {trending.length ? (
              trending.map((item) => <SocialItem key={item.gameId} item={item} kind="trending" />)
            ) : (
              <div className="p-5 text-sm text-muted-foreground">
                No positive movers are available yet.
              </div>
            )}
          </div>
        </Card>

        <Card className="bobaks-signal-card overflow-hidden">
          <div className="border-b border-border p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Trophy className="size-3.5" aria-hidden="true" />
              Peak records
            </div>
            <h2 className="mt-1 text-xl font-black">Highest recorded peaks</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              Bobaks-recorded player peaks
              <span
                title="A Recorded Peak reflects the period Bobaks has been recording the game."
                aria-label="Recorded Peak information"
                className="inline-flex cursor-help"
              >
                ⓘ
              </span>
            </p>
          </div>
          <div className="divide-y divide-border p-2">
            {peaks.length ? (
              peaks.map((item) => <SocialItem key={item.gameId} item={item} kind="peak" />)
            ) : (
              <div className="p-5 text-sm text-muted-foreground">
                No peak records are available yet.
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/compare"
          className="bobaks-signal-card group rounded-2xl border border-border p-5"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Compare</div>
          <h2 className="mt-2 text-lg font-black">Put two games side by side</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Compare players, rankings, peaks, and trends.</p>
          <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">
            Compare games <ArrowRight className="size-4" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/saved"
          className="bobaks-signal-card group rounded-2xl border border-border p-5"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Watchlist</div>
          <h2 className="mt-2 text-lg font-black">Keep the games you care about</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Save games on this device without an account.</p>
          <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">
            Open watchlist <ArrowRight className="size-4" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/methodology"
          className="bobaks-signal-card group rounded-2xl border border-border p-5"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Transparency</div>
          <h2 className="mt-2 text-lg font-black">See how Bobaks ranks games</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Understand freshness, eligibility, coverage, and ranking rules.
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">
            View methodology <ArrowRight className="size-4" aria-hidden="true" />
          </div>
        </Link>
      </section>

      <div className="text-xs text-muted-foreground">
        {feed ? `Discovery data refreshed ${formatUpdated(feed.generatedAt)}` : "Discovery data is temporarily limited."}
      </div>
    </div>
  );
}
