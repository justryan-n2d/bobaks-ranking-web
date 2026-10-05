import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Phase A brand and trust", () => {
  const shell = readFileSync(resolve(process.cwd(), "src/components/site-shell.tsx"), "utf8");
  const auth = readFileSync(resolve(process.cwd(), "src/components/account-page.tsx"), "utf8");
  const footer = readFileSync(resolve(process.cwd(), "src/components/site-footer.tsx"), "utf8");
  const legal = readFileSync(resolve(process.cwd(), "src/lib/legal.ts"), "utf8");

  it("uses the Bobaks brand treatment and site-wide footer", () => {
    expect(shell).toContain("BobaksBrand");
    expect(shell).toContain("SiteFooter");
    expect(footer).toContain("© 2026 Bobaks Ranking");
    expect(footer).toContain("Not affiliated with Roblox Corporation.");
  });

  it("requires legal acceptance for new email accounts", () => {
    expect(auth).toContain("legalAccepted");
    expect(auth).toContain('I agree to the');
    expect(auth).toContain('href="/terms"');
    expect(auth).toContain('href="/privacy"');
    expect(legal).toContain('terms: "2026-10-06"');
    expect(legal).toContain('privacy: "2026-10-06"');
  });

  it("provides a one-time acceptance path for accounts without current consent", () => {
    expect(auth).toContain("hasCurrentLegal");
    expect(auth).toContain("Agree and continue");
    expect(auth).toContain("acceptCurrentLegal");
  });
});
