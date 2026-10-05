"use client";

import Link from "next/link";
import { Bookmark, LoaderCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getGame, type GameProfile } from "@/lib/api";
import { useAuth } from "@/components/account-provider";
import { WATCHLIST_STORAGE_KEY, parseWatchlist, type WatchlistGame } from "@/lib/watchlist";
import { Card } from "@/components/ui/card";

type EnrichedGame = WatchlistGame & {
  currentPlayers?: number | null;
  liveRank?: number | null;
  loading?: boolean;
};

function formatPlayers(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.max(0, Number(value) || 0));
}

export function WatchlistPage() {
  const { user, loading: accountLoading, watchlistIds, removeWatchlist } = useAuth();
  const [games, setGames] = useState<EnrichedGame[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (user) {
      setGames(watchlistIds.map((id) => ({
        id,
        name: `Experience ${id}`,
        creatorName: "Loading creator",
        iconUrl: null,
        savedAt: "",
      })));
      setHydrated(true);
      return;
    }

    try {
      setGames(parseWatchlist(window.localStorage.getItem(WATCHLIST_STORAGE_KEY)));
    } catch {
      setGames([]);
    }
    setHydrated(true);

    const read = () => {
      try { setGames(parseWatchlist(window.localStorage.getItem(WATCHLIST_STORAGE_KEY))); } catch { setGames([]); }
    };
    window.addEventListener("bobaks-watchlist-change", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("bobaks-watchlist-change", read);
      window.removeEventListener("storage", read);
    };
  }, [user, watchlistIds]);

  useEffect(() => {
    if (!games.length) return;
    let cancelled = false;
    async function refresh() {
      for (let index = 0; index < games.length; index += 2) {
        const batch = games.slice(index, index + 2);
        const results = await Promise.allSettled(batch.map((game) => getGame(game.id)));
        if (cancelled) return;
        setGames((current) => current.map((item) => {
          const position = batch.findIndex((game) => game.id === item.id);
          if (position === -1) return item;
          const result = results[position];
          if (result.status !== "fulfilled") return { ...item, loading: false };
          const profile = result.value as GameProfile;
          return {
            ...item,
            name: profile.name || item.name,
            creatorName: profile.creatorName || item.creatorName,
            iconUrl: profile.iconUrl || item.iconUrl,
            currentPlayers: profile.currentPlayers ?? null,
            liveRank: profile.rankings?.live?.rank ?? null,
            loading: false,
          };
        }));
      }
    }
    void refresh();
    return () => { cancelled = true; };
  }, [games.length, user]);

  async function remove(id: string) {
    if (user) {
      try { await removeWatchlist(id); } catch { /* Keep server state visible until retry. */ }
      return;
    }
    const next = games.filter((item) => item.id !== id);
    setGames(next);
    try { window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  if (!hydrated || accountLoading) {
    return <Card className="p-8 text-sm text-muted-foreground">Loading your watchlist...</Card>;
  }

  if (!games.length) {
    return (
      <Card className="p-8 sm:p-10">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Bookmark className="size-5" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-xl font-black">Your watchlist is empty</h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          Save games from their profile or from rankings. Guests keep saves on this device. Signed-in users sync them across devices.
        </p>
        <Link href="/rankings/live" className="mt-5 inline-flex rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90">
          Browse live rankings
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {games.length} saved {games.length === 1 ? "game" : "games"} {user ? "on your account" : "on this device"}
        </div>
      </div>

      <div className="space-y-2">
        {games.map((game) => (
          <Card key={game.id} className="flex items-center gap-3 p-3 sm:p-4">
            <Link href={`/game/${encodeURIComponent(game.id)}`} className="flex min-w-0 flex-1 items-center gap-3">
              {game.iconUrl ? (
                <img src={game.iconUrl} alt="" width={52} height={52} className="size-13 shrink-0 rounded-2xl border border-border object-cover" />
              ) : (
                <div className="size-13 shrink-0 rounded-2xl bg-muted" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <div className="truncate font-semibold">{game.name}</div>
                <div className="truncate text-xs text-muted-foreground">{game.creatorName}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {game.liveRank ? `#${game.liveRank} live` : "Live rank unavailable"}
                  {game.currentPlayers != null ? ` · ${formatPlayers(game.currentPlayers)} players` : ""}
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-1">
              {game.loading ? <LoaderCircle className="mr-1 size-4 animate-spin text-muted-foreground" aria-label="Refreshing" /> : null}
              <button type="button" onClick={() => void remove(game.id)} aria-label={`Remove ${game.name} from watchlist`} title="Remove from watchlist" className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground">
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {user ? (
        <div className="text-xs text-muted-foreground">Signed-in watchlists are stored in your Bobaks account and protected by account ownership policies.</div>
      ) : games.length >= 25 ? (
        <div className="text-xs text-muted-foreground">Guest watchlists are limited to 25 games for a lightweight device-local experience.</div>
      ) : null}
    </div>
  );
}
