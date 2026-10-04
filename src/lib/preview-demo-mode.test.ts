import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getGame,
  getGameHistory,
  getGamePeak,
  getGameRankHistory,
  getRankings,
  getSocialFeed,
  searchGames,
} from "./api";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("preview demo data mode", () => {
  it("serves deterministic ranking fixtures when preview demo mode is enabled", async () => {
    vi.stubEnv("BOBAKS_DEPLOYMENT_ENV", "preview");
    vi.stubEnv("BOBAKS_UI_DEMO_MODE", "true");

    const [live, weekly, monthly, yearly] = await Promise.all([
      getRankings("live"),
      getRankings("weekly"),
      getRankings("monthly"),
      getRankings("yearly"),
    ]);

    expect(live.data).toHaveLength(8);
    expect(live.data[0]?.gameId).toBe("demo-001");
    expect(live.data[0]?.game?.name).toBe("Filipino Hangout");
    expect(weekly.period).toBe("weekly");
    expect(monthly.period).toBe("monthly");
    expect(yearly.period).toBe("yearly");
    expect(live.data.find((game) => game.previousRank == null)?.gameId).toBe("demo-008");
  });

  it("serves the complete game-profile data surface from fixtures", async () => {
    vi.stubEnv("BOBAKS_DEPLOYMENT_ENV", "preview");
    vi.stubEnv("BOBAKS_UI_DEMO_MODE", "true");

    const [feed, game, history, rankHistory, peak] = await Promise.all([
      getSocialFeed("live"),
      getGame("demo-002"),
      getGameHistory("demo-002", 365),
      getGameRankHistory("demo-002", 31),
      getGamePeak("demo-002"),
    ]);

    expect(feed.source).toBe("preview-demo");
    expect(feed.trending.items.length).toBeGreaterThan(0);
    expect(game.name).toBe("Island Builders");
    expect(game.rankings?.live?.rank).toBeGreaterThan(0);
    expect(game.rankings?.weekly?.rank).toBeGreaterThan(0);
    expect(game.rankings?.monthly?.rank).toBeGreaterThan(0);
    expect(game.rankings?.yearly?.rank).toBeGreaterThan(0);
    expect(history.data).toHaveLength(14);
    expect(rankHistory).toHaveLength(14);
    expect(peak.peakPlayers).toBe(19880);
    expect(peak.gameId).toBe("demo-002");
  });

  it("serves demo search results only through the same preview gate", async () => {
    vi.stubEnv("BOBAKS_DEPLOYMENT_ENV", "preview");
    vi.stubEnv("BOBAKS_UI_DEMO_MODE", "true");

    const results = await searchGames("Island");

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("demo-002");
  });

  it("does not enable demo data outside the preview deployment gate", async () => {
    vi.stubEnv("BOBAKS_DEPLOYMENT_ENV", "production");
    vi.stubEnv("BOBAKS_UI_DEMO_MODE", "true");

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await getRankings("live");

    expect(response.data).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not enable demo data when the deployment environment is missing", async () => {
    vi.stubEnv("BOBAKS_UI_DEMO_MODE", "true");

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await getRankings("live");

    expect(response.data).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
