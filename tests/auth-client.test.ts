import { describe, expect, it } from "vitest";

import {
  AUTH_SESSION_STORAGE_KEY,
  createAuthClient,
} from "@/lib/auth-client";

function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

function session(expiresAt = Math.floor(Date.now() / 1000) + 3600) {
  return {
    access_token: "access-1",
    refresh_token: "refresh-1",
    expires_at: expiresAt,
    user: { id: "user-1", email: "player@example.com" },
  };
}

describe("account auth client", () => {
  it("starts Google sign-in through the Bobaks server callback", async () => {
    const assigned: string[] = [];
    const originalWindow = (globalThis as { window?: unknown }).window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: {
          origin: "https://bobaksranking.com",
          assign: (url: string) => assigned.push(url),
        },
      },
    });

    try {
      const client = createAuthClient({
        supabaseUrl: "https://supabase.example",
        publishableKey: "sb_publishable_test",
      });
      const url = await client.signInWithGoogle();
      expect(url).toBe("https://bobaksranking.com/api/auth/google/start");
      expect(assigned).toEqual([url]);
    } finally {
      if (originalWindow === undefined) delete (globalThis as { window?: unknown }).window;
      else Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
    }
  });

  it("rejects a Google callback when required authorization data is missing", async () => {
    const originalWindow = (globalThis as { window?: unknown }).window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { origin: "https://bobaksranking.com" } },
    });
    const originalFetch = globalThis.fetch;
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response("{}");
    }) as typeof fetch;

    try {
      const client = createAuthClient({
        supabaseUrl: "https://supabase.example",
        publishableKey: "sb_publishable_test",
      });
      await expect(client.exchangeGoogleAuthCode("auth-code", "")).rejects.toThrow(/callback is incomplete/i);
      expect(called).toBe(false);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalWindow === undefined) delete (globalThis as { window?: unknown }).window;
      else Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
    }
  });

  it("exchanges a Google callback through the Bobaks server endpoint and stores the returned session", async () => {
    const store = storage();
    const originalWindow = (globalThis as { window?: unknown }).window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: { origin: "https://bobaksranking.com" },
        dispatchEvent: () => true,
      },
    });
    const originalFetch = globalThis.fetch;
    let receivedBody = "";
    globalThis.fetch = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
      expect(String(input)).toBe("https://bobaksranking.com/api/auth/google/exchange");
      expect(new Headers(init.headers).get("content-type")).toBe("application/json");
      receivedBody = String(init.body);
      return new Response(JSON.stringify({
        access_token: "google-access",
        refresh_token: "google-refresh",
        expires_in: 3600,
        user: { id: "google-user", email: "google@example.com" },
      }));
    }) as typeof fetch;

    try {
      const client = createAuthClient({
        supabaseUrl: "https://supabase.example",
        publishableKey: "sb_publishable_test",
        storage: store,
      });
      const result = await client.exchangeGoogleAuthCode("auth-code", "oauth-state");
      expect(result.user.id).toBe("google-user");
      expect(receivedBody).toContain('"code":"auth-code"');
      expect(receivedBody).toContain('"state":"oauth-state"');
      expect(store.getItem(AUTH_SESSION_STORAGE_KEY)).toContain("google-access");
    } finally {
      globalThis.fetch = originalFetch;
      if (originalWindow === undefined) delete (globalThis as { window?: unknown }).window;
      else Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
    }
  });

  it("stores a successful sign-in session and uses its bearer token for owned data", async () => {
    const store = storage();
    const calls: { url: string; init: RequestInit }[] = [];
    const client = createAuthClient({
      supabaseUrl: "https://supabase.example",
      publishableKey: "sb_publishable_test",
      storage: store,
    });

    const fetchImpl = async (input: RequestInfo | URL, init: RequestInit = {}) => {
      calls.push({ url: String(input), init });
      const url = new URL(String(input));
      if (url.pathname === "/auth/v1/token") return new Response(JSON.stringify(session()));
      if (url.pathname === "/auth/v1/user") return new Response(JSON.stringify({ id: "user-1", email: "player@example.com" }));
      if (url.pathname === "/rest/v1/user_watchlist") {
        return new Response(JSON.stringify([{ game_id: 123, created_at: "2026-10-05T00:00:00Z" }]));
      }
      return new Response("{}", { status: 404 });
    };

    const authenticatedClient = createAuthClient({
      supabaseUrl: "https://supabase.example",
      publishableKey: "sb_publishable_test",
      storage: store,
    });
    (authenticatedClient as unknown as { __fetch?: typeof fetch }).__fetch = fetchImpl;

    // The public client intentionally takes no fetch override in production.
    // This test swaps global fetch only for the duration of the public boundary.
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchImpl as typeof fetch;
    try {
      await authenticatedClient.signIn({ email: "player@example.com", password: "correct" });
      const rows = await authenticatedClient.listWatchlist();
      expect(rows[0]?.game_id).toBe(123);
      expect(store.getItem(AUTH_SESSION_STORAGE_KEY)).toContain("access-1");
      const watchlistCall = calls.find((call) => call.url.includes("/rest/v1/user_watchlist"));
      expect(new Headers(watchlistCall?.init.headers).get("authorization")).toBe("Bearer access-1");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("refreshes an expired session before an owned request", async () => {
    const store = storage();
    store.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session(Math.floor(Date.now() / 1000) - 10)));
    const calls: string[] = [];
    const originalFetch = globalThis.fetch;

    globalThis.fetch = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
      calls.push(String(input));
      const url = new URL(String(input));
      if (url.pathname === "/auth/v1/token") {
        expect(String(init.body)).toContain("refresh-1");
        return new Response(JSON.stringify(session()));
      }
      if (url.pathname === "/auth/v1/user") return new Response(JSON.stringify({ id: "user-1" }));
      if (url.pathname === "/rest/v1/user_watchlist") return new Response(JSON.stringify([]));
      return new Response("{}", { status: 404 });
    }) as typeof fetch;

    try {
      const client = createAuthClient({
        supabaseUrl: "https://supabase.example",
        publishableKey: "sb_publishable_test",
        storage: store,
      });
      await client.listWatchlist();
      expect(calls.some((call) => call.endsWith("/auth/v1/token?grant_type=refresh_token"))).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("rejects invalid Roblox visibility combinations before saving them", async () => {
    const store = storage();
    store.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session()));
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.pathname === "/auth/v1/user") return new Response(JSON.stringify({ id: "user-1" }));
      return new Response("[]");
    }) as typeof fetch;

    try {
      const client = createAuthClient({
        supabaseUrl: "https://supabase.example",
        publishableKey: "sb_publishable_test",
        storage: store,
      });
      await expect(client.updateIdentityPreferences({
        show_roblox_identity: false,
        show_roblox_avatar: true,
      })).rejects.toThrow(/requires Roblox identity/i);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
