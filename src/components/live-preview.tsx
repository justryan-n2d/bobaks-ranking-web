import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getRankings } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatPlayers(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.max(0, value));
}

export async function LivePreview() {
  try {
    const response = await getRankings("live");
    const games = response.data.slice(0, 5);

    return (
      <Card>
        <CardHeader className="flex-row items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Live now
            </div>
            <CardTitle>Top 5 experiences</CardTitle>
            <CardDescription className="mt-1">
              A small live snapshot. Open the full ranking for the complete Top 100.
            </CardDescription>
          </div>
          <Link href="/rankings/live" className="hidden shrink-0 items-center gap-1 text-sm font-semibold hover:underline sm:inline-flex">
            Full ranking <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {games.length ? (
            games.map((game) => (
              <Link
                href={`/game/${encodeURIComponent(game.gameId)}`}
                key={game.gameId}
                className="flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-accent/60"
              >
                <div className="w-10 shrink-0 text-center text-sm font-black tabular-nums">#{game.rank}</div>
                {game.game?.iconUrl ? (
                  <img src={game.game.iconUrl} alt="" width={40} height={40} className="size-10 rounded-xl object-cover" />
                ) : (
                  <div className="size-10 rounded-xl bg-muted" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{game.game?.name || "Unknown experience"}</div>
                  <div className="truncate text-xs text-muted-foreground">{game.game?.creatorName || "Unknown creator"}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums">{formatPlayers(Number(game.score || 0))}</div>
                  <div className="text-[11px] text-muted-foreground">players</div>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No live ranking data is available right now.
            </div>
          )}
        </CardContent>
      </Card>
    );
  } catch {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live rankings</CardTitle>
          <CardDescription>Live data is temporarily unavailable.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
}
