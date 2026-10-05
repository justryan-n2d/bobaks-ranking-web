import Link from "next/link";
import { ArrowLeft, ArrowLeftRight, ExternalLink } from "lucide-react";

import { getGame, getGamePeak, getRankings, type GameProfile, type RankingGame } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { SaveComparisonButton } from "@/components/save-comparison-button";

export const dynamic = "force-dynamic";

function formatPlayers(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.max(0, Number(value) || 0));
}

function rankLabel(value: number | null | undefined) {
  return value ? `#${value}` : "Not ranked";
}

function metricValue(profile: GameProfile | null, key: "current" | "live" | "weekly" | "monthly" | "yearly" | "peak") {
  if (!profile) return "Choose a game";
  if (key === "current") return formatPlayers(profile.currentPlayers);
  if (key === "peak") return "Loading...";
  const summary =
    key === "live"
      ? profile.rankings?.live
      : key === "weekly"
        ? profile.rankings?.week || profile.rankings?.weekly
        : key === "monthly"
          ? profile.rankings?.month || profile.rankings?.monthly
          : profile.rankings?.year || profile.rankings?.yearly;
  return rankLabel(summary?.rank);
}

async function loadProfile(id: string): Promise<GameProfile | null> {
  try {
    return await getGame(id);
  } catch {
    return null;
  }
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a: rawA, b: rawB } = await searchParams;
  const a = rawA?.trim() || "";
  const b = rawB?.trim() || "";

  if (!a || !b) {
    const [selected, liveResult] = await Promise.all([
      a ? loadProfile(a) : Promise.resolve(null),
      getRankings("live").catch(() => ({ data: [] as RankingGame[] })),
    ]);

    const suggestions = liveResult.data
      .filter((game) => game.gameId !== a)
      .slice(0, 8);

    return (
      <div className="space-y-6">
        <div>
          <Link href="/" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Home
          </Link>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Compare</div>
          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Compare Roblox games</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Pick two games and compare their current players, rankings, and recorded peaks.
          </p>
        </div>

        <Card className="p-5">
          <form action="/compare" className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <label htmlFor="compare-a" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Game A
              </label>
              <input
                id="compare-a"
                name="a"
                defaultValue={a}
                placeholder="Game ID"
                inputMode="numeric"
                className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="compare-b" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Game B
              </label>
              <input
                id="compare-b"
                name="b"
                defaultValue={b}
                placeholder="Game ID"
                inputMode="numeric"
                className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <button type="submit" className="h-11 self-end rounded-xl bg-foreground px-5 text-sm font-semibold text-background hover:opacity-90">
              Compare
            </button>
          </form>
        </Card>

        {selected ? (
          <Card className="p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Selected game</div>
            <div className="mt-3 flex items-center gap-3">
              {selected.iconUrl ? (
                <img src={selected.iconUrl} alt="" width={52} height={52} className="size-13 rounded-2xl border border-border object-cover" />
              ) : (
                <div className="size-13 rounded-2xl bg-muted" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <div className="truncate font-semibold">{selected.name || `Experience ${a}`}</div>
                <div className="truncate text-xs text-muted-foreground">{selected.creatorName || "Unknown creator"}</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Now choose a second game below.</p>
          </Card>
        ) : null}

        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Quick picks</div>
              <h2 className="mt-1 text-xl font-black">Choose from the live Top 100</h2>
            </div>
            <Link href="/rankings/live" className="text-sm font-semibold hover:underline">Full ranking</Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {suggestions.map((game) => (
              <Link
                href={`/compare?a=${encodeURIComponent(a || game.gameId)}&b=${encodeURIComponent(a ? game.gameId : "")}`}
                key={game.gameId}
                className="group"
              >
                <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-accent/60">
                  {game.game?.iconUrl ? (
                    <img src={game.game.iconUrl} alt="" width={48} height={48} className="size-12 rounded-2xl border border-border object-cover" />
                  ) : (
                    <div className="size-12 rounded-2xl bg-muted" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold group-hover:underline">{game.game?.name || "Unknown experience"}</div>
                    <div className="truncate text-xs text-muted-foreground">{game.game?.creatorName || "Unknown creator"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black tabular-nums">#{game.rank}</div>
                    <div className="text-xs text-muted-foreground">{formatPlayers(game.score)} players</div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const [profileA, profileB, peakA, peakB] = await Promise.all([
    loadProfile(a),
    loadProfile(b),
    getGamePeak(a).catch(() => null),
    getGamePeak(b).catch(() => null),
  ]);

  if (!profileA || !profileB) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Compare</div>
        <h1 className="mt-2 text-3xl font-black">One of those games could not be loaded</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Check the game IDs and try again.</p>
        <Link href="/compare" className="mt-6 inline-flex rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background">
          Start again
        </Link>
      </div>
    );
  }

  const rows = [
    ["Current players", formatPlayers(profileA.currentPlayers), formatPlayers(profileB.currentPlayers)],
    ["Live rank", metricValue(profileA, "live"), metricValue(profileB, "live")],
    ["This Week", metricValue(profileA, "weekly"), metricValue(profileB, "weekly")],
    ["This Month", metricValue(profileA, "monthly"), metricValue(profileB, "monthly")],
    ["This Year", metricValue(profileA, "yearly"), metricValue(profileB, "yearly")],
    ["Recorded Peak", peakA ? formatPlayers(peakA.peakPlayers) : "Unavailable", peakB ? formatPlayers(peakB.peakPlayers) : "Unavailable"],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/compare" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Compare another pair
          </Link>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Game comparison</div>
          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Side by side</h1>
        </div>
        <ArrowLeftRight className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[profileA, profileB].map((profile, index) => (
          <Card key={profile.id} className="p-5">
            <div className="flex items-center gap-3">
              {profile.iconUrl ? (
                <img src={profile.iconUrl} alt="" width={64} height={64} className="size-16 rounded-2xl border border-border object-cover" />
              ) : (
                <div className="size-16 rounded-2xl bg-muted" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Game {index === 0 ? "A" : "B"}</div>
                <h2 className="truncate text-xl font-black">{profile.name || `Experience ${profile.id}`}</h2>
                <p className="truncate text-sm text-muted-foreground">{profile.creatorName || "Unknown creator"}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/game/${encodeURIComponent(profile.id)}`} className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold hover:bg-accent">
                Details
              </Link>
              <a href={`https://www.roblox.com/games/${encodeURIComponent(String(profile.placeId || profile.id))}`} target="_blank" rel="noreferrer noopener" className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold hover:bg-accent">
                Roblox <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
              <SaveComparisonButton gameIdA={a} gameIdB={b} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_1fr_1fr] border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:px-5">
          <span>Metric</span>
          <span className="text-right">Game A</span>
          <span className="text-right">Game B</span>
        </div>
        <div className="divide-y divide-border">
          {rows.map(([label, valueA, valueB]) => (
            <div key={label} className="grid grid-cols-[minmax(0,1fr)_1fr_1fr] items-center px-4 py-4 sm:px-5">
              <div className="text-sm font-semibold">{label}</div>
              <div className="text-right font-black tabular-nums">{valueA}</div>
              <div className="text-right font-black tabular-nums">{valueB}</div>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs leading-5 text-muted-foreground">
        Rankings are produced by the same Bobaks ranking system shown on the period pages. Recorded Peak reflects Bobaks' recorded history rather than an external all-time database.
      </p>
    </div>
  );
}
