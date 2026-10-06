import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Phase D final polish", () => {
  const shell = readFileSync(resolve(process.cwd(), "src/components/site-shell.tsx"), "utf8");
  const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
  const rootLoading = readFileSync(resolve(process.cwd(), "src/app/loading.tsx"), "utf8");
  const rootError = readFileSync(resolve(process.cwd(), "src/app/error.tsx"), "utf8");
  const accountLoading = readFileSync(resolve(process.cwd(), "src/app/account/loading.tsx"), "utf8");
  const compare = readFileSync(resolve(process.cwd(), "src/app/compare/page.tsx"), "utf8");
  const selector = readFileSync(resolve(process.cwd(), "src/components/game-selector.tsx"), "utf8");
  const search = readFileSync(resolve(process.cwd(), "src/app/search/page.tsx"), "utf8");
  const watchlist = readFileSync(resolve(process.cwd(), "src/components/watchlist-page.tsx"), "utf8");
  const account = readFileSync(resolve(process.cwd(), "src/components/account-page.tsx"), "utf8");

  it("adds skip navigation, focus visibility, and keyboard-safe mobile drawer behavior", () => {
    expect(shell).toContain('href="#main-content"');
    expect(shell).toContain('id="main-content"');
    expect(shell).toContain('role="dialog"');
    expect(shell).toContain('event.key === "Tab"');
    expect(shell).toContain('event.key === "Escape"');
    expect(css).toContain("a:focus-visible");
  });

  it("provides global and account loading/error recovery surfaces", () => {
    expect(rootLoading).toContain("Loading Bobaks...");
    expect(rootError).toContain("Try again");
    expect(rootError).toContain('role="alert"');
    expect(accountLoading).toContain("Loading your account...");
  });

  it("keeps empty states actionable", () => {
    expect(watchlist).toContain("Your watchlist is empty");
    expect(watchlist).toContain("Browse live rankings");
    expect(compare).toContain("Choose from the live Top 100");
    expect(search).toContain("No active games matched");
  });

  it("improves keyboard semantics for Compare selectors", () => {
    expect(selector).toContain('role="combobox"');
    expect(selector).toContain("aria-activedescendant");
    expect(selector).toContain('event.key === "ArrowDown"');
    expect(selector).toContain('event.key === "ArrowUp"');
    expect(selector).toContain('event.key === "Enter"');
  });

  it("refines the logged-out account experience", () => {
    expect(account).toContain('href="/"');
    expect(account).toContain("Home");
    expect(account).toContain("Log in");
    expect(account).not.toContain("Log in or create an account");
    expect(account).not.toContain("Accounts are optional");
    expect(account).not.toContain("You can keep browsing Bobaks as a guest.");
    expect(account).toContain('fill="#4285F4"');
    expect(account).toContain('fill="#34A853"');
    expect(account).toContain('fill="#FBBC05"');
    expect(account).toContain('fill="#EA4335"');
  });

  it("keeps Phase D error styling semantic instead of hard-coded colors", () => {
    expect(search).toContain('role="alert"');
    expect(search).toContain("text-destructive");
    expect(search).not.toContain("text-red-600");
  });
});
