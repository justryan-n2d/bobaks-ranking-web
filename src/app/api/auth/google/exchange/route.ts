const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://zhrfozouzvxhpkylmpwh.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_m5sYdsVZpWMOVRxyMSwblw_dIesP93F";
const COOKIE = "__Host-bobaks-google-tx";
const MAX_AGE_MS = 10 * 60 * 1000;

function readCookie(request: Request): string | null {
  const raw = request.headers.get("cookie") ?? "";
  const prefix = COOKIE + "=";
  for (const item of raw.split(";")) {
    const value = item.trim();
    if (value.startsWith(prefix)) return value.slice(prefix.length);
  }
  return null;
}

function decode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(normalized + padding);
}

function clearCookie(): string {
  return COOKIE + "=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax";
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
  } catch {}

  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code) {
    return Response.json({ error: "Google sign-in callback is incomplete." }, {
      status: 400,
      headers: { "cache-control": "no-store" },
    });
  }

  const encoded = readCookie(request);
  if (!encoded) {
    return Response.json({ error: "Google sign-in session is missing. Start Google sign-in again." }, {
      status: 400,
      headers: { "cache-control": "no-store" },
    });
  }

  let transaction: { codeVerifier: string; createdAt: number };
  try {
    const parsed = JSON.parse(decode(encoded)) as Partial<{ codeVerifier: string; createdAt: number }>;
    if (typeof parsed.codeVerifier !== "string" || typeof parsed.createdAt !== "number") {
      throw new Error("invalid transaction");
    }
    transaction = parsed as { codeVerifier: string; createdAt: number };
  } catch {
    return Response.json({ error: "Google sign-in session is invalid. Start Google sign-in again." }, {
      status: 400,
      headers: { "cache-control": "no-store", "set-cookie": clearCookie() },
    });
  }

  const age = Date.now() - transaction.createdAt;
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) {
    return Response.json({ error: "Google sign-in session expired. Start Google sign-in again." }, {
      status: 400,
      headers: { "cache-control": "no-store", "set-cookie": clearCookie() },
    });
  }

  const tokenResponse = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=pkce", {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      auth_code: code,
      code_verifier: transaction.codeVerifier,
    }),
    cache: "no-store",
  });

  const responseText = await tokenResponse.text();
  let payload: unknown = null;
  try {
    payload = responseText ? JSON.parse(responseText) : null;
  } catch {
    payload = responseText;
  }

  if (!tokenResponse.ok) {
    const row = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    return Response.json({
      error: String(row.msg ?? row.message ?? row.error_description ?? row.error ?? "Google sign-in could not be completed."),
    }, {
      status: tokenResponse.status,
      headers: { "cache-control": "no-store", "set-cookie": clearCookie() },
    });
  }

  return Response.json(payload, {
    status: 200,
    headers: { "cache-control": "no-store", "set-cookie": clearCookie() },
  });
}
