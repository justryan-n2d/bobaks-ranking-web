import { afterEach, describe, expect, it } from "vitest";

import { POST } from "@/app/api/identity/roblox/[action]/route";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("Roblox identity API proxy", () => {
  it("forwards to the migrated production API hostname", async () => {
    let targetUrl = "";

    globalThis.fetch = async (input) => {
      targetUrl = String(input);
      return Response.json({ error: "Authentication required." }, { status: 401 });
    };

    const response = await POST(
      new Request("https://web.bobaksranking.workers.dev/api/identity/roblox/start", {
        method: "POST",
      }),
      { params: Promise.resolve({ action: "start" }) },
    );

    expect(response.status).toBe(401);
    expect(targetUrl).toBe(
      "https://bobaks-ranking-api-service.bobaksranking.workers.dev/api/identity/roblox/start",
    );
  });
});
