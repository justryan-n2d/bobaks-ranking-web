import { afterEach, describe, expect, it } from "vitest";

import { GET } from "@/app/sitemap.xml/route";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("sitemap route", () => {
  it("returns public ranking routes and current game URLs", async () => {
    globalThis.fetch = async (input) => {
      const url = String(input);
      expect(url).toBe(
        "https://bobaks-ranking-api-service.bobaksranking.workers.dev/api/games?limit=100&offset=0",
      );
      return new Response(
        JSON.stringify({
          data: [
            { id: "123", updatedAt: "2026-10-06T20:00:00.000Z" },
            { id: "not-a-number", updatedAt: "2026-10-06T20:00:00.000Z" },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    };

    const response = await GET(
      new Request("https://web.bobaksranking.workers.dev/sitemap.xml"),
    );
    const xml = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/xml; charset=utf-8");
    expect(xml).toContain("https://web.bobaksranking.workers.dev/");
    expect(xml).toContain("https://web.bobaksranking.workers.dev/rankings/weekly");
    expect(xml).toContain("https://web.bobaksranking.workers.dev/rankings/monthly");
    expect(xml).toContain("https://web.bobaksranking.workers.dev/rankings/yearly");
    expect(xml).toContain("https://web.bobaksranking.workers.dev/community");
    expect(xml).toContain("https://web.bobaksranking.workers.dev/game/123");
    expect(xml).not.toContain("not-a-number");
    expect(xml).toContain("<lastmod>2026-10-06T20:00:00.000Z</lastmod>");
  });

  it("still returns a valid static sitemap when the game API is unavailable", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "temporary outage" }), { status: 503 });

    const response = await GET(
      new Request("https://web.bobaksranking.workers.dev/sitemap.xml"),
    );
    const xml = await response.text();

    expect(response.status).toBe(200);
    expect(xml).toContain("https://web.bobaksranking.workers.dev/");
    expect(xml).toContain("https://web.bobaksranking.workers.dev/rankings/yearly");
    expect(xml).toContain("https://web.bobaksranking.workers.dev/community");
  });
});
