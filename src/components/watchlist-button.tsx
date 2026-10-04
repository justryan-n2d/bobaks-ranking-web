"use client";

import { Bookmark, Check } from "lucide-react";
import { useEffect, useState } from "react";

import {
  WATCHLIST_STORAGE_KEY,
  addToWatchlist,
  isWatchlisted,
  parseWatchlist,
  removeFromWatchlist,
  type WatchlistGame,
} from "@/lib/watchlist";

type WatchlistButtonProps = {
  game: Omit<WatchlistGame, "savedAt">;
  compact?: boolean;
};

export function WatchlistButton({ game, compact = false }: WatchlistButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      setSaved(isWatchlisted(parseWatchlist(window.localStorage.getItem(WATCHLIST_STORAGE_KEY)), game.id));
    } catch {
      setSaved(false);
    }
  }, [game.id]);

  function toggle() {
    try {
      const current = parseWatchlist(window.localStorage.getItem(WATCHLIST_STORAGE_KEY));
      const next = saved ? removeFromWatchlist(current, game.id) : addToWatchlist(current, game);
      window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
      setSaved(!saved);
      window.dispatchEvent(new CustomEvent("bobaks-watchlist-change"));
    } catch {
      // Keep the button non-blocking if browser storage is unavailable.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${game.name} from watchlist` : `Save ${game.name} to watchlist`}
      title={saved ? "Remove from watchlist" : "Save to watchlist"}
      className={
        compact
          ? "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background hover:bg-accent"
          : "inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold hover:bg-accent"
      }
    >
      {saved ? <Check className="size-4" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
      {!compact ? (saved ? "Saved" : "Save") : null}
    </button>
  );
}
