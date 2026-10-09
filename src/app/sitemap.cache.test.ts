import { describe, expect, it } from "vitest";
import * as sitemapModule from "./sitemap";

describe("sitemap caching configuration", () => {
  it("renders on demand instead of requiring incremental regeneration storage", () => {
    expect(sitemapModule.dynamic).toBe("force-dynamic");
    expect(sitemapModule).not.toHaveProperty("revalidate");
  });
});
