import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Phase C core product UX", () => {
  const compare = readFileSync(resolve(process.cwd(), "src/app/compare/page.tsx"), "utf8");
  const picker = readFileSync(resolve(process.cwd(), "src/components/compare-picker.tsx"), "utf8");
  const selector = readFileSync(resolve(process.cwd(), "src/components/game-selector.tsx"), "utf8");
  const search = readFileSync(resolve(process.cwd(), "src/app/search/page.tsx"), "utf8");
  const liveHome = readFileSync(resolve(process.cwd(), "src/components/live-home-board.tsx"), "utf8");
  const liveRanking = readFileSync(resolve(process.cwd(), "src/components/ranking-period-view.tsx"), "utf8");
  const game = readFileSync(resolve(process.cwd(), "src/app/game/[id]/page.tsx"), "utf8");
  const searchRoute = readFileSync(resolve(process.cwd(), "src/app/api/search/route.ts"), "utf8");

  it("replaces Compare game ID inputs with accessible searchable selectors", () => {
    expect(compare).toContain("<ComparePicker");
    expect(compare).not.toContain('placeholder="Game ID"');
    expect(picker).toContain("GameSelector");
    expect(selector).toContain('role="listbox"');
    expect(selector).toContain('role="option"');
    expect(selector).toContain("/api/search?q=");
    expect(selector).toContain("/api/rankings/live");
    expect(selector).toContain("Live #");
  });

  it("provides a same-origin search route for browser clients", () => {
    expect(searchRoute).toContain("searchGames");
    expect(searchRoute).toContain("force-dynamic");
    expect(searchRoute).toContain('"/api/search');
  });

  it("adds live rank and player count to search results", () => {
    expect(search).toContain("liveByGameId");
    expect(search).toContain("players");
    expect(search).toContain("Live #{");
  });

  it("uses API-provided refresh timing on live surfaces", () => {
    expect(liveHome).toContain("nextRefreshAt");
    expect(liveHome).toContain("Next refresh in");
    expect(liveHome).toContain("payload.nextRefreshAt");
    expect(liveRanking).toContain("Next refresh in");
    expect(liveRanking).toContain("payload.nextRefreshAt");
    expect(liveRanking).toContain("refreshIntervalSeconds");
  });

  it("does not call an API response an exact tracking start date", () => {
    expect(game).toContain("Oldest available record");
    expect(game).toContain("not presented as the game's original creation date or guaranteed first-ever observation");
    expect(game).toContain("Recorded Peak");
  });
});
