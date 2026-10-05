import { describe, expect, it } from "vitest";

import { GET as startGoogle } from "@/app/api/auth/google/start/route";

function decodeCookieValue(setCookie: string) {
  const match = setCookie.match(/__Host-bobaks-google-tx=([^;]+)/);
  if (!match) throw new Error("transaction cookie missing");
  const value = match[1].replace(/-/g, "+").replace(/_/g, "/");
  const padding = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  return JSON.parse(atob(value + padding));
}

describe("Google OAuth server routes", () => {
  it("starts with the fixed Bobaks callback and sets a short-lived host cookie", async () => {
    const response = await startGoogle(new Request(
      "https://bobaksranking.com/api/auth/google/start",
    ));
    expect(response.status).toBe(302);

    const location = response.headers.get("location");
    expect(location).toBeTruthy();

    const url = new URL(location!);
    expect(url.origin).toBe("https://zhrfozouzvxhpkylmpwh.supabase.co");
    expect(url.pathname).toBe("/auth/v1/authorize");
    expect(url.searchParams.get("provider")).toBe("google");
    expect(url.searchParams.get("redirect_to")).toBe(
      "https://bobaksranking.com/account/google-callback",
    );
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(url.searchParams.get("state")).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("__Host-bobaks-google-tx=");
    expect(cookie).toContain("Max-Age=600");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");

    const tx = decodeCookieValue(cookie);
    expect(tx.state).toBe(url.searchParams.get("state"));
    expect(tx.codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(typeof tx.createdAt).toBe("number");
  });
});
