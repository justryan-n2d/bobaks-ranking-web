import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Flame,
  Search,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
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

function GameLink({
  game,
  prominent = false,
}: {
  game: RankingGame;
  prominent?: boolean;
}) {
  return (
    <Link
      href={`/game/${encodeURIComponent(game.gameId)}`}
      className={`group flex items-center gap-3 rounded-2xl border border-transparent transition-colors hover:border-border hover:bg-accent/60 ${prominent ? "p-4" : "p-3"}`}
    >
      <div className={`shrink-0 text-center font-black tabular-nums text-muted-foreground ${prominent ? "w-8 text-lg" : "w-7 text-sm"}`}>
        #{game.rank}
      </div>
      {game.game?.iconUrl ? (
        <img
          src={game.game.iconUrl}
          alt=""
          width={prominent ? 56 : 44}
          height={prominent ? 56 : 44}
          loading="lazy"
          decoding="async"
          className={`shrink-0 rounded-2xl border border-border object-cover ${prominent ? "size-14" : "size-11"}`}
        />
      ) : (
        <div className={`shrink-0 rounded-2xl bg-muted ${prominent ? "size-14" : "size-11"}`} aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <div className={`truncate font-semibold ${prominent ? "text-base" : "text-sm"} group-hover:underline`}>
          {game.game?.name || "Unknown experience"}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {game.game?.creatorName || "Unknown creator"}
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold tabular-nums">{formatNumber(game.score)}</div>
        <div className="text-[11px] text-muted-foreground">players</div>
      </div>
    </Link>
  );
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
          <TrendingIcon />
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

function TrendingIcon() {
  return <ArrowUp className="size-4" aria-hidden="true" />;
}

function Highlight({
  label,
  value,
  note,
  icon,
  href,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const body = (
    <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent/60">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
        <div className="mt-1 truncate text-base font-black">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{note}</div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
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
  const liveTop = liveGames.slice(0, 10);
  const spotlights = liveTop.slice(0, 3);
  const rising = [...liveGames]
    .filter((game) => Number(game.rankChange ?? 0) > 0)
    .sort((a, b) => Number(b.rankChange ?? 0) - Number(a.rankChange ?? 0))
    .slice(0, 3);
  const drops = [...liveGames]
    .filter((game) => Number(game.rankChange ?? 0) < 0)
    .sort((a, b) => Number(a.rankChange ?? 0) - Number(b.rankChange ?? 0))
    .slice(0, 3);
  const newEntries = liveGames.filter((game) => game.previousRank == null).slice(0, 3);
  const trending = feed?.trending.items.slice(0, 5) ?? [];
  const peaks = feed?.peaks.items.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-card p-5 shadow-sm sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Live Roblox experience rankings
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            See what gamers are playing right now.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Find rising games, follow player-count trends, and explore the numbers behind Roblox experiences.
          </p>
        </div>

        <form action="/search" className="mt-7 flex max-w-3xl gap-2">
          <label className="sr-only" htmlFor="home-search">Search games or creators</label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="home-search"
              name="q"
              maxLength={100}
              placeholder="Search a game or creator..."
              className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button type="submit" className="h-12 rounded-2xl bg-foreground px-5 text-sm font-bold text-background hover:opacity-90">
            Search
          </button>
        </form>

        <div className="mt-7 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Link href="/rankings/live" className="rounded-full border border-border bg-background px-3 py-2 hover:bg-accent">Live Top 100</Link>
          <Link href="/rankings/weekly" className="rounded-full border border-border bg-background px-3 py-2 hover:bg-accent">This Week</Link>
          <Link href="/rankings/monthly" className="rounded-full border border-border bg-background px-3 py-2 hover:bg-accent">This Month</Link>
          <Link href="/rankings/yearly" className="rounded-full border border-border bg-background px-3 py-2 hover      <LiveHomeBoard initialGames={liveGames} initialUpdatedAt={liveUpdatedAt} />

0].gameId)}` : "/rankings/live"}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Flame className="size-3.5" aria-hidden="true" />
              Trending
            </div>
            <h2 className="mt-1 text-xl font-black">Biggest positive movers</h2>
            <p className="mt-1 text-sm text-muted-foreground">Games moving up the live ranking.</p>
          </div>
          <div className="divide-y divide-border p-2">
            {trending.length ? trending.map((item) => <SocialItem key={item.gameId} item={item} kind="trending" />) : (
              <div className="p-5 text-sm text-muted-foreground">No positive movers are available yet.</div>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
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
            {peaks.length ? peaks.map((item) => <SocialItem key={item.gameId} item={item} kind="peak" />) : (
              <div className="p-5 text-sm text-muted-foreground">No peak records are available yet.</div>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/compare" className="group rounded-2xl border border-border bg-card p-5 shadow-sm hover:bg-accent/60">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Compare</div>
          <h2 className="mt-2 text-lg font-black">Put two games side by side</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Compare players, rankings, peaks, and trends.</p>
          <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">Compare games <ArrowRight className="size-4" aria-hidden="true" /></div>
        </Link>
        <Link href="/saved" className="group rounded-2xl border border-border bg-card p-5 shadow-sm hover:bg-accent/60">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Watchlist</div>
          <h2 className="mt-2 text-lg font-black">Keep the games you care about</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Save games on this device without an account.</p>
          <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">Open watchlist <ArrowRight className="size-4" aria-hidden="true" /></div>
        </Link>
        <Link href="/methodology" className="group rounded-2xl border border-border bg-card p-5 shadow-sm hover:bg-accent/60">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Transparency</div>
          <h2 className="mt-2 text-lg font-black">See how Bobaks ranks games</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Understand freshness, eligibility, coverage, and ranking rules.</p>
          <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">View methodology <ArrowRight className="size-4" aria-hidden="true" /></div>
        </Link>
      </section>

      <div className="text-xs text-muted-foreground">
        {feed ? `Discovery data refreshed ${formatUpdated(feed.generatedAt)}` : "Discovery data is temporarily limited."}
      </div>
    </div>
  );
}
