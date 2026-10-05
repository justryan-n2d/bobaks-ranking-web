const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://zhrfozouzvxhpkylmpwh.supabase.co";
const SUPABASE_REDIRECT = "/account/google-callback";
const COOKIE = "__Host-bobaks-google-tx";

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
  const redirectTo = new URL(SUPABASE_REDIRECT, requestUrl.origin).toString();
  const codeVerifier = randomToken(32);
  const challenge = await codeChallenge(codeVerifier);

  const transaction = base64Url(
    new TextEncoder().encode(
      JSON.stringify({
        codeVerifier,
        createdAt: Date.now(),
      }),
    ),
  );

  const authorizeUrl = new URL(SUPABASE_URL + "/auth/v1/authorize");
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_to", redirectTo);
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  return new Response(null, {
    status: 302,
    headers: {
      location: authorizeUrl.toString(),
      "cache-control": "no-store",
      "set-cookie": [
        COOKIE + "=" + transaction,
        "Max-Age=600",
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
      ].join("; "),
    },
  });
}
