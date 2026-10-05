import { describe, expect, it } from "vitest";

import { GET as startGoogle } from "@/app/api/auth/google/start/route";
import { POST as exchangeGoogle } from "@/app/api/auth/google/exchange/route";

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

    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("__Host-bobaks-google-tx=");
    expect(cookie).toContain("Max-Age=600");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");

    const tx = decodeCookieValue(cookie);
    expect(tx.codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(typeof tx.createdAt).toBe("number");
  });

  it("exchanges a callback code with the verifier from the secure cookie", async () => {
    const startResponse = await startGoogle(new Request(
      "https://bobaksranking.com/api/auth/google/start",
    ));
    const cookie = startResponse.headers.get("set-cookie") ?? "";
    const transactionValue = cookie.match(/__Host-bobaks-google-tx=([^;]+)/)?.[1];
    if (!transactionValue) throw new Error("transaction cookie missing");

    const padded = transactionValue.replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (transactionValue.length % 4)) % 4);
    const transaction = JSON.parse(atob(padded)) as { codeVerifier: string };

    const originalFetch = globalThis.fetch;
    let receivedBody = "";
    globalThis.fetch = (async (_input: RequestInfo | URL, init: RequestInit = {}) => {
      receivedBody = String(init.body);
      return new Response(JSON.stringify({
        access_token: "access",
        refresh_token: "refresh",
        expires_in: 3600,
        user: { id: "user-1", email: "player@example.com" },
      }));
    }) as typeof fetch;

    try {
      const response = await exchangeGoogle(new Request(
        "https://bobaksranking.com/api/auth/google/exchange",
        {
          method: "POST",
          headers: {
            cookie,
            "content-type": "application/json",
          },
          body: JSON.stringify({ code: "code-1" }),
        },
      ));
      expect(response.status).toBe(200);
      expect(JSON.parse(receivedBody)).toEqual({
        auth_code: "code-1",
        code_verifier: transaction.codeVerifier,
      });
      expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
