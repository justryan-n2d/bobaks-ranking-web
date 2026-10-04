import { afterEach, describe, expect, it, vi } from "vitest";
import { getRankings, searchGames } from "./api";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("preview demo data mode", () => {
  it("serves deterministic ranking fixtures when preview demo mode is enabled", async () => {
    vi.stubEnv("BOBAKS_DEPLOYMENT_ENV", "preview");
    vi.stubEnv("BOBAKS_UI_DEMO_MODE", "true");

    const response = await getRankings("live");

    expect(response.data).toHaveLength(8);
    expect(response.data[0].gameId).toBe("demo-001");
    expect(response.data[0].game?.name).toBe("Filipino Hangout");
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

  it("serves demo search results only through the same preview gate", async () => {
    vi.stubEnv("BOBAKS_DEPLOYMENT_ENV", "preview");
    vi.stubEnv("BOBAKS_UI_DEMO_MODE", "true");

    const results = await searchGames("Island");

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("demo-002");
  });
});
