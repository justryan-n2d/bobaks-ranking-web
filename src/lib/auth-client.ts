export const AUTH_SESSION_STORAGE_KEY = "bobaks.auth.session.v1";
const REFRESH_BUFFER_SECONDS = 60;

export type AuthUser = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number | null;
  expires_in?: number | null;
  token_type?: string;
  user: AuthUser;
};

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
};

export type AlertPreferences = {
  user_id: string;
  alerts_enabled: boolean;
  top10_enabled: boolean;
  new_peak_enabled: boolean;
  rank_jump_enabled: boolean;
  rank_jump_threshold: number;
  created_at?: string;
  updated_at?: string;
};

export type IdentityPreferences = {
  user_id: string;
  show_roblox_identity: boolean;
  show_roblox_avatar: boolean;
  created_at?: string;
  updated_at?: string;
};

export type RobloxIdentity = {
  user_id: string;
  roblox_user_id: string | number;
  provider_subject: string;
  username: string | null;
  display_name: string | null;
  profile_url: string | null;
  avatar_url: string | null;
  status: "connected" | "revoked";
  connected_at?: string | null;
  last_verified_at?: string | null;
  updated_at?: string | null;
};

export type WatchlistRow = { game_id: string; created_at: string };
export type SavedComparison = {
  id: string;
  game_id_a: string | number;
  game_id_b: string | number;
  created_at: string;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function createMemoryStorage(): StorageLike {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

function defaultStorage(): StorageLike {
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  } catch {
    // Browser storage may be blocked.
  }
  return createMemoryStorage();
}

function normalizeBaseUrl(value: string): string {
  const url = new URL(value.trim());
  if (!/^https?:$/.test(url.protocol)) throw new Error("Supabase URL must use HTTP or HTTPS.");
  return url.toString().replace(/\/$/, "");
}

function normalizeSession(input: unknown): AuthSession | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const user = row.user;
  const accessToken = typeof row.access_token === "string" ? row.access_token : "";
  const refreshToken = typeof row.refresh_token === "string" ? row.refresh_token : "";
  if (!accessToken || !refreshToken || !user || typeof user !== "object") return null;

  const expiresAt = Number(row.expires_at);
  const expiresIn = Number(row.expires_in);
  return {
    ...(row as Omit<AuthSession, "user" | "access_token" | "refresh_token" | "expires_at">),
    access_token: accessToken,
    refresh_token: refreshToken,
    user: user as AuthUser,
    expires_at: Number.isFinite(expiresAt)
      ? expiresAt
      : Number.isFinite(expiresIn)
        ? Math.floor(Date.now() / 1000) + expiresIn
        : null,
  };
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function requestError(response: Response, payload: unknown): Error & { status?: number } {
  const row = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const error = new Error(
    String(row.msg ?? row.message ?? row.error_description ?? row.error ?? "Authentication request failed."),
  ) as Error & { status?: number };
  error.status = response.status;
  return error;
}

function gameId(value: string | number): string {
  const normalized = String(value).trim();
  if (!/^\d{1,20}$/.test(normalized)) throw new Error("Invalid game ID.");
  return normalized;
}

function email(value: string): string {
  const normalized = value.trim();
  if (!normalized || !normalized.includes("@")) throw new Error("Enter a valid email address.");
  return normalized;
}

async function send(
  baseUrl: string,
  key: string,
  path: string,
  init: RequestInit = {},
  accessToken?: string,
) {
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("accept", "application/json");
  if (accessToken) headers.set("authorization", "Bearer " + accessToken);
  if (init.body !== undefined && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(path.startsWith("http") ? path : baseUrl + path, {
    ...init,
    headers,
  });
  const payload = await readBody(response);
  if (!response.ok) throw requestError(response, payload);
  return { response, payload };
}

export function createAuthClient({
  supabaseUrl,
  publishableKey,
  storage = defaultStorage(),
}: {
  supabaseUrl: string;
  publishableKey: string;
  storage?: StorageLike;
}) {
  const baseUrl = normalizeBaseUrl(supabaseUrl);
  const key = publishableKey.trim();
  if (!key) throw new Error("Supabase publishable key is required.");
  const store = storage;
  const listeners = new Set<(event: string, session: AuthSession | null) => void>();
  let refreshPromise: Promise<AuthSession | null> | null = null;

  function emit(event: string, session: AuthSession | null) {
    for (const listener of listeners) listener(event, session);
  }

  function readStored(): AuthSession | null {
    const raw = store.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
      const session = normalizeSession(JSON.parse(raw));
      if (!session) store.removeItem(AUTH_SESSION_STORAGE_KEY);
      return session;
    } catch {
      store.removeItem(AUTH_SESSION_STORAGE_KEY);
      return null;
    }
  }

  function writeStored(input: unknown): AuthSession | null {
    const session = normalizeSession(input);
    if (!session) {
      store.removeItem(AUTH_SESSION_STORAGE_KEY);
      return null;
    }
    store.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  async function refreshSession() {
    if (refreshPromise) return refreshPromise;
    const existing = readStored();
    if (!existing?.refresh_token) return null;

    refreshPromise = (async () => {
      const { payload } = await send(baseUrl, key, "/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        body: JSON.stringify({ refresh_token: existing.refresh_token }),
      });
      const session = writeStored(payload);
      if (!session) throw new Error("Session refresh returned no usable session.");
      emit("TOKEN_REFRESHED", session);
      return session;
    })().finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  }

  async function getSession(): Promise<AuthSession | null> {
    const session = readStored();
    if (!session) return null;
    if (session.expires_at == null) return session;
    if (session.expires_at - Math.floor(Date.now() / 1000) > REFRESH_BUFFER_SECONDS) return session;
    try {
      return await refreshSession();
    } catch {
      store.removeItem(AUTH_SESSION_STORAGE_KEY);
      emit("SIGNED_OUT", null);
      return null;
    }
  }

  async function getUser(): Promise<AuthUser> {
    let session = await getSession();
    if (!session) throw new Error("Authentication required.");
    try {
      const { payload } = await send(baseUrl, key, "/auth/v1/user", {}, session.access_token);
      const user = payload as AuthUser;
      writeStored({ ...session, user });
      return user;
    } catch (error) {
      if ((error as { status?: number }).status !== 401) throw error;
      session = await refreshSession();
      if (!session) throw new Error("Authentication required.");
      const { payload } = await send(baseUrl, key, "/auth/v1/user", {}, session.access_token);
      writeStored({ ...session, user: payload });
      return payload as AuthUser;
    }
  }

  async function authenticatedRest(
    path: string,
    init: RequestInit = {},
  ): Promise<{ response: Response; payload: unknown }> {
    let session = await getSession();
    if (!session) throw new Error("Authentication required.");

    try {
      return await send(baseUrl, key, "/rest/v1" + path, init, session.access_token);
    } catch (error) {
      if ((error as { status?: number }).status !== 401) throw error;
      session = await refreshSession();
      if (!session) throw new Error("Authentication required.");
      return send(baseUrl, key, "/rest/v1" + path, init, session.access_token);
    }
  }

  async function signIn(values: { email: string; password: string }) {
    const { payload } = await send(baseUrl, key, "/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email: email(values.email), password: values.password }),
    });
    const session = writeStored(payload);
    if (!session) throw new Error("Sign-in succeeded but no session was returned.");
    emit("SIGNED_IN", session);
    return { user: session.user, session };
  }

  async function signInWithGoogle(): Promise<string> {
    if (typeof window === "undefined") throw new Error("Google sign-in requires a browser.");
    const authorizeUrl = new URL("/api/auth/google/start", window.location.origin);
    window.location.assign(authorizeUrl.toString());
    return authorizeUrl.toString();
  }

  async function exchangeGoogleAuthCode(code: string) {
    if (typeof window === "undefined") throw new Error("Google sign-in requires a browser.");
    const normalizedCode = String(code ?? "").trim();
    if (!normalizedCode) {
      throw new Error("Google sign-in callback is incomplete.");
    }

    const response = await fetch("/api/auth/google/exchange", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ code: normalizedCode }),
      cache: "no-store",
    });
    const payload = await readBody(response);
    if (!response.ok) throw requestError(response, payload);

    const session = writeStored(payload);
    if (!session) throw new Error("Google sign-in succeeded but no session was returned.");
    emit("SIGNED_IN", session);
    window.dispatchEvent(new Event("bobaks-auth-change"));
    return session;
  }

  async function signUp(values: { email: string; password: string; displayName?: string }) {
    const body: Record<string, unknown> = {
      email: email(values.email),
      password: values.password,
      data: {},
      redirect_to: window.location.origin + "/account",
    };
    if (values.displayName?.trim()) (body.data as Record<string, unknown>).display_name = values.displayName.trim().slice(0, 80);
    const { payload } = await send(baseUrl, key, "/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const session = writeStored((payload as Record<string, unknown> | null)?.session ?? payload);
    emit(session ? "SIGNED_IN" : "SIGNED_UP", session);
    return { user: (payload as Record<string, unknown> | null)?.user as AuthUser | null ?? null, session };
  }

  async function signOut() {
    const session = readStored();
    try {
      if (session?.access_token) {
        await send(baseUrl, key, "/auth/v1/logout", { method: "POST" }, session.access_token);
      }
    } finally {
      store.removeItem(AUTH_SESSION_STORAGE_KEY);
      emit("SIGNED_OUT", null);
      window.dispatchEvent(new Event("bobaks-auth-change"));
    }
  }

  async function recoverSessionFromUrl() {
    if (typeof window === "undefined") return null;
    const rawHash = window.location.hash.replace(/^#/, "");
    if (!rawHash) return null;
    const params = new URLSearchParams(rawHash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) return null;

    try {
      const { payload } = await send(baseUrl, key, "/auth/v1/user", {}, accessToken);
      const session = writeStored({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: Number(params.get("expires_in") ?? 0),
        expires_at: Number(params.get("expires_at") ?? 0) || undefined,
        token_type: params.get("token_type") ?? "bearer",
        user: payload,
      });
      if (session) emit("SIGNED_IN", session);
      return session;
    } finally {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  async function resetPasswordForEmail(emailValue: string) {
    await send(baseUrl, key, "/auth/v1/recover", {
      method: "POST",
      body: JSON.stringify({
        email: email(emailValue),
        redirect_to: window.location.origin + "/account/update-password",
      }),
    });
  }

  async function updatePassword(password: string) {
    const normalized = String(password ?? "");
    if (normalized.length < 8) throw new Error("Password must be at least 8 characters.");
    let session = await getSession();
    if (!session) throw new Error("Authentication required.");
    try {
      await send(baseUrl, key, "/auth/v1/user", {
        method: "PUT",
        body: JSON.stringify({ password: normalized }),
      }, session.access_token);
    } catch (error) {
      if ((error as { status?: number }).status !== 401) throw error;
      session = await refreshSession();
      if (!session) throw new Error("Authentication required.");
      await send(baseUrl, key, "/auth/v1/user", {
        method: "PUT",
        body: JSON.stringify({ password: normalized }),
      }, session.access_token);
    }
  }

  async function resendConfirmation(emailValue: string) {
    await send(baseUrl, key, "/auth/v1/resend", {
      method: "POST",
      body: JSON.stringify({ type: "signup", email: email(emailValue), redirect_to: window.location.origin + "/account" }),
    });
  }

  async function getProfile(): Promise<Profile | null> {
    const user = await getUser();
    const { payload } = await authenticatedRest(
      "/profiles?select=id,display_name,avatar_url,is_public,created_at,updated_at&id=eq." + encodeURIComponent(user.id) + "&limit=1",
    );
    return Array.isArray(payload) ? (payload[0] as Profile | undefined) ?? null : null;
  }

  async function updateProfile(patch: Partial<Pick<Profile, "display_name" | "avatar_url" | "is_public">>) {
    const user = await getUser();
    const allowed: Record<string, unknown> = {};
    if ("display_name" in patch) allowed.display_name = patch.display_name?.trim().slice(0, 80) || null;
    if ("avatar_url" in patch) allowed.avatar_url = patch.avatar_url?.trim().slice(0, 2048) || null;
    if ("is_public" in patch) allowed.is_public = Boolean(patch.is_public);
    const { payload } = await authenticatedRest("/profiles?id=eq." + encodeURIComponent(user.id), {
      method: "PATCH",
      headers: { prefer: "return=representation" },
      body: JSON.stringify(allowed),
    });
    return Array.isArray(payload) ? (payload[0] as Profile | undefined) ?? null : null;
  }

  async function getAlerts(): Promise<AlertPreferences | null> {
    const user = await getUser();
    const { payload } = await authenticatedRest(
      "/user_alert_preferences?select=user_id,alerts_enabled,top10_enabled,new_peak_enabled,rank_jump_enabled,rank_jump_threshold,created_at,updated_at&user_id=eq." + encodeURIComponent(user.id) + "&limit=1",
    );
    return Array.isArray(payload) ? (payload[0] as AlertPreferences | undefined) ?? null : null;
  }

  async function updateAlerts(patch: Partial<AlertPreferences>) {
    const user = await getUser();
    const allowed: Record<string, unknown> = { user_id: user.id };
    for (const field of ["alerts_enabled", "top10_enabled", "new_peak_enabled", "rank_jump_enabled"] as const) {
      if (field in patch) allowed[field] = Boolean(patch[field]);
    }
    if ("rank_jump_threshold" in patch) {
      const value = Number(patch.rank_jump_threshold);
      if (!Number.isInteger(value) || value < 1 || value > 100) throw new Error("Rank jump threshold must be an integer from 1 to 100.");
      allowed.rank_jump_threshold = value;
    }
    const { payload } = await authenticatedRest("/user_alert_preferences?on_conflict=user_id", {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(allowed),
    });
    return Array.isArray(payload) ? (payload[0] as AlertPreferences | undefined) ?? null : null;
  }

  async function getIdentityPreferences(): Promise<IdentityPreferences | null> {
    const user = await getUser();
    const { payload } = await authenticatedRest(
      "/user_identity_preferences?select=user_id,show_roblox_identity,show_roblox_avatar,created_at,updated_at&user_id=eq." + encodeURIComponent(user.id) + "&limit=1",
    );
    return Array.isArray(payload) ? (payload[0] as IdentityPreferences | undefined) ?? null : null;
  }

  async function updateIdentityPreferences(patch: Partial<Pick<IdentityPreferences, "show_roblox_identity" | "show_roblox_avatar">>) {
    const user = await getUser();
    const showIdentity = "show_roblox_identity" in patch ? Boolean(patch.show_roblox_identity) : true;
    const showAvatar = "show_roblox_avatar" in patch ? Boolean(patch.show_roblox_avatar) : false;
    if (showAvatar && !showIdentity) throw new Error("Show Roblox avatar requires Roblox identity visibility.");
    const { payload } = await authenticatedRest("/user_identity_preferences?on_conflict=user_id", {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ user_id: user.id, show_roblox_identity: showIdentity, show_roblox_avatar: showAvatar }),
    });
    return Array.isArray(payload) ? (payload[0] as IdentityPreferences | undefined) ?? null : null;
  }

  async function listWatchlist(): Promise<WatchlistRow[]> {
    const { payload } = await authenticatedRest("/user_watchlist?select=game_id,created_at&order=created_at.desc");
    return Array.isArray(payload) ? payload as WatchlistRow[] : [];
  }

  async function addWatchlistGame(id: string | number) {
    const user = await getUser();
    const { payload } = await authenticatedRest("/user_watchlist?on_conflict=user_id%2Cgame_id", {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ user_id: user.id, game_id: gameId(id) }),
    });
    return Array.isArray(payload) ? payload[0] ?? null : null;
  }

  async function removeWatchlistGame(id: string | number) {
    const user = await getUser();
    const { payload } = await authenticatedRest(
      "/user_watchlist?user_id=eq." + encodeURIComponent(user.id) + "&game_id=eq." + encodeURIComponent(gameId(id)),
      { method: "DELETE", headers: { prefer: "return=representation" } },
    );
    return Array.isArray(payload) ? payload as WatchlistRow[] : [];
  }

  async function listSavedComparisons(): Promise<SavedComparison[]> {
    const { payload } = await authenticatedRest(
      "/saved_comparisons?select=id,game_id_a,game_id_b,created_at&order=created_at.desc",
    );
    return Array.isArray(payload) ? payload as SavedComparison[] : [];
  }

  async function saveComparison(a: string | number, b: string | number) {
    const left = gameId(a);
    const right = gameId(b);
    if (left === right) throw new Error("A comparison needs two different games.");
    const [gameIdA, gameIdB] = BigInt(left) < BigInt(right) ? [left, right] : [right, left];
    const user = await getUser();
    const { payload } = await authenticatedRest(
      "/saved_comparisons?on_conflict=user_id%2Cgame_id_a%2Cgame_id_b",
      {
        method: "POST",
        headers: { prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({ user_id: user.id, game_id_a: gameIdA, game_id_b: gameIdB }),
      },
    );
    return Array.isArray(payload) ? payload[0] ?? null : null;
  }

  async function removeSavedComparison(id: string) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid saved comparison ID.");
    const user = await getUser();
    const { payload } = await authenticatedRest(
      "/saved_comparisons?id=eq." + encodeURIComponent(id) + "&user_id=eq." + encodeURIComponent(user.id),
      { method: "DELETE", headers: { prefer: "return=representation" } },
    );
    return Array.isArray(payload) ? payload : [];
  }

  async function getRobloxIdentity(): Promise<RobloxIdentity | null> {
    const { payload } = await authenticatedRest(
      "/roblox_identities?select=user_id,roblox_user_id,provider_subject,username,display_name,profile_url,avatar_url,status,connected_at,last_verified_at,updated_at&limit=1",
    );
    return Array.isArray(payload) ? (payload[0] as RobloxIdentity | undefined) ?? null : null;
  }

  async function startRobloxConnection() {
    const session = await getSession();
    if (!session) throw new Error("Authentication required.");
    const response = await fetch("/api/identity/roblox/start", {
      method: "POST",
      headers: { authorization: "Bearer " + session.access_token, accept: "application/json" },
    });
    const payload = await readBody(response);
    if (!response.ok) throw requestError(response, payload);
    if (!payload || typeof payload !== "object" || typeof (payload as Record<string, unknown>).authorizeUrl !== "string") {
      throw new Error("Roblox connection did not return an authorization URL.");
    }
    return (payload as { authorizeUrl: string }).authorizeUrl;
  }

  async function exchangeRobloxConnection(code: string, state: string) {
    const session = await getSession();
    if (!session) throw new Error("Authentication required.");
    const response = await fetch("/api/identity/roblox/exchange", {
      method: "POST",
      headers: { authorization: "Bearer " + session.access_token, "content-type": "application/json", accept: "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ code, state }),
    });
    const payload = await readBody(response);
    if (!response.ok) throw requestError(response, payload);
    return payload as RobloxIdentity;
  }

  async function disconnectRoblox() {
    const session = await getSession();
    if (!session) throw new Error("Authentication required.");
    const response = await fetch("/api/identity/roblox/disconnect", {
      method: "POST",
      headers: { authorization: "Bearer " + session.access_token, accept: "application/json" },
      credentials: "same-origin",
    });
    const payload = await readBody(response);
    if (!response.ok) throw requestError(response, payload);
    return payload as RobloxIdentity;
  }

  function onAuthStateChange(listener: (event: string, session: AuthSession | null) => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    signIn,
    signInWithGoogle,
    exchangeGoogleAuthCode,
    signUp,
    resetPasswordForEmail,
    updatePassword,
    signOut,
    resendConfirmation,
    refreshSession,
    getSession,
    getUser,
    recoverSessionFromUrl,
    getProfile,
    updateProfile,
    getAlerts,
    updateAlerts,
    getIdentityPreferences,
    updateIdentityPreferences,
    listWatchlist,
    addWatchlistGame,
    removeWatchlistGame,
    listSavedComparisons,
    saveComparison,
    removeSavedComparison,
    getRobloxIdentity,
    startRobloxConnection,
    exchangeRobloxConnection,
    disconnectRoblox,
    onAuthStateChange,
    clearSession: () => store.removeItem(AUTH_SESSION_STORAGE_KEY),
  };
}

export type AuthClient = ReturnType<typeof createAuthClient>;
