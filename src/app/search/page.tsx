import Link from "next/link";
import { Search } from "lucide-react";

import { getRankings, searchGames } from "@/lib/api";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Search",
  description: "Search Roblox experiences and creators on Bobaks Ranking.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: rawQuery } = await searchParams;
  const query = (rawQuery ?? "").trim();
  let results: Awaited<ReturnType<typeof searchGames>> = [];
  let error: string | null = null;
  let liveByGameId = new Map<string, Awaited<ReturnType<typeof getRankings>>["data"][number]>();

  if (query) {
    try {
      const [searchResult, liveResult] = await Promise.all([
        searchGames(query.slice(0, 100)),
        getRankings("live").catch(() => ({ data: [] })),
      ]);
      results = searchResult;
      liveByGameId = new Map(liveResult.data.map((game) => [String(game.gameId), game]));
    } catch (cause) {
      error =
        cause && typeof cause === "object" && "status" in cause && (cause as { status?: number }).status === 400
          ? "Please enter a valid search."
          : "Search is temporarily unavailable.";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Bobaks Search</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Find games and creators</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Search the active Roblox experiences currently tracked by Bobaks.
        </p>
      </div>

      <form action="/search" className="flex gap-2">
        <label className="sr-only" htmlFor="search">Search games or creators</label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input id="search" name="q" defaultValue={query} maxLength={100} placeholder="Search a game or creator..." className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        <button type="submit" className="h-11 rounded-xl bg-foreground px-5 text-sm font-semibold text-background hover:opacity-90">Search</button>
      </form>

      {!query ? (
        <Card className="p-8 text-sm text-muted-foreground">Search by game name or creator name. Results come from the Bobaks API.</Card>
      ) : error ? (
        <Card role="alert" className="border-destructive/25 bg-destructive/5 p-8 text-sm text-destructive">{error}</Card>
      ) : (
        <section aria-labelledby="results-heading" className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <h2 id="results-heading" className="text-lg font-bold">{results.length} {results.length === 1 ? "result" : "results"}</h2>
            <div className="text-xs text-muted-foreground">Showing up to 50 matches</div>
          </div>
          {!results.length ? (
            <Card className="p-8 text-sm text-muted-foreground">No active games matched “{query}”.</Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {results.map((game) => (
                <Card key={String(game.id)} className="flex h-full items-center gap-4 p-4">
                  {(() => {
                    const live = liveByGameId.get(String(game.id));
                    return (
                      <>
                        <Link href={`/game/${encodeURIComponent(String(game.id))}`} className="flex min-w-0 flex-1 items-center gap-4">
                          {game.iconUrl ? (
                            <img src={game.iconUrl} alt="" width={56} height={56} loading="lazy" decoding="async" className="size-14 shrink-0 rounded-2xl border border-border object-cover" />
                          ) : (
                            <div className="size-14 shrink-0 rounded-2xl bg-muted" aria-hidden="true" />
                          )}
                          <div className="min-w-0">
                            <div className="truncate font-semibold hover:underline">{game.name || "Unknown experience"}</div>
                            <div className="mt-1 truncate text-sm text-muted-foreground">{game.creatorName || "Unknown creator"}</div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                              {live ? (
                                <>
                                  <span className="font-bold tabular-nums">{new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.max(0, Number(live.score) || 0))} players</span>
                                  <span className="text-muted-foreground">Live #{live.rank}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">Live ranking unavailable</span>
                              )}
                            </div>
                          </div>
                        </Link>
                        <Link href={`/compare?a=${encodeURIComponent(String(game.id))}`} className="shrink-0 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-accent">
                          Compare
                        </Link>
                      </>
                    );
                  })()}
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
