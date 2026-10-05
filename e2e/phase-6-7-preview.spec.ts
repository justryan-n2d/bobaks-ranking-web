import { test, expect } from "@playwright/test";

const PREVIEW_URL =
  process.env.PREVIEW_URL ??
  "https://feat-phase-6-7-accounts-identity-20261005-bobaks-ranking-web.ryan-oledan0.workers.dev";

async function previewIsReachable(request: import("@playwright/test").APIRequestContext) {
  await expect.poll(
    async () => {
      try {
        const response = await request.get(PREVIEW_URL, {
          maxRedirects: 0,
          timeout: 10_000,
        });
        return response.status();
      } catch {
        return 0;
      }
    },
    {
      timeout: 60_000,
      intervals: [1000, 2000, 5000],
      message: "Cloudflare Phase 6.7 preview did not become reachable",
    },
  ).toBe(200);
}

test.describe("Phase 6.7 Cloudflare preview", () => {
  test("renders the signed-out account surface in a real browser", async ({ page, request }) => {
    await previewIsReachable(request);
    await page.goto(PREVIEW_URL + "/account", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Log in to Bobaks" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("stores the Google transaction cookie in the real browser before OAuth", async ({ page, request }) => {
    await previewIsReachable(request);

    const responsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/auth/google/start") && response.status() === 302,
    );

    await page.goto(PREVIEW_URL + "/api/auth/google/start", { waitUntil: "commit" });
    await responsePromise;

    const cookies = await page.context().cookies(PREVIEW_URL);
    const transaction = cookies.find((cookie) => cookie.name === "__Host-bobaks-google-tx");
    expect(transaction).toBeTruthy();
    expect(transaction?.secure).toBe(true);
    expect(transaction?.httpOnly).toBe(true);
    expect(transaction?.sameSite).toBe("Lax");
    expect(transaction?.path).toBe("/");
  });

  test("sends Google sign-in from the real preview toward Google", async ({ page, request }) => {
    await previewIsReachable(request);
    await page.goto(PREVIEW_URL + "/account", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "Continue with Google" }).click();

    await expect
      .poll(
        async () => new URL(page.url()).hostname,
        {
          timeout: 30_000,
          intervals: [500, 1000, 2000],
          message: "Google sign-in did not reach the Google authorization host",
        },
      )
      .toBe("accounts.google.com");
  });

  test("keeps the guest-first watchlist route usable without an account", async ({ page, request }) => {
    await previewIsReachable(request);
    await page.goto(PREVIEW_URL + "/saved", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Your watchlist is empty" })).toBeVisible();
    await expect(page.getByText("Guests keep saves on this device.")).toBeVisible();
  });

  test("enforces authentication at the Roblox connection server boundary", async ({ request }) => {
    await previewIsReachable(request);
    const response = await request.post(PREVIEW_URL + "/api/identity/roblox/start");
    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "Authentication required.",
    });
  });

  test("starts Google OAuth with the preview callback and a short-lived transaction cookie", async ({ request }) => {
    await previewIsReachable(request);
    const response = await request.get(PREVIEW_URL + "/api/auth/google/start", {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    const location = response.headers().location;
    expect(location).toBeTruthy();

    const authorizeUrl = new URL(location!);
    expect(authorizeUrl.hostname).toBe("zhrfozouzvxhpkylmpwh.supabase.co");
    expect(authorizeUrl.pathname).toBe("/auth/v1/authorize");
    expect(authorizeUrl.searchParams.get("provider")).toBe("google");
    expect(authorizeUrl.searchParams.get("redirect_to")).toBe(
      PREVIEW_URL + "/account/google-callback",
    );
    expect(authorizeUrl.searchParams.get("code_challenge_method")).toBe("S256");
    expect(authorizeUrl.searchParams.get("code_challenge")).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const cookie = response.headers()["set-cookie"] ?? "";
    expect(cookie).toContain("__Host-bobaks-google-tx=");
    expect(cookie).toContain("Max-Age=600");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
  });

  test("renders a safe Google callback error in the real browser", async ({ page, request }) => {
    await previewIsReachable(request);
    await page.goto(PREVIEW_URL + "/account/google-callback?error=access_denied", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Google sign-in failed" })).toBeVisible();
    await expect(page.getByText("Google sign-in was cancelled or rejected.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Back to account" })).toBeVisible();
  });

  test("rejects a Google callback exchange when the browser transaction cookie is missing", async ({ request }) => {
    await previewIsReachable(request);
    const response = await request.post(PREVIEW_URL + "/api/auth/google/exchange", {
      data: { code: "invalid-test-code" },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Google sign-in session is missing. Start Google sign-in again.",
    });
  });
});
