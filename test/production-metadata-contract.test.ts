import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("production metadata contract", () => {
  test("uses the current Cloudflare site origin and keeps previews out of indexes", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");
    const wrangler = readFileSync("wrangler.jsonc", "utf8");

    expect(layout).toMatch(/web\.bobaksranking\.workers\.dev/);
    expect(layout).toMatch(/canonical:\s*["']\/["']/);
    expect(layout).toMatch(/index:\s*!IS_PREVIEW/);
    expect(wrangler).toMatch(/"BOBAKS_SITE_ORIGIN":\s*"https:\/\/web\.bobaksranking\.workers\.dev"/);
    expect(wrangler).toMatch(/"BOBAKS_DEPLOYMENT_ENV":\s*"preview"/);
    expect(wrangler).toMatch(/"main":\s*"dist\/server\/index\.js"/);
  });
});
