import { afterEach, describe, expect, it } from "vitest";

import { POST } from "@/app/api/identity/roblox/[action]/route";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("Roblox identity API proxy", () => {
  it("returns the authentication boundary locally without an upstream request", async () => {
    let fetchCalled = false;

    globalThis.fetch = async () => {
      fetchCalled = true;
      throw new Error("upstream should not be called");
    };

    const response = await POST(
      new Request("https://web.bobaksranking.workers.dev/api/identity/roblox/start", {
        method: "POST",
      }),
      { params: Promise.resolve({ action: "start" }) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Authentication required.",
    });
    expect(fetchCalled).toBe(false);
  });

  it("forwards authenticated requests to the migrated production API hostname", async () => {
    let targetUrl = "";

    globalThis.fetch = async (input) => {
      targetUrl = String(input);
      return Response.json({ error: "Roblox identity connection is not configured." }, { status: 503 });
    };

    const response = await POST(
      new Request("https://web.bobaksranking.workers.dev/api/identity/roblox/start", {
        method: "POST",
        headers: { authorization: "Bearer test-token" },
      }),
      { params: Promise.resolve({ action: "start" }) },
    );

    expect(response.status).toBe(503);
    expect(targetUrl).toBe(
      "https://bobaks-ranking-api-service.bobaksranking.workers.dev/api/identity/roblox/start",
    );
  });
});
