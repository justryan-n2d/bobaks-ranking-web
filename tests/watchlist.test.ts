import { describe, expect, it } from "vitest";
import {
  WATCHLIST_LIMIT,
  addToWatchlist,
  isWatchlisted,
  parseWatchlist,
  removeFromWatchlist,
  type WatchlistGame,
} from "../src/lib/watchlist";

const game = (id: string): Omit<WatchlistGame, "savedAt"> => ({
  id,
  name: `Game ${id}`,
  creatorName: "Creator",
  iconUrl: null,
});

describe("guest watchlist", () => {
  it("adds newest games first and de-duplicates ids", () => {
    const one = addToWatchlist([], game("1"));
    const two = addToWatchlist(one, game("2"));
    const duplicate = addToWatchlist(two, game("1"));

    expect(duplicate.map((item) => item.id)).toEqual(["1", "2"]);
    expect(isWatchlisted(duplicate, "1")).toBe(true);
  });

  it("removes a saved game", () => {
    const list = addToWatchlist(addToWatchlist([], game("1")), game("2"));
    expect(removeFromWatchlist(list, "1").map((item) => item.id)).toEqual(["2"]);
  });

  it("enforces the 25-game limit", () => {
    let list: WatchlistGame[] = [];
    for (let i = 0; i < 30; i += 1) {
      list = addToWatchlist(list, game(String(i)));
    }

    expect(list).toHaveLength(WATCHLIST_LIMIT);
    expect(list[0].id).toBe("29");
  });

  it("fails closed on malformed storage", () => {
    expect(parseWatchlist("{bad")).toEqual([]);
    expect(parseWatchlist(null)).toEqual([]);
  });
});
