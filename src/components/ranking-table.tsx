import Link from "next/link";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { RankingGame } from "@/lib/api";
import { Card } from "@/components/ui/card";

function formatPlayers(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.max(0, value));
}

export function RankingTable({ games }: { games: RankingGame[] }) {
  if (!games.length) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        No ranking data is available right now.
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="hidden grid-cols-[52px_minmax(0,1fr)_120px_90px] gap-3 border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:grid">
        <span>Rank</span>
        <span>Experience</span>
        <span className="text-right">Players</span>
        <span className="text-right">Move</span>
      </div>
      <div className="divide-y divide-border">
        {games.map((game) => {
          const change = Number(game.rankChange || 0);

          return (
            <div key={game.gameId} className="flex items-center gap-3 px-4 py-4 sm:grid sm:grid-cols-[52px_minmax(0,1fr)_120px_90px] sm:px-5">
              <div className="w-10 shrink-0 text-center text-lg font-black tabular-nums sm:w-auto sm:text-left">#{game.rank}</div>
              <Link
                href={`/game/${encodeURIComponent(game.gameId)}`}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring sm:min-w-0"
              >
                {game.game?.iconUrl ? (
                  <img
                    src={game.game.iconUrl}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="size-10 shrink-0 rounded-xl border border-border object-cover"
                  />
                ) : (
                  <div className="size-10 shrink-0 rounded-xl bg-muted" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <div className="truncate font-semibold">{game.game?.name || "Unknown experience"}</div>
                  <div className="truncate text-xs text-muted-foreground">{game.game?.creatorName || "Unknown creator"}</div>
                </div>
              </Link>
              <div className="text-right">
                <div className="font-bold tabular-nums">{formatPlayers(Number(game.score || 0))}</div>
                <div className="text-xs text-muted-foreground">players</div>
              </div>
              <div className="flex w-16 justify-end sm:w-auto">
                {game.previousRank == null ? (
                  <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-bold text-muted-foreground">NEW</span>
                ) : change > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <ArrowUp className="size-3.5" aria-hidden="true" /> {change}
                  </span>
                ) : change < 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                    <ArrowDown className="size-3.5" aria-hidden="true" /> {Math.abs(change)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Minus className="size-3.5" aria-hidden="true" /> 0
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
