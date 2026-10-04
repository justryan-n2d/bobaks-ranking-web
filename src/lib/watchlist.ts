export const WATCHLIST_STORAGE_KEY = "bobaks_watchlist_v1";
export const WATCHLIST_LIMIT = 25;

export type WatchlistGame = {
  id: string;
  name: string;
  creatorName: string;
  iconUrl: string | null;
  savedAt: string;
};

export function parseWatchlist(raw: string | null): WatchlistGame[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item) => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? "Unknown experience"),
        creatorName: String(item.creatorName ?? "Unknown creator"),
        iconUrl: typeof item.iconUrl === "string" ? item.iconUrl : null,
        savedAt: String(item.savedAt ?? ""),
      }))
      .filter((item) => item.id.length > 0)
      .slice(0, WATCHLIST_LIMIT);
  } catch {
    return [];
  }
}

export function addToWatchlist(
  list: WatchlistGame[],
  game: Omit<WatchlistGame, "savedAt">,
): WatchlistGame[] {
  const filtered = list.filter((item) => item.id !== game.id);
  const next = [{ ...game, savedAt: new Date().toISOString() }, ...filtered];
  return next.slice(0, WATCHLIST_LIMIT);
}

export function removeFromWatchlist(list: WatchlistGame[], id: string): WatchlistGame[] {
  return list.filter((item) => item.id !== id);
}

export function isWatchlisted(list: WatchlistGame[], id: string): boolean {
  return list.some((item) => item.id === id);
}
