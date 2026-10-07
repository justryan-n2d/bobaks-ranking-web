import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync("src/app/layout.tsx", "utf8");
const wrangler = readFileSync("wrangler.jsonc", "utf8");

assert.match(layout, /web\.bobaksranking\.workers\.dev/);
assert.match(layout, /canonical:\s*"\/"|canonical:\s*["']\//);
assert.match(layout, /index:\s*!IS_PREVIEW/);
assert.match(wrangler, /"BOBAKS_SITE_ORIGIN":\s*"https:\/\/web\.bobaksranking\.workers\.dev"/);
assert.match(wrangler, /"BOBAKS_DEPLOYMENT_ENV":\s*"preview"/);

console.log("Production metadata uses the current Cloudflare site origin and previews are non-indexable.");
