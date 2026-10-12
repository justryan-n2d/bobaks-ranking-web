import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getRankings } from "@/lib/api";

const originalFetch = globalThis.fetch;
const originalDeploymentEnv = process.env.BOBAKS_DEPLOYMENT_ENV;
const originalDemoMode = process.env.BOBAKS_UI_DEMO_MODE;

function jsonResponse(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const rankingPayload = {
  period: "live",
  data: [{ rank: 1, gameId: "game-1", score: 100 }],
  updatedAt: "2026-10-12T00:00:00.000Z",
};

function mockFetch() {
  const fetchMock = vi.fn<typeof fetch>();
  globalThis.fetch = fetchMock;
  return fetchMock;
}

describe("transient ranking API failures", () => {
  beforeEach(() => {
    process.env.BOBAKS_DEPLOYMENT_ENV = "production";
    process.env.BOBAKS_UI_DEMO_MODE = "false";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalDeploymentEnv === undefined) {
      delete process.env.BOBAKS_DEPLOYMENT_ENV;
    } else {
      process.env.BOBAKS_DEPLOYMENT_ENV = originalDeploymentEnv;
    }
    if (originalDemoMode === undefined) {
      delete process.env.BOBAKS_UI_DEMO_MODE;
    } else {
      process.env.BOBAKS_UI_DEMO_MODE = originalDemoMode;
    }
    vi.restoreAllMocks();
  });

  it("retries transient 502 and 503 responses and returns the recovered ranking data", async () => {
    const fetchMock = mockFetch();
    fetchMock
      .mockResolvedValueOnce(jsonResponse(502, { error: "upstream temporarily unavailable" }))
      .mockResolvedValueOnce(jsonResponse(503, { error: "service warming up" }))
      .mockResolvedValueOnce(jsonResponse(200, rankingPayload));

    await expect(getRankings("live")).resolves.toMatchObject({
      period: "live",
      data: [{ rank: 1, gameId: "game-1", score: 100 }],
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("retries a transient network exception", async () => {
    const fetchMock = mockFetch();
    fetchMock
      .mockRejectedValueOnce(new TypeError("temporary network failure"))
      .mockResolvedValueOnce(jsonResponse(200, rankingPayload));

    await expect(getRankings("live")).resolves.toMatchObject({
      period: "live",
      data: [{ rank: 1, gameId: "game-1", score: 100 }],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry a permanent client error", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse(404, { error: "not found" }));

    await expect(getRankings("live")).rejects.toThrow("Bobaks API returned HTTP 404");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("stops after three transient failures and preserves the upstream status", async () => {
    const fetchMock = mockFetch();
    fetchMock
      .mockResolvedValueOnce(jsonResponse(502, { error: "bad gateway" }))
      .mockResolvedValueOnce(jsonResponse(502, { error: "bad gateway" }))
      .mockResolvedValueOnce(jsonResponse(502, { error: "bad gateway" }));

    await expect(getRankings("live")).rejects.toThrow("Bobaks API returned HTTP 502");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
