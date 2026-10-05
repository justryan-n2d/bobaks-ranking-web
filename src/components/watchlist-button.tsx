"use client";

import { Bookmark, Check, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/account-provider";
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
  variant?: "default" | "hero";
};

export function WatchlistButton({ game, compact = false, variant = "default" }: WatchlistButtonProps) {
  const { loading, user, isWatchlisted: remoteIsWatchlisted, toggleWatchlist } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setSaved(remoteIsWatchlisted(game.id));
      return;
    }
    try {
      setSaved(isWatchlisted(parseWatchlist(window.localStorage.getItem(WATCHLIST_STORAGE_KEY)), game.id));
    } catch {
      setSaved(false);
    }
  }, [game.id, remoteIsWatchlisted, user, loading]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      if (user) {
        await toggleWatchlist(game);
        setSaved(!saved);
      } else {
        const current = parseWatchlist(window.localStorage.getItem(WATCHLIST_STORAGE_KEY));
        const next = saved ? removeFromWatchlist(current, game.id) : addToWatchlist(current, game);
        window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
        setSaved(!saved);
        window.dispatchEvent(new CustomEvent("bobaks-watchlist-change"));
      }
    } catch {
      // Keep the button non-blocking if browser storage or the account API is unavailable.
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${game.name} from watchlist` : `Save ${game.name} to watchlist`}
      title={saved ? "Remove from watchlist" : "Save to watchlist"}
      disabled={busy || loading}
      className={
        variant === "hero"
          ? "inline-flex h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/15 disabled:opacity-60"
          : compact
            ? "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background hover:bg-accent disabled:opacity-60"
            : "inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold hover:bg-accent disabled:opacity-60"
      }
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : saved ? <Check className="size-4" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
      {!compact ? (saved ? "Saved" : "Save") : null}
    </button>
  );
}
