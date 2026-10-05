const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://zhrfozouzvxhpkylmpwh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_m5sYdsVZpWMOVRxyMSwblw_dIesP93F";

const GOOGLE_TRANSACTION_COOKIE = "__Host-bobaks-google-tx";
const GOOGLE_TRANSACTION_MAX_AGE = 10 * 60;

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64Url(new Uint8Array(digest));
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const redirectTo = new URL("/account/google-callback", requestUrl.origin).toString();
  const state = randomToken(32);
  const codeVerifier = randomToken(32);
  const challenge = await codeChallenge(codeVerifier);

  const transaction = base64Url(
    new TextEncoder().encode(
      JSON.stringify({
        state,
        codeVerifier,
        createdAt: Date.now(),
      }),
    ),
  );

  const authorizeUrl = new URL(SUPABASE_URL + "/auth/v1/authorize");
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("redirect_to", redirectTo);
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      location: authorizeUrl.toString(),
      "cache-control": "no-store",
      "set-cookie": [
        GOOGLE_TRANSACTION_COOKIE + "=" + transaction,
        "Max-Age=" + GOOGLE_TRANSACTION_MAX_AGE,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
      ].join("; "),
    },
  });
}

export { GOOGLE_TRANSACTION_COOKIE };
