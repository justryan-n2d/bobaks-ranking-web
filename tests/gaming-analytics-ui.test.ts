import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

describe("Gaming Analytics visual language", () => {
  it("defines semantic Bobaks signal tokens for the new UI", () => {
    expect(css).toContain("--brand:");
    expect(css).toContain("--signal-live:");
    expect(css).toContain("--signal-rise:");
    expect(css).toContain("--signal-drop:");
    expect(css).toContain("--signal-peak:");
  });

  it("keeps the visual system responsive and motion-safe", () => {
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain(".bobaks-hero");
    expect(css).toContain(".bobaks-spotlight");
  });
});
