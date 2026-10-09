import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("deployment marker route", () => {
  it("exposes the release id without caching the response", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      release: "cloudflare-generated-worker-deploy-20261009-v2",
    });
  });
});
